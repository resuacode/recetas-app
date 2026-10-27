// routes/authRoutes.js
const express = require('express');
const { forgotPassword, resetPassword, refreshToken } = require('../controllers/authController'); // Importa las funciones
const { protect } = require('../middleware/authMiddleware'); // Para proteger la ruta de validación
const router = express.Router();

// Ruta para olvido la contraseña
// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// Ruta para resetear la contraseña
// POST /api/auth/reset-password
router.patch('/reset-password', resetPassword); // Usamos PATCH para actualizar parcialmente un recurso

// Ruta para validar token
// GET /api/auth/validate-token
router.get('/validate-token', protect, (req, res) => {
  // Si llega aquí, el token es válido (el middleware protect ya lo validó)
  res.status(200).json({
    message: 'Token válido',
    user: req.user // El middleware protect añade el usuario al request
  });
});

// Ruta para refrescar token (acepta tokens caducados dentro de la vida máxima de la sesión)
// POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

module.exports = router;