import { AppDataSource } from '../database/data-source';
import { Aviso } from '../entity/Aviso';
import { AppError } from '../middleware/AppError';

export class AvisosService {
  private repo = AppDataSource.getRepository(Aviso);

  async getAll(): Promise<Aviso[]> {
    return this.repo.find({
      where: { eliminado: 0 },
      order: { fechaPublicacion: 'DESC' },
      relations: ['administrador'],
    });
  }

  async create(administradorId: number, titulo: string, cuerpo: string): Promise<Aviso> {
    const aviso = this.repo.create({ administradorId, titulo, cuerpo });
    return this.repo.save(aviso);
  }

  async remove(id: number): Promise<void> {
    const aviso = await this.repo.findOne({ where: { id } });
    if (!aviso) throw AppError.notFound('Aviso', id);
    if (aviso.eliminado === 1) throw AppError.notFound('Aviso', id);
    aviso.eliminado = 1;
    await this.repo.save(aviso);
  }
}
