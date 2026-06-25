# recetas-app

Aplicacion web de recetas con arquitectura MERN, autenticacion JWT y gestion de favoritos.

## Estado del proyecto
- Backend funcional en Express + MongoDB.
- Frontend funcional en React + Vite.
- Proyecto pensado para mantenimiento intermitente, con documentacion operativa para retomarlo rapido.

## Arquitectura

### Frontend
- Ubicacion: `frontend/`
- SPA con React Router.
- Gestion de sesion con interceptores Axios.
- Estilos en SCSS modular.

### Backend
- Ubicacion: `backend/`
- API REST con capas:
  - `routes/`
  - `controllers/`
  - `models/`
  - `middleware/`
- Seguridad con JWT, control de roles y rate limiting.

### Base de datos
- MongoDB (local, Atlas o via Docker Compose).

## Estructura principal
- `README.md`: guia global.
- `IMPLEMENTACION_AUTH.md`: detalle de autenticacion.
- `backend/README.md`: operativa y API backend.
- `frontend/README.md`: operativa y arquitectura frontend.
- `AGENTS.md`: estrategia de subagentes y ahorro de tokens.

## Requisitos
- Node.js 18+
- npm
- MongoDB (o Docker)

## Puesta en marcha rapida

### 1) Clonar
```bash
git clone https://github.com/resuacode/recetas-app.git
cd recetas-app
```

### 2) Backend
```bash
cd backend
npm install
```

Crear `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=<tu_mongo_uri>
JWT_SECRET=<tu_jwt_secret>
FRONTEND_URL=http://localhost:5173
MAILGUN_API_KEY=<tu_mailgun_key>
MAILGUN_DOMAIN=<tu_mailgun_domain>
EMAIL_FROM=<tu_email_from>
```

Iniciar backend:
```bash
npm start
```

### 3) Frontend
```bash
cd ../frontend
npm install
```

Crear `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Iniciar frontend:
```bash
npm run dev
```

## Opcion Docker Compose
Desde la raiz:
```bash
docker-compose up -d
```

Servicios:
- backend: `http://localhost:5000`
- mongodb: `mongodb://localhost:27017`

## Funcionalidades implementadas
- Registro e inicio de sesion.
- Recuperacion y restablecimiento de contrasena.
- Validacion y refresh de token.
- Listado y detalle de recetas en acceso publico.
- Favoritos para usuarios autenticados.
- Valoraciones de 1-5 estrellas para usuarios autenticados (una por usuario/receta).
- Compartir recetas desde detalle con panel nativo en móvil.
- Descarga de receta en PDF con marca de agua y contenido estructurado.
- Gestion de recetas para rol admin.

## Endpoints base
- API health: `GET /`
- Usuarios: `/api/users/*`
- Auth: `/api/auth/*`
- Recetas: `/api/recipes/*`
- Favoritos: `/api/favorites/*`
- Valoraciones: `/api/ratings/*`

Ver detalle completo en `backend/README.md`.

## Calidad y validacion
Frontend:
```bash
cd frontend
npm run lint
npm run build
```

Backend:
```bash
cd backend
npm start
```

## Flujo de trabajo con agentes
Este repositorio ya incluye configuracion para Copilot y Cursor:
- `AGENTS.md`
- `.github/copilot-instructions.md`
- `.github/prompts/*.prompt.md`
- `.cursor/rules/*.mdc`

Objetivo: reducir tokens, enrutar tareas por dominio (frontend, backend, docs) y mantener consistencia arquitectonica.

## Mantenimiento futuro recomendado
1. Añadir tests automaticos (frontend y backend).
2. Añadir script `dev` en backend con nodemon.
3. Versionar `.env.example` para frontend y backend.
4. Documentar changelog por release o hitos.
