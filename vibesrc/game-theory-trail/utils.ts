import { PlatformPosition, Move } from './types';
import { SVG_CONFIG } from './constants';

/**
 * Generate platform positions along an S-curve trail
 * with no overlaps and minimum gaps between platforms
 */
export function generatePlatformPositions(count: number): PlatformPosition[] {
  const positions: PlatformPosition[] = [];
  const { width, height, baseRadius, minGap, startY } = SVG_CONFIG;

  let currentY = startY;

  for (let i = 0; i < count; i++) {
    // Calculate scale and radius for current platform
    const scale = 1.2 - (i * 0.8) / (count - 1);
    const radius = baseRadius * scale;

    // Calculate x position using S-curve (reversed, moderate curve)
    const progress = i / (count - 1);
    const x = 50 - 35 * Math.sin(progress * Math.PI * 2 - Math.PI / 2);

    // Calculate y position
    let y = currentY;

    // If not first platform, ensure no overlap with previous platform
    if (i > 0) {
      const prevPlatform = positions[i - 1];
      const prevRadius = baseRadius * prevPlatform.scale;

      // Calculate minimum distance needed (in pixels)
      const minDistancePx = radius + prevRadius + minGap;

      // Calculate actual distance between current and previous
      const dx = ((x - prevPlatform.x) * width) / 100; // Convert % to px
      const dy = ((prevPlatform.y - y) * height) / 100; // Convert % to px
      const actualDistance = Math.sqrt(dx * dx + dy * dy);

      // If too close, push this platform up more
      if (actualDistance < minDistancePx) {
        const neededDy = Math.sqrt(minDistancePx * minDistancePx - dx * dx);
        y = prevPlatform.y - (neededDy * 100) / height; // Convert px back to %
      }
    }

    currentY = y;
    positions.push({ x, y, scale });
  }

  return positions;
}

/**
 * Get emoji representation for a move
 */
export function getMoveEmoji(move: Move): string {
  return move === 'C' ? '🤝' : '⚔️';
}

/**
 * Generate a timestamp string
 */
export function getTimestamp(): string {
  return new Date().toLocaleTimeString();
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
