import { Router, Request, Response, NextFunction } from 'express';
import { IncidentesService } from '../service/IncidentesService';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/AppError';

const router = Router();
const service = new IncidentesService();

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

router.post('/', authenticate, authorize('Administrador'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nivel_gravedad, descripcion, reclamo_id } = req.body as {
      nivel_gravedad?: unknown; descripcion?: unknown; reclamo_id?: unknown;
    };
    if (!['Baja', 'Media', 'Alta'].includes(nivel_gravedad as string))
      throw AppError.validationError('nivel_gravedad debe ser Baja, Media o Alta');
    if (typeof descripcion !== 'string' || descripcion.trim().length < 10)
      throw AppError.validationError('La descripción debe tener mínimo 10 caracteres');

    const incidente = await service.create(
      nivel_gravedad as 'Baja' | 'Media' | 'Alta',
      descripcion.trim(),
      typeof reclamo_id === 'number' ? reclamo_id : undefined
    );
    res.status(201).json({ success: true, data: incidente });
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, authorize('Administrador', 'Encargado'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw AppError.validationError('ID inválido');
    const { estado } = req.body as { estado?: unknown };
    if (typeof estado !== 'string') throw AppError.validationError('El campo estado es requerido');

    const incidente = await service.updateEstado(id, estado as 'Abierto' | 'En progreso' | 'Resuelto');
    res.json({ success: true, data: incidente });
  } catch (err) { next(err); }
});

router.get('/:id/tareas', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw AppError.validationError('ID inválido');
    res.json({ success: true, data: await service.getTareas(id) });
  } catch (err) { next(err); }
});

router.post('/:id/tareas', authenticate, authorize('Administrador'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incidenteId = parseInt(req.params.id);
    if (isNaN(incidenteId)) throw AppError.validationError('ID inválido');

    const { encargado_id, descripcion, fecha_limite } = req.body as {
      encargado_id?: unknown; descripcion?: unknown; fecha_limite?: unknown;
    };
    if (typeof encargado_id !== 'number') throw AppError.validationError('El campo encargado_id es requerido');
    if (typeof descripcion !== 'string' || descripcion.trim().length < 5)
      throw AppError.validationError('La descripción debe tener mínimo 5 caracteres');

    const tarea = await service.addTarea(
      incidenteId,
      encargado_id,
      descripcion.trim(),
      typeof fecha_limite === 'string' ? fecha_limite : undefined
    );
    res.status(201).json({ success: true, data: tarea });
  } catch (err) { next(err); }
});

export default router;
