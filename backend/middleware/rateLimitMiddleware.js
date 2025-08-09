// backend/middleware/rateLimitMiddleware.js
const rateLimit = require('express-rate-limit');

// Limitador general para API, excluyendo rutas de auth muy específicas si lo deseas
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // Límite de 300 solicitudes por IP cada 15 minutos
  message: 'Demasiadas solicitudes desde esta IP, por favor inténtalo de nuevo después de 15 minutos.',
  headers: true, // Incluye los headers X-RateLimit-Limit y X-RateLimit-Remaining
});

// Limitador más estricto para rutas de autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // Límite de 50 solicitudes por IP cada 15 minutos
  message: 'Demasiados intentos de autenticación desde esta IP, por favor inténtalo de nuevo después de 15 minutos.',
  headers: true,
});

module.exports = { apiLimiter, authLimiter };