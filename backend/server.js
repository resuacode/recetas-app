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

// --- AÑADE ESTAS LÍNEAS TEMPORALMENTE ---
console.log('Variables de entorno cargadas:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET (primeros 5 caracteres):', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) + '...' : 'No definido');
// --- FIN DE LAS LÍNEAS TEMPORALES ---



connectDB();

const app = express();
app.use(express.json());
app.use(cors());

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