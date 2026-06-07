import { Router, Request, Response, NextFunction } from 'express';
import { AvisosService } from '../service/AvisosService';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/AppError';

const router = Router();
const service = new AvisosService();

router.get('/', authenticate, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const avisos = await service.getAll();
    res.json({ success: true, data: avisos });
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('Administrador'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { titulo, cuerpo } = req.body as { titulo?: unknown; cuerpo?: unknown };
    if (typeof titulo !== 'string' || titulo.trim().length < 5)
      throw AppError.validationError('El título debe tener mínimo 5 caracteres');
    if (typeof cuerpo !== 'string' || cuerpo.trim().length < 10)
      throw AppError.validationError('El cuerpo debe tener mínimo 10 caracteres');

    const aviso = await service.create(req.user!.id, titulo.trim(), cuerpo.trim());
    res.status(201).json({ success: true, data: aviso });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, authorize('Administrador'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw AppError.validationError('ID inválido');
    await service.remove(id);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
