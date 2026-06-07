import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './AppError';
import { Rol } from '../entity/Persona';

export interface JwtPayload {
  id: number;
  email: string;
  rol: Rol;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(AppError.invalidToken());
  }

  const token = header.slice(7);
  const secret = process.env.JWT_SECRET ?? 'dev_secret';

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    next(AppError.invalidToken());
  }
}

export function authorize(...roles: Rol[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return next(AppError.unauthorized());
    }
    next();
  };
}
