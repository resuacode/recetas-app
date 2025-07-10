// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,      // Opciones para evitar warnings de Mongoose
      useUnifiedTopology: true,   // Opciones para evitar warnings de Mongoose
    });

    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Salir del proceso con fallo
  }
};

module.exports = connectDB;