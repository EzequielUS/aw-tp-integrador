# State Machines — Sistema de Gestión de Consorcio

**Versión:** 0.2 Final
**Fecha:** 2026-05-30

---

## 1. RECLAMO — Triage (Estados Terminales)

```
┌─────────────┐
│  Pendiente  │ (inicial)
└──────┬──────┘
       │
       ├──[ADMIN]──→ ┌──────────┐
       │             │ Aprobado │ (TERMINAL)
       │             └──────────┘
       │             └─ Side-effect: Crear Incidente
       │
       └──[ADMIN]──→ ┌───────────┐
                     │ Rechazado │ (TERMINAL)
                     └───────────┘
                     └─ Requiere: motivo_rechazo
```

| Transición | Quién | Validaciones | Side-effects |
|------------|-------|--------------|--------------|
| Pendiente → Aprobado | ADMIN | Descripción existe | Crear Incidente con nivel_gravedad (admin define) |
| Pendiente → Rechazado | ADMIN | motivo_rechazo requerido | — |

**Estados terminales:** Aprobado, Rechazado. **No hay retorno.**

---

## 2. INCIDENTE — Ciclo de Vida (Unidireccional)

```
┌─────────┐
│ Abierto │ (inicial)
└────┬────┘
     │
     └──[ADMIN]──→ ┌──────────────┐
                   │ En progreso  │
                   └──────┬───────┘
                          │
                          └──[ENCARGADO (manual)]──→ ┌──────────┐
                                                     │ Resuelto │ (TERMINAL)
                                                     └──────────┘
```

| Transición | Quién | Validaciones | Side-effects |
|------------|-------|--------------|--------------|
| Abierto → En progreso | ADMIN | ≥1 Tarea correctiva asignada | — |
| En progreso → Resuelto | ENCARGADO | Todas Tareas correctivas = Finalizada | — |

**Estados terminales:** Resuelto. **No hay retorno una vez en progreso.**

**Nota:** Una vez "En progreso", aunque se añadan nuevas tareas correctivas, el incidente **no vuelve a "Abierto"**.

---

## 3. RUTINA — Plan Diario (Encargado-driven)

```
┌─────────────┐
│  Pendiente  │ (inicial)
└──────┬──────┘
       │
       └──[ENCARGADO (manual)]──→ ┌──────────────┐
                                  │ En progreso  │
                                  └──────┬───────┘
                                         │
                                         └──[SISTEMA (automático)]──→ ┌────────────┐
                                                                      │ Completada │ (TERMINAL)
                                                                      └────────────┘
```

| Transición | Quién | Validaciones | Side-effects |
|------------|-------|--------------|--------------|
| Pendiente → En progreso | ENCARGADO | — | — |
| En progreso → Completada | SISTEMA | Todas Tareas preventivas = Finalizada | — |

**Trigger automático:** Cuando la última Tarea preventiva pasa a "Finalizada", la Rutina pasa a "Completada" automáticamente.

**Estados terminales:** Completada. **No se puede reabrirse.**

---

## 4. TAREA — Ejecución (Encargado-driven)

```
┌──────────────┐
│  Pendiente   │ (inicial)
└──────┬───────┘
       │
       └──[ENCARGADO]──→ ┌────────────────┐
                         │ En ejecución   │
                         └────────┬───────┘
                                  │
                                  └──[ENCARGADO]──→ ┌────────────┐
                                                    │ Finalizada │ (TERMINAL)
                                                    └────────────┘
```

| Transición | Quién | Validaciones | Side-effects |
|------------|-------|--------------|--------------|
| Pendiente → En ejecución | ENCARGADO | — | — |
| En ejecución → Finalizada | ENCARGADO | Requiere: notas (opcional) | Evalúa Rutina/Incidente padre |

**Notas:** Campo `notas_finalizacion` de texto, para que el encargado pueda dejar observaciones.

**Side-effects al finalizar:**
- Si `rutina_id` existe: Verificar si todas las Tareas de la Rutina están Finalizada → autocompletar Rutina
- Si `incidente_id` existe: Verificar si todas las Tareas del Incidente están Finalizada → permitir transición manual a "Resuelto"

**Estados terminales:** Finalizada. **No hay retorno.**

---

## 5. AVISO — Tablón Simple

```
┌────────────┐
│ Publicado  │ (inicial)
└─────┬──────┘
      │
      └──[ADMIN]──→ ┌──────────┐
                    │ Eliminado│ (soft-delete)
                    └──────────┘
```

| Transición | Quién | Validaciones | Side-effects |
|------------|-------|--------------|--------------|
| Publicado → Eliminado | ADMIN | — | Soft-delete (marcar como inactivo, no borrar) |

**Estados terminales:** Eliminado (soft-delete). **No se recupera.**

---

## Cambios a Data Model

Necesitamos actualizar la tabla `Tarea`:

```sql
ALTER TABLE Tarea ADD COLUMN notas_finalizacion TEXT;
```

O en la creación:

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

---

## Resumen: Transiciones por Entidad

| Entidad | Inicial | Transiciones | Terminal |
|---------|---------|--------------|----------|
| Reclamo | Pendiente | Aprobado, Rechazado | Ambos (sin retorno) |
| Incidente | Abierto | En progreso → Resuelto | Resuelto |
| Rutina | Pendiente | En progreso → Completada | Completada |
| Tarea | Pendiente | En ejecución → Finalizada | Finalizada |
| Aviso | Publicado | Eliminado | Eliminado |

**Patrón General:** Estados terminales unidireccionales. Una vez definido un estado final, no hay retorno.

---

## Próximos pasos

1. ✅ Data Model → `data-model.md`
2. ✅ State Machines → `state-machines.md`
3. **Seed Data** → `seed-data.md` (qué datos crear al iniciar)
4. **Tech Stack** → `tech-decisions.md` (frameworks, testing, etc.)
