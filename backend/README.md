# Backend - recetas-app

API REST para autenticación, recetas y favoritos.

## Stack
- Node.js
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

### Usuarios
- `POST /api/users/register`
- `POST /api/users/login`

### Auth
- `POST /api/auth/forgot-password`
- `PATCH /api/auth/reset-password?token=<token>`
- `GET /api/auth/validate-token` (protegido)
- `POST /api/auth/refresh-token` (protegido)

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

## Seguridad y middlewares
- CORS con lista de orígenes permitidos (`localhost`, `127.0.0.1`, `FRONTEND_URL`).
- Rate limiting:
  - General API: 300 req / 15 min
  - Auth sensible: 50 req / 15 min
- JWT con middleware `protect` y control de roles con `authorize`.
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
