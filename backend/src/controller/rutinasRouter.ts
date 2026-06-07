import { Router, Request, Response, NextFunction } from 'express';
import { RutinasService } from '../service/RutinasService';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/AppError';

const router = Router();
const service = new RutinasService();

router.get('/', authenticate, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: await service.getAll() });
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('Administrador'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { encargado_id, fecha_asignacion, tareas } = req.body as {
      encargado_id?: unknown; fecha_asignacion?: unknown; tareas?: unknown;
    };
    if (typeof encargado_id !== 'number') throw AppError.validationError('El campo encargado_id es requerido');
    if (typeof fecha_asignacion !== 'string') throw AppError.validationError('El campo fecha_asignacion es requerido');
    if (!Array.isArray(tareas) || tareas.length === 0) throw AppError.validationError('Se requiere al menos una tarea');

    const rutina = await service.create(encargado_id, fecha_asignacion, tareas as string[]);
    res.status(201).json({ success: true, data: rutina });
  } catch (err) { next(err); }
});

router.get('/:id/tareas', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw AppError.validationError('ID inválido');
    res.json({ success: true, data: await service.getTareas(id) });
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, authorize('Encargado', 'Administrador'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw AppError.validationError('ID inválido');
    const { estado } = req.body as { estado?: unknown };
    if (typeof estado !== 'string') throw AppError.validationError('El campo estado es requerido');

    const rutina = await service.updateEstado(id, estado as 'Pendiente' | 'En progreso' | 'Completada');
    res.json({ success: true, data: rutina });
  } catch (err) { next(err); }
});

export default router;
