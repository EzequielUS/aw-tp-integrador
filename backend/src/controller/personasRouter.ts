import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/data-source';
import { Persona } from '../entity/Persona';
import { authenticate } from '../middleware/auth';

const router = Router();

// Devuelve personas sin el campo password
router.get('/', authenticate, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const personas = await AppDataSource.getRepository(Persona).find({ order: { nombre: 'ASC' } });
    const safe = personas.map(({ password: _omit, ...p }) => p);
    res.json({ success: true, data: safe });
  } catch (err) { next(err); }
});

export default router;
