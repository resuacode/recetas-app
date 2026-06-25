# Frontend - recetas-app

Aplicación React para explorar recetas, autenticarse, gestionar favoritos y administrar recetas (rol admin).

## Funcionalidades destacadas
- Compartir recetas desde el detalle con Web Share API (móvil) y fallback en escritorio.
- Descargar receta en PDF desde el detalle con:
	- marca de agua `rescetario.resuacode.es`
	- título, subtítulo y campo "basado en"
	- imagen principal (50% más pequeña en PDF)
	- ingredientes, pasos y metadatos finales (categorías, autor, tiempos, porciones).

## Stack
- React 19
- Vite
- React Router DOM
- Axios
- react-hot-toast
- SCSS modular

## Estructura
- `src/App.jsx`: router principal y control de sesión.
- `src/components/`: vistas y componentes funcionales.
- `src/pages/`: páginas específicas (p. ej. política de privacidad).
- `src/utils/api.js`: instancia de Axios.
- `src/utils/auth.js`: interceptores, validación de token y refresh.
- `src/styles/`: estilos SCSS por capas y componentes.

## Scripts
Desde `frontend/`:

- Instalar dependencias:
	- `npm install`
- Desarrollo:
	- `npm run dev`
- Lint:
	- `npm run lint`
- Build producción:
	- `npm run build`
- Preview build:
	- `npm run preview`

## Variables de entorno
Crear `frontend/.env` con:

- `VITE_API_BASE_URL=http://localhost:5000/api`

## Rutas SPA
- `/` listado de recetas
- `/recipes/:id` detalle de receta
- `/login` login
- `/register` registro
- `/forgot-password` solicitud de recuperación
- `/reset-password` restablecimiento
- `/politica-de-privacidad` política
- `/manage-recipes` panel admin
- `/manage-recipes/new` alta receta (admin)
- `/manage-recipes/edit/:id` edición receta (admin)

## Flujo de autenticación
1. Al iniciar app, `checkSession()` valida datos en localStorage y token.
2. Si el token está próximo a expirar, se intenta `refresh-token`.
3. Interceptor de request añade `Authorization: Bearer <token>`.
4. Interceptor de response reintenta una vez en `401` tras refresh.
5. Si falla, limpia sesión y fuerza logout controlado.

## Convenciones de desarrollo
- Reutilizar utilidades en `src/utils/` antes de crear nuevas.
- Mantener estilos en SCSS modular (`src/styles/`).
- No duplicar llamadas API si ya existe lógica en componentes o utilidades.
- Si se cambia comportamiento de rutas o auth, actualizar este README.

## Troubleshooting rápido
1. No conecta con backend
- Revisar `VITE_API_BASE_URL`.

2. Logout inesperado
- Verificar expiración JWT y disponibilidad de endpoint `/auth/refresh-token`.

3. Errores CORS
- Revisar `FRONTEND_URL` en backend y orígenes permitidos.
