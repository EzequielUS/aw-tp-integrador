# Backend Design — Sistema de Gestión de Consorcio

**Materia:** Arquitectura Web  
**Trabajo Práctico Integrador — 1ª Entrega**  
**Año:** 2026  
**Docente:** Diego Marafetti  
**Fecha de presentación:** 11/04/2026  
**Autor:** Ezequiel David Ustar

---

## Consignas

Entregar una breve descripción del backend elegido y documentación sobre los endpoints que expone, detallando:

- Ruta del endpoint (URL)
- Verbo HTTP utilizado
- Breve descripción de su propósito
- Códigos de estado HTTP posibles como respuesta

---

## Introducción

Para la presentación del trabajo práctico se ha decidido realizar un sistema de gestión de incidentes en consorcios, utilizable por residentes de unidades funcionales o encargados de edificios.

La idea principal consiste en que el consorcio cuente con un espacio formalizado para notificar problemáticas detectadas en unidades o el edificio, así como conocer actualizaciones y novedades. Por el lado del o los encargados, estos contarán con un sistema unificado que les permitirá visualizar fácilmente sus tareas regulares asignadas para la jornada diaria, así como también potenciales nuevas tareas extraordinarias en función de los incidentes generados en el edificio que sean reportados.

---

## Descripción

El sistema se divide en tres actores principales que interactúan en un flujo de trabajo continuo.

### El Residente

Es quien habita la unidad y levanta la mano ante un problema creando un reclamo.

- **Lectura de novedades:** Consume el tablón de anuncios emitido por la administración.
- **Generación de reclamos:** Genera el punto de entrada para problemas dentro de su departamento o en espacios comunes.
- **Seguimiento:** Audita el historial de sus reportes para verificar en qué estado se encuentran.

### El Administrador

Funciona como el filtro central del sistema y el orquestador de la carga de trabajo.

- **Triage de reclamos:** Atiende la bandeja de entrada de los residentes, con autoridad para aprobar o rechazar problemas.
- **Gestión de incidentes:** Al aprobar un reclamo válido, lo oficializa en el sistema, categoriza su nivel de gravedad y lo transforma en un incidente real.
- **Asignación de trabajo:** Desglosa los incidentes confirmados en tareas correctivas específicas y las asigna al encargado.
- **Planificación operativa:** Arma las rutinas maestras de mantenimiento diario (tareas preventivas).
- **Comunicación:** Controla el flujo de información emitiendo avisos al consorcio.

### El Encargado

Consume la planificación armada por el administrador y reporta resultados.

- **Gestión de rutinas:** Visualiza y accede al bloque de trabajo estructurado para su turno actual.
- **Control de tareas preventivas:** Marca como completadas las tareas de mantenimiento diario dentro de su rutina.
- **Control de tareas correctivas:** Actualiza el avance de las tareas específicas asignadas para cerrar un incidente puntual.
