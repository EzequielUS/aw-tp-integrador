import { AppDataSource } from '../database/data-source';
import { Incidente, EstadoIncidente, NivelGravedad } from '../entity/Incidente';
import { Tarea } from '../entity/Tarea';
import { AppError } from '../middleware/AppError';

const TRANSITIONS: Record<EstadoIncidente, EstadoIncidente[]> = {
  'Abierto': ['En progreso'],
  'En progreso': ['Resuelto'],
  'Resuelto': [],
};

export class IncidentesService {
  private incidenteRepo = AppDataSource.getRepository(Incidente);
  private tareaRepo = AppDataSource.getRepository(Tarea);

  async getAll(): Promise<Incidente[]> {
    return this.incidenteRepo.find({
      order: { fechaCreacion: 'DESC' },
      relations: ['reclamo'],
    });
  }

  async getById(id: number): Promise<Incidente> {
    const incidente = await this.incidenteRepo.findOne({
      where: { id },
      relations: ['reclamo', 'tareas', 'tareas.encargado'],
    });
    if (!incidente) throw AppError.notFound('Incidente', id);
    return incidente;
  }

  async create(nivelGravedad: NivelGravedad, descripcion: string, reclamoId?: number): Promise<Incidente> {
    const incidente = this.incidenteRepo.create({
      nivelGravedad,
      descripcion,
      estado: 'Abierto',
      reclamoId: reclamoId ?? null,
    });
    return this.incidenteRepo.save(incidente);
  }

  async updateEstado(id: number, nuevoEstado: EstadoIncidente): Promise<Incidente> {
    const incidente = await this.incidenteRepo.findOne({
      where: { id },
      relations: ['tareas'],
    });
    if (!incidente) throw AppError.notFound('Incidente', id);

    const allowed = TRANSITIONS[incidente.estado];
    if (!allowed.includes(nuevoEstado)) {
      throw AppError.invalidStateTransition('Incidente', incidente.estado, nuevoEstado);
    }

    if (nuevoEstado === 'En progreso') {
      const tareas = incidente.tareas ?? [];
      if (tareas.length === 0)
        throw AppError.businessLogicError('El incidente necesita al menos una tarea correctiva para pasar a En progreso');
    }

    if (nuevoEstado === 'Resuelto') {
      const tareas = incidente.tareas ?? [];
      const todasFinalizadas = tareas.every(t => t.estado === 'Finalizada');
      if (!todasFinalizadas)
        throw AppError.businessLogicError('No se puede resolver el incidente mientras haya tareas sin finalizar');
    }

    incidente.estado = nuevoEstado;
    return this.incidenteRepo.save(incidente);
  }

  async addTarea(incidenteId: number, encargadoId: number, descripcion: string, fechaLimite?: string): Promise<Tarea> {
    const incidente = await this.incidenteRepo.findOne({ where: { id: incidenteId } });
    if (!incidente) throw AppError.notFound('Incidente', incidenteId);

    const tarea = this.tareaRepo.create({
      encargadoId,
      incidenteId,
      rutinaId: null,
      descripcion,
      estado: 'Pendiente',
      fechaLimite: fechaLimite ? new Date(fechaLimite) : null,
    });
    return this.tareaRepo.save(tarea);
  }

  async getTareas(incidenteId: number): Promise<Tarea[]> {
    const incidente = await this.incidenteRepo.findOne({ where: { id: incidenteId } });
    if (!incidente) throw AppError.notFound('Incidente', incidenteId);

    return this.tareaRepo.find({
      where: { incidenteId },
      relations: ['encargado'],
    });
  }
}
