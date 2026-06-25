# Implementacion de Autenticacion

Este documento describe el estado real de la autenticacion en recetas-app para facilitar mantenimiento futuro.

## Resumen
- Autenticacion basada en JWT.
- Login/registro en `POST /api/users/*`.
- Validacion y refresh de token en `POST/GET /api/auth/*`.
- Frontend con interceptores Axios y control de sesion en arranque.

## Backend

### Endpoints clave
- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/auth/validate-token` (requiere Bearer token)
- `POST /api/auth/refresh-token` (requiere Bearer token)
- `POST /api/auth/forgot-password`
- `PATCH /api/auth/reset-password?token=<token>`

### Middleware de seguridad
- `protect`: valida JWT y adjunta `req.user`.
- `authorize(['admin'])`: restringe rutas por rol.
- Rate limiting:
	- API general: 300 solicitudes / 15 min.
	- Rutas sensibles auth: 50 solicitudes / 15 min.

### Modelo de usuario
Campos relevantes:
- `username`, `email`, `password` (hash con hook pre-save)
- `role` (`user` o `admin`)
- `favorites`
- `resetPasswordToken`, `resetPasswordExpires`

## Frontend

### Persistencia de sesion
Se guarda en `localStorage`:
- `token`
- `user`
- `role`

### Flujo de arranque
1. `App.jsx` llama `checkSession()`.
2. `checkSession()` valida consistencia de datos locales.
3. Si token expirado o cercano a expirar, intenta refresh.
4. Si validacion falla, limpia datos y deja sesion cerrada.

### Interceptores Axios
- Request interceptor:
	- Adjunta Bearer token automaticamente.
	- Intenta renovar token si esta proximo a expirar.
- Response interceptor:
	- En `401`, intenta refresh una vez y reintenta request.
	- Si falla, limpia sesion y hace logout controlado.

## Recuperacion de contrasena
1. Usuario solicita reset con email (`forgot-password`).
2. Backend genera token aleatorio y guarda hash SHA-256 + expiracion.
3. Se envia URL al frontend con token sin hash.
4. Frontend envia nueva password con token.
5. Backend valida hash/expiracion, actualiza password y limpia token.

## Variables de entorno criticas

Backend:
- `JWT_SECRET`
- `FRONTEND_URL`
- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`
- `EMAIL_FROM`

Frontend:
- `VITE_API_BASE_URL`

## Checklist de cambios futuros en auth
1. Si cambias expiracion JWT, revisar refresh y mensajes UX.
2. Si cambias payload del token, revisar `protect` y consumo frontend.
3. Si cambias rutas auth, actualizar `src/utils/auth.js` y documentacion.
4. Validar siempre:
	 - login
	 - refresh
	 - logout por token invalido
	 - reset password completo

## Pendiente recomendado
- Añadir pruebas automaticas de auth (unitarias/integracion) para evitar regresiones.
