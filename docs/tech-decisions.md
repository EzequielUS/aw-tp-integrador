# Tech Decisions — Sistema de Gestión de Consorcio

**Versión:** 1.0
**Fecha:** 2026-05-30

---

## Backend Stack

### Runtime & Framework
- **Node.js** (18+ LTS recomendado)
- **Express.js** — framework minimalista para API REST
- **TypeScript** — type safety, mejor DX

### ORM & Persistencia
- **SQLite** — base de datos embebida, sin setup externo
- **TypeORM** — ORM completo con decoradores, migraciones y generación de tipos
- **better-sqlite3** (opcional para querys custom) — si se necesita control directo

### Validación & Utilidades
- **class-validator** — decoradores para validación (integración TypeORM)
- **class-transformer** — transformación de DTOs
- **dotenv** — variables de entorno
- **jsonwebtoken** — generación y validación de JWT
- **bcrypt** — hash de contraseñas (si aplica)

### Testing
- **Jest** — framework de testing
- **supertest** — HTTP assertions para testing de endpoints
- **sqlite3** — para crear BD de test (opcional)

---

## Frontend Stack

### Framework & Build
- **React 18+** — UI library, simplicidad
- **Vite** — build tool rápido
- **TypeScript** — type safety en frontend

### Estilos & UI
- **CSS Modules** o **Tailwind CSS** (decidir según preferencia)
- **React Router v6** — routing

### Estado & Data Fetching
- **Axios** o **fetch API** — HTTP client
- **React Context** — state management simple (sin Redux)
- **JWT** — almacenado en localStorage, incluido en header Authorization

---

## Persistencia de Datos

### Base de Datos
```
proyecto/
  └─ data/
      └─ database.sqlite (creada al primer run)
```

### Inicialización BD
1. Al arrancar backend, verificar si `database.sqlite` existe
2. Si NO existe:
   - Ejecutar migraciones TypeORM
   - Cargar seed data automáticamente
3. Si existe: usar BD existente
4. Comando manual disponible: `npm run seed:reset` (borra y recrea BD + seed)

---

## Estructura de Carpetas

```
proyecto/
├── backend/
│   ├── src/
│   │   ├── entity/           # TypeORM entities (Persona, Reclamo, etc.)
│   │   ├── controller/       # Express route handlers
│   │   ├── service/          # Lógica de negocio
│   │   ├── middleware/       # Custom middleware (validación, errores)
│   │   ├── dto/              # Data Transfer Objects (request/response)
│   │   ├── database/         # Configuración TypeORM, migraciones
│   │   ├── seed/             # Scripts de seed data
│   │   └── app.ts            # Express app setup
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── pages/            # Páginas por rol (Residente, Admin, Encargado)
│   │   ├── services/         # API client, hooks
│   │   ├── context/          # React Context (rol simulado, etc.)
│   │   ├── styles/           # CSS/Tailwind
│   │   └── App.tsx           # Root component
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docs/
│   ├── data-model.md
│   ├── state-machines.md
│   ├── tech-decisions.md      (este archivo)
│   ├── frontend-screens.md
│   ├── error-contract.md
│   └── seed-data.md
│
├── README.md
└── .gitignore
```

---

## Scripts NPM Backend

```json
{
  "scripts": {
    "dev": "ts-node src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "seed:run": "ts-node src/seed/seed.ts",
    "seed:reset": "rm data/database.sqlite && npm run seed:run",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

---

## Scripts NPM Frontend

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest"
  }
}
```

---

## Formato de API Responses

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
    "code": "RESOURCE_NOT_FOUND",
    "message": "El reclamo con ID 123 no existe"
  }
}
```

Códigos de error estandarizados:
- `VALIDATION_ERROR` — entrada inválida
- `UNAUTHORIZED` — no tiene permiso
- `RESOURCE_NOT_FOUND` — entidad no existe
- `CONFLICT` — violación de constraint
- `INTERNAL_ERROR` — error del servidor

---

## Convenciones de Código

### TypeScript
- Strict mode: `"strict": true` en tsconfig.json
- Tipos explícitos en funciones públicas
- No usar `any`

### Express
- Rutas organizadas por dominio (avisos, reclamos, etc.)
- Middleware de error centralizado
- Status codes HTTP correctos

### React
- Componentes funcionales + hooks
- Props tipadas con TypeScript
- Separación de responsabilidades (container vs presentational)

---

## Entrega Final

```
work-integrador.zip (< 3 MB)
├── backend/         (sin node_modules)
├── frontend/        (sin node_modules)
├── docs/            (todos los .md)
└── README.md
```

Scripts en README:
```bash
cd backend && npm install && npm run seed:run
cd frontend && npm install
npm run dev        # backend
npm run dev        # frontend (otra terminal)
```

---

## Testing

### Backend Endpoints
1. **Postman Collection** — exportable para corrector
   - Ubicación: `backend/postman-collection.json`
   - Incluir requests para cada endpoint

2. **Jest Tests** — codificados
   - Ubicación: `backend/src/**/*.test.ts`
   - Usar supertest para HTTP assertions
   - Mín. 1 test por endpoint critical

### Frontend
- No se requiere unit testing del frontend (según TP)
- Manual testing: navegación, CRUD, reportes

---

## Próximos pasos

1. ✅ data-model.md
2. ✅ state-machines.md
3. ✅ tech-decisions.md
4. **frontend-screens.md** — definir pantallas por rol
5. **error-contract.md** — códigos de error específicos
6. **seed-data.md** — entidades concretas para seed
