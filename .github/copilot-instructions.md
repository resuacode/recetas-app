# Copilot Instructions - recetas-app

## Contexto técnico
- Stack: MERN (MongoDB, Express, React, Node.js)
- Frontend: React + Vite + SCSS modular
- Backend: Express + Mongoose + JWT

## Cómo trabajar en este repositorio
1. Elegir dominio primero
- Frontend: `frontend/src/**`
- Backend: `backend/**`
- Docs: `*.md`

2. Limitar contexto para ahorrar tokens
- Leer primero `package.json` del dominio afectado.
- Leer entrypoint del dominio (`frontend/src/App.jsx` o `backend/server.js`).
- Abrir solo rutas/controladores/componentes impactados.

3. Respetar arquitectura existente
- Backend: no mezclar lógica en rutas, mantener controladores y middleware.
- Frontend: componentes desacoplados y estilos en SCSS del módulo correspondiente.

4. Validar cambios con comandos mínimos
- Frontend: `npm run lint` y/o `npm run build`.
- Backend: `npm start` (o smoke test de endpoint).

5. Actualizar documentación al cambiar comportamiento
- `README.md`, `backend/README.md`, `frontend/README.md`, `IMPLEMENTACION_AUTH.md`.

## Buenas prácticas de edición
- Preferir cambios pequeños sobre reescrituras grandes.
- Mantener nombres, convenciones y estructura actual salvo petición explícita.
- Evitar introducir dependencias nuevas si no son necesarias.
