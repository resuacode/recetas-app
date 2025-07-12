// frontend/src/components/RecipeManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from './RecipeCard'; // Reutilizamos RecipeCard

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
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          author: currentUser.username, // Filtra por el nombre de usuario del admin
          sortBy: 'createdAt:desc', // Por defecto, las más recientes primero
        },
      };
      const response = await axios.get(`${API_URL}/recipes`, config);
      setUserRecipes(response.data);
    } catch (err) {
      console.error('Error al cargar las recetas del usuario:', err);
      setError('No se pudieron cargar tus recetas. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]); // Depende del currentUser para asegurar que se carga para el usuario correcto

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
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        await axios.delete(`${API_URL}/recipes/${recipeId}`, config);
        // Actualizar la lista después de eliminar
        setUserRecipes(userRecipes.filter(recipe => recipe._id !== recipeId));
        alert('Receta eliminada correctamente.');
      } catch (err) {
        console.error('Error al eliminar la receta:', err);
        alert('No se pudo eliminar la receta. Asegúrate de tener permisos.');
      }
    }
  };

  const handleRecipeClick = (recipeId) => {
    // Redirige a la vista de detalle cuando se hace clic en la tarjeta
    navigate(`/recipes/${recipeId}`);
  };

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
    </div>
  );
};

export default RecipeManagement;