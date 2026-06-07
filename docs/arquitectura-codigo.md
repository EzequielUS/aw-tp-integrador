# Arquitectura del Código — Guía de Ownership

Este documento explica cómo está organizado el proyecto, qué hace cada carpeta y cada archivo clave, y cómo fluye una request de punta a punta. El objetivo es que puedas entender el código, modificarlo con confianza y saber dónde tocar cuando algo falla.

---

## Visión general

El proyecto tiene dos partes completamente separadas que se comunican por HTTP:

```
Browser (React) ──────── HTTP/JSON ────────► Express (Node.js)
  puerto 5173                                   puerto 3000
                                                    │
                                               SQLite (archivo)
                                            data/database.sqlite
```

El frontend nunca toca la base de datos directamente. Todo pasa por la API del backend.

---

## Flujo de una request típica

Cuando el usuario hace algo en la UI (ej: aprobar un reclamo), esto es lo que pasa:

```
1. Página React llama a api.patch('/reclamos/4', { estado: 'Aprobado', nivel_gravedad: 'Alta' })
2. api.ts agrega el header Authorization: Bearer <token> automáticamente
3. La request llega al servidor Express (app.ts)
4. app.ts la enruta a reclamosRouter.ts
5. reclamosRouter.ts valida los datos del body y llama a ReclamosService.triage()
6. ReclamosService.triage() aplica las reglas de negocio:
   - verifica que el reclamo esté en estado Pendiente
   - crea un Incidente nuevo en la BD
   - vincula el Incidente al Reclamo
7. reclamosRouter.ts devuelve { success: true, data: reclamoActualizado }
8. La página React actualiza su estado y re-renderiza la tabla
```

---

## Backend

### Estructura de carpetas

```
backend/src/
├── app.ts              ← punto de entrada, configura Express
├── database/
│   └── data-source.ts  ← conexión a SQLite con TypeORM
├── entity/             ← tablas de la base de datos
├── controller/         ← rutas HTTP (reciben request, devuelven response)
├── service/            ← lógica de negocio (reglas, validaciones, BD)
├── middleware/         ← funciones que se ejecutan antes/después de cada request
└── seed/
    └── seed.ts         ← script que carga datos de prueba
```

### `app.ts` — El punto de entrada

Es donde arranca todo. Hace tres cosas:

1. Crea la app Express y registra `express.json()` para poder leer el body de las requests
2. Conecta cada prefijo de URL (`/api/reclamos`, `/api/incidentes`, etc.) con su router correspondiente
3. Registra el `errorHandler` al **final** de todo — Express lo llama automáticamente cuando alguna función llama `next(error)`

La función `bootstrap()` inicializa la conexión a la base de datos antes de empezar a escuchar conexiones. Si la BD falla, el servidor no arranca.

---

### `database/data-source.ts` — La conexión a SQLite

Configura TypeORM para usar SQLite. Lo más importante:

- `synchronize: true` — TypeORM lee las entidades y **crea o modifica las tablas automáticamente** al arrancar. No hace falta correr migraciones manualmente. En producción real esto sería peligroso, pero para el TP es conveniente.
- `entities` — le dice a TypeORM dónde están las clases que representan tablas
- La ruta del archivo `.sqlite` viene de la variable de entorno `DATABASE_PATH` (definida en `.env`)

---

### `entity/` — Las tablas de la base de datos

Cada archivo es una clase TypeScript decorada que representa una tabla en SQLite. TypeORM lee estos decoradores para saber qué columnas crear.

| Archivo | Tabla | Descripción |
|---------|-------|-------------|
| `Persona.ts` | Persona | Usuarios del sistema. El campo `rol` determina qué puede hacer cada uno |
| `Unidad.ts` | Unidad | Departamentos/viviendas del edificio (1A, 2B, PB, etc.) |
| `Aviso.ts` | Aviso | Publicaciones del tablón. Tiene `eliminado: 0/1` para soft-delete |
| `Reclamo.ts` | Reclamo | Queja creada por Residente o Encargado. Puede tener un Incidente vinculado |
| `Incidente.ts` | Incidente | Problema validado. Se crea automáticamente al aprobar un Reclamo, o manualmente |
| `Rutina.ts` | Rutina | Plan diario de trabajo. Unique por encargado + fecha (no puede haber dos rutinas el mismo día para el mismo encargado) |
| `Tarea.ts` | Tarea | Unidad de trabajo. Pertenece a un Incidente (correctiva) O a una Rutina (preventiva), nunca a los dos |

**Cómo leer una entidad:**

```typescript
// En Tarea.ts
@Column({ name: 'incidente_id', type: 'integer', nullable: true })
incidenteId!: number | null;
```

- `@Column` le dice a TypeORM que esto es una columna de la tabla
- `name: 'incidente_id'` es el nombre en la BD (snake_case), `incidenteId` es el nombre en TypeScript (camelCase)
- `nullable: true` significa que puede ser NULL en la BD
- `type: 'integer'` es necesario en SQLite cuando el campo puede ser null, porque TypeORM no puede inferir el tipo de `number | null`

**Relaciones entre entidades:**

```typescript
// En Persona.ts
@OneToMany(() => Reclamo, (reclamo) => reclamo.creador)
reclamos!: Reclamo[];
```

Esto le dice a TypeORM: "una Persona puede tener muchos Reclamos". Cuando buscás una Persona con `relations: ['reclamos']`, TypeORM hace el JOIN automáticamente.

---

### `controller/` — Las rutas HTTP

Cada archivo define las rutas de un módulo. Su responsabilidad es:
1. Extraer y validar los datos del request (body, params)
2. Llamar al service correspondiente
3. Devolver la response con el formato correcto

**Nunca tienen lógica de negocio.** Si necesitás cambiar una regla de negocio, el controller no se toca.

| Archivo | Rutas que maneja |
|---------|-----------------|
| `authRouter.ts` | `POST /api/auth/login` |
| `avisosRouter.ts` | `GET/POST /api/avisos`, `DELETE /api/avisos/:id` |
| `reclamosRouter.ts` | `GET/POST /api/reclamos`, `GET/PATCH /api/reclamos/:id` |
| `incidentesRouter.ts` | `GET/POST /api/incidentes`, `GET/PATCH /api/incidentes/:id`, `GET/POST /api/incidentes/:id/tareas` |
| `rutinasRouter.ts` | `GET/POST /api/rutinas`, `PATCH /api/rutinas/:id`, `GET /api/rutinas/:id/tareas` |
| `tareasRouter.ts` | `PATCH /api/tareas/:id` |
| `unidadesRouter.ts` | `GET /api/unidades` |
| `personasRouter.ts` | `GET /api/personas` |

**Patrón que sigue cada ruta:**

```typescript
router.patch('/:id', authenticate, authorize('Administrador'), async (req, res, next) => {
  try {
    // 1. Extraer y validar datos
    const id = parseInt(req.params.id);
    const { estado } = req.body;
    if (typeof estado !== 'string') throw AppError.validationError('...');

    // 2. Llamar al service
    const resultado = await service.updateEstado(id, estado);

    // 3. Responder
    res.json({ success: true, data: resultado });
  } catch (err) {
    next(err); // pasa el error al errorHandler
  }
});
```

Los middlewares `authenticate` y `authorize(...)` van entre la ruta y el handler — son los "guardianes" que verifican el token y el rol antes de ejecutar la lógica.

---

### `service/` — La lógica de negocio

Esta es la parte más importante del backend. Los services son donde viven las reglas del negocio: qué transiciones de estado son válidas, qué side-effects ocurren, qué constraints se validan.

#### `AuthService.ts`

- `login(email, password)` — busca la Persona por email, compara la contraseña con bcrypt, y si todo está bien, genera un JWT firmado que dura 8 horas. El JWT contiene `{ id, email, rol }`.

#### `AvisosService.ts`

- `getAll()` — devuelve solo los avisos con `eliminado = 0` (los borrados no aparecen)
- `create(administradorId, titulo, cuerpo)` — crea un aviso nuevo
- `remove(id)` — soft-delete: pone `eliminado = 1` en lugar de borrar el registro. Así el historial queda en la BD.

#### `ReclamosService.ts`

- `getAll()` — lista todos los reclamos con sus relaciones (creador, unidad, incidente)
- `getById(id)` — busca uno por ID, lanza error 404 si no existe
- `create(creadorId, unidadId, descripcion)` — crea un reclamo en estado `Pendiente`
- `triage(id, estado, motivoRechazo?, nivelGravedad?)` — **la función más importante de este servicio**. Implementa la máquina de estado del Reclamo:
  - Solo acepta transiciones desde `Pendiente`
  - Si el estado destino es `Rechazado`, requiere `motivoRechazo`
  - Si el estado destino es `Aprobado`, requiere `nivelGravedad` y **crea automáticamente un Incidente** vinculado al reclamo

#### `IncidentesService.ts`

- `getAll()`, `getById(id)` — consultas estándar
- `create(nivelGravedad, descripcion, reclamoId?)` — crea un incidente manual (sin reclamo origen)
- `updateEstado(id, nuevoEstado)` — aplica la máquina de estado del Incidente:
  - `Abierto → En progreso`: requiere que haya al menos 1 tarea correctiva asignada
  - `En progreso → Resuelto`: requiere que todas las tareas estén en estado `Finalizada`
- `addTarea(incidenteId, encargadoId, descripcion, fechaLimite?)` — crea una tarea correctiva y la vincula al incidente
- `getTareas(incidenteId)` — lista las tareas de un incidente

#### `RutinasService.ts`

- `create(encargadoId, fechaAsignacion, tareas[])` — crea la rutina y todas sus tareas preventivas en una sola operación. Si ya existe una rutina para ese encargado en esa fecha, TypeORM lanza un error de unique constraint.
- `updateEstado(id, nuevoEstado)` — aplica la máquina de estado de la Rutina:
  - `Pendiente → En progreso`: sin restricciones, el encargado decide cuándo empezar
  - `En progreso → Completada`: requiere que todas las tareas estén `Finalizada`
- `getTareas(rutinaId)` — lista las tareas de una rutina

#### `TareasService.ts`

- `updateEstado(id, nuevoEstado, notasFinalizacion?)` — aplica la máquina de estado de la Tarea:
  - `Pendiente → En ejecución`
  - `En ejecución → Finalizada`
  - Después de finalizar, llama a `checkAutoCompleteRutina()` si la tarea pertenece a una rutina
- `checkAutoCompleteRutina(rutinaId)` — función privada que carga la rutina con todas sus tareas y, si **todas** están `Finalizada`, cambia la rutina a `Completada` automáticamente. Así el encargado no necesita marcar la rutina manualmente.

---

### `middleware/` — Funciones transversales

#### `AppError.ts`

Define la clase `AppError` que extiende `Error`. En lugar de tirar errores genéricos, el código tira errores tipados:

```typescript
throw AppError.notFound('Reclamo', 4);
// equivale a: new AppError('RESOURCE_NOT_FOUND', 'Reclamo con ID 4 no existe', 404)
```

Los factory methods estáticos (`notFound`, `unauthorized`, `businessLogicError`, etc.) son atajos para los 10 tipos de error definidos en el contrato de errores. Esto garantiza que todos los errores tengan el mismo formato JSON.

#### `errorHandler.ts`

Middleware de Express que captura todos los errores que llegan con `next(err)`. Si el error es un `AppError`, lo serializa al formato estándar `{ success: false, error: { code, message } }`. Si es cualquier otro error inesperado, devuelve un 500 genérico.

**Por qué va al final de `app.ts`:** Express identifica los middleware de error por tener 4 parámetros `(err, req, res, next)`. Solo se invoca cuando alguna función anterior llamó `next(error)`.

#### `auth.ts`

Dos funciones que se usan como middleware en las rutas:

- `authenticate` — lee el header `Authorization: Bearer <token>`, verifica la firma del JWT con la clave secreta, y guarda el payload decodificado en `req.user`. Si el token falta o es inválido, corta la request con 401.
- `authorize(...roles)` — verifica que `req.user.rol` esté dentro de los roles permitidos. Si no, corta con 403. Se usa así: `authorize('Administrador')` o `authorize('Residente', 'Encargado')`.

---

### `seed/seed.ts` — Datos de prueba

Script independiente que se ejecuta con `npm run seed:run`. Crea 40+ registros en este orden (el orden importa por las foreign keys):

1. Unidades → 2. Personas → 3. Avisos → 4. Incidentes (sin reclamoId aún) → 5. Reclamos (apuntando a los incidentes) → 6. Actualiza reclamoId en los incidentes → 7. Rutinas → 8. Tareas

Usar `npm run seed:reset` borra el archivo `.sqlite` y vuelve a correr el seed desde cero. Útil para resetear el estado durante el desarrollo.

---

## Frontend

### Estructura de carpetas

```
frontend/src/
├── main.tsx            ← punto de entrada, monta React en el DOM
├── App.tsx             ← define todas las rutas de la app
├── styles/
│   └── global.css      ← clases CSS reutilizables (badges, botones, formularios)
├── context/
│   └── AuthContext.tsx ← estado global del usuario logueado
├── services/
│   ├── api.ts          ← cliente HTTP (axios configurado)
│   └── authService.ts  ← función login()
├── components/
│   ├── Layout/         ← estructura visual de la app (navbar + sidebar + contenido)
│   └── Shared/         ← componentes de utilidad
└── pages/              ← una carpeta por módulo
    ├── LoginPage.tsx
    ├── DashboardPage.tsx
    ├── AvisosPage.tsx  ← compartida entre roles
    ├── residente/
    ├── admin/
    └── encargado/
```

---

### `main.tsx` — El punto de entrada

Monta la aplicación React en el elemento `<div id="root">` del `index.html`. Es boilerplate puro, no hace falta modificarlo.

---

### `App.tsx` — El mapa de rutas

Define qué componente se muestra para cada URL. Usa React Router v6.

Hay dos tipos de rutas:
- **Públicas** (`/login`): accesibles sin token
- **Privadas** (todo lo demás): envueltas en `ProtectedRoute`, que redirige a `/login` si no hay sesión

Las rutas privadas usan el componente `Layout` como wrapper — esto hace que todas las páginas internas compartan el Navbar y el Sidebar sin repetir código.

```
/login                    → LoginPage (pública)
/dashboard                → DashboardPage (privada, todos los roles)
/residente/reclamos       → ReclamosPage
/admin/triage             → TriagePage
/encargado/tareas         → TareasPage
... etc
```

No hay ninguna protección por rol en las rutas — si un Residente escribe `/admin/triage` en la URL, puede entrar. La protección real está en el backend (el PATCH de reclamos rechazará la request si el token no es de un Administrador). Para el TP esto es suficiente.

---

### `context/AuthContext.tsx` — El estado global de sesión

Es el corazón de la autenticación en el frontend. Implementa el patrón React Context para compartir el estado del usuario entre todos los componentes sin pasar props.

**Funciones expuestas:**

- `setAuth(token, user)` — guarda el token y el usuario tanto en el estado de React como en `localStorage`. El `localStorage` hace que la sesión persista si el usuario recarga la página.
- `logout()` — borra el token del estado y del `localStorage`
- `isAuthenticated` — booleano, `true` si hay token
- `user` — objeto con `{ id, nombre, apellido, email, rol }`

**`loadFromStorage()`** — función que se llama al inicializar el contexto. Lee el token y el usuario del `localStorage` para restaurar la sesión automáticamente cuando el usuario vuelve al sitio.

**`useAuth()`** — hook personalizado que los componentes usan para acceder al contexto. Si se llama fuera del `AuthProvider`, tira un error.

---

### `services/api.ts` — El cliente HTTP

Instancia de Axios configurada con dos interceptores:

**Interceptor de request** — antes de enviar cualquier request, lee el token del `localStorage` y lo agrega al header `Authorization: Bearer <token>`. Esto significa que **ninguna página tiene que acordarse de enviar el token manualmente**.

**Interceptor de response** — si cualquier request devuelve un 401 (token expirado o inválido), limpia el `localStorage` y redirige al login automáticamente. Así el usuario nunca queda "atrapado" con una sesión inválida.

---

### `services/authService.ts`

Tiene una sola función: `login(email, password)`. Llama a `POST /api/auth/login` y devuelve `{ token, user }`. La página `LoginPage` la usa y después llama a `setAuth()` para guardar la sesión.

---

### `components/Layout/`

Son los tres componentes que forman el "shell" visual de todas las páginas privadas.

- **`Layout.tsx`** — el contenedor principal. Usa `<Outlet />` de React Router, que es donde se renderiza la página activa. Es como un "slot" donde se inserta el contenido.
- **`Navbar.tsx`** — barra superior con el título, el nombre del usuario, su rol y el botón de logout. Lee el usuario de `useAuth()`.
- **`Sidebar.tsx`** — menú lateral. Tiene un objeto `MENU` que mapea cada rol a sus links. Lee el rol del usuario de `useAuth()` y muestra solo los links correspondientes. Usa `NavLink` de React Router para resaltar automáticamente el link activo.

---

### `components/Shared/ProtectedRoute.tsx`

Componente muy simple: si `isAuthenticated` es `true`, renderiza sus hijos (`children`). Si no, redirige a `/login`. Se usa en `App.tsx` para envolver las rutas privadas.

---

### `pages/` — Las páginas

Cada página es un componente React independiente. El patrón que siguen es siempre el mismo:

```typescript
export default function MiPagina() {
  // 1. Estado local con useState
  const [datos, setDatos] = useState([]);
  const [error, setError] = useState('');

  // 2. Cargar datos al montar el componente
  useEffect(() => {
    api.get('/endpoint').then(r => setDatos(r.data.data));
  }, []);

  // 3. Handlers para acciones del usuario
  async function handleAccion() {
    try {
      await api.post('/endpoint', payload);
      cargarDatos(); // refresca
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Error');
    }
  }

  // 4. JSX con la UI
  return (<div>...</div>);
}
```

#### Páginas por módulo

**Residente:**
- `ReclamosPage.tsx` — lista los reclamos del usuario con filtro por estado, y tiene un formulario inline para crear nuevos
- `ReportesPage.tsx` — cuenta los reclamos por estado y los muestra como cards de colores + tabla

**Administrador:**
- `TriagePage.tsx` — muestra solo los reclamos `Pendientes`. Tiene modales para aprobar (con selector de gravedad) o rechazar (con campo de motivo). Llama a `PATCH /reclamos/:id`.
- `IncidentesPage.tsx` — lista incidentes con su estado y gravedad. Permite avanzar el estado (Abierto → En progreso → Resuelto) y asignar tareas correctivas con un modal.
- `RutinasPage.tsx` — crea rutinas con sus tareas (texto libre, una por línea). Muestra las tareas de cada rutina en un modal.
- `AdminAvisosPage.tsx` — formulario de creación de avisos + tabla de los publicados con botón de eliminar.

**Encargado:**
- `TareasPage.tsx` — lista todas las tareas del encargado (preventivas y correctivas), con filtros por estado y tipo. El modal de actualización muestra solo las transiciones válidas según el estado actual, y pide notas al finalizar.
- `RutinasEncargadoPage.tsx` — lista las rutinas asignadas con barra de progreso (% de tareas finalizadas). El modal de detalle permite iniciar la rutina.
- `CrearReclamoPage.tsx` — formulario simple para que el encargado reporte un problema.

**Compartidas:**
- `DashboardPage.tsx` — página de bienvenida. Carga conteos de reclamos e incidentes y muestra cards distintas según el rol del usuario.
- `AvisosPage.tsx` — listado de avisos con modal para ver el contenido completo. Usada tanto por Residente como por Encargado.

---

### `styles/global.css` — Sistema de estilos

En lugar de crear CSS específico para cada componente, hay un archivo global con clases utilitarias reutilizables:

- `.badge`, `.badge-pendiente`, `.badge-aprobado`, etc. — para los estados con colores
- `.btn`, `.btn-primary`, `.btn-danger`, `.btn-secondary`, `.btn-sm` — botones
- `.form-group` — campo de formulario con label
- `.card`, `.cards-grid`, `.stat-card` — tarjetas del dashboard
- `.modal-overlay`, `.modal` — ventanas modales
- `.filters` — fila de filtros
- `.page-header`, `.page-title` — encabezado de cada página
- `.error-msg`, `.success-msg` — mensajes de feedback

Para agregar estilos específicos de un componente podés usar CSS Modules (crear un archivo `.module.css` al lado del componente) como ya se hace con `LoginPage.module.css` y los componentes de Layout.

---

## Dónde tocar según lo que querés hacer

| Tarea | Dónde ir |
|-------|----------|
| Cambiar una regla de negocio (ej: validación de estado) | `backend/src/service/NombreService.ts` |
| Agregar un campo nuevo a una tabla | `backend/src/entity/NombreEntidad.ts` + seed |
| Agregar un endpoint nuevo | `backend/src/controller/router.ts` + `app.ts` |
| Cambiar un mensaje de error | `backend/src/middleware/AppError.ts` |
| Cambiar lo que se ve en una página | `frontend/src/pages/...` |
| Cambiar el menú lateral | `frontend/src/components/Layout/Sidebar.tsx` |
| Agregar una ruta nueva | `frontend/src/App.tsx` + nueva página en `pages/` |
| Cambiar colores o estilos globales | `frontend/src/styles/global.css` |
| Agregar datos al seed | `backend/src/seed/seed.ts` |

---

## Cosas importantes a tener en cuenta

**El token JWT dura 8 horas.** Si el corrector prueba el sistema y el token expira, tiene que hacer logout y login de nuevo. Esto es comportamiento esperado.

**`synchronize: true` en TypeORM.** Cada vez que arranca el backend, TypeORM compara las entidades con la BD y aplica cambios. Si agregás un campo nuevo a una entidad, la próxima vez que levantes el servidor ese campo aparece en la tabla automáticamente.

**El seed no se puede correr dos veces sin resetear.** Si corrés `npm run seed:run` con una BD que ya tiene datos, va a fallar por los unique constraints (emails duplicados). Usá `npm run seed:reset` para empezar desde cero.

**Las transiciones de estado son unidireccionales.** Una vez que un Reclamo está `Aprobado` o `Rechazado`, no hay endpoint para volver a `Pendiente`. Lo mismo para todos los demás estados terminales. Si necesitás cambiar esto, hay que modificar el objeto `TRANSITIONS` en el service correspondiente.

**El frontend no filtra por usuario.** `ReclamosPage` muestra todos los reclamos que devuelve la API, no solo los del usuario logueado. Para filtrar por usuario habría que modificar `ReclamosService.getAll()` en el backend para aceptar un parámetro `creadorId`, o hacer el filtro en el frontend después de recibir los datos.
