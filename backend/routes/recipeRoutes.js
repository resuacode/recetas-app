// backend/routes/recipeRoutes.js
const express = require('express');
const {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getUserRecipes,
} = require('../controllers/recipeController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Middleware para proteger y autorizar
const router = express.Router();

// Rutas accesibles para todos (GET)
// GET /api/recipes
router.get('/', getRecipes);
// Ruta para obtener recetas del usuario autenticado
// GET /api/recipes/my-recipes
router.get('/my-recipes', protect, authorize(['admin']), getUserRecipes); 
// GET /api/recipes/:id
router.get('/:id', getRecipeById);

// Rutas protegidas por autenticación y solo para administradores (POST, PUT, DELETE)
// Estas rutas usarán los middlewares 'protect' y 'authorize'
// POST /api/recipes
router.post('/', protect, authorize(['admin']), createRecipe);
// PUT /api/recipes/:id
router.put('/:id', protect, authorize(['admin']), updateRecipe);
// DELETE /api/recipes/:id
router.delete('/:id', protect, authorize(['admin']), deleteRecipe);




module.exports = router;