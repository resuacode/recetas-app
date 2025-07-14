// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
// Importar rutas
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
// Importar middleware de errores (lo crearemos a continuación)
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());


// Configuración de CORS
const allowedOrigins = [
    'http://localhost:5173', // Para desarrollo local
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
    credentials: true // Si manejas cookies o headers de autorización
}));

app.get('/', (req, res) => {
  res.send('API de Recetas funcionando!');
});

// Usar rutas
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);

// Middleware de manejo de errores (siempre al final, después de las rutas)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));