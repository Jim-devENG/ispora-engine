import React, { useState } from 'react';
import { safeString } from '../utils/safeString';

const PlaceholderImage = ({ 
  width = 40, 
  height = 40, 
  text = '', 
  className = '',
  fallbackSrc = '/placeholder-40x40.png',
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Generate placeholder URL
  const placeholderUrl = `/api/placeholder/${width}/${height}`;
  
  // Generate fallback SVG if API fails
  const generateFallbackSVG = () => {
    const displayText = safeString.trim(text) || `${width}x${height}`;
    const fontSize = Math.min(width, height) * 0.2;
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
        <rect fill="#f0f0f0" width="${width}" height="${height}"/>
        <text fill="#666" font-family="Arial, sans-serif" font-size="${fontSize}" 
              x="50%" y="50%" text-anchor="middle" dy="0.35em">${displayText}</text>
      </svg>
    `)}`;
  };

  const handleError = () => {
    setImageError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  if (imageError) {
    return (
      <img
        src={generateFallbackSVG()}
        alt={safeString.trim(text) || 'Placeholder'}
        width={width}
        height={height}
        className={className}
        {...props}
      />
    );
  }

  return (
    <div className={`placeholder-container ${className}`} style={{ width, height }}>
      {loading && (
        <div className="placeholder-loading" style={{
          width: '100%',
          height: '100%',
          background: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#666'
        }}>
          Loading...
        </div>
      )}
      <img
        src={placeholderUrl}
        alt={safeString.trim(text) || 'Placeholder'}
        width={width}
        height={height}
        onError={handleError}
        onLoad={handleLoad}
        style={{ display: loading ? 'none' : 'block' }}
        {...props}
      />
    </div>
  );
};

export default PlaceholderImage;
