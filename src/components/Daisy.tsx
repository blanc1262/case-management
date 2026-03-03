import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DaisyProps {
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}

export const Daisy: React.FC<DaisyProps> = ({ className, style, delay = 0 }) => {
  return (
    <div 
      className={cn("flower-container", className)} 
      style={{ 
        ...style, 
        animationDelay: `${delay}s` 
      }}
    >
      {[...Array(8)].map((_, i) => (
        <div 
          key={i} 
          className="petal" 
          style={{ transform: `rotate(${i * 45}deg)` }} 
        />
      ))}
      <div className="flower-center" />
    </div>
  );
};
