# Data Model — Sistema de Gestión de Consorcio

**Versión:** 0.4 Final
**Persistencia:** SQLite
**Fecha:** 2026-05-30

---

## Entidades

### `Persona`
Usuario del sistema. Simula rol (no requiere autenticación para el TP).

```sql
CREATE TABLE Persona (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre            TEXT NOT NULL,
  apellido          TEXT NOT NULL,
  email             TEXT NOT NULL UNIQUE,
  rol               TEXT NOT NULL CHECK(rol IN ('Residente', 'Administrador', 'Encargado')),
  fecha_creacion    DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### `Unidad`
Unidad funcional (departamento, vivienda).

```sql
CREATE TABLE Unidad (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  numero            TEXT NOT NULL UNIQUE,
  piso              INTEGER,
  descripcion       TEXT,
  fecha_creacion    DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### `Aviso`
Tablón de comunicaciones. Solo admin puede crear.

```sql
CREATE TABLE Aviso (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  administrador_id  INTEGER NOT NULL,
  titulo            TEXT NOT NULL,
  cuerpo            TEXT NOT NULL,
  fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_creacion    DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (administrador_id) REFERENCES Persona(id)
);
```

---

### `Reclamo`
Queja/reporte creado por Residente o Encargado.

```sql
CREATE TABLE Reclamo (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  creador_id        INTEGER NOT NULL,
  unidad_id         INTEGER NOT NULL,
  descripcion       TEXT NOT NULL,
  estado            TEXT NOT NULL CHECK(estado IN ('Pendiente', 'Aprobado', 'Rechazado')),
  motivo_rechazo    TEXT,
  incidente_id      INTEGER,
  fecha_creacion    DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creador_id) REFERENCES Persona(id),
  FOREIGN KEY (unidad_id) REFERENCES Unidad(id),
  FOREIGN KEY (incidente_id) REFERENCES Incidente(id)
);
```

---

### `Incidente`
Problema validado por admin. Puede originarse de un Reclamo o ser manual.

```sql
CREATE TABLE Incidente (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  nivel_gravedad    TEXT NOT NULL CHECK(nivel_gravedad IN ('Baja', 'Media', 'Alta')),
  descripcion       TEXT NOT NULL,
  estado            TEXT NOT NULL CHECK(estado IN ('Abierto', 'En progreso', 'Resuelto')),
  reclamo_id        INTEGER,
  fecha_creacion    DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reclamo_id) REFERENCES Reclamo(id)
);
```

---

### `Rutina`
Plan diario de trabajo del encargado. Una por día/encargado.

```sql
CREATE TABLE Rutina (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  encargado_id      INTEGER NOT NULL,
  fecha_asignacion  DATE NOT NULL,
  estado            TEXT NOT NULL CHECK(estado IN ('Pendiente', 'En progreso', 'Completada')),
  fecha_creacion    DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (encargado_id) REFERENCES Persona(id),
  UNIQUE (encargado_id, fecha_asignacion)
);
```

> **Nota:** El estado `Completada` se puede marcar **solo si todas sus tareas hijas están `Finalizada`**. El backend valida esto.

---

### `Tarea`
Unidad mínima de trabajo. Preventiva (de Rutina) o Correctiva (de Incidente).

```sql
CREATE TABLE Tarea (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  encargado_id          INTEGER NOT NULL,
  incidente_id          INTEGER,
  rutina_id             INTEGER,
  descripcion           TEXT NOT NULL,
  estado                TEXT NOT NULL CHECK(estado IN ('Pendiente', 'En ejecución', 'Finalizada')),
  fecha_limite          DATETIME,
  notas_finalizacion    TEXT,
  fecha_creacion        DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (encargado_id) REFERENCES Persona(id),
  FOREIGN KEY (incidente_id) REFERENCES Incidente(id),
  FOREIGN KEY (rutina_id) REFERENCES Rutina(id),
  CHECK((incidente_id IS NOT NULL AND rutina_id IS NULL) OR (incidente_id IS NULL AND rutina_id IS NOT NULL))
);
```

> **Constraint:** Una Tarea pertenece a **exactamente uno** de: Incidente o Rutina (exclusividad enforced por CHECK)
> **notas_finalizacion:** Campo opcional que el Encargado puede llenar al marcar Finalizada

---

## Diagrama de Relaciones

```
Persona (1)
  ├─ (1:N) Aviso (solo rol=Administrador)
  ├─ (1:N) Reclamo (rol=Residente OR Encargado)
  ├─ (1:N) Rutina (rol=Encargado)
  └─ (1:N) Tarea (rol=Encargado)

Unidad (1)
  └─ (1:N) Reclamo

Reclamo (1)
  ├─ (1:N) Incidente (aprobación genera)
  └─ [0:1] Incidente (link bidireccional)

Incidente (1)
  └─ (1:N) Tarea (tareas correctivas)

Rutina (1)
  └─ (1:N) Tarea (tareas preventivas)
```

---

## Convenciones

- **IDs:** INTEGER autoincrement (SQLite)
- **Timestamps:** DATETIME DEFAULT CURRENT_TIMESTAMP
- **Estados:** TEXT + CHECK constraints
- **Booleans:** INTEGER (0/1) si se necesitan
- **Códigos de devolución:** Separados en `error-contract.md`

---

## Próximos pasos

1. **State Machines** (`state-machines.md`) — transiciones válidas
2. **Seed Data** (`seed-data.md`) — datos iniciales
3. **Tech Stack** (`tech-decisions.md`) — frameworks, testing
