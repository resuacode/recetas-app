// frontend/src/components/RecipeDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importa useParams y useNavigate
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RecipeDetail = () => {
  const { id } = useParams(); // Obtiene el ID de la URL
  const navigate = useNavigate(); // Para volver a la lista si es necesario
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecipeDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API_URL}/recipes/${id}`, config);
      setRecipe(response.data);
    } catch (err) {
      console.error('Error al cargar detalle de la receta:', err);
      setError('No se pudo cargar el detalle de la receta. Asegúrate de que existe o inténtalo más tarde.');
      // Opcional: Si la receta no se encuentra o hay un error, puedes redirigir
      // navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id]); // Dependencia del ID de la URL

  useEffect(() => {
    fetchRecipeDetail();
  }, [fetchRecipeDetail]);

  if (loading) return <p className="loading-message">Cargando detalles de la receta...</p>;
  if (error) return (
    <div className="error-container">
      <p className="error-message">{error}</p>
      <button onClick={() => navigate('/')} className="back-button">Volver a la lista de recetas</button>
    </div>
  );
  if (!recipe) return <p className="not-found-message">Receta no encontrada.</p>; // Esto podría pasar si el fetch devuelve null por algún motivo

// Función auxiliar para verificar si un valor es "presente" para mostrarlo
  const isPresent = (value) => {
    // Para números, chequea si no es null/undefined y es un número válido
    if (typeof value === 'number') {
      return value !== null && value !== undefined && !isNaN(value);
    }
    // Para strings, chequea si no es null/undefined y no está vacío después de trim
    if (typeof value === 'string') {
      return value !== null && value !== undefined && value.trim() !== '';
    }
    // Para arrays, chequea si no es null/undefined y tiene elementos
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return false; // Otros tipos no se consideran "presentes"
  };

  return (
    <div className="recipe-detail-container">
      <h2>{recipe.title}</h2>
      <p className="recipe-description">{recipe.description}</p>

      {/* Mostrar "basado en" solo si existe y no está vacío/nulo */}
      {recipe.basedOn && recipe.basedOn.trim() !== '' && (
        <p className="recipe-based-on">Basado en: {recipe.basedOn}</p>
      )}

      {/* Mostrar imágenes si existen */}
      {recipe.imagesUrl && recipe.imagesUrl.length > 0 && (
        <div className="recipe-images">
          {recipe.imagesUrl.map((image, index) => (
            <img key={index} src={image} alt={`Imagen de ${recipe.title} ${index + 1}`} className="recipe-image" />
          ))}
        </div>
      )}

      {/* Mostrar video de TikTok/Instagram si existe */}
      {isPresent(recipe.videoUrl) && (
        <div className="recipe-video">
          <h3>Video de la Receta:</h3>
          {/* Usamos un iframe para incrustar el video */}
          <iframe
            src={recipe.videoUrl}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="recipe-video-iframe"
            title="Video de la receta"
          ></iframe>
        </div>
      )}

      {/* Lista de Ingredientes */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div className="recipe-ingredients">
          <h3>Ingredientes:</h3>
          <ul>
            {recipe.ingredients.map((ingredient, index) => {
              const hasQuantity = ingredient.quantity && !isNaN(ingredient.quantity);
              const hasUnit = ingredient.unit && ingredient.unit.trim() !== '';
              
              if (hasQuantity && hasUnit) {
                return <li key={index}>{ingredient.quantity} {ingredient.unit} de {ingredient.name}</li>;
              } else if (hasQuantity && !hasUnit) {
                return <li key={index}>{ingredient.quantity} de {ingredient.name}</li>;
              } else if (!hasQuantity && hasUnit) {
                return <li key={index}>{ingredient.unit} de {ingredient.name}</li>;
              } else {
                return <li key={index}>{ingredient.name}</li>;
              }
            })}
          </ul>
        </div>
      )}

      {/* Paso a Paso */}
     {isPresent(recipe.instructions) && (
        <div className="recipe-instructions">
        <h3>Preparación:</h3>
        <ol>
            {recipe.instructions.map((inst, index) => ( // Cambiado a 'inst' para mayor claridad
            <li key={index} dangerouslySetInnerHTML={{ __html: inst.step }}></li> 
            ))}
        </ol>
        </div>
    )}

        <div className="recipe-meta-section">
        <p className="recipe-meta">Categorías: {recipe.categories?.join(', ') || 'N/A'}</p>
        <p className="recipe-meta">Autor: {recipe.author?.username || 'Desconocido'}</p>
        
        {/* Nuevos campos con renderizado condicional */}
        {isPresent(recipe.prepTime) && (
          <p className="recipe-meta">Tiempo de preparación: {recipe.prepTime} mins</p>
        )}
        {isPresent(recipe.cookTime) && (
          <p className="recipe-meta">Tiempo de cocción: {recipe.cookTime} mins</p>
        )}
        {isPresent(recipe.servings) && (
          <p className="recipe-meta">Porciones: {recipe.servings}</p>
        )}
        
      </div>
        <button onClick={() => navigate(-1)} className="back-button">Volver a la lista de recetas</button> {/* Botón para volver */}
    </div>
  );
};

export default RecipeDetail;