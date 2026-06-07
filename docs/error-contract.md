# Error Contract — Sistema de Gestión de Consorcio

**Versión:** 1.0  
**Fecha:** 2026-05-30

---

## Formato de Respuesta de Error

Todos los errores devuelven este formato:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción legible del error",
    "details": {}  // opcional, solo en algunos casos
  }
}
```

### Ejemplo: Validación fallida
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El campo 'descripción' es requerido",
    "details": {
      "field": "descripcion",
      "value": null,
      "constraint": "required"
    }
  }
}
```

---

## Status Codes HTTP

| Código | Significado | Cuándo |
|--------|-------------|--------|
| 200 | OK | GET exitoso, devuelve datos |
| 201 | Created | POST exitoso, recurso creado |
| 204 | No Content | DELETE exitoso, sin body |
| 400 | Bad Request | Entrada inválida / validación fallida |
| 401 | Unauthorized | Sin token o token inválido |
| 403 | Forbidden | Sin permisos para esta acción |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Violación de constraint (ej: email duplicado) |
| 500 | Internal Server Error | Error del servidor |

---

## Códigos de Error Específicos

### 1. AUTHENTICATION_FAILED — 401

**Cuándo:** Credenciales inválidas en login

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Email o contraseña incorrectos"
  }
}
```

**Endpoint afectado:** `POST /api/auth/login`

---

### 2. INVALID_TOKEN — 401

**Cuándo:** Token JWT expirado, inválido o faltante

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Token no válido o expirado"
  }
}
```

**Endpoints afectados:** Todos los que requieren autenticación

---

### 3. UNAUTHORIZED — 403

**Cuándo:** Usuario autenticado pero sin permisos para la acción

Ejemplos:
- Residente intenta aprobar un Reclamo (solo Admin)
- Encargado intenta crear Incidente (solo Admin)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No tienes permisos para realizar esta acción"
  }
}
```

**Endpoint afectado:** Cualquiera con restricción de rol

---

### 4. VALIDATION_ERROR — 400

**Cuándo:** Datos enviados no cumplen validaciones

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Error en validación de datos",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Email no válido",
          "value": "invalid-email"
        },
        {
          "field": "password",
          "message": "Contraseña debe tener mínimo 6 caracteres",
          "value": "123"
        }
      ]
    }
  }
}
```

**Campos validados por entidad:**

**Persona (Login):**
- email: requerido, formato válido
- password: requerido, mínimo 6 caracteres

**Reclamo (Crear/Editar):**
- unidad_id: requerido, debe existir
- descripcion: requerido, mínimo 10 caracteres

**Reclamo (Triage):**
- estado: requerido, debe ser "Aprobado" o "Rechazado"
- motivo_rechazo: requerido SI estado = "Rechazado"
- nivel_gravedad: requerido SI estado = "Aprobado"

**Incidente (Crear):**
- nivel_gravedad: requerido, valores válidos: Baja, Media, Alta
- descripcion: requerido, mínimo 10 caracteres

**Incidente (Actualizar estado):**
- estado: requerido, transición válida según state machine

**Rutina (Crear):**
- encargado_id: requerido, debe existir y rol = Encargado
- fecha_asignacion: requerido, formato date válido
- tareas: requerido, array no vacío

**Tarea (Actualizar estado):**
- estado: requerido, transición válida
- notas_finalizacion: requerido SI estado = "Finalizada"

**Aviso (Crear):**
- titulo: requerido, mínimo 5 caracteres
- cuerpo: requerido, mínimo 10 caracteres

---

### 5. RESOURCE_NOT_FOUND — 404

**Cuándo:** Recurso solicitado no existe

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El reclamo con ID 999 no existe"
  }
}
```

**Ejemplos:**
- GET `/api/reclamos/999` → reclamo no existe
- PATCH `/api/incidentes/123` → incidente no existe
- GET `/api/avisos/456` → aviso no existe

---

### 6. INVALID_STATE_TRANSITION — 400

**Cuándo:** Se intenta una transición de estado no permitida según state machine

```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "No se puede cambiar de estado 'Resuelto' a 'Abierto'",
    "details": {
      "entity": "Incidente",
      "currentState": "Resuelto",
      "requestedState": "Abierto",
      "validTransitions": ["En progreso", "Resuelto"]
    }
  }
}
```

**Ejemplos:**
- Incidente: intentar pasar de "Resuelto" a "Abierto"
- Rutina: intentar reabrirse si ya es "Completada"
- Tarea: intentar pasar de "Finalizada" a "Pendiente"

---

### 7. CONSTRAINT_VIOLATION — 409

**Cuándo:** Violación de restricciones de negocio o base de datos

```json
{
  "success": false,
  "error": {
    "code": "CONSTRAINT_VIOLATION",
    "message": "Ya existe una rutina para este encargado en esta fecha"
  }
}
```

**Ejemplos:**
- Email duplicado al crear Persona
- Rutina duplicada: mismo encargado + fecha (UNIQUE constraint)
- Intenta aprobar Reclamo que ya fue procesado

---

### 8. MISSING_REQUIRED_DATA — 400

**Cuándo:** Datos requeridos están ausentes (distinto a validación)

```json
{
  "success": false,
  "error": {
    "code": "MISSING_REQUIRED_DATA",
    "message": "El campo 'nivel_gravedad' es requerido para aprobar el reclamo"
  }
}
```

---

### 9. BUSINESS_LOGIC_ERROR — 400

**Cuándo:** Error en lógica de negocio

```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_LOGIC_ERROR",
    "message": "No se puede cambiar el incidente a 'Resuelto' si aún hay tareas pendientes"
  }
}
```

**Ejemplos:**
- Marcar Rutina como Completada pero aún hay tareas Pendientes
- Resolver Incidente sin todas sus tareas Finalizadas
- Crear Incidente sin asignar tareas

---

### 10. INTERNAL_ERROR — 500

**Cuándo:** Error del servidor (no manejado)

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Error interno del servidor. Intenta de nuevo más tarde."
  }
}
```

---

## Matriz de Errores por Endpoint

| Endpoint | Método | 200/201 | 400 | 401 | 403 | 404 | 409 |
|----------|--------|---------|-----|-----|-----|-----|-----|
| `/api/auth/login` | POST | 201 | VALIDATION_ERROR | — | — | — | — |
| `/api/auth/login` | POST | — | — | AUTHENTICATION_FAILED | — | — | — |
| `/api/avisos` | GET | 200 | — | INVALID_TOKEN | — | — | — |
| `/api/avisos` | POST | 201 | VALIDATION_ERROR | INVALID_TOKEN | UNAUTHORIZED | — | — |
| `/api/avisos/{id}` | DELETE | 204 | — | INVALID_TOKEN | UNAUTHORIZED | RESOURCE_NOT_FOUND | — |
| `/api/reclamos` | GET | 200 | — | INVALID_TOKEN | — | — | — |
| `/api/reclamos` | POST | 201 | VALIDATION_ERROR | INVALID_TOKEN | — | — | — |
| `/api/reclamos/{id}` | GET | 200 | — | INVALID_TOKEN | — | RESOURCE_NOT_FOUND | — |
| `/api/reclamos/{id}` | PATCH | 200 | VALIDATION_ERROR, INVALID_STATE_TRANSITION | INVALID_TOKEN | UNAUTHORIZED | RESOURCE_NOT_FOUND | CONSTRAINT_VIOLATION |
| `/api/incidentes` | GET | 200 | — | INVALID_TOKEN | — | — | — |
| `/api/incidentes` | POST | 201 | VALIDATION_ERROR | INVALID_TOKEN | UNAUTHORIZED | — | — |
| `/api/incidentes/{id}` | GET | 200 | — | INVALID_TOKEN | — | RESOURCE_NOT_FOUND | — |
| `/api/incidentes/{id}` | PATCH | 200 | VALIDATION_ERROR, INVALID_STATE_TRANSITION | INVALID_TOKEN | UNAUTHORIZED | RESOURCE_NOT_FOUND | — |
| `/api/incidentes/{id}/tareas` | POST | 201 | VALIDATION_ERROR | INVALID_TOKEN | UNAUTHORIZED | RESOURCE_NOT_FOUND | — |
| `/api/rutinas` | GET | 200 | — | INVALID_TOKEN | — | — | — |
| `/api/rutinas` | POST | 201 | VALIDATION_ERROR | INVALID_TOKEN | UNAUTHORIZED | — | CONSTRAINT_VIOLATION |
| `/api/rutinas/{id}/tareas` | GET | 200 | — | INVALID_TOKEN | — | RESOURCE_NOT_FOUND | — |
| `/api/tareas/{id}` | PATCH | 200 | VALIDATION_ERROR, INVALID_STATE_TRANSITION | INVALID_TOKEN | — | RESOURCE_NOT_FOUND | — |

---

## Manejo de Errores en Frontend

### Interceptor Axios

```typescript
// src/services/api.ts
apiClient.interceptors.response.use(
  response => response,
  error => {
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Token inválido → limpiar y redirigir a login
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 403:
        // Sin permisos → mostrar toast
        showToast('No tienes permisos para esta acción', 'error');
        break;
      case 404:
        // Recurso no existe → mostrar modal o redirigir
        showToast(data.error.message, 'error');
        break;
      case 400:
      case 409:
        // Error de validación → mostrar detalles
        showToast(data.error.message, 'error');
        break;
      case 500:
        // Error del servidor → mostrar mensaje genérico
        showToast('Error del servidor. Intenta de nuevo.', 'error');
        break;
    }
    return Promise.reject(error);
  }
);
```

### Toast Notifications

- **Error:** fondo rojo, ícono X, timeout 5s
- **Success:** fondo verde, ícono check, timeout 3s
- **Info:** fondo azul, ícono info, timeout 4s

---

## Próximos pasos

1. ✅ data-model.md
2. ✅ state-machines.md
3. ✅ tech-decisions.md
4. ✅ frontend-screens.md
5. ✅ error-contract.md
6. **seed-data.md** — entidades concretas
7. **Actualizar endpoints.yaml** — agregar `/api/auth/login`
