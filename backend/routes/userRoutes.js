// backend/routes/userRoutes.js
const express = require('express');
const { registerUser, authUser } = require('../controllers/userController');
const router = express.Router();

// Ruta para registrar un nuevo usuario
// POST /api/users/register
router.post('/register', registerUser);

// Ruta para autenticar un usuario y obtener un token
// POST /api/users/login
router.post('/login', authUser);

module.exports = router;