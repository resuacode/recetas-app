// routes/authRoutes.js
const express = require('express');
const { forgotPassword, resetPassword } = require('../controllers/authController'); // Importa las funciones
const router = express.Router();

// Ruta para olvido la contraseña
// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// Ruta para resetear la contraseña
// POST /api/auth/reset-password
router.patch('/reset-password', resetPassword); // Usamos PATCH para actualizar parcialmente un recurso

module.exports = router;