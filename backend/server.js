// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db');
// Importar rutas
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const authRoutes = require('./routes/authRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

// Importar middleware de errores (lo crearemos a continuación)
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter, authLimiter } = require('./middleware/rateLimitMiddleware');


dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false}));


// Middleware de compresión. Se recomienda colocarlo al principio, después de express.json()
// para que comprima todas las respuestas.
app.use(compression());



// Configuración de CORS
const allowedOrigins = [
    'http://localhost:5173', // Para desarrollo local
    'http://127.0.0.1:5173', // Para desarrollo local
    process.env.FRONTEND_URL // <-- Variable de entorno para producción
];
 
app.use(cors({
    origin: function (origin, callback) {
        // Permitir solicitudes sin origen (como de herramientas como Postman o curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Permite todos los métodos HTTP que vas a usar
    credentials: true, // Si manejas cookies o headers de autorización
    optionsSuccessStatus: 204 // Para compatibilidad con navegadores antiguos
}));

app.get('/', (req, res) => {
  res.send('API de Recetas funcionando!');
});

// Aplica el limitador general a todas las rutas de la API
// Se recomienda aplicarlo ANTES de las rutas para que proteja todo
app.use('/api/', apiLimiter); // Aplica a todas las rutas que empiezan con /api/

// Aplica el limitador de autenticación a rutas específicas de usuario
app.use('/api/users/register', authLimiter); // Registro
app.use('/api/users/login', authLimiter);    // Login
app.use('/api/users/forgot-password', authLimiter); // Olvidé contraseña
app.use('/api/users/reset-password', authLimiter); // Restablecer contraseña

// Usar rutas
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/auth', authRoutes); // O la ruta base que uses para auth
app.use('/api/favorites', favoriteRoutes);

// Middleware de manejo de errores (siempre al final, después de las rutas)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));