import React, { useEffect, useState, ReactNode } from 'react';

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
}

/**
 * Scale-in animation wrapper for modals
 */
export const ScaleIn: React.FC<ScaleInProps> = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      style={{
        transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  );
};
