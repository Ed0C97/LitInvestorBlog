// LitInvestorBlog-frontend/src/components/LazyLoadWrapper.jsx

import { useEffect, useRef, useState } from 'react';

const LazyLoadWrapper = ({ children, threshold = 0.1, rootMargin = '100px', minHeight = '300px' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer && observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={elementRef} style={{ minHeight: isVisible ? 'auto' : minHeight }}>
      {isVisible ? children : <div className="flex items-center justify-center" style={{ minHeight }}><div className="animate-pulse text-gray-400">Caricamento...</div></div>}
    </div>
  );
};

export default LazyLoadWrapper;
