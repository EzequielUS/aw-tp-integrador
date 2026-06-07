# Sistema de Gestión de Consorcio

Aplicación web full-stack para la gestión operativa de consorcios: reclamos, incidentes, rutinas de mantenimiento y avisos.

## Requisitos previos

- Node.js 18+
- npm 9+

---

## Instalación y configuración

### 1. Backend

```bash
cd backend
npm install
```

Crear el archivo de variables de entorno:

```bash
cp .env.example .env
```

El archivo `.env` generado tiene valores por defecto que funcionan para desarrollo:

```
PORT=3000
JWT_SECRET=change_this_secret_in_production
DATABASE_PATH=../data/database.sqlite
NODE_ENV=development
```

### 2. Frontend

```bash
cd frontend
npm install
```

---

## Levantar la aplicación

Se necesitan **dos terminales** abiertas al mismo tiempo.

### Terminal 1 — Backend

```bash
cd backend
npm run seed:reset   # Crea la base de datos y carga datos de prueba
npm run dev          # Inicia el servidor en http://localhost:3000
```

> Si la base de datos ya existe y solo querés iniciarla: `npm run dev` (carga el seed automáticamente si la BD está vacía).

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev          # Inicia la app en http://localhost:5173
```

Abrí el navegador en **http://localhost:5173**

---

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | diego@consorcio.com | password123 |
| Encargado | juan@consorcio.com | password123 |
| Encargado | carlos@consorcio.com | password123 |
| Residente | ana@mail.com | password123 |
| Residente | maria@mail.com | password123 |

---

## Scripts disponibles

### Backend (`cd backend`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor en modo desarrollo (puerto 3000) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Inicia la versión compilada |
| `npm run seed:run` | Carga datos de prueba (solo si la BD está vacía) |
| `npm run seed:reset` | Borra la BD y recarga todos los datos desde cero |
| `npm test` | Ejecuta los tests con Jest |

### Frontend (`cd frontend`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia la app en modo desarrollo (puerto 5173) |
| `npm run build` | Compila para producción |
| `npm run preview` | Previsualiza el build de producción |

---

## Estructura del proyecto

```
trabajo_integrador/
├── backend/
│   ├── src/
│   │   ├── entity/        # Entidades TypeORM (Persona, Reclamo, etc.)
│   │   ├── controller/    # Routers Express por módulo
│   │   ├── service/       # Lógica de negocio
│   │   ├── middleware/    # Auth JWT, manejo de errores
│   │   ├── database/      # Configuración TypeORM + SQLite
│   │   ├── seed/          # Script de datos de prueba
│   │   └── app.ts         # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/         # Páginas por módulo (residente, admin, encargado)
│   │   ├── components/    # Layout (Navbar, Sidebar), componentes compartidos
│   │   ├── context/       # AuthContext
│   │   ├── services/      # Cliente Axios + authService
│   │   └── App.tsx        # Rutas principales
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                  # Documentación de arquitectura
│   ├── data-model.md
│   ├── state-machines.md
│   ├── endpoints.yaml     # OpenAPI 3.0
│   └── ...
│
└── data/                  # Base de datos SQLite (generada automáticamente)
    └── database.sqlite
```

---

## API

**Base URL:** `http://localhost:3000/api`

| Módulo | Endpoints |
|--------|-----------|
| Auth | `POST /auth/login` |
| Avisos | `GET /avisos` · `POST /avisos` · `DELETE /avisos/:id` |
| Reclamos | `GET /reclamos` · `POST /reclamos` · `GET /reclamos/:id` · `PATCH /reclamos/:id` |
| Incidentes | `GET /incidentes` · `POST /incidentes` · `PATCH /incidentes/:id` · `GET/POST /incidentes/:id/tareas` |
| Rutinas | `GET /rutinas` · `POST /rutinas` · `PATCH /rutinas/:id` · `GET /rutinas/:id/tareas` |
| Tareas | `PATCH /tareas/:id` |
| Unidades | `GET /unidades` |
| Personas | `GET /personas` |

Ver especificación completa en `docs/endpoints.yaml` (OpenAPI 3.0).

---

## Empaquetado para entrega

```bash
# Desde la raíz del proyecto
zip -r trabajo-integrador.zip . \
  --exclude "*/node_modules/*" \
  --exclude "*/.git/*" \
  --exclude "*/dist/*" \
  --exclude "*/data/*"
```
