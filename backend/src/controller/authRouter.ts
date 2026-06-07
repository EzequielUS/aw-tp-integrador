import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../service/AuthService';
import { AppError } from '../middleware/AppError';

const router = Router();
const authService = new AuthService();

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email?: unknown; password?: unknown };

    if (typeof email !== 'string' || !email.includes('@')) {
      throw AppError.validationError('Email no válido');
    }
    if (typeof password !== 'string' || password.length < 6) {
      throw AppError.validationError('Contraseña debe tener mínimo 6 caracteres');
    }

    const result = await authService.login(email, password);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
