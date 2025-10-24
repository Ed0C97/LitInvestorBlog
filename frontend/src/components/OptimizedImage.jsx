// LitInvestorBlog-frontend/src/components/OptimizedImage.jsx

import { useState } from 'react';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const optimizeSrc = (url) => {
    if (!url) return url;
    if (url.includes('unsplash.com') && !url.includes('auto=format')) {
      return `${url}${url.includes('?') ? '&' : '?'}auto=format&fit=crop&q=75&fm=webp`;
    }
    return url;
  };

  if (error) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Immagine non disponibile</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
      <img
        src={optimizeSrc(src)}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

export default OptimizedImage;
