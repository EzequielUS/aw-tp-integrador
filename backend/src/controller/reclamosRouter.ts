import { Router, Request, Response, NextFunction } from 'express';
import { ReclamosService } from '../service/ReclamosService';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/AppError';

const router = Router();
const service = new ReclamosService();

router.get('/', authenticate, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: await service.getAll() });
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw AppError.validationError('ID inválido');
    res.json({ success: true, data: await service.getById(id) });
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('Residente', 'Encargado'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { unidad_id, descripcion } = req.body as { unidad_id?: unknown; descripcion?: unknown };
    if (!unidad_id || typeof unidad_id !== 'number')
      throw AppError.validationError('El campo unidad_id es requerido');
    if (typeof descripcion !== 'string' || descripcion.trim().length < 10)
      throw AppError.validationError('La descripción debe tener mínimo 10 caracteres');

    const reclamo = await service.create(req.user!.id, unidad_id, descripcion.trim());
    res.status(201).json({ success: true, data: reclamo });
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, authorize('Administrador'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw AppError.validationError('ID inválido');

    const { estado, motivo_rechazo, nivel_gravedad } = req.body as {
      estado?: unknown;
      motivo_rechazo?: unknown;
      nivel_gravedad?: unknown;
    };

    if (typeof estado !== 'string')
      throw AppError.validationError('El campo estado es requerido');

    const reclamo = await service.triage(
      id,
      estado as 'Aprobado' | 'Rechazado',
      typeof motivo_rechazo === 'string' ? motivo_rechazo : undefined,
      typeof nivel_gravedad === 'string' ? nivel_gravedad as 'Baja' | 'Media' | 'Alta' : undefined
    );
    res.json({ success: true, data: reclamo });
  } catch (err) { next(err); }
});

export default router;
