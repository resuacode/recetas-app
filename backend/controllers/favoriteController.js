// backend/controllers/favoriteController.js
const User = require('../models/User');
const Recipe = require('../models/Recipe');

// @desc    Obtener favoritos del usuario
// @route   GET /api/favorites
// @access  Private
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      populate: {
        path: 'author',
        select: 'username'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user.favorites);
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Añadir receta a favoritos
// @route   POST /api/favorites/:recipeId
// @access  Private
const addToFavorites = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    // Verificar que la receta existe
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Receta no encontrada' });
    }

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si ya está en favoritos
    if (user.favorites.includes(recipeId)) {
      return res.status(400).json({ message: 'La receta ya está en favoritos' });
    }

    // Añadir a favoritos
    user.favorites.push(recipeId);
    await user.save();

    res.status(200).json({ 
      message: 'Receta añadida a favoritos',
      favorites: user.favorites 
    });
  } catch (error) {
    console.error('Error al añadir a favoritos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Quitar receta de favoritos
// @route   DELETE /api/favorites/:recipeId
// @access  Private
const removeFromFavorites = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si está en favoritos
    if (!user.favorites.includes(recipeId)) {
      return res.status(400).json({ message: 'La receta no está en favoritos' });
    }

    // Quitar de favoritos
    user.favorites = user.favorites.filter(fav => fav.toString() !== recipeId);
    await user.save();

    res.status(200).json({ 
      message: 'Receta quitada de favoritos',
      favorites: user.favorites 
    });
  } catch (error) {
    console.error('Error al quitar de favoritos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Verificar si una receta está en favoritos
// @route   GET /api/favorites/check/:recipeId
// @access  Private
const checkIsFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isFavorite = user.favorites.includes(recipeId);
    res.json({ isFavorite });
  } catch (error) {
    console.error('Error al verificar favorito:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkIsFavorite
};
