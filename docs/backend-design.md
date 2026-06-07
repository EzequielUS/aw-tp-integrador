
  Arquitectura Web
   Trabajo Práctico Integrador (1ª Entrega)

     2026


Docente: Diego Marafetti
Fecha de presentación: 11/04/2026
Autores:
Ezequiel David Ustar
Documentos:
Documento de API

Consignas:
Entregar una breve descripción del backend elegido.


Documentación sobre los endpoint que el backend expone. Básicamente se pide este punto (referenciando el TP):


Documentación de la API: Un documento (puede estar integrado en el README) que detalle cada endpoint expuesto por el backend indicando:
Ruta del Endpoint (URL).
Verbo HTTP utilizado.
Breve descripción de su propósito.
Códigos de estado HTTP (Status Codes) posibles como respuesta.


Para la documentación, si bien pueden incluirla en el README del repositorio de Github, deben exportarla y presentarla como entrega para esta actividad.
Introducción
Para la presentación del trabajo práctico, se ha decidido realizar un sistema de gestión de incidentes en consorcios. El mismo puede ser utilizado por residentes de unidades funcionales o encargados de edificios.

La idea principal consiste en que el consorcio cuente con un espacio formalizado para notificar problemáticas detectadas en unidades o el edificio, así como conocer actualizaciones y novedades. Por el lado del o los encargados, estos contarán con un sistema unificado que les permitirá visualizar fácilmente sus tareas regulares asignadas para la jornada diaria, así como también potenciales nuevas tareas extraordinarias en función de los incidentes generados en el edificio que sean reportados.
Descripción
Para entender la arquitectura y el modelo de dominio de esta solución, se dividió el sistema en tres actores principales que interactúan en un flujo de trabajo continuo.
El Residente
Es simplemente quien habita la unidad y levanta la mano ante un problema (creando un reclamo).
Lectura de Novedades: Consume el tablón de anuncios emitido por la administración.
Generación de Reclamos: Genera el punto de entrada para problemas dentro de su departamento o en espacios comunes.
Seguimiento: Audita el historial de sus reportes para verificar en qué estado se encuentran.
El Administrador
Funciona como el filtro central del sistema y el orquestador de la carga de trabajo.
Triage de Reclamos: Ataja la bandeja de entrada de los residentes. Tiene la autoridad para auditar los problemas y decidir si los rechaza o los aprueba.
Gestión de Incidentes: Al aprobar un reclamo válido, lo oficializa en el sistema, categoriza su nivel de gravedad y lo transforma en un incidente real.
Asignación de Trabajo: Desglosa esos incidentes confirmados en tareas correctivas específicas y se las asigna al encargado.
Planificación Operativa: Arma las rutinas maestras de mantenimiento diario (tareas preventivas).
Comunicación: Controla el flujo de información emitiendo los avisos al consorcio.
El Encargado
Consume la planificación armada por el administrador y reporta resultados.
Gestión de Rutinas: Visualiza y accede al bloque de trabajo estructurado para su turno actual.
Control de Tareas Preventivas: Marca como completadas las tareas de mantenimiento diario dentro de su rutina.
Control de Tareas Correctivas: Actualiza el avance de las tareas específicas que se le asignaron para cerrar un incidente puntual.






