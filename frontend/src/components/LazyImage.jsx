/**
 * LazyImage Component
 * Carica immagini solo quando entrano nel viewport
 * Migliora le performance e riduce il consumo di banda
 */
import { useState, useEffect, useRef } from 'react';

export const LazyImage = ({ 
  src, 
  alt, 
  placeholder = '/placeholder.jpg',
  className = '',
  threshold = 0.1,
  rootMargin = '50px',
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Check se Intersection Observer è supportato
    if (!('IntersectionObserver' in window)) {
      // Fallback: carica subito
      setImageSrc(src);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Immagine è visibile, inizia il caricamento
            const img = new Image();
            
            img.onload = () => {
              setImageSrc(src);
              setImageLoaded(true);
              setError(false);
            };
            
            img.onerror = () => {
              setError(true);
              console.error(`Failed to load image: ${src}`);
            };
            
            img.src = src;
            
            // Stop observing dopo il caricamento
            if (imgRef.current) {
              observer.unobserve(imgRef.current);
            }
          }
        });
      },
      { 
        threshold, 
        rootMargin 
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    // Cleanup
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, threshold, rootMargin]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${imageLoaded ? 'loaded' : 'loading'} ${error ? 'error' : ''}`}
      loading="lazy"
      {...props}
      style={{
        transition: 'opacity 0.3s ease-in-out',
        opacity: imageLoaded ? 1 : 0.5,
        ...props.style
      }}
    />
  );
};

/**
 * Uso:
 * 
 * import { LazyImage } from '@/components/LazyImage';
 * 
 * <LazyImage 
 *   src="/images/article-hero.jpg" 
 *   alt="Article Hero"
 *   className="w-full h-64 object-cover rounded-lg"
 *   placeholder="/images/placeholder.jpg"
 * />
 */
