# CLAUDE.md — Sistema de Gestión de Consorcio

**Última actualización:** 2026-05-30  
**Etapa:** Documentación completada, listo para desarrollo de backend

---

## Resumen del Proyecto

**Nombre:** Sistema de Gestión de Consorcio (Incidentes)  
**Dominio:** Gestión operativa de consorcios/edificios  
**Actores:** Residente, Administrador, Encargado  
**Entregable:** Full-stack web app (backend + frontend + tests)

---

## Documentación Clave

La arquitectura completa está documentada en `docs/`:

| Documento | Propósito | Leer cuando... |
|-----------|-----------|---|
| `data-model.md` | Entidades SQL + relaciones | Antes de crear controllers/services |
| `state-machines.md` | Transiciones válidas por entidad | Antes de implementar lógica de negocio |
| `tech-decisions.md` | Stack (Express+TS, React, SQLite, TypeORM, Jest) | Antes de setup inicial |
| `frontend-screens.md` | Pantallas por rol, flujos, rutas | Antes de implementar React |
| `error-contract.md` | Códigos HTTP, formatos de error | Antes de implementar validaciones |
| `seed-data.md` | 40+ entidades de ejemplo | Al configurar seed script |

**Acceso rápido:** Cada doc tiene estructura clara con tablas, ejemplos de JSON, y próximos pasos.

---

## Stack Completo

### Backend
- **Runtime:** Node.js 18+ LTS
- **Framework:** Express.js + TypeScript
- **Database:** SQLite + TypeORM
- **Auth:** JWT (jsonwebtoken + bcrypt)
- **Validation:** class-validator + class-transformer
- **Testing:** Jest + supertest
- **Scripts:** `npm run dev`, `npm run seed:run`, `npm run test`

### Frontend
- **Framework:** React 18+ + TypeScript
- **Build:** Vite
- **HTTP:** Axios + React Context
- **Routing:** React Router v6
- **Styling:** CSS Modules (decidir Tailwind después)

### Database
- **Persistencia:** `/data/database.sqlite` (creada al primer run)
- **ORM:** TypeORM con decoradores
- **Migraciones:** Automáticas al startup
- **Seed:** Automático si BD vacía + comando manual `npm run seed:reset`

---

## Arquitectura de Datos

### 7 Entidades Core

```
Persona (rol: Residente | Administrador | Encargado)
├─ Aviso (tablón, solo admin crea)
├─ Reclamo (creador = Residente | Encargado)
│  └─ Incidente (creado al aprobar reclamo)
│     └─ Tarea (tareas correctivas)
├─ Rutina (encargado asignado)
│  └─ Tarea (tareas preventivas)
└─ Unidad (departamentos/viviendas)
```

**Constraint crítico:** `Tarea.incidente_id XOR Tarea.rutina_id` (nunca ambos)

---

## Máquinas de Estado

Todas las transiciones son **unidireccionales** hacia estados terminales:

| Entidad | Inicial | Transiciones | Terminal |
|---------|---------|--------------|----------|
| **Reclamo** | Pendiente | Aprobado, Rechazado | Ambos |
| **Incidente** | Abierto | En progreso → Resuelto | Resuelto |
| **Rutina** | Pendiente | En progreso → Completada | Completada |
| **Tarea** | Pendiente | En ejecución → Finalizada | Finalizada |
| **Aviso** | Publicado | Eliminado | Eliminado |

**Reglas clave:**
- Al aprobar Reclamo → crear Incidente automáticamente
- Al finalizar todas Tareas de Rutina → marcar Rutina Completada automáticamente
- Incidente requiere ≥1 Tarea para pasar a "En progreso"

---

## Autenticación

### Login Flow
```
POST /api/auth/login
  ↓ (email + password)
Backend valida + genera JWT
  ↓ 
Devuelve { token, user: { id, nombre, rol } }
  ↓
Frontend: localStorage["token"] + AuthContext
  ↓
Cada request: Authorization: Bearer {token}
```

### Roles & Permisos
- **Residente:** crear reclamos (propios), ver avisos, ver reportes
- **Administrador:** triage de reclamos, crear incidentes, asignar tareas, publicar avisos
- **Encargado:** ejecutar tareas, completar rutinas, crear reclamos (si descubre problema), ver avisos

---

## API Endpoints

**Base URL:** `http://localhost:3000/api`

### Auth
```
POST /api/auth/login  (200/401)
```

### Avisos
```
GET    /api/avisos           (200)
POST   /api/avisos           (201/403)
DELETE /api/avisos/{id}      (204/403/404)
```

### Reclamos
```
GET    /api/reclamos              (200)
POST   /api/reclamos              (201)
GET    /api/reclamos/{id}         (200/404)
PATCH  /api/reclamos/{id}         (200/400/403/404)
```

### Incidentes
```
GET    /api/incidentes            (200)
POST   /api/incidentes            (201/403)
GET    /api/incidentes/{id}       (200/404)
PATCH  /api/incidentes/{id}       (200/400/403/404)
POST   /api/incidentes/{id}/tareas (201/403/404)
GET    /api/incidentes/{id}/tareas (200/404)
```

### Rutinas
```
GET    /api/rutinas               (200)
POST   /api/rutinas               (201/403)
GET    /api/rutinas/{id}/tareas   (200/404)
```

### Tareas
```
PATCH  /api/tareas/{id}           (200/400/404)
```

Detalles: `endpoints.yaml` (OpenAPI 3.0.0)

---

## Formato de Respuestas

### Success (2xx)
```json
{
  "success": true,
  "data": { ... }
}
```

### Error (4xx/5xx)
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción legible"
  }
}
```

**Códigos estándar:** VALIDATION_ERROR, INVALID_TOKEN, UNAUTHORIZED, RESOURCE_NOT_FOUND, INVALID_STATE_TRANSITION, CONSTRAINT_VIOLATION, BUSINESS_LOGIC_ERROR, INTERNAL_ERROR

Detalles: `error-contract.md`

---

## Seed Data de Desarrollo

**Al arrancar backend, si BD vacía:**
- Crea 8 Personas (1 admin, 2 encargados, 5 residentes)
- Crea 10 Unidades
- Crea 5 Avisos
- Crea 6 Reclamos (3 pendientes, 2 aprobados, 1 rechazado)
- Crea 3 Incidentes (abierto, en progreso, resuelto)
- Crea 3 Rutinas (pendiente, en progreso, completada)
- Crea 16 Tareas (todos los estados)

**Credenciales para testing:**
- Admin: `diego@consorcio.com` / `password123`
- Encargado: `juan@consorcio.com` / `password123`
- Residente: `ana@mail.com` / `password123`

Detalles: `seed-data.md`

---

## Pantallas Frontend

**Login → Dashboard (dinámico por rol) → Módulos contextuales**

### Residente
- Mis Reclamos (ABM)
- Avisos
- Mis Reportes (gráfico de reclamos por estado)

### Administrador
- Triage de Reclamos (aprobar/rechazar)
- Gestión de Incidentes (crear, cambiar estado, asignar tareas)
- Rutinas (crear, ver tareas)
- Publicar Avisos

### Encargado
- Mis Tareas (preventivas + correctivas)
- Mis Rutinas (ver progreso, iniciar)
- Crear Reclamo
- Avisos

Detalles: `frontend-screens.md`

---

## Estructura de Carpetas

```
proyecto/
├── backend/
│   ├── src/
│   │   ├── entity/          # TypeORM entities
│   │   ├── controller/      # Express handlers
│   │   ├── service/         # Lógica de negocio
│   │   ├── middleware/      # Validación, errores, auth
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── database/        # Config TypeORM, migrations
│   │   ├── seed/            # Script de seed
│   │   └── app.ts           # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas por rol
│   │   ├── services/        # API client
│   │   ├── context/         # Auth context
│   │   ├── styles/          # CSS
│   │   └── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── docs/                    # Esta carpeta
```

---

## Comandos Clave

### Backend Setup
```bash
cd backend
npm install
npm run dev           # Start dev server (port 3000)
npm run seed:run      # Create seed data
npm run seed:reset    # Drop + recreate BD + seed
npm run test          # Run tests
npm run build         # Compile TypeScript
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev           # Start dev server (port 5173)
npm run build         # Build for production
npm run test          # Run tests
```

---

## Testing

### Backend
- **Postman Collection:** `backend/postman-collection.json` (exportable)
- **Jest Tests:** `backend/src/**/*.test.ts` (mín. 1 test por endpoint crítico)
- **Supertest:** HTTP assertions

### Frontend
- Manual testing (navegación, CRUD, reportes)
- No se requiere unit testing según TP

---

## Decisiones Clave Tomadas

✅ **Auth:** JWT (no sesiones)  
✅ **DB:** SQLite (embebida, sin setup)  
✅ **ORM:** TypeORM (decoradores, migraciones automáticas)  
✅ **Frontend:** React (más simple que Angular)  
✅ **Seed:** Automático + manual (`npm run seed:reset`)  
✅ **Roles:** Dinámicos en UI (mismo layout, diferente contenido)  
✅ **State Machine:** Unidireccional, estados terminales  
✅ **Error Format:** Estandarizado { success, error: { code, message } }

---

## Próximos Pasos (Orden Recomendado)

1. **Backend Base**
   - Setup Express + TypeORM + TypeScript
   - Crear entities (Persona, Reclamo, etc.)
   - Crear migraciones
   - Implementar seed script

2. **Backend Auth**
   - POST `/api/auth/login`
   - Middleware JWT
   - Crear controllers básicos

3. **Backend Lógica de Negocio**
   - Services por dominio (ReclamoService, IncidenteService, etc.)
   - Validaciones (state transitions, constraints)
   - Implementar todos los endpoints

4. **Testing Backend**
   - Jest setup
   - Tests de endpoints críticos
   - Postman collection

5. **Frontend**
   - Setup React + Vite + TypeScript
   - AuthContext + API client
   - Login page
   - Dashboard + Sidebar
   - Componentes por módulo

6. **Integration Testing**
   - Full end-to-end flows
   - Múltiples roles

---

## Convenciones Clave

- **TypeScript:** Strict mode siempre, no `any`
- **Express:** Middleware centralizado, status codes correctos
- **React:** Componentes funcionales + hooks, props tipadas
- **Nombres:** camelCase en código, snake_case en BD
- **Errores:** Centralizado en middleware + interceptor axios
- **Git:** Commits por funcionalidad, no por archivo

---

## FAQ Rápida

**P: ¿Autenticación/autorización completa?**  
R: JWT. No se requiere "login real" pero está implementado. Middleware en rutas protegidas.

**P: ¿Base de datos? ¿Migraciones?**  
R: SQLite embebida. TypeORM auto-crea tablas al startup. Seed automático si BD vacía.

**P: ¿Cómo seeding en producción?**  
R: Script manual (`npm run seed:run`). Sólo crea si no existe.

**P: ¿Sin login, cómo simulo roles?**  
R: JWT. Login real contra BD. Para testing, usar credenciales seed.

**P: ¿API responses format?**  
R: Estandarizado: `{ success: bool, data/error: {...} }`

**P: ¿Testing endpoints sin tests?**  
R: Postman collection exportable para corrector.

**P: ¿Soft-delete o hard-delete?**  
R: Avisos: soft-delete. Otros: se especifica en state-machines.

---

## Notas Finales

- Este documento es la fuente única de verdad. Léelo completo antes de cada sesión.
- Documentación de negocio está en `docs/`. No la dupliques en código.
- Las máquinas de estado son **restrictivas** — sólo permiten transiciones explícitas.
- Seed data es **reproducible** — mismo resultado cada ejecución.
- Frontend es **reactivo** — menú, dashboard, acciones cambian por rol sin reload.

---

**Estado:** Documentación lista. Desarrollo backend puede comenzar.
