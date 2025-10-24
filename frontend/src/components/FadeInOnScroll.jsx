// LitInvestorBlog-frontend/src/components/FadeInOnScroll.jsx

import React from 'react';
import { useInView } from 'react-intersection-observer';
import { twMerge } from 'tailwind-merge';

const FadeInOnScroll = ({
  children,
  className,
  delay = 0,
  threshold = 0.1,
  triggerOnce = true, // Manteniamo la prop originale per flessibilità
}) => {
  const { ref, inView } = useInView({
    threshold: threshold,
    triggerOnce: triggerOnce,
  });

  // Definiamo uno spostamento verticale predefinito per l'effetto.
  const yOffset = 24; // Corrisponde a circa `translate-y-6` in Tailwind.

  // Stili in linea per le proprietà che beneficiano dell'accelerazione hardware.
  // Usiamo translate3d per forzare l'uso della GPU.
  const styles = {
    transitionDelay: `${delay}ms`,
    // Applichiamo la trasformazione iniziale o finale in base alla visibilità.
    transform: inView
      ? 'translate3d(0, 0, 0)'
      : `translate3d(0, ${yOffset}px, 0)`,
  };

  return (
    <div
      ref={ref}
      style={styles}
      className={twMerge(
        // Definiamo qui le proprietà della transizione:
        // - `transition-all`: applichiamo la transizione a transform e opacity.
        // - `duration-700`: una durata leggermente più lunga per un effetto più morbido.
        // - `ease-smooth`: la nostra curva di easing personalizzata (da definire in tailwind.config.js).
        // - `will-change-*`: ottimizzazione per le performance.
        'transition-all duration-700 ease-smooth will-change-transform will-change-opacity',
        // Applichiamo l'opacità in base alla visibilità.
        inView ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      {children}
    </div>
  );
};

export default FadeInOnScroll;