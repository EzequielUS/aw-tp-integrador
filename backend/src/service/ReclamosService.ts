import { AppDataSource } from '../database/data-source';
import { Reclamo, EstadoReclamo } from '../entity/Reclamo';
import { Incidente } from '../entity/Incidente';
import { AppError } from '../middleware/AppError';
import { NivelGravedad } from '../entity/Incidente';

export class ReclamosService {
  private reclamoRepo = AppDataSource.getRepository(Reclamo);
  private incidenteRepo = AppDataSource.getRepository(Incidente);

  async getAll(): Promise<Reclamo[]> {
    return this.reclamoRepo.find({
      relations: ['creador', 'unidad', 'incidente'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async getById(id: number): Promise<Reclamo> {
    const reclamo = await this.reclamoRepo.findOne({
      where: { id },
      relations: ['creador', 'unidad', 'incidente'],
    });
    if (!reclamo) throw AppError.notFound('Reclamo', id);
    return reclamo;
  }

  async create(creadorId: number, unidadId: number, descripcion: string): Promise<Reclamo> {
    const reclamo = this.reclamoRepo.create({ creadorId, unidadId, descripcion, estado: 'Pendiente' });
    return this.reclamoRepo.save(reclamo);
  }

  async triage(
    id: number,
    estado: EstadoReclamo,
    motivoRechazo?: string,
    nivelGravedad?: NivelGravedad
  ): Promise<Reclamo> {
    const reclamo = await this.reclamoRepo.findOne({ where: { id } });
    if (!reclamo) throw AppError.notFound('Reclamo', id);

    if (reclamo.estado !== 'Pendiente') {
      throw AppError.invalidStateTransition('Reclamo', reclamo.estado, estado);
    }
    if (estado !== 'Aprobado' && estado !== 'Rechazado') {
      throw AppError.validationError('Estado debe ser Aprobado o Rechazado');
    }
    if (estado === 'Rechazado' && !motivoRechazo?.trim()) {
      throw AppError.missingRequiredData('El campo motivo_rechazo es requerido para rechazar el reclamo');
    }
    if (estado === 'Aprobado' && !nivelGravedad) {
      throw AppError.missingRequiredData('El campo nivel_gravedad es requerido para aprobar el reclamo');
    }

    reclamo.estado = estado;

    if (estado === 'Rechazado') {
      reclamo.motivoRechazo = motivoRechazo!;
    }

    if (estado === 'Aprobado') {
      const incidente = this.incidenteRepo.create({
        nivelGravedad: nivelGravedad!,
        descripcion: reclamo.descripcion,
        estado: 'Abierto',
        reclamoId: reclamo.id,
      });
      const savedIncidente = await this.incidenteRepo.save(incidente);
      reclamo.incidenteId = savedIncidente.id;
    }

    return this.reclamoRepo.save(reclamo);
  }
}
