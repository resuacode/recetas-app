# AGENTS - Flujo de trabajo automático del proyecto

Este archivo define la estrategia de trabajo para agentes (Copilot/Cursor) en este repositorio.

## Objetivos
- Minimizar consumo de tokens.
- Priorizar cambios pequeños y verificables.
- Respetar la arquitectura actual MERN y convenciones existentes.
- Evitar regresiones por cambios masivos o refactors no solicitados.

## Mapa del proyecto
- Frontend: `frontend/` (React + Vite + SCSS modular)
- Backend: `backend/` (Express + Mongoose + JWT)
- Documentación transversal: raíz del repositorio (`README.md`, `IMPLEMENTACION_AUTH.md`)

## Router de subagentes
Usar este enrutado por defecto:

1. Frontend agent
- Cuándo: cambios de UI, componentes React, estado local, rutas SPA, estilos SCSS, experiencia de usuario.
- Archivos objetivo: `frontend/src/**`, `frontend/README.md`.
- Validación mínima: `npm run lint` y `npm run build` en `frontend/`.

2. Backend agent
- Cuándo: rutas API, controladores, middleware, modelos Mongoose, seguridad y rendimiento.
- Archivos objetivo: `backend/**`.
- Validación mínima: arranque de servidor (`npm start`) y prueba manual de endpoint crítico.

3. Documentation agent
- Cuándo: README, guías de operación, onboarding, runbooks y decisiones técnicas.
- Archivos objetivo: `README.md`, `backend/README.md`, `frontend/README.md`, `IMPLEMENTACION_AUTH.md`.
- Validación mínima: consistencia con código real (scripts, endpoints, rutas y variables de entorno existentes).

## Política de ahorro de tokens
1. Leer primero solo archivos índice
- `package.json`, archivo raíz de arranque (`server.js`, `App.jsx`) y rutas/controladores implicados.

2. Búsqueda antes que lectura completa
- Buscar símbolos/rutas por patrón y luego abrir solo los archivos relevantes.

3. No reescrituras globales
- Evitar refactor masivo si la tarea es puntual.

4. Cambios atómicos
- Un objetivo por bloque de edición, con validación al final.

5. Evitar duplicación
- Si ya existe una utilidad (auth, API client, middleware), reutilizar.

## Reglas arquitectónicas obligatorias
- Mantener separación por capas en backend: `routes -> controllers -> models`.
- No introducir lógica de negocio en rutas.
- Mantener middleware de autenticación/autorización en `backend/middleware/`.
- Frontend sin estado global nuevo salvo que sea imprescindible.
- Estilos en SCSS modular siguiendo `frontend/src/styles/`.
- Toda funcionalidad nueva debe documentarse en el README correspondiente.

## Definición de terminado (DoD)
- Cambios mínimos y enfocados.
- Sin errores de lint/build en la zona afectada (si aplica).
- Documentación actualizada cuando cambia comportamiento.
- No romper endpoints ni rutas existentes.

## Checklist rápido por tarea
- ¿El subagente correcto está asignado?
- ¿Se leyeron solo los archivos necesarios?
- ¿Se validó con comandos mínimos del dominio?
- ¿Se actualizó documentación si cambió el comportamiento?
