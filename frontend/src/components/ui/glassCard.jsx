// src/components/ui/GlassCard.jsx
// ✅ ORIGINALE - NON MODIFICARE

import React from 'react';
import { cn } from '@/lib/utils';

const GlassCard = ({ as: Component = 'div', children, className, ...props }) => {
  return (
    <Component
      className={cn(
        // Stili "vetro"
        'bg-white-glass backdrop-blur-lg border border-white-glass-border shadow-card-glass',
        // Stili per la forma e il posizionamento - INGRANDITO
        'w-full max-w-[550px] aspect-[550/372] rounded-[28px] relative z-10',
        // Permette di passare classi extra
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default GlassCard;
