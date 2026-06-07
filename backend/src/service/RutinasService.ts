import { AppDataSource } from '../database/data-source';
import { Rutina, EstadoRutina } from '../entity/Rutina';
import { Tarea } from '../entity/Tarea';
import { AppError } from '../middleware/AppError';

const TRANSITIONS: Record<EstadoRutina, EstadoRutina[]> = {
  'Pendiente': ['En progreso'],
  'En progreso': ['Completada'],
  'Completada': [],
};

export class RutinasService {
  private rutinaRepo = AppDataSource.getRepository(Rutina);
  private tareaRepo = AppDataSource.getRepository(Tarea);

  async getAll(): Promise<Rutina[]> {
    return this.rutinaRepo.find({
      order: { fechaAsignacion: 'DESC' },
      relations: ['encargado'],
    });
  }

  async create(encargadoId: number, fechaAsignacion: string, tareas: string[]): Promise<Rutina> {
    if (!tareas || tareas.length === 0)
      throw AppError.validationError('La rutina debe tener al menos una tarea');

    const rutina = this.rutinaRepo.create({ encargadoId, fechaAsignacion, estado: 'Pendiente' });
    const savedRutina = await this.rutinaRepo.save(rutina);

    const tareaEntities = tareas.map(desc =>
      this.tareaRepo.create({
        encargadoId,
        rutinaId: savedRutina.id,
        incidenteId: null,
        descripcion: desc,
        estado: 'Pendiente',
      })
    );
    await this.tareaRepo.save(tareaEntities);
    return savedRutina;
  }

  async getTareas(rutinaId: number): Promise<Tarea[]> {
    const rutina = await this.rutinaRepo.findOne({ where: { id: rutinaId } });
    if (!rutina) throw AppError.notFound('Rutina', rutinaId);
    return this.tareaRepo.find({ where: { rutinaId }, relations: ['encargado'] });
  }

  async updateEstado(id: number, nuevoEstado: EstadoRutina): Promise<Rutina> {
    const rutina = await this.rutinaRepo.findOne({ where: { id }, relations: ['tareas'] });
    if (!rutina) throw AppError.notFound('Rutina', id);

    const allowed = TRANSITIONS[rutina.estado];
    if (!allowed.includes(nuevoEstado))
      throw AppError.invalidStateTransition('Rutina', rutina.estado, nuevoEstado);

    if (nuevoEstado === 'Completada') {
      const todasFinalizadas = (rutina.tareas ?? []).every(t => t.estado === 'Finalizada');
      if (!todasFinalizadas)
        throw AppError.businessLogicError('No se puede completar la rutina mientras haya tareas sin finalizar');
    }

    rutina.estado = nuevoEstado;
    return this.rutinaRepo.save(rutina);
  }
}
