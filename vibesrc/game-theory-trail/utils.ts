import { PlatformPosition, Move } from './types';

/**
 * Generate platform positions along an S-curve trail
 * Positions are calculated to match the visual trail path
 */
export function generatePlatformPositions(count: number): PlatformPosition[] {
  const positions: PlatformPosition[] = [];

  // Define key points along the trail path (bottom to top)
  // These match the bezier curve in TrailSVG
  const pathPoints = [
    { x: 50, y: 95 },   // Bottom (start)
    { x: 62, y: 80 },   // Curve right
    { x: 67, y: 60 },   // Peak right
    { x: 67, y: 50 },   // Middle right
    { x: 64, y: 40 },   // Curve back
    { x: 52, y: 37 },   // Middle center
    { x: 40, y: 35 },   // Curve left
    { x: 34, y: 27 },   // Upper left
    { x: 30, y: 13 },   // Near top
    { x: 30, y: 5 },    // Top
  ];

  for (let i = 0; i < count; i++) {
    // Calculate scale (larger at bottom, smaller at top)
    const scale = 1.2 - (i * 0.8) / (count - 1);

    // Calculate progress along the path (0 = bottom, 1 = top)
    const progress = i / (count - 1);

    // Interpolate position along the path points
    const pathIndex = progress * (pathPoints.length - 1);
    const lowerIndex = Math.floor(pathIndex);
    const upperIndex = Math.min(lowerIndex + 1, pathPoints.length - 1);
    const t = pathIndex - lowerIndex;

    const lower = pathPoints[lowerIndex];
    const upper = pathPoints[upperIndex];

    // Linear interpolation between path points
    const x = lower.x + (upper.x - lower.x) * t;
    const y = lower.y + (upper.y - lower.y) * t;

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
