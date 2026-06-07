import { Router, Request, Response, NextFunction } from 'express';
import { TareasService } from '../service/TareasService';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/AppError';

const router = Router();
const service = new TareasService();

router.patch('/:id', authenticate, authorize('Encargado'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw AppError.validationError('ID inválido');

    const { estado, notas_finalizacion } = req.body as { estado?: unknown; notas_finalizacion?: unknown };
    if (typeof estado !== 'string') throw AppError.validationError('El campo estado es requerido');

    const tarea = await service.updateEstado(
      id,
      estado as 'Pendiente' | 'En ejecución' | 'Finalizada',
      typeof notas_finalizacion === 'string' ? notas_finalizacion : undefined
    );
    res.json({ success: true, data: tarea });
  } catch (err) { next(err); }
});

export default router;
