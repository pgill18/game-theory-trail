import { useEffect } from 'react';

interface KeyboardNavigationOptions {
  enabled: boolean;
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
  useEffect(() => {
    if (!options.enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          options.onEscape?.();
          break;
        case 'Enter':
          options.onEnter?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          options.onArrowUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          options.onArrowDown?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          options.onArrowLeft?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          options.onArrowRight?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options]);
}
