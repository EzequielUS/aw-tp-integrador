import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { AppDataSource } from './database/data-source';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './controller/authRouter';
import avisosRouter from './controller/avisosRouter';
import reclamosRouter from './controller/reclamosRouter';
import incidentesRouter from './controller/incidentesRouter';
import rutinasRouter from './controller/rutinasRouter';
import tareasRouter from './controller/tareasRouter';
import unidadesRouter from './controller/unidadesRouter';
import personasRouter from './controller/personasRouter';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

app.get('/api/health', (_req: express.Request, res: express.Response) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRouter);
app.use('/api/avisos', avisosRouter);
app.use('/api/reclamos', reclamosRouter);
app.use('/api/incidentes', incidentesRouter);
app.use('/api/rutinas', rutinasRouter);
app.use('/api/tareas', tareasRouter);
app.use('/api/unidades', unidadesRouter);
app.use('/api/personas', personasRouter);

app.use(errorHandler);

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  console.log('Base de datos inicializada');

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

bootstrap().catch(console.error);

export default app;
