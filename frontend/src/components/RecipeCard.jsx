// frontend/src/components/RecipeCard.jsx
import React from 'react';
import FavoriteButton from './FavoriteButton';

const RecipeCard = ({ recipe, onClick, isLoggedIn, onFavoriteChange }) => {
  const handleCardClick = (e) => {
    // Evitar que se active el onClick si se hace clic en el botón de favoritos
    if (e.target.closest('.favorite-button')) {
      return;
    }
    onClick(recipe._id);
  };

  return (
    <div className="recipe-card" onClick={handleCardClick}>
      <FavoriteButton 
        recipeId={recipe._id} 
        isLoggedIn={isLoggedIn} 
        size="medium"
        onFavoriteChange={onFavoriteChange}
      />
      <h3>{recipe.title}</h3>
      <p>{recipe.description}</p>
      {/* Opcional: Mostrar categorías y autor */}
      {recipe.categories && recipe.categories.length > 0 && (
        <div className="recipe-categories">
          {recipe.categories.map((cat, index) => (
            <span key={index} className="category-chip">{cat}</span>
          ))}
        </div>
      )}
      {recipe.author && (
        <p className="recipe-author">Por: {recipe.author.username || recipe.author}</p>
      )}
    </div>
  );
};

export default RecipeCard;