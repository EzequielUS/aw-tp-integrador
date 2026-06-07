import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/data-source';
import { Unidad } from '../entity/Unidad';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const unidades = await AppDataSource.getRepository(Unidad).find({ order: { numero: 'ASC' } });
    res.json({ success: true, data: unidades });
  } catch (err) { next(err); }
});

export default router;
