// frontend/src/components/FavoriteButton.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const FavoriteButton = ({ recipeId, isLoggedIn, size = 'medium', onFavoriteChange }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verificar si la receta es favorita al cargar el componente
  useEffect(() => {
    if (isLoggedIn && recipeId) {
      checkIfFavorite();
    }
  }, [isLoggedIn, recipeId]);

  const checkIfFavorite = async () => {
    try {
      const response = await axios.get(`${API_URL}/favorites/check/${recipeId}`);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Error al verificar favorito:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      toast.error('Debes iniciar sesión para añadir favoritos');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await axios.delete(`${API_URL}/favorites/${recipeId}`);
        setIsFavorite(false);
        toast.success('Receta quitada de favoritos');
        // Notificar al componente padre del cambio
        if (onFavoriteChange) {
          onFavoriteChange(recipeId, false);
        }
      } else {
        await axios.post(`${API_URL}/favorites/${recipeId}`);
        setIsFavorite(true);
        toast.success('Receta añadida a favoritos');
        // Notificar al componente padre del cambio
        if (onFavoriteChange) {
          onFavoriteChange(recipeId, true);
        }
      }
    } catch (error) {
      console.error('Error al cambiar favorito:', error);
      toast.error('Error al actualizar favoritos');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <button 
        className={`favorite-button not-logged ${size}`}
        onClick={() => toast.error('Inicia sesión para añadir favoritos')}
        title="Inicia sesión para añadir a favoritos"
      >
        <span className="heart-icon">🤍</span>
      </button>
    );
  }

  return (
    <button 
      className={`favorite-button ${isFavorite ? 'favorited' : 'not-favorited'} ${size} ${loading ? 'loading' : ''}`}
      onClick={toggleFavorite}
      disabled={loading}
      title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
    >
      <span className="heart-icon">
        {loading ? '⏳' : isFavorite ? '❤️' : '🤍'}
      </span>
    </button>
  );
};

export default FavoriteButton;
