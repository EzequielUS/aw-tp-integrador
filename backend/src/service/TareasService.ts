import { AppDataSource } from '../database/data-source';
import { Tarea, EstadoTarea } from '../entity/Tarea';
import { Rutina } from '../entity/Rutina';
import { AppError } from '../middleware/AppError';

const TRANSITIONS: Record<EstadoTarea, EstadoTarea[]> = {
  'Pendiente': ['En ejecución'],
  'En ejecución': ['Finalizada'],
  'Finalizada': [],
};

export class TareasService {
  private tareaRepo = AppDataSource.getRepository(Tarea);
  private rutinaRepo = AppDataSource.getRepository(Rutina);

  async updateEstado(id: number, nuevoEstado: EstadoTarea, notasFinalizacion?: string): Promise<Tarea> {
    const tarea = await this.tareaRepo.findOne({ where: { id } });
    if (!tarea) throw AppError.notFound('Tarea', id);

    const allowed = TRANSITIONS[tarea.estado];
    if (!allowed.includes(nuevoEstado))
      throw AppError.invalidStateTransition('Tarea', tarea.estado, nuevoEstado);

    tarea.estado = nuevoEstado;
    if (notasFinalizacion) tarea.notasFinalizacion = notasFinalizacion;

    const saved = await this.tareaRepo.save(tarea);

    // Side-effect: si finalizó y pertenece a una rutina, verificar autocompletado
    if (nuevoEstado === 'Finalizada' && tarea.rutinaId) {
      await this.checkAutoCompleteRutina(tarea.rutinaId);
    }

    return saved;
  }

  private async checkAutoCompleteRutina(rutinaId: number): Promise<void> {
    const rutina = await this.rutinaRepo.findOne({
      where: { id: rutinaId },
      relations: ['tareas'],
    });
    if (!rutina || rutina.estado === 'Completada') return;

    const todasFinalizadas = (rutina.tareas ?? []).every(t => t.estado === 'Finalizada');
    if (todasFinalizadas) {
      rutina.estado = 'Completada';
      await this.rutinaRepo.save(rutina);
    }
  }
}
