// backend/models/Recipe.js
const mongoose = require('mongoose');

const ingredientSchema = mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }, // ej: "gramos", "ml", "cucharadas"
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
    author: {
      type: mongoose.Schema.Types.ObjectId, // Referencia al ID del usuario que creó la receta
      ref: 'User', // Referencia al modelo 'User'
      required: true,
    },
    basedOn: {
      type: String,
      default: '', // Valor por defecto para que no sea estrictamente requerido
    },
    approximateTime: {
      type: Number, // Duración en minutos
      default: 0, // O un valor que consideres apropiado si no se especifica
    },
  },
  {
    timestamps: true, // Añade `createdAt` y `updatedAt`
  }
);

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;