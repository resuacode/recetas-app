// backend/routes/favoriteRoutes.js
const express = require('express');
const {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkIsFavorite
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas de favoritos requieren autenticación
router.use(protect);

// GET /api/favorites - Obtener todos los favoritos del usuario
router.get('/', getFavorites);

// GET /api/favorites/check/:recipeId - Verificar si una receta es favorita
router.get('/check/:recipeId', checkIsFavorite);

// POST /api/favorites/:recipeId - Añadir receta a favoritos
router.post('/:recipeId', addToFavorites);

// DELETE /api/favorites/:recipeId - Quitar receta de favoritos
router.delete('/:recipeId', removeFromFavorites);

module.exports = router;
