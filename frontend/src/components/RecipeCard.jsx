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

  const coverImage = recipe.imagesUrl?.find(url => url);
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="recipe-card" onClick={handleCardClick}>
      <div className="recipe-card-image">
        {coverImage ? (
          <img src={coverImage} alt={recipe.title} loading="lazy" />
        ) : (
          <div className="recipe-card-image-placeholder" aria-hidden="true">🍽️</div>
        )}
        <FavoriteButton
          recipeId={recipe._id}
          isLoggedIn={isLoggedIn}
          size="medium"
          onFavoriteChange={onFavoriteChange}
        />
      </div>
      <div className="recipe-card-content">
        <h3>{recipe.title}</h3>
        <p>{recipe.description}</p>
        {(totalTime > 0 || recipe.servings) && (
          <div className="recipe-card-meta">
            {totalTime > 0 && <span className="meta-badge">⏱️ {totalTime} min</span>}
            {recipe.servings && <span className="meta-badge">🍽️ {recipe.servings}</span>}
          </div>
        )}
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
    </div>
  );
};

export default RecipeCard;