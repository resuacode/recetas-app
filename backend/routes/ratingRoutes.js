// backend/routes/ratingRoutes.js
const express = require('express');
const {
  getRecipeRatings,
  getUserRatingForRecipe,
  createOrUpdateRating,
  deleteRating,
} = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas públicas
// GET /api/ratings/recipe/:recipeId - obtener todos los ratings de una receta
router.get('/recipe/:recipeId', getRecipeRatings);

// Rutas protegidas (requieren autenticación)
// GET /api/ratings/recipe/:recipeId/user - obtener rating del usuario para una receta
router.get('/recipe/:recipeId/user', protect, getUserRatingForRecipe);

// POST /api/ratings - crear o actualizar rating
router.post('/', protect, createOrUpdateRating);

// DELETE /api/ratings/:recipeId - eliminar rating
router.delete('/:recipeId', protect, deleteRating);

module.exports = router;
