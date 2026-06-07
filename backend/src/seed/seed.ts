import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import { AppDataSource } from '../database/data-source';
import { Persona } from '../entity/Persona';
import { Unidad } from '../entity/Unidad';
import { Aviso } from '../entity/Aviso';
import { Reclamo } from '../entity/Reclamo';
import { Incidente } from '../entity/Incidente';
import { Rutina } from '../entity/Rutina';
import { Tarea } from '../entity/Tarea';

async function seed(): Promise<void> {
  await AppDataSource.initialize();
  const HASH = await bcrypt.hash('password123', 10);

  // 1. Unidades
  const unidades = await AppDataSource.getRepository(Unidad).save([
    { numero: '1A', piso: 1, descripcion: 'Departamento Frente' },
    { numero: '1B', piso: 1, descripcion: 'Departamento Fondo' },
    { numero: '2A', piso: 2, descripcion: 'Departamento Frente' },
    { numero: '2B', piso: 2, descripcion: 'Departamento Fondo' },
    { numero: '3A', piso: 3, descripcion: 'Departamento Frente' },
    { numero: '3B', piso: 3, descripcion: 'Departamento Fondo' },
    { numero: '4A', piso: 4, descripcion: 'Departamento Frente' },
    { numero: '4B', piso: 4, descripcion: 'Departamento Fondo' },
    { numero: 'PB', piso: 0, descripcion: 'Planta Baja - Acceso' },
    { numero: 'SUB', piso: -1, descripcion: 'Subsuelo - Cocheras' },
  ]);

  // 2. Personas
  const personas = await AppDataSource.getRepository(Persona).save([
    { nombre: 'Diego', apellido: 'Marafetti', email: 'diego@consorcio.com', password: HASH, rol: 'Administrador' },
    { nombre: 'Juan', apellido: 'García', email: 'juan@consorcio.com', password: HASH, rol: 'Encargado' },
    { nombre: 'Carlos', apellido: 'Rodríguez', email: 'carlos@consorcio.com', password: HASH, rol: 'Encargado' },
    { nombre: 'Ana', apellido: 'López', email: 'ana@mail.com', password: HASH, rol: 'Residente' },
    { nombre: 'Maria', apellido: 'González', email: 'maria@mail.com', password: HASH, rol: 'Residente' },
    { nombre: 'Pedro', apellido: 'Martínez', email: 'pedro@mail.com', password: HASH, rol: 'Residente' },
    { nombre: 'Laura', apellido: 'Fernández', email: 'laura@mail.com', password: HASH, rol: 'Residente' },
    { nombre: 'Roberto', apellido: 'Sánchez', email: 'roberto@mail.com', password: HASH, rol: 'Residente' },
  ]);
  const [diego, juan, carlos, ana, maria, pedro, laura, roberto] = personas;

  // 3. Avisos
  await AppDataSource.getRepository(Aviso).save([
    { administradorId: diego.id, titulo: 'Corte de agua programado', cuerpo: 'El día martes 3 de junio de 10:00 a 14:00 se cortará el suministro de agua para limpieza de tanques. Se solicita precaución.' },
    { administradorId: diego.id, titulo: 'Mantenimiento de ascensor', cuerpo: 'Se realizará mantenimiento preventivo del ascensor el viernes 5 de junio. Se utilizará el ascensor alternativo.' },
    { administradorId: diego.id, titulo: 'Fumigación del edificio', cuerpo: 'Asueto en el edificio el próximo miércoles para fumigación general. Favor mantener ventanas cerradas.' },
    { administradorId: diego.id, titulo: 'Reunión de consorcio', cuerpo: 'Se convoca a asamblea de consorcio para el próximo jueves 6 de junio a las 19:00 en PB. Orden del día: presupuesto 2026.' },
    { administradorId: diego.id, titulo: 'Cambio de cerrajero', cuerpo: 'Se informa cambio de cerrajero del consorcio. Nuevo contacto: 011-XXXX-YYYY. Disponible 24/7.' },
  ]);

  // 4. Incidentes (antes que reclamos para poder linkear)
  const incidentes = await AppDataSource.getRepository(Incidente).save([
    { nivelGravedad: 'Alta', descripcion: 'Rotura de caño de agua en baño principal (Dept 3A). Hay pérdida constante.', estado: 'Abierto', reclamoId: null },
    { nivelGravedad: 'Media', descripcion: 'Falta de luz en palier del piso 1. Oscuro y peligroso.', estado: 'En progreso', reclamoId: null },
    { nivelGravedad: 'Baja', descripcion: 'Puerta de entrada lateral con bisagra floja.', estado: 'Resuelto', reclamoId: null },
  ]);
  const [inc1, inc2, inc3] = incidentes;

  // 5. Reclamos
  const reclamos = await AppDataSource.getRepository(Reclamo).save([
    { creadorId: ana.id, unidadId: unidades[0].id, descripcion: 'Filtración de agua en el techo de la cochera 3. Lluvia hace que se forme un charco en el piso.', estado: 'Pendiente', motivoRechazo: null, incidenteId: null },
    { creadorId: maria.id, unidadId: unidades[2].id, descripcion: 'Ruido excesivo en departamento 2B (encima del mío) todas las noches después de las 23:00.', estado: 'Pendiente', motivoRechazo: null, incidenteId: null },
    { creadorId: juan.id, unidadId: unidades[8].id, descripcion: 'Puerta de acceso PB con cierre roto. No cierra correctamente, afecta seguridad.', estado: 'Pendiente', motivoRechazo: null, incidenteId: null },
    { creadorId: pedro.id, unidadId: unidades[4].id, descripcion: 'Rotura de caño de agua en baño principal. Hay pérdida constante.', estado: 'Aprobado', motivoRechazo: null, incidenteId: inc1.id },
    { creadorId: laura.id, unidadId: unidades[1].id, descripcion: 'Falta de luz en palier del piso 1. Oscuro y peligroso.', estado: 'Aprobado', motivoRechazo: null, incidenteId: inc2.id },
    { creadorId: roberto.id, unidadId: unidades[6].id, descripcion: 'Solicito que cambien el color del edificio a azul.', estado: 'Rechazado', motivoRechazo: 'La solicitud debe ser votada en asamblea. No es responsabilidad de administración.', incidenteId: null },
  ]);

  // Actualizar reclamoId en incidentes
  await AppDataSource.getRepository(Incidente).save([
    { ...inc1, reclamoId: reclamos[3].id },
    { ...inc2, reclamoId: reclamos[4].id },
  ]);

  // 6. Rutinas
  const rutinas = await AppDataSource.getRepository(Rutina).save([
    { encargadoId: juan.id, fechaAsignacion: '2026-05-31', estado: 'Pendiente' },
    { encargadoId: carlos.id, fechaAsignacion: '2026-05-31', estado: 'En progreso' },
    { encargadoId: juan.id, fechaAsignacion: '2026-05-30', estado: 'Completada' },
  ]);
  const [rut1, rut2, rut3] = rutinas;

  // 7. Tareas
  await AppDataSource.getRepository(Tarea).save([
    // Preventivas pendientes - Rutina 1
    { encargadoId: juan.id, rutinaId: rut1.id, incidenteId: null, descripcion: 'Barrido y limpieza de pasileres piso 1 al 3', estado: 'Pendiente', fechaLimite: null, notasFinalizacion: null },
    { encargadoId: juan.id, rutinaId: rut1.id, incidenteId: null, descripcion: 'Limpieza de vidrios entrada principal', estado: 'Pendiente', fechaLimite: null, notasFinalizacion: null },
    { encargadoId: juan.id, rutinaId: rut1.id, incidenteId: null, descripcion: 'Revisión de iluminación exterior', estado: 'Pendiente', fechaLimite: null, notasFinalizacion: null },
    { encargadoId: juan.id, rutinaId: rut1.id, incidenteId: null, descripcion: 'Riego de plantas en hall', estado: 'Pendiente', fechaLimite: null, notasFinalizacion: null },
    { encargadoId: juan.id, rutinaId: rut1.id, incidenteId: null, descripcion: 'Desinfección de manijas y barandas', estado: 'Pendiente', fechaLimite: null, notasFinalizacion: null },
    // Preventivas en ejecución - Rutina 2
    { encargadoId: carlos.id, rutinaId: rut2.id, incidenteId: null, descripcion: 'Limpieza de cocheras', estado: 'En ejecución', fechaLimite: null, notasFinalizacion: null },
    { encargadoId: carlos.id, rutinaId: rut2.id, incidenteId: null, descripcion: 'Barrido común del piso 4', estado: 'En ejecución', fechaLimite: null, notasFinalizacion: null },
    { encargadoId: carlos.id, rutinaId: rut2.id, incidenteId: null, descripcion: 'Vaciado de papeleros', estado: 'En ejecución', fechaLimite: null, notasFinalizacion: null },
    // Preventivas finalizadas - Rutina 3
    { encargadoId: juan.id, rutinaId: rut3.id, incidenteId: null, descripcion: 'Limpieza palieres piso 1-3', estado: 'Finalizada', fechaLimite: null, notasFinalizacion: 'Completado sin novedad' },
    { encargadoId: juan.id, rutinaId: rut3.id, incidenteId: null, descripcion: 'Limpieza vidrios entrada', estado: 'Finalizada', fechaLimite: null, notasFinalizacion: 'Limpieza profunda realizada' },
    { encargadoId: juan.id, rutinaId: rut3.id, incidenteId: null, descripcion: 'Riego de plantas', estado: 'Finalizada', fechaLimite: null, notasFinalizacion: 'Plantas hidratadas' },
    // Correctivas pendientes - Incidente 1
    { encargadoId: juan.id, rutinaId: null, incidenteId: inc1.id, descripcion: 'Cerrar llave de paso general', estado: 'Pendiente', fechaLimite: new Date('2026-06-01T12:00:00Z'), notasFinalizacion: null },
    { encargadoId: juan.id, rutinaId: null, incidenteId: inc1.id, descripcion: 'Llamar al plomero para reparación', estado: 'Pendiente', fechaLimite: new Date('2026-06-01T18:00:00Z'), notasFinalizacion: null },
    // Correctiva en ejecución - Incidente 2
    { encargadoId: carlos.id, rutinaId: null, incidenteId: inc2.id, descripcion: 'Cambiar bombillas en palier 1', estado: 'En ejecución', fechaLimite: new Date('2026-05-31T17:00:00Z'), notasFinalizacion: null },
    // Correctivas finalizadas - Incidente 3
    { encargadoId: juan.id, rutinaId: null, incidenteId: inc3.id, descripcion: 'Reparación de bisagra', estado: 'Finalizada', fechaLimite: new Date('2026-05-25T16:00:00Z'), notasFinalizacion: 'Bisagra reemplazada sin problemas' },
    { encargadoId: carlos.id, rutinaId: null, incidenteId: inc3.id, descripcion: 'Ajuste de cierre de puerta', estado: 'Finalizada', fechaLimite: new Date('2026-05-26T17:00:00Z'), notasFinalizacion: 'Cierre funciona correctamente' },
  ]);

  console.log('✓ Seed completado exitosamente');
  console.log('  Admin:     diego@consorcio.com / password123');
  console.log('  Encargado: juan@consorcio.com  / password123');
  console.log('  Residente: ana@mail.com        / password123');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
