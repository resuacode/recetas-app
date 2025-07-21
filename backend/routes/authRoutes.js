// routes/authRoutes.js
const express = require('express');
const { forgotPassword, resetPassword } = require('../controllers/authController'); // Importa las funciones
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

// Ruta para refrescar token (opcional)
// POST /api/auth/refresh-token
router.post('/refresh-token', protect, (req, res) => {
  // Generar un nuevo token con la información del usuario actual
  const jwt = require('jsonwebtoken');
  
  const newToken = jwt.sign(
    { id: req.user._id, role: req.user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' } // Nuevo token válido por 7 días
  );
  
  res.status(200).json({
    message: 'Token renovado correctamente',
    token: newToken,
    user: req.user
  });
});

module.exports = router;