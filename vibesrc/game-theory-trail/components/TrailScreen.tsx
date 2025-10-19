import React from 'react';
import { StrategyKey, ScorecardEntry } from '../types';
import { TrailSVG } from './TrailSVG';
import { Scorecard } from './Scorecard';

interface TrailScreenProps {
  platforms: StrategyKey[];
  completedPlatforms: number[];
  scorecard: ScorecardEntry[];
  totalScore: number;
  autoPlayEnabled: boolean;
  onOpenPlatform: (index: number) => void;
  onToggleNPCEncounters: () => void;
  onToggleAutoPlay: () => void;
  onViewEncounterDetail: (entry: ScorecardEntry) => void;
}

export const TrailScreen: React.FC<TrailScreenProps> = ({
  platforms,
  completedPlatforms,
  scorecard,
  totalScore,
  autoPlayEnabled,
  onOpenPlatform,
  onToggleNPCEncounters,
  onToggleAutoPlay,
  onViewEncounterDetail,
}) => {
  return (
    <div>
      <div className="mb-8 flex justify-center gap-3 flex-wrap">
        <div className="inline-block bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <div className="text-sm text-emerald-200 mb-1">Trail Score</div>
          <div className="text-4xl font-bold text-yellow-400">{totalScore}</div>
          <div className="text-xs text-emerald-200 mt-2">
            {completedPlatforms.length}/{platforms.length} platforms
          </div>
        </div>
        <button
          onClick={onToggleNPCEncounters}
          className="bg-white/10 backdrop-blur-md rounded-lg px-5 py-6 border border-white/20 hover:border-purple-400 hover:bg-purple-500/10 transition-all text-white font-bold text-center text-sm"
        >
          ⚔️ All
          <br />
          Encounters
        </button>
        <button
          onClick={onToggleAutoPlay}
          className={`backdrop-blur-md rounded-lg px-5 py-6 border-2 transition-all text-white font-bold text-center text-sm ${
            autoPlayEnabled
              ? 'bg-emerald-500/30 border-emerald-400'
              : 'bg-white/10 border-white/20 hover:border-white/40'
          }`}
        >
          ⚡ Auto
          <br />
          Play
        </button>
      </div>

      {/* Trail SVG */}
      <TrailSVG
        platforms={platforms}
        completedPlatforms={completedPlatforms}
        scorecard={scorecard}
        onOpenPlatform={onOpenPlatform}
      />

      {/* Scorecard */}
      <Scorecard scorecard={scorecard} onViewEncounter={onViewEncounterDetail} />
    </div>
  );
};
