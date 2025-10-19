import React, { useMemo } from 'react';
import { StrategyKey, ScorecardEntry } from '../types';
import { STRATEGIES, SVG_CONFIG } from '../constants';
import { generatePlatformPositions } from '../utils';

interface TrailSVGProps {
  platforms: StrategyKey[];
  completedPlatforms: number[];
  scorecard: ScorecardEntry[];
  onOpenPlatform: (index: number) => void;
}

export const TrailSVG: React.FC<TrailSVGProps> = ({
  platforms,
  completedPlatforms,
  scorecard,
  onOpenPlatform,
}) => {
  const positions = useMemo(
    () => generatePlatformPositions(platforms.length),
    [platforms.length]
  );

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-lg p-8 border border-white/20 mb-8 overflow-hidden">
      <svg viewBox="0 0 1000 600" className="w-full h-auto">
        {/* Background gradient for field effect */}
        <defs>
          <linearGradient id="fieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: 'rgba(34, 197, 94, 0.1)', stopOpacity: 0.3 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: 'rgba(34, 197, 94, 0.3)', stopOpacity: 0.6 }}
            />
          </linearGradient>
          <linearGradient id="trailGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: 'rgba(34, 197, 94, 0.2)', stopOpacity: 0.4 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: 'rgba(34, 197, 94, 0.4)', stopOpacity: 0.8 }}
            />
          </linearGradient>
        </defs>

        {/* Field background */}
        <rect width="1000" height="600" fill="url(#fieldGradient)" />

        {/* Trail path - S-curve from bottom to top */}
        <path
          d="M 500 620
             C 520 580, 560 540, 620 480
             C 680 420, 700 360, 670 300
             C 640 240, 580 220, 520 220
             C 460 220, 400 220, 340 160
             C 280 100, 260 40, 300 -10"
          stroke="url(#trailGradient)"
          strokeWidth="150"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M 500 620
             C 520 580, 560 540, 620 480
             C 680 420, 700 360, 670 300
             C 640 240, 580 220, 520 220
             C 460 220, 400 220, 340 160
             C 280 100, 260 40, 300 -10"
          stroke="rgba(34, 197, 94, 0.25)"
          strokeWidth="110"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M 500 620
             C 520 580, 560 540, 620 480
             C 680 420, 700 360, 670 300
             C 640 240, 580 220, 520 220
             C 460 220, 400 220, 340 160
             C 280 100, 260 40, 300 -10"
          stroke="rgba(16, 185, 129, 0.2)"
          strokeWidth="70"
          fill="none"
          strokeLinecap="round"
        />

        {/* Platforms */}
        {platforms.map((platformKey, idx) => {
          const pos = positions[idx];
          const x = (pos.x / 100) * SVG_CONFIG.width;
          const y = (pos.y / 100) * SVG_CONFIG.height;
          const scale = pos.scale || 1;
          const baseRadius = SVG_CONFIG.baseRadius * scale;
          const glowRadius = 35 * scale;
          const isCompleted = completedPlatforms.includes(idx);
          const opacity = 0.6 + scale * 0.4;

          // Get outcome for this platform
          const platformResult = scorecard.find((s) => s.platform === idx + 1);
          const outcome = platformResult?.outcome;

          // Determine colors based on outcome
          let fillColor: string;
          let strokeColor: string;
          if (isCompleted) {
            if (outcome === 'win') {
              fillColor = 'rgba(34, 197, 94, 0.7)'; // Green
              strokeColor = '#22c55e';
            } else if (outcome === 'loss') {
              fillColor = 'rgba(147, 51, 234, 0.4)'; // Purple
              strokeColor = '#9333ea';
            } else {
              // tie
              fillColor = 'rgba(250, 250, 250, 0.4)'; // Pale white
              strokeColor = '#e5e5e5';
            }
          } else {
            fillColor = 'rgba(59, 130, 246, 0.4)';
            strokeColor = '#93c5fd';
          }

          return (
            <g key={idx} opacity={opacity}>
              {/* Platform glow when not completed */}
              {!isCompleted && (
                <circle
                  cx={x}
                  cy={y}
                  r={glowRadius}
                  fill="rgba(34, 197, 94, 0.3)"
                />
              )}

              {/* Platform circle */}
              <circle
                cx={x}
                cy={y}
                r={baseRadius}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={3 * scale}
                style={{ cursor: 'pointer' }}
                onClick={() => onOpenPlatform(idx)}
              />

              {/* Platform icon */}
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fontSize: `${24 * scale}px` }}
                className="select-none pointer-events-none"
              >
                {STRATEGIES[platformKey].icon}
              </text>

              {/* Platform number */}
              <text
                x={x}
                y={y + 45 * scale}
                textAnchor="middle"
                style={{ fontSize: `${12 * scale}px` }}
                className="fill-white font-bold select-none pointer-events-none"
              >
                {idx + 1}
              </text>

              {/* Completion checkmark */}
              {isCompleted && (
                <text
                  x={x + 20 * scale}
                  y={y - 20 * scale}
                  style={{ fontSize: `${20 * scale}px` }}
                  className={`select-none pointer-events-none ${
                    outcome === 'win'
                      ? 'fill-green-600'
                      : outcome === 'loss'
                      ? 'fill-purple-600'
                      : 'fill-gray-400'
                  }`}
                >
                  ✓
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
