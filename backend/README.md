# Backend - recetas-app

API REST para autenticación, recetas y favoritos.

## Stack
- Node.js 22.23.4+ (fijado en `.node-version` y `Dockerfile`)
- Express
- MongoDB + Mongoose
- JWT
- bcryptjs
- express-rate-limit
- compression

## Estructura
- `server.js`: arranque, middlewares globales y montaje de rutas.
- `config/`: conexión DB y envío de email.
- `routes/`: definición de endpoints.
- `controllers/`: lógica de negocio.
- `middleware/`: auth, errores, rate limiting.
- `models/`: esquemas Mongoose.

## Scripts
Desde `backend/`:

- Instalar dependencias:
  - `npm install`
- Iniciar servidor:
  - `npm start`

Nota: no hay script `dev` con nodemon en este momento.

## Variables de entorno
Crear `backend/.env` con:

- `NODE_ENV=development`
- `PORT=5000`
- `MONGO_URI=<cadena_mongodb>`
- `JWT_SECRET=<secreto_jwt>`
- `FRONTEND_URL=http://localhost:5173`
- `MAILGUN_API_KEY=<api_key>`
- `MAILGUN_DOMAIN=<domain>`
- `EMAIL_FROM=<from_email>`

## Endpoints
Base URL local: `http://localhost:5000`

### Salud
- `GET /` -> mensaje de estado API

Nota: este endpoint recibe un ping cada 10 minutos desde un cronjob externo en cron-job.org
para evitar el "cold start" del plan gratuito de Render (se duerme tras 15 min sin tráfico).
No se usa GitHub Actions porque sus ejecuciones programadas se retrasan horas y no mantienen el servicio despierto.

### Usuarios
- `POST /api/users/register`
- `POST /api/users/login`

### Auth
- `POST /api/auth/forgot-password`
- `PATCH /api/auth/reset-password?token=<token>`
- `GET /api/auth/validate-token` (protegido)
- `POST /api/auth/refresh-token` (requiere Bearer token firmado; acepta tokens caducados mientras no pasen 7 días desde el login)

### Recetas
- `GET /api/recipes` (público)
- `GET /api/recipes/:id` (público)
- `GET /api/recipes/my-recipes` (admin)
- `POST /api/recipes` (admin)
- `PUT /api/recipes/:id` (admin)
- `DELETE /api/recipes/:id` (admin)

### Favoritos
Todas las rutas requieren autenticación:
- `GET /api/favorites`
- `GET /api/favorites/check/:recipeId`
- `POST /api/favorites/:recipeId`
- `DELETE /api/favorites/:recipeId`

### Valoraciones
- `GET /api/ratings/recipe/:recipeId` (público) - Retorna `{average, count, ratings}`
- `GET /api/ratings/recipe/:recipeId/user` (protegido) - Obtiene valoración del usuario actual
- `POST /api/ratings` (protegido) - Crear o actualizar valoración
  - Body: `{recipeId, score}` donde score es 1-5
- `DELETE /api/ratings/:recipeId` (protegido) - Eliminar valoración del usuario actual

**Restricción**: Un usuario solo puede tener una valoración por receta (unique index en [recipe, user])

## Seguridad y middlewares
- CORS con lista de orígenes permitidos (`localhost`, `127.0.0.1`, `FRONTEND_URL`).
- Rate limiting:
  - General API: 300 req / 15 min
  - Auth sensible: 50 req / 15 min (`/api/users/register`, `/api/users/login`, `/api/auth/forgot-password`, `/api/auth/reset-password`)
  - `trust proxy` activado para que el límite use la IP real del cliente tras el proxy de Render.
- Entradas de búsqueda y login convertidas a `String` (evita inyección NoSQL) y `keyword` escapado antes de usarse en `$regex`.
- JWT de 1 h con `authTime` (momento del login). La sesión dura como máximo 7 días; después hay que volver a iniciar sesión.
- Contraseña mínima de 8 caracteres (solo se aplica al registrar o cambiar contraseña).
- JWT con middleware `protect` y control de roles con `authorize`. `protect` rechaza tokens de usuarios que ya no existen.
- `compression` habilitado.

## Ejecución con Docker Compose
Desde la raíz del proyecto:

- `docker-compose up -d`

Levanta:
- backend en puerto `5000`
- mongodb en puerto `27017`

## Troubleshooting rápido
1. Error CORS
- Revisar `FRONTEND_URL` en `backend/.env`.

2. Error JWT
- Revisar `JWT_SECRET` y expiración del token.

3. Error de conexión Mongo
- Verificar `MONGO_URI` (modo local) o variables root de Mongo en compose.

4. No llegan emails
- Validar `MAILGUN_API_KEY`, `MAILGUN_DOMAIN` y `EMAIL_FROM`.
