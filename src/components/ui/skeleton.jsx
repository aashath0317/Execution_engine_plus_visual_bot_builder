import React from 'react';

/**
 * Base Skeleton component with shimmer animation
 */
export const Skeleton = ({ 
  className = '', 
  width, 
  height, 
  circle = false,
  style = {} 
}) => {
  const baseClasses = 'bg-white/5 animate-pulse';
  const shapeClasses = circle ? 'rounded-full' : 'rounded-lg';
  
  const inlineStyle = {
    width: width || '100%',
    height: height || '100%',
    ...style
  };

  return (
    <div 
      className={`${baseClasses} ${shapeClasses} ${className}`}
      style={inlineStyle}
    />
  );
};

/**
 * Skeleton with shimmer gradient effect
 */
export const SkeletonShimmer = ({ 
  className = '', 
  width, 
  height,
  style = {}
}) => {
  const inlineStyle = {
    width: width || '100%',
    height: height || '100%',
    ...style
  };

  return (
    <div 
      className={`relative overflow-hidden bg-white/5 rounded-lg ${className}`}
      style={inlineStyle}
    >
      <div className="absolute inset-0 skeleton-shimmer" />
    </div>
  );
};

/**
 * Skeleton for text lines
 */
export const SkeletonText = ({ 
  lines = 1, 
  className = '',
  lastLineWidth = '60%'
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i}
          height="12px"
          width={i === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton for circular avatar/icon
 */
export const SkeletonCircle = ({ size = '40px', className = '' }) => {
  return <Skeleton circle width={size} height={size} className={className} />;
};

/**
 * Skeleton for rectangular card
 */
export const SkeletonCard = ({ 
  className = '',
  height = '200px',
  children 
}) => {
  return (
    <div className={`bg-[#131517] rounded-3xl p-6 border border-white/5 ${className}`}>
      {children || <Skeleton height={height} />}
    </div>
  );
};

export default Skeleton;
