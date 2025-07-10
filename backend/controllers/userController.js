// backend/controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Función auxiliar para generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h', // El token expira en 1 hora
  });
};

// @desc    Registrar un nuevo usuario
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validar datos de entrada
  if (!username || !password) {
    res.status(400);
    throw new Error('Por favor, introduce un nombre de usuario y contraseña');
  }

  // Comprobar si el usuario ya existe
  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(400);
    throw new Error('El nombre de usuario ya está registrado');
  }

  // Crear usuario
  const user = await User.create({
    username,
    password, // La contraseña se hashea automáticamente por el pre-save hook en el modelo
    // role se establecerá por defecto a 'user'
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Datos de usuario inválidos');
  }
});

// @desc    Autenticar usuario y obtener token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Buscar usuario
  const user = await User.findOne({ username });

  // Verificar contraseña
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Nombre de usuario o contraseña inválidos');
  }
});

module.exports = { registerUser, authUser };