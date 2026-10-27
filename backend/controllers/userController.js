// backend/controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { MIN_PASSWORD_LENGTH } = User;
const { generateToken } = require('../utils/generateToken');

// @desc    Registrar un nuevo usuario
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, passwordConfirm } = req.body;

  // Validar datos de entrada
  if (!username || !email || !password || !passwordConfirm) {
    res.status(400);
    throw new Error('Por favor, introduce un nombre de usuario y contraseña');
  }

  // Comprobar si el usuario ya existe
  // String() evita inyección de operadores NoSQL (ej: { "$ne": null })
  const userExists = await User.findOne({ username: String(username) });

  if (userExists) {
    res.status(400);
    throw new Error('El nombre de usuario ya está registrado');
  }

  // Comprobar si el email ya exite
  const emailExists = await User.findOne({ email: String(email) });

  if(emailExists) {
    res.status(400);
    throw new Error('Ya existe un usuario asociado a ese email.');
  }

  // Comprobar la longitud mínima de la contraseña
  if (String(password).length < MIN_PASSWORD_LENGTH) {
    res.status(400);
    throw new Error(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  }

 // Comprobar si las contraseñas coinciden
  if (password !== passwordConfirm) {
    res.status(400);
    throw new Error('Las contraseñas no coinciden.');
  }

  // Crear usuario
  const user = await User.create({
    username,
    email, 
    password, // La contraseña se hashea automáticamente por el pre-save hook en el modelo
    // role se establecerá por defecto a 'user'
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      email: user.email,
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
  const user = await User.findOne({ username: String(username) }).select('+password'); // Asegurarse de que la contraseña se incluya en la consulta
  // Verificar contraseña
  if (user && (await user.matchPassword(String(password)))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Nombre de usuario o contraseña inválidos');
  }

});

module.exports = { registerUser, authUser };