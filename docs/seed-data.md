# Seed Data — Sistema de Gestión de Consorcio

**Versión:** 1.0
**Fecha:** 2026-05-30
**Propósito:** Datos iniciales para demostración y testing completo de todos los flujos

---

## Resumen de Entidades a Crear

| Entidad | Cantidad | Propósito |
|---------|----------|-----------|
| Persona - Residente | 5 | Crear reclamos, ver avisos, reportes |
| Persona - Administrador | 1 | Triage, crear incidentes, asignar tareas |
| Persona - Encargado | 2 | Ejecutar tareas, completar rutinas |
| Unidad | 10 | Departamentos/viviendas del consorcio |
| Aviso | 5 | Tablón de comunicaciones |
| Reclamo - Pendiente | 3 | Para que Admin revise (flujo triage) |
| Reclamo - Aprobado | 2 | Con incidente vinculado |
| Reclamo - Rechazado | 1 | Histórico |
| Incidente - Abierto | 2 | Con tareas correctivas asignadas |
| Incidente - En progreso | 1 | Demostrando flujo en ejecución |
| Incidente - Resuelto | 1 | Histórico |
| Rutina - Pendiente | 1 | Para hoy (encargado puede iniciar) |
| Rutina - En progreso | 1 | Parcialmente completada |
| Rutina - Completada | 1 | Histórico |
| Tarea - Preventiva Pendiente | 5 | En rutina pendiente |
| Tarea - Preventiva En ejecución | 3 | En rutina en progreso |
| Tarea - Preventiva Finalizada | 3 | Ya completadas en rutina completada |
| Tarea - Correctiva Pendiente | 2 | Asignadas a incidente abierto |
| Tarea - Correctiva En ejecución | 1 | Encargado trabajando en ella |
| Tarea - Correctiva Finalizada | 2 | Ya resueltas en incidente resuelto |

---

## 1. PERSONAS

### Administrador
```javascript
{
  id: 1,
  nombre: "Diego",
  apellido: "Marafetti",
  email: "diego@consorcio.com",
  password: "password123", // hasheada con bcrypt en BD
  rol: "Administrador",
  fecha_creacion: "2026-05-30T10:00:00Z"
}
```

### Encargados
```javascript
[
  {
    id: 2,
    nombre: "Juan",
    apellido: "García",
    email: "juan@consorcio.com",
    password: "password123",
    rol: "Encargado",
    fecha_creacion: "2026-05-30T10:00:00Z"
  },
  {
    id: 3,
    nombre: "Carlos",
    apellido: "Rodríguez",
    email: "carlos@consorcio.com",
    password: "password123",
    rol: "Encargado",
    fecha_creacion: "2026-05-30T10:00:00Z"
  }
]
```

### Residentes
```javascript
[
  {
    id: 4,
    nombre: "Ana",
    apellido: "López",
    email: "ana@mail.com",
    password: "password123",
    rol: "Residente",
    fecha_creacion: "2026-05-29T14:30:00Z"
  },
  {
    id: 5,
    nombre: "Maria",
    apellido: "González",
    email: "maria@mail.com",
    password: "password123",
    rol: "Residente",
    fecha_creacion: "2026-05-29T15:00:00Z"
  },
  {
    id: 6,
    nombre: "Pedro",
    apellido: "Martínez",
    email: "pedro@mail.com",
    password: "password123",
    rol: "Residente",
    fecha_creacion: "2026-05-28T09:00:00Z"
  },
  {
    id: 7,
    nombre: "Laura",
    apellido: "Fernández",
    email: "laura@mail.com",
    password: "password123",
    rol: "Residente",
    fecha_creacion: "2026-05-27T11:30:00Z"
  },
  {
    id: 8,
    nombre: "Roberto",
    apellido: "Sánchez",
    email: "roberto@mail.com",
    password: "password123",
    rol: "Residente",
    fecha_creacion: "2026-05-26T16:00:00Z"
  }
]
```

---

## 2. UNIDADES

```javascript
[
  { id: 1, numero: "1A", piso: 1, descripcion: "Departamento Frente" },
  { id: 2, numero: "1B", piso: 1, descripcion: "Departamento Fondo" },
  { id: 3, numero: "2A", piso: 2, descripcion: "Departamento Frente" },
  { id: 4, numero: "2B", piso: 2, descripcion: "Departamento Fondo" },
  { id: 5, numero: "3A", piso: 3, descripcion: "Departamento Frente" },
  { id: 6, numero: "3B", piso: 3, descripcion: "Departamento Fondo" },
  { id: 7, numero: "4A", piso: 4, descripcion: "Departamento Frente" },
  { id: 8, numero: "4B", piso: 4, descripcion: "Departamento Fondo" },
  { id: 9, numero: "PB", piso: 0, descripcion: "Planta Baja - Acceso" },
  { id: 10, numero: "SUB", piso: -1, descripcion: "Subsuelo - Cocheras" }
]
```

---

## 3. AVISOS (Tablón de Comunicaciones)

```javascript
[
  {
    id: 1,
    administrador_id: 1,
    titulo: "Corte de agua programado",
    cuerpo: "El día martes 3 de junio de 10:00 a 14:00 se cortará el suministro de agua para limpieza de tanques. Se solicita precaución.",
    fecha_publicacion: "2026-05-30T08:00:00Z",
    fecha_creacion: "2026-05-30T08:00:00Z"
  },
  {
    id: 2,
    administrador_id: 1,
    titulo: "Mantenimiento de ascensor",
    cuerpo: "Se realizará mantenimiento preventivo del ascensor el viernes 5 de junio. Se utilizará el ascensor alternativo.",
    fecha_publicacion: "2026-05-30T09:30:00Z",
    fecha_creacion: "2026-05-30T09:30:00Z"
  },
  {
    id: 3,
    administrador_id: 1,
    titulo: "Fumigación del edificio",
    cuerpo: "Asueto en el edificio el próximo miércoles para fumigación general. Favor mantener ventanas cerradas.",
    fecha_publicacion: "2026-05-29T14:00:00Z",
    fecha_creacion: "2026-05-29T14:00:00Z"
  },
  {
    id: 4,
    administrador_id: 1,
    titulo: "Reunión de consorcio",
    cuerpo: "Se convoca a asamblea de consorcio para el próximo jueves 6 de junio a las 19:00 en PB. Orden del día: presupuesto 2026.",
    fecha_publicacion: "2026-05-28T10:00:00Z",
    fecha_creacion: "2026-05-28T10:00:00Z"
  },
  {
    id: 5,
    administrador_id: 1,
    titulo: "Cambio de cerrajero",
    cuerpo: "Se informa cambio de cerrajero del consorcio. Nuevo contacto: 011-XXXX-YYYY. Disponible 24/7.",
    fecha_publicacion: "2026-05-27T11:00:00Z",
    fecha_creacion: "2026-05-27T11:00:00Z"
  }
]
```

---

## 4. RECLAMOS

### Pendientes (por revisar por Admin)
```javascript
[
  {
    id: 1,
    creador_id: 4,  // Ana (Residente)
    unidad_id: 1,   // 1A
    descripcion: "Filtración de agua en el techo de la cochera 3. Lluvia hace que se forme un charco en el piso.",
    estado: "Pendiente",
    motivo_rechazo: null,
    incidente_id: null,
    fecha_creacion: "2026-05-30T14:20:00Z"
  },
  {
    id: 2,
    creador_id: 5,  // Maria (Residente)
    unidad_id: 3,   // 2A
    descripcion: "Ruido excesivo en departamento 2B (encima del mío) todas las noches después de las 23:00.",
    estado: "Pendiente",
    motivo_rechazo: null,
    incidente_id: null,
    fecha_creacion: "2026-05-30T16:45:00Z"
  },
  {
    id: 3,
    creador_id: 2,  // Juan (Encargado)
    unidad_id: 9,   // PB
    descripcion: "Puerta de acceso PB con cierre roto. No cierra correctamente, afecta seguridad.",
    estado: "Pendiente",
    motivo_rechazo: null,
    incidente_id: null,
    fecha_creacion: "2026-05-30T09:15:00Z"
  }
]
```

### Aprobados (con Incidente vinculado)
```javascript
[
  {
    id: 4,
    creador_id: 6,  // Pedro (Residente)
    unidad_id: 5,   // 3A
    descripcion: "Rotura de caño de agua en baño principal. Hay pérdida constante.",
    estado: "Aprobado",
    motivo_rechazo: null,
    incidente_id: 1,  // Vinculado a Incidente
    fecha_creacion: "2026-05-28T10:00:00Z"
  },
  {
    id: 5,
    creador_id: 7,  // Laura (Residente)
    unidad_id: 2,   // 1B
    descripcion: "Falta de luz en palier del piso 1. Oscuro y peligroso.",
    estado: "Aprobado",
    motivo_rechazo: null,
    incidente_id: 2,  // Vinculado a Incidente
    fecha_creacion: "2026-05-27T13:30:00Z"
  }
]
```

### Rechazados (histórico)
```javascript
[
  {
    id: 6,
    creador_id: 8,  // Roberto (Residente)
    unidad_id: 7,   // 4A
    descripcion: "Solicito que cambien el color del edificio a azul.",
    estado: "Rechazado",
    motivo_rechazo: "La solicitud debe ser votada en asamblea. No es responsabilidad de administración.",
    incidente_id: null,
    fecha_creacion: "2026-05-26T15:00:00Z"
  }
]
```

---

## 5. INCIDENTES

### Abierto (con tareas asignadas)
```javascript
{
  id: 1,
  nivel_gravedad: "Alta",
  descripcion: "Rotura de caño de agua en baño principal (Dept 3A). Hay pérdida constante.",
  estado: "Abierto",
  reclamo_id: 4,
  fecha_creacion: "2026-05-28T10:30:00Z"
}
```

### En progreso (parcialmente avanzado)
```javascript
{
  id: 2,
  nivel_gravedad: "Media",
  descripcion: "Falta de luz en palier del piso 1. Oscuro y peligroso.",
  estado: "En progreso",
  reclamo_id: 5,
  fecha_creacion: "2026-05-27T14:00:00Z"
}
```

### Resuelto (histórico)
```javascript
{
  id: 3,
  nivel_gravedad: "Baja",
  descripcion: "Puerta de entrada lateral con bisagra floja.",
  estado: "Resuelto",
  reclamo_id: null,  // Incidente manual
  fecha_creacion: "2026-05-25T11:00:00Z"
}
```

---

## 6. RUTINAS

### Pendiente (para hoy, encargado puede iniciar)
```javascript
{
  id: 1,
  encargado_id: 2,  // Juan
  fecha_asignacion: "2026-05-30",  // Hoy
  estado: "Pendiente",
  fecha_creacion: "2026-05-30T07:00:00Z"
}
```

### En progreso (parcialmente completada)
```javascript
{
  id: 2,
  encargado_id: 3,  // Carlos
  fecha_asignacion: "2026-05-30",  // Hoy
  estado: "En progreso",
  fecha_creacion: "2026-05-30T06:00:00Z"
}
```

### Completada (histórico)
```javascript
{
  id: 3,
  encargado_id: 2,  // Juan
  fecha_asignacion: "2026-05-29",  // Ayer
  estado: "Completada",
  fecha_creacion: "2026-05-29T07:00:00Z"
}
```

---

## 7. TAREAS

### Preventivas - Pendiente (Rutina 1)
```javascript
[
  {
    id: 1,
    encargado_id: 2,  // Juan
    rutina_id: 1,
    incidente_id: null,
    descripcion: "Barrido y limpieza de pasileres piso 1 al 3",
    estado: "Pendiente",
    fecha_limite: null,
    notas_finalizacion: null,
    fecha_creacion: "2026-05-30T07:30:00Z"
  },
  {
    id: 2,
    encargado_id: 2,
    rutina_id: 1,
    incidente_id: null,
    descripcion: "Limpieza de vidrios entrada principal",
    estado: "Pendiente",
    fecha_limite: null,
    notas_finalizacion: null,
    fecha_creacion: "2026-05-30T07:30:00Z"
  },
  {
    id: 3,
    encargado_id: 2,
    rutina_id: 1,
    incidente_id: null,
    descripcion: "Revisión de iluminación exterior",
    estado: "Pendiente",
    fecha_limite: null,
    notas_finalizacion: null,
    fecha_creacion: "2026-05-30T07:30:00Z"
  },
  {
    id: 4,
    encargado_id: 2,
    rutina_id: 1,
    incidente_id: null,
    descripcion: "Riego de plantas en hall",
    estado: "Pendiente",
    fecha_limite: null,
    notas_finalizacion: null,
    fecha_creacion: "2026-05-30T07:30:00Z"
  },
  {
    id: 5,
    encargado_id: 2,
    rutina_id: 1,
    incidente_id: null,
    descripcion: "Desinfección de manijas y barandas",
    estado: "Pendiente",
    fecha_limite: null,
    notas_finalizacion: null,
    fecha_creacion: "2026-05-30T07:30:00Z"
  }
]
```

### Preventivas - En ejecución (Rutina 2)
```javascript
[
  {
    id: 6,
    encargado_id: 3,  // Carlos
    rutina_id: 2,
    incidente_id: null,
    descripcion: "Limpieza de cocheras",
    estado: "En ejecución",
    fecha_limite: null,
    notas_finalizacion: null,
    fecha_creacion: "2026-05-30T06:30:00Z"
  },
  {
    id: 7,
    encargado_id: 3,
    rutina_id: 2,
    incidente_id: null,
    descripcion: "Barrido común del piso 4",
    estado: "En ejecución",
    fecha_limite: null,
    notas_finalizacion: null,
    fecha_creacion: "2026-05-30T06:30:00Z"
  },
  {
    id: 8,
    encargado_id: 3,
    rutina_id: 2,
    incidente_id: null,
    descripcion: "Vaciado de papeleros",
    estado: "En ejecución",
    fecha_limite: null,
    notas_finalizacion: null,
    fecha_creacion: "2026-05-30T06:30:00Z"
  }
]
```

### Preventivas - Finalizada (Rutina 3 - completada)
```javascript
[
  {
    id: 9,
    encargado_id: 2,  // Juan
    rutina_id: 3,
    incidente_id: null,
    descripcion: "Limpieza palieres piso 1-3",
    estado: "Finalizada",
    fecha_limite: null,
    notas_finalizacion: "Completado sin novedad",
    fecha_creacion: "2026-05-29T07:30:00Z"
  },
  {
    id: 10,
    encargado_id: 2,
    rutina_id: 3,
    incidente_id: null,
    descripcion: "Limpieza vidrios entrada",
    estado: "Finalizada",
    fecha_limite: null,
    notas_finalizacion: "Limpieza profunda realizada",
    fecha_creacion: "2026-05-29T07:30:00Z"
  },
  {
    id: 11,
    encargado_id: 2,
    rutina_id: 3,
    incidente_id: null,
    descripcion: "Riego de plantas",
    estado: "Finalizada",
    fecha_limite: null,
    notas_finalizacion: "Plantas hidratadas",
    fecha_creacion: "2026-05-29T07:30:00Z"
  }
]
```

### Correctivas - Pendiente (Incidente 1)
```javascript
[
  {
    id: 12,
    encargado_id: 2,  // Juan
    rutina_id: null,
    incidente_id: 1,  // Incidente abierto
    descripcion: "Cerrar llave de paso general",
    estado: "Pendiente",
    fecha_limite: "2026-05-31T12:00:00Z",
    notas_finalizacion: null,
    fecha_creacion: "2026-05-28T10:45:00Z"
  },
  {
    id: 13,
    encargado_id: 2,
    rutina_id: null,
    incidente_id: 1,
    descripcion: "Llamar al plomero para reparación",
    estado: "Pendiente",
    fecha_limite: "2026-05-31T18:00:00Z",
    notas_finalizacion: null,
    fecha_creacion: "2026-05-28T10:45:00Z"
  }
]
```

### Correctivas - En ejecución (Incidente 2)
```javascript
[
  {
    id: 14,
    encargado_id: 3,  // Carlos
    rutina_id: null,
    incidente_id: 2,  // Incidente en progreso
    descripcion: "Cambiar bombillas en palier 1",
    estado: "En ejecución",
    fecha_limite: "2026-05-30T17:00:00Z",
    notas_finalizacion: null,
    fecha_creacion: "2026-05-27T14:30:00Z"
  }
]
```

### Correctivas - Finalizada (Incidente 3 - resuelto)
```javascript
[
  {
    id: 15,
    encargado_id: 2,
    rutina_id: null,
    incidente_id: 3,  // Incidente resuelto
    descripcion: "Reparación de bisagra",
    estado: "Finalizada",
    fecha_limite: "2026-05-25T16:00:00Z",
    notas_finalizacion: "Bisagra reemplazada sin problemas",
    fecha_creacion: "2026-05-25T11:30:00Z"
  },
  {
    id: 16,
    encargado_id: 3,
    rutina_id: null,
    incidente_id: 3,
    descripcion: "Ajuste de cierre de puerta",
    estado: "Finalizada",
    fecha_limite: "2026-05-26T17:00:00Z",
    notas_finalizacion: "Cierre funciona correctamente",
    fecha_creacion: "2026-05-25T11:30:00Z"
  }
]
```

---

## Flujos Demostrables

Con estos datos, se pueden demostrar:

1. **Login:**
   - Admin: diego@consorcio.com / password123
   - Encargado: juan@consorcio.com / password123
   - Residente: ana@mail.com / password123

2. **Triage (Admin):**
   - 3 reclamos pendientes para revisar
   - Flujo: aprobar, rechazar, crear incidente

3. **Incidentes (Admin):**
   - 1 abierto (con tareas pendientes)
   - 1 en progreso (tareas en ejecución)
   - 1 resuelto (histórico)

4. **Tareas (Encargado):**
   - 5 preventivas pendientes (en rutina nueva)
   - 3 preventivas en ejecución
   - 2 correctivas pendientes
   - 1 correctiva en ejecución

5. **Rutinas (Encargado):**
   - 1 pendiente (para iniciar hoy)
   - 1 en progreso (parcial)
   - 1 completada (ayer)

6. **Avisos (Todos):**
   - 5 avisos diversos para ver tablón

---

## Script de Seeding

El script debe ejecutar en este orden:

```
1. Crear Unidades
2. Crear Personas
3. Crear Avisos
4. Crear Reclamos
5. Crear Incidentes
6. Crear Rutinas
7. Crear Tareas
```

Ubicación: `backend/src/seed/seed.ts`

Ejecución:
```bash
npm run seed:run      # Crea BD + seed si no existe
npm run seed:reset    # Borra y recrea BD + seed
```

---

## Próximos pasos

1. ✅ data-model.md
2. ✅ state-machines.md
3. ✅ tech-decisions.md
4. ✅ frontend-screens.md
5. ✅ error-contract.md
6. ✅ seed-data.md
7. **Actualizar endpoints.yaml** — agregar POST `/api/auth/login`
8. **Crear CLAUDE.md** — resumen de arquitectura para desarrollo
9. **Iniciar código** — backend + frontend
