// frontend/src/components/RecipeManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from './RecipeCard'; // Reutilizamos RecipeCard
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RecipeManagement = ({ currentUser }) => {
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Función para obtener las recetas de este usuario
  const fetchUserRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        params: {
          sortBy: 'createdAt:desc', // Por defecto, las más recientes primero
        },
      };
      const response = await axios.get(`${API_URL}/recipes/my-recipes`, config);
      setUserRecipes(response.data);
    } catch (err) {
      console.error('Error al cargar las recetas del usuario:', err);
      toast.error('No se pudieron cargar tus recetas. Inténtalo de nuevo más tarde.');
      setError('No se pudieron cargar tus recetas. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUserRecipes();
    }
  }, [currentUser, fetchUserRecipes]);

  const handleCreateNewRecipe = () => {
    // console.log('Navegar a formulario para crear nueva receta');
    navigate('/manage-recipes/new');
  };

  const handleEditRecipe = (recipeId) => {
    // console.log(`Editar receta con ID: ${recipeId}`);
    navigate(`/manage-recipes/edit/${recipeId}`);
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
      try {
        await axios.delete(`${API_URL}/recipes/${recipeId}`);
        // Actualizar la lista después de eliminar
        setUserRecipes(userRecipes.filter(recipe => recipe._id !== recipeId));
        toast.success('Receta eliminada correctamente.');
      } catch (err) {
        console.error('Error al eliminar la receta:', err);
        toast.error('No se pudo eliminar la receta. Asegúrate de tener permisos.');
      }
    }
  };

  const handleRecipeClick = (recipeId) => {
    // Redirige a la vista de detalle cuando se hace clic en la tarjeta
    navigate(`/recipes/${recipeId}`);
  };

  // Función para calcular las categorías más populares
  const getTopCategories = (recipes, limit = 3) => {
    const categoryCount = {};
    
    // Contar las categorías de todas las recetas
    recipes.forEach(recipe => {
      if (recipe.categories && Array.isArray(recipe.categories)) {
        recipe.categories.forEach(category => {
          if (category && category.trim()) {
            const normalizedCategory = category.trim();
            categoryCount[normalizedCategory] = (categoryCount[normalizedCategory] || 0) + 1;
          }
        });
      }
    });

    // Convertir a array y ordenar por frecuencia
    const sortedCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);

    return sortedCategories;
  };

  // Función para obtener información de la primera receta
  const getFirstRecipeInfo = (recipes) => {
    if (recipes.length === 0) return null;
    
    // Ordenar por fecha de creación (más antigua primero)
    const sortedByDate = recipes
      .filter(recipe => recipe.createdAt) // Asegurar que tenga fecha
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    if (sortedByDate.length === 0) return null;
    
    const firstRecipe = sortedByDate[0];
    const createdDate = new Date(firstRecipe.createdAt);
    
    // Formatear la fecha de manera legible
    const formattedDate = createdDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return {
      date: formattedDate,
      title: firstRecipe.title,
      id: firstRecipe._id
    };
  };

  // Calcular estadísticas
  const totalRecipes = userRecipes.length;
  const topCategories = getTopCategories(userRecipes);
  const firstRecipeInfo = getFirstRecipeInfo(userRecipes);

  if (!currentUser) return <p>Acceso denegado. No se ha encontrado el usuario.</p>;
  if (loading) return <p className="loading-message">Cargando tus recetas...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="recipe-management-container">
      <h2>Gestión de Mis Recetas</h2>

      <button onClick={handleCreateNewRecipe} className="create-recipe-button">
        Crear Nueva Receta
      </button>

      <div className="my-recipes-list">
        {userRecipes.length === 0 ? (
          <p>Aún no has añadido ninguna receta.</p>
        ) : (
          userRecipes.map((recipe) => (
            <div key={recipe._id} className="management-recipe-item">
              <RecipeCard recipe={recipe} onClick={handleRecipeClick} />
              <div className="management-buttons">
                <button onClick={() => handleEditRecipe(recipe._id)} className="edit-button">Editar</button>
                <button onClick={() => handleDeleteRecipe(recipe._id)} className="delete-button">Borrar</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sección de estadísticas - solo se muestra si hay recetas */}
      {userRecipes.length > 0 && (
        <div className="user-stats-section">
          <h3>📊 Resumen de tus Contribuciones</h3>
          
          <div className="stats-container">
            <div className="stat-item total-recipes">
              <div className="stat-number">{totalRecipes}</div>
              <div className="stat-label">
                {totalRecipes === 1 ? 'Receta Creada' : 'Recetas Creadas'}
              </div>
            </div>

            <div className="stat-item top-categories">
              <div className="stat-label">Tus Categorías Favoritas:</div>
              <div className="categories-list">
                {topCategories.length > 0 ? (
                  topCategories.map(([category, count], index) => (
                    <div key={category} className="category-stat">
                      <span className="category-rank">#{index + 1}</span>
                      <span className="category-name">{category}</span>
                      <span className="category-count">({count} {count === 1 ? 'receta' : 'recetas'})</span>
                    </div>
                  ))
                ) : (
                  <span className="no-categories">No hay categorías disponibles</span>
                )}
              </div>
            </div>
          </div>

          {/* Información de la primera receta */}
          {firstRecipeInfo && (
            <div className="first-recipe-info">
              <p className="contributing-since">
                🎂 Contribuyendo desde <strong>{firstRecipeInfo.date}</strong> con{' '}
                <span 
                  className="first-recipe-link"
                  onClick={() => navigate(`/recipes/${firstRecipeInfo.id}`)}
                  title="Ver receta"
                >
                  "{firstRecipeInfo.title}"
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeManagement;