// backend/models/Recipe.js
const mongoose = require('mongoose');

const ingredientSchema = mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String }, // Puede ser opcional - acepta números, decimales y fracciones como texto
  unit: { type: String }, // ej: "gramos", "ml", "cucharadas", "tazas", puede ser opcional
});

const instructionsSchema = mongoose.Schema({
  step: { type: String, required: true },
  order: { type: Number, required: true }, // Para mantener el orden de los pasos
});

const recipeSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    instructions: [
      instructionsSchema, // Array de objetos con el esquema de instrucciones
    ],
    ingredients: [ingredientSchema], // Array de objetos con el esquema de ingredientes
    categories: [
      {
        type: String, // ej: "Desayuno", "Almuerzo", "Cena", "Postre", "Vegetariano"
        required: true,
      },
    ],
    imagesUrl: [ // Array de URLs de imágenes
        {
            type: String,
            default: '', // Puede ser opcional, con un valor por defecto
        }
    ],
     videoUrl: { // Nuevo campo para el URL del video
      type: String,
      trim: true,
      default: null, // Opcional: establecer un valor por defecto explícito de null
    },
    prepTime: { // Nuevo campo para tiempo de preparación
      type: Number, // En minutos, por ejemplo
      default: null,
    },
    cookTime: { // Nuevo campo para tiempo de cocción
      type: Number, // En minutos, por ejemplo
      default: null,
    },
    servings: { // Nuevo campo para número de raciones
      type: Number,
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId, // Referencia al ID del usuario que creó la receta
      ref: 'User', // Referencia al modelo 'User'
      required: true,
    },
    basedOn: {
      type: String,
      default: '', // Valor por defecto para que no sea estrictamente requerido
    },
  },
  {
    timestamps: true, // Añade `createdAt` y `updatedAt`
  }
);

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;