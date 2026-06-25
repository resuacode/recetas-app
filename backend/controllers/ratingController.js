// backend/controllers/ratingController.js
const asyncHandler = require('express-async-handler');
const Rating = require('../models/Rating');

// @desc    Obtener todos los ratings de una receta
// @route   GET /api/ratings/recipe/:recipeId
// @access  Public
const getRecipeRatings = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  const ratings = await Rating.find({ recipe: recipeId });

  if (ratings.length === 0) {
    return res.json({
      average: 0,
      count: 0,
      ratings: [],
    });
  }

  const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
  const average = (sum / ratings.length).toFixed(1);

  res.json({
    average: parseFloat(average),
    count: ratings.length,
    ratings,
  });
});

// @desc    Obtener la valoración del usuario para una receta específica
// @route   GET /api/ratings/recipe/:recipeId/user
// @access  Private
const getUserRatingForRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user._id;

  const rating = await Rating.findOne({ recipe: recipeId, user: userId });

  if (!rating) {
    return res.json({ userRating: null });
  }

  res.json({ userRating: rating.score });
});

// @desc    Crear o actualizar la valoración de un usuario para una receta
// @route   POST /api/ratings
// @access  Private
const createOrUpdateRating = asyncHandler(async (req, res) => {
  const { recipeId, score } = req.body;
  const userId = req.user._id;

  // Validar datos de entrada
  if (!recipeId || score === undefined) {
    res.status(400);
    throw new Error('Por favor, proporciona recipeId y score');
  }

  if (score < 1 || score > 5 || !Number.isInteger(score)) {
    res.status(400);
    throw new Error('La puntuación debe ser un número entero entre 1 y 5');
  }

  // Intentar encontrar rating existente
  let rating = await Rating.findOne({ recipe: recipeId, user: userId });

  if (rating) {
    // Actualizar rating existente
    rating.score = score;
    const updatedRating = await rating.save();
    return res.json({
      message: 'Valoración actualizada exitosamente',
      rating: updatedRating,
    });
  }

  // Crear nuevo rating
  rating = new Rating({
    recipe: recipeId,
    user: userId,
    score,
  });

  const createdRating = await rating.save();
  res.status(201).json({
    message: 'Valoración creada exitosamente',
    rating: createdRating,
  });
});

// @desc    Eliminar la valoración de un usuario para una receta
// @route   DELETE /api/ratings/:recipeId
// @access  Private
const deleteRating = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user._id;

  const rating = await Rating.findOneAndDelete({
    recipe: recipeId,
    user: userId,
  });

  if (!rating) {
    res.status(404);
    throw new Error('Valoración no encontrada');
  }

  res.json({ message: 'Valoración eliminada exitosamente' });
});

module.exports = {
  getRecipeRatings,
  getUserRatingForRecipe,
  createOrUpdateRating,
  deleteRating,
};
