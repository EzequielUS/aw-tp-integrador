import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../database/data-source';
import { Persona } from '../entity/Persona';
import { AppError } from '../middleware/AppError';
import { JwtPayload } from '../middleware/auth';

const JWT_EXPIRES_IN = '8h';

export class AuthService {
  private personaRepo = AppDataSource.getRepository(Persona);

  async login(email: string, password: string): Promise<{ token: string; user: Omit<Persona, 'password'> }> {
    const persona = await this.personaRepo.findOne({ where: { email } });

    if (!persona) {
      throw AppError.authenticationFailed();
    }

    const passwordMatch = await bcrypt.compare(password, persona.password);
    if (!passwordMatch) {
      throw AppError.authenticationFailed();
    }

    const payload: JwtPayload = { id: persona.id, email: persona.email, rol: persona.rol };
    const secret = process.env.JWT_SECRET ?? 'dev_secret';
    const token = jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });

    const { password: _omit, ...user } = persona;
    return { token, user };
  }
}
