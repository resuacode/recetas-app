// frontend/src/components/RatingDisplay.jsx
import React from 'react';
import '../styles/components/_ratingdisplay.scss';

const RatingDisplay = ({ average, count }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return stars;
  };

  return (
    <div className="rating-display">
      <div className="stars-container">
        {renderStars(average)}
      </div>
      <div className="rating-info">
        <span className="average-score">{average.toFixed(1)}</span>
        <span className="rating-count">({count} {count === 1 ? 'valoración' : 'valoraciones'})</span>
      </div>
    </div>
  );
};

export default RatingDisplay;
