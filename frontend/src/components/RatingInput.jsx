// frontend/src/components/RatingInput.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../styles/components/_ratinginput.scss';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RatingInput = ({ recipeId, isLoggedIn, onRatingSubmitted }) => {
  const [userRating, setUserRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUserRating = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/ratings/recipe/${recipeId}/user`);
      if (response.data.userRating) {
        setUserRating(response.data.userRating);
      }
    } catch (error) {
      console.error('Error al cargar tu valoración:', error);
    }
  }, [recipeId]);

  // Cargar la valoración actual del usuario al montar el componente
  useEffect(() => {
    if (isLoggedIn && recipeId) {
      fetchUserRating();
    }
  }, [isLoggedIn, recipeId, fetchUserRating]);

  const handleRating = async (score) => {
    if (!isLoggedIn) {
      toast.error('Debes estar logueado para poder valorar la receta (:');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/ratings`, {
        recipeId,
        score,
      });
      setUserRating(score);
      toast.success('¡Valoración registrada!');
      // Notificar al componente padre para que recargue los ratings
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    } catch (error) {
      console.error('Error al valorar la receta:', error);
      toast.error(error.response?.data?.message || 'Error al valorar la receta');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= (hoverRating || userRating || 0);
      stars.push(
        <button
          key={i}
          className={`rating-star ${isFilled ? 'filled' : 'empty'}`}
          onClick={() => handleRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          disabled={loading}
          title={`Valorar con ${i} ${i === 1 ? 'estrella' : 'estrellas'}`}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  if (!isLoggedIn) {
    return (
      <div className="rating-input-container">
        <p className="not-logged-message">Debes estar logueado para poder valorar la receta (:</p>
      </div>
    );
  }

  return (
    <div className="rating-input-container">
      <h3>Tu valoración</h3>
      <div className="rating-stars">
        {renderStars()}
      </div>
      {userRating && (
        <p className="current-rating">Tu valoración: <strong>{userRating}</strong> {userRating === 1 ? 'estrella' : 'estrellas'}</p>
      )}
    </div>
  );
};

export default RatingInput;
