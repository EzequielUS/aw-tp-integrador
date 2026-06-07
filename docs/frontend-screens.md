# Frontend Screens — Sistema de Gestión de Consorcio

**Versión:** 1.0
**Fecha:** 2026-05-30
**Framework:** React + TypeScript + Vite

---

## Arquitectura de Navegación

```
App (raíz)
├── PublicRoutes
│   └── LoginPage
└── PrivateRoutes (requiere JWT)
    ├── Layout (Sidebar + Header)
    │   ├── Navbar (usuario, logout)
    │   ├── Sidebar (menú vertical dinámico)
    │   └── MainContent (outlet para componentes)
    │
    ├── Dashboard (resumen según rol)
    │
    └── Módulos Dinámicos (según rol)
        ├── Módulo Residente
        ├── Módulo Administrador
        └── Módulo Encargado
```

---

## 1. PANTALLA DE LOGIN

**Ruta:** `/login`
**Tipo:** Pública (sin JWT requerido)

### Campos
- Email (required)
- Contraseña (required)
- Botón "Ingresar"

### Flujo
1. Usuario ingresa credenciales
2. POST `/api/auth/login` → `{ email, password }`
3. Backend valida y devuelve: `{ token: "jwt...", user: { id, nombre, rol } }`
4. Frontend almacena token en localStorage
5. Redirige a `/dashboard`

### Validación
- Email válido (formato)
- Contraseña mínimo 6 caracteres
- Mostrar error si credenciales inválidas

---

## 2. PANTALLA PRINCIPAL - DASHBOARD

**Ruta:** `/dashboard`
**Tipo:** Privada (requiere JWT)
**Acceso:** Todos los roles

### Componentes Principales

#### Navbar (Superior)
- Logo/título "Sistema de Consorcio"
- Usuario logueado (nombre, rol)
- Botón Logout

#### Sidebar (Izquierda - Menú Dinámico)
Muestra módulos según `user.rol`:

**Si rol = "Residente":**
- 📋 Mis Reclamos
- 📢 Avisos
- 📊 Mis Reportes

**Si rol = "Administrador":**
- ✅ Triage de Reclamos
- 🔴 Gestión de Incidentes
- 📋 Rutinas
- 📢 Publicar Avisos

**Si rol = "Encargado":**
- 📋 Mis Tareas
- 📅 Mis Rutinas
- ✏️ Crear Reclamo (si se descubre problema)
- 📢 Avisos

#### Contenido Principal - Resumen
**Componente: ResumenCards**

Muestra dinámicamente según rol:

**RESIDENTE:**
- Card 1: "Reclamos Pendientes" (count)
- Card 2: "Reclamos Aprobados" (count)
- Card 3: "Últimos Avisos" (list de 3 avisos recientes)

**ADMINISTRADOR:**
- Card 1: "Reclamos por Revisar" (count, Pendiente)
- Card 2: "Incidentes Abiertos" (count)
- Card 3: "Últimos Avisos" (list)

**ENCARGADO:**
- Card 1: "Tareas Pendientes Hoy" (count)
- Card 2: "Rutina Actual" (estado)
- Card 3: "Últimos Avisos" (list)

---

## 3. MÓDULO RESIDENTE

### 3.1. Mis Reclamos (ABM)

**Ruta:** `/residente/reclamos`

#### Vista: Listado
- Tabla con columnas:
  - ID
  - Unidad
  - Descripción (truncada)
  - Estado (Pendiente, Aprobado, Rechazado)
  - Fecha Creación
  - Acciones (Ver, Editar si Pendiente)

- Filtros:
  - Por estado (dropdown)
  - Buscar por descripción

#### Vista: Crear Reclamo
- Form:
  - Unidad (dropdown)
  - Descripción (textarea)
  - Botón "Crear"
- Validaciones: ambos campos requeridos
- Success: mostrar modal + limpiar form + recargar lista

#### Vista: Editar Reclamo (solo si estado = Pendiente)
- Pre-llenar formulario con datos actuales
- Permitir editar Unidad y Descripción
- Botón "Guardar"
- Botón "Cancelar"

#### Vista: Ver Detalle
- Mostrar todos los campos
- Si hay Incidente vinculado, link al incidente
- Botón "Volver"

---

### 3.2. Avisos

**Ruta:** `/residente/avisos`

#### Vista: Listado
- Tabla con columnas:
  - Fecha Publicación
  - Título
  - Cuerpo (truncado, expandible)
  - Acciones (Ver Detalle)

- Sin filtros (solo avisos públicos)

#### Vista: Detalle
- Título grande
- Cuerpo completo
- Fecha
- Botón "Volver"

---

### 3.3. Mis Reportes

**Ruta:** `/residente/reportes`

#### Reporte: Estado de Mis Reclamos
- Gráfico de pastel: Pendiente | Aprobado | Rechazado (count)
- Tabla debajo: listado de reclamos con estado actual
- Export a CSV (opcional)

---

## 4. MÓDULO ADMINISTRADOR

### 4.1. Triage de Reclamos

**Ruta:** `/admin/triage`

#### Vista: Listado Pendientes
- Tabla con columnas:
  - ID
  - Residente
  - Unidad
  - Descripción
  - Fecha Creación
  - Acciones (Revisar)

- Filtros:
  - Estado (solo Pendiente por defecto)

#### Vista: Detalle + Decisión
- Mostrar reclamo completo
- Dos botones:
  - "✅ Aprobar" → Abre modal para definir nivel_gravedad (Baja/Media/Alta) + crear Incidente
  - "❌ Rechazar" → Abre modal para escribir motivo_rechazo

- Después de aprobar/rechazar: redirige a listado

---

### 4.2. Gestión de Incidentes

**Ruta:** `/admin/incidentes`

#### Vista: Listado
- Tabla con columnas:
  - ID
  - Gravedad (Baja/Media/Alta con color)
  - Descripción (truncada)
  - Estado (Abierto, En progreso, Resuelto)
  - Acciones (Ver, Editar Estado, Asignar Tareas)

- Filtros:
  - Por Gravedad
  - Por Estado
  - Buscar descripción

#### Vista: Crear Incidente (Manual)
- Form:
  - Nivel Gravedad (radio: Baja/Media/Alta)
  - Descripción (textarea)
  - Botón "Crear"

#### Vista: Editar Estado Incidente
- Mostrar estado actual
- Dropdown para cambiar estado (Abierto → En progreso → Resuelto)
- Botón "Guardar"

#### Vista: Asignar Tareas al Incidente
**Ruta:** `/admin/incidentes/{id}/tareas`

- Listado de tareas correctivas actuales (si existen)
- Form para crear nueva tarea:
  - Encargado (dropdown)
  - Descripción (textarea)
  - Fecha Límite (datetime picker, opcional)
  - Botón "Asignar"

---

### 4.3. Rutinas

**Ruta:** `/admin/rutinas`

#### Vista: Listado
- Tabla con columnas:
  - ID
  - Encargado
  - Fecha Asignación
  - Estado (Pendiente, En progreso, Completada)
  - Acciones (Ver, Editar, Ver Tareas)

- Filtros:
  - Por Encargado
  - Por Fecha
  - Por Estado

#### Vista: Crear Rutina
- Form:
  - Encargado (dropdown)
  - Fecha Asignación (date picker)
  - Tareas (textarea, una por línea o multiline)
  - Botón "Crear Rutina + Tareas"
- Al crear: genera Rutina + N Tareas preventivas

#### Vista: Ver Tareas de Rutina
**Ruta:** `/admin/rutinas/{id}/tareas`

- Listado de tareas preventivas
- Columnas: ID, Descripción, Estado, Acciones

---

### 4.4. Publicar Avisos

**Ruta:** `/admin/avisos/crear`

#### Vista: Form Crear Aviso
- Campos:
  - Título (required)
  - Cuerpo (textarea, required)
  - Botón "Publicar"
- Validaciones: ambos requeridos
- Success: mostrar toast + limpiar + redirigir a `/admin/avisos`

#### Vista: Listado de Avisos Publicados
**Ruta:** `/admin/avisos`

- Tabla con columnas:
  - ID
  - Título
  - Fecha Publicación
  - Acciones (Eliminar)

- Botón "Crear Nuevo Aviso" (link a crear)

---

## 5. MÓDULO ENCARGADO

### 5.1. Mis Tareas

**Ruta:** `/encargado/tareas`

#### Vista: Listado
- Tabla con columnas:
  - ID
  - Descripción
  - Tipo (Preventiva/Correctiva)
  - Estado (Pendiente, En ejecución, Finalizada)
  - Fecha Límite (si existe)
  - Acciones (Ver, Actualizar Estado)

- Filtros:
  - Por Estado
  - Por Tipo
  - Buscar descripción

- Información destacada: "N tareas pendientes hoy"

#### Vista: Actualizar Estado de Tarea
**Ruta:** `/encargado/tareas/{id}/actualizar`

- Mostrar estado actual
- Transiciones permitidas (según state machine):
  - Pendiente → En ejecución
  - En ejecución → Finalizada (+ campo notas)

- Form:
  - Estado (dropdown con transiciones válidas)
  - Notas (textarea, solo aparece si transición es a Finalizada)
  - Botón "Guardar"

- Al finalizar todas las tareas de una Rutina → Rutina se marca Completada automáticamente

---

### 5.2. Mis Rutinas

**Ruta:** `/encargado/rutinas`

#### Vista: Listado
- Tabla con columnas:
  - ID
  - Fecha Asignación
  - Estado (Pendiente, En progreso, Completada)
  - % Completado (N tareas finalizadas / total)
  - Acciones (Ver, Cambiar Estado)

- Filtro:
  - Por Estado

#### Vista: Detalle Rutina
**Ruta:** `/encargado/rutinas/{id}`

- Mostrar Rutina (fecha, estado, encargado)
- Listado de Tareas preventivas asociadas:
  - Tabla: Descripción, Estado, Fecha Límite, Acciones
  - Acciones: botón para cambiar estado de cada tarea

- Botón "Marcar Como En Progreso" (si Pendiente)
- Progreso visual: barra de % completado

#### Vista: Crear Reclamo Nuevo
**Ruta:** `/encargado/crear-reclamo`

(Accesible desde Sidebar)

- Form:
  - Unidad (dropdown)
  - Descripción (textarea)
  - Botón "Crear Reclamo"
- Mismo flujo que Residente

---

### 5.3. Avisos

**Ruta:** `/encargado/avisos`

- Mismo listado que Residente (read-only)

---

## Componentes Reutilizables

```
src/components/
├── Layout/
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
│   └── Layout.tsx
├── Common/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Toast.tsx
│   └── Table.tsx
├── Forms/
│   ├── ReclamoForm.tsx
│   ├── IncidenteForm.tsx
│   ├── TareaForm.tsx
│   └── AvisoForm.tsx
└── Shared/
    ├── ProtectedRoute.tsx
    └── ErrorBoundary.tsx
```

---

## Contexts & Hooks

```
src/context/
├── AuthContext.tsx        (usuario, token, rol)
└── useAuth.ts             (hook para acceder contexto)

src/services/
├── api.ts                 (configuración axios + interceptores)
└── authService.ts         (login, logout, refresh token)
```

---

## Flujos de Autenticación

### Login
1. Usuario ingresa email + password
2. POST `/api/auth/login`
3. Backend devuelve `{ token, user: { id, nombre, rol } }`
4. Frontend: guardar token en localStorage + actualizar AuthContext
5. Redirigir a `/dashboard`

### Logout
1. Botón Logout en Navbar
2. Limpiar localStorage (token)
3. Limpiar AuthContext
4. Redirigir a `/login`

### Refresh Token (si aplica)
- Token incluido en header `Authorization: Bearer {token}` en cada request
- Si token expira (401): solicitar refresh o redirigir a login

---

## Validaciones & Errores

### Frontend
- Campos requeridos: color rojo, mensaje bajo campo
- Formato email: validar con regex
- Textarea min length: 10 caracteres

### Backend (responses 4xx/5xx)
- Mostrar toast con mensaje de error
- Log errors en console para debugging
- Redirigir a login si 401 (Unauthorized)

---

## Próximos pasos

1. ✅ data-model.md
2. ✅ state-machines.md
3. ✅ tech-decisions.md
4. ✅ frontend-screens.md
5. **error-contract.md** — códigos HTTP específicos
6. **seed-data.md** — entidades para seed
7. **endpoints.yaml** (actualizar) — agregar POST /api/auth/login
