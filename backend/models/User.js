// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Necesario para hashear contraseñas

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // El nombre de usuario debe ser único
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: 'user', // Por defecto, los nuevos usuarios son 'user'
      enum: ['user', 'admin'], // Solo permite estos dos valores
    },
  },
  {
    timestamps: true, // Añade campos `createdAt` y `updatedAt` automáticamente
  }
);

// Método pre-save para hashear la contraseña antes de guardarla
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) { // Solo hashear si la contraseña ha sido modificada
    next();
  }

  const salt = await bcrypt.genSalt(10); // Genera un "salt" para el hasheo
  this.password = await bcrypt.hash(this.password, salt); // Hashea la contraseña
});

// Método para comparar contraseñas
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;