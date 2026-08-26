import React, { useState } from 'react';

const RatingStars = ({ rating = 0, onRate, size = 16, showValue = false, count = null }) => {
  const [hovered, setHovered] = useState(0);

  const displayRating = hovered || rating;

  const stars = Array.from({ length: 5 }, (_, i) => {
    const starIndex = i + 1;
    const fillPercent = Math.min(Math.max((displayRating - i) * 100, 0), 100);

    return (
      <button
        key={i}
        type="button"
        disabled={!onRate}
        onClick={() => onRate && onRate(starIndex)}
        onMouseEnter={() => onRate && setHovered(starIndex)}
        onMouseLeave={() => onRate && setHovered(0)}
        className={`relative transition-transform duration-200 ${onRate ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
        style={{ width: size, height: size }}
      >
        {/* Background star (empty) */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          className="absolute inset-0"
          style={{ width: size, height: size }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>

        {/* Filled star with clip */}
        <svg
          viewBox="0 0 24 24"
          className="absolute inset-0 transition-all duration-300"
          style={{
            width: size,
            height: size,
            clipPath: `inset(0 ${100 - fillPercent}% 0 0)`,
          }}
        >
          <defs>
            <linearGradient id={`star-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#FFA500" />
              <stop offset="100%" stopColor="#FF8C00" />
            </linearGradient>
          </defs>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={`url(#star-grad-${i})`}
            stroke="#FFD700"
            strokeWidth="0.5"
          />
        </svg>
      </button>
    );
  });

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {stars}
      </div>
      {showValue && (
        <span className="text-white/60 text-xs font-medium ml-1">
          {rating.toFixed(1)}
        </span>
      )}
      {count !== null && (
        <span className="text-white/30 text-[10px] ml-0.5">
          ({count})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
