// backend/controllers/recipeController.js
const asyncHandler = require('express-async-handler');
const Recipe = require('../models/Recipe');
const User = require('../models/User'); // Podrías necesitarlo para validar el autor, aunque ya lo tenemos en req.user

// @desc    Obtener todas las recetas
// @route   GET /api/recipes
// @access  Public
const getRecipes = asyncHandler(async (req, res) => {
  // Implementar búsqueda y filtrado aquí (ej: req.query.category, req.query.keyword)
  const keyword = req.query.keyword
    ? {
        title: {
          $regex: req.query.keyword,
          $options: 'i', // 'i' para case-insensitive
        },
      }
    : {};

  const category = req.query.category
    ? {
        categories: req.query.category, // Busca recetas que contengan la categoría
      }
    : {};

  const recipes = await Recipe.find({ ...keyword, ...category }).populate(
    'author',
    'username'
  ); // Poblamos el autor para obtener solo su username
  res.json(recipes);
});

// @desc    Obtener una receta por ID
// @route   GET /api/recipes/:id
// @access  Public
const getRecipeById = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id).populate(
    'author',
    'username'
  );

  if (recipe) {
    res.json(recipe);
  } else {
    res.status(404);
    throw new Error('Receta no encontrada');
  }
});

// @desc    Crear una nueva receta
// @route   POST /api/recipes
// @access  Private/Admin
const createRecipe = asyncHandler(async (req, res) => {
  // req.user viene del middleware 'protect' y contiene el usuario autenticado
  const { title, description, instructions, ingredients, categories, imagesUrl, basedOn, approximateTime } = req.body;

  if (!title || !description || !instructions || !ingredients || !categories) {
    res.status(400);
    throw new Error('Por favor, rellena todos los campos obligatorios para la receta');
  }

  // Asegúrate de que los ingredientes y las instrucciones tengan el formato correcto
  // Esto es una validación básica, podrías hacerla más robusta si es necesario
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
      res.status(400);
      throw new Error('Los ingredientes deben ser un array y no pueden estar vacíos');
  }
  if (!Array.isArray(instructions) || instructions.length === 0) {
      res.status(400);
      throw new Error('Las instrucciones deben ser un array y no pueden estar vacías');
  }

  const recipe = new Recipe({
    title,
    description,
    instructions,
    ingredients,
    categories,
    imagesUrl: imagesUrl || [], // Si no se proveen imágenes, un array vacío
    author: req.user._id, // Asigna el ID del usuario autenticado como autor
    basedOn: basedOn || '', // Si no se provee, usará el default del esquema o un string vacío
    approximateTime: approximateTime || 0, // Si no se provee, usará el default del esquema o 0
  });

  const createdRecipe = await recipe.save();
  res.status(201).json(createdRecipe);
});

// @desc    Actualizar una receta
// @route   PUT /api/recipes/:id
// @access  Private/Admin
const updateRecipe = asyncHandler(async (req, res) => {
  const { title, description, instructions, ingredients, categories, imagesUrl, basedOn, approximateTime } = req.body;

  const recipe = await Recipe.findById(req.params.id);

  if (recipe) {
    // Solo el autor o un super-admin (si lo hubiera) debería poder editarla
    // Para este proyecto, simplemente verificamos que sea admin, ya que el authorize lo controla
    // Podrías añadir una verificación adicional: if (recipe.author.toString() !== req.user._id.toString()) { ... }

    recipe.title = title || recipe.title;
    recipe.description = description || recipe.description;
    recipe.instructions = instructions || recipe.instructions;
    recipe.ingredients = ingredients || recipe.ingredients;
    recipe.categories = categories || recipe.categories;
    recipe.imagesUrl = imagesUrl || recipe.imagesUrl;
    recipe.basedOn = basedOn !== undefined ? basedOn : recipe.basedOn;
    recipe.approximateTime = approximateTime !== undefined ? approximateTime : recipe.approximateTime;


    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);
  } else {
    res.status(404);
    throw new Error('Receta no encontrada');
  }
});

// @desc    Eliminar una receta
// @route   DELETE /api/recipes/:id
// @access  Private/Admin
const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);

  if (recipe) {
    // Al igual que en update, podrías verificar si el usuario autenticado es el autor
    await recipe.deleteOne(); // Mongoose 6+ usa deleteOne(), versiones anteriores remove()
    res.json({ message: 'Receta eliminada' });
  } else {
    res.status(404);
    throw new Error('Receta no encontrada');
  }
});

module.exports = {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};