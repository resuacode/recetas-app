// frontend/src/components/RecipeCard.jsx
import React from 'react';

const RecipeCard = ({ recipe, onClick }) => {
  return (
    <div className="recipe-card" onClick={() => onClick(recipe._id)}>
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