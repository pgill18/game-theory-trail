import React, { useEffect } from 'react';
import { useGameState } from './useGameState';
import { useAutoPlay } from './hooks/useAutoPlay';
import { SetupScreen } from './components/SetupScreen';
import { TrailScreen } from './components/TrailScreen';
import { CompleteScreen } from './components/CompleteScreen';
import { PersonalLeaderboard } from './components/PersonalLeaderboard';
import { StrategyLeaderboard } from './components/StrategyLeaderboard';
import { GameModal } from './components/GameModal';
import { EncounterDetailModal } from './components/EncounterDetailModal';
import { AllEncountersModal } from './components/AllEncountersModal';
import { PayoffInfo } from './components/PayoffInfo';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StrategyKey, Move } from './types';

const GameTheoryTrail: React.FC = () => {
  const { state, dispatch } = useGameState();

  // Auto-play hook
  const { autoPlay } = useAutoPlay({
    playerStrategy: state.playerStrategy,
    opponentStrategy:
      state.currentPlatformIndex !== null
        ? state.platforms[state.currentPlatformIndex]
        : 'random',
    history: state.history,
    playerScore: state.playerScore,
    opponentScore: state.opponentScore,
    onUpdateState: (updates) =>
      dispatch({ type: 'UPDATE_AUTO_PLAY_STATE', payload: updates }),
    onSetAutoPlaying: (playing) =>
      dispatch({ type: 'SET_AUTO_PLAYING', payload: playing }),
    delay: state.autoPlayEnabled ? 0 : 300, // Instant in background, animated in modal
  });

  // Auto-play when opening any platform with auto-play enabled
  useEffect(() => {
    if (
      state.currentPlatformIndex !== null &&
      state.autoPlayEnabled &&
      !state.autoPlaying &&
      state.history.length === 0 // Only run for fresh platforms
    ) {
      const runAutoPlay = async () => {
        await autoPlay();
        // Automatically complete the platform after autoplay finishes
        setTimeout(() => dispatch({ type: 'COMPLETE_PLATFORM' }), 500);
      };
      setTimeout(() => runAutoPlay(), 100);
    }
  }, [
    state.currentPlatformIndex,
    state.autoPlayEnabled,
    state.autoPlaying,
    state.history.length,
    autoPlay,
    dispatch,
  ]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 p-8 relative">
      {/* Personal Leaderboard - Top Left */}
      {(state.phase === 'trail' || state.phase === 'complete') && (
        <PersonalLeaderboard
          entries={state.personalLeaderboard}
          expanded={state.personalLeaderboardExpanded}
          onToggle={() => dispatch({ type: 'TOGGLE_PERSONAL_LEADERBOARD' })}
        />
      )}

      {/* Strategy Leaderboard - Top Right */}
      {(state.phase === 'trail' || state.phase === 'complete') && (
        <StrategyLeaderboard
          npcLeaderboard={state.npcLeaderboard}
          playerStrategy={state.playerStrategy}
          expanded={state.strategyLeaderboardExpanded}
          onToggle={() => dispatch({ type: 'TOGGLE_STRATEGY_LEADERBOARD' })}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            🥾 Game Theory Trail
          </h1>
          <p className="text-emerald-200">
            Navigate the trail and master game theory strategies
          </p>
        </div>

        {/* Setup Screen */}
        {state.phase === 'setup' && (
          <SetupScreen
            playerStrategy={state.playerStrategy}
            platformCount={state.platformCount}
            onSelectStrategy={(strategy: StrategyKey) =>
              dispatch({ type: 'SET_PLAYER_STRATEGY', payload: strategy })
            }
            onSetPlatformCount={(count: number) =>
              dispatch({ type: 'SET_PLATFORM_COUNT', payload: count })
            }
            onStartTrail={() => dispatch({ type: 'START_TRAIL' })}
          />
        )}

        {/* Trail Screen */}
        {state.phase === 'trail' && (
          <TrailScreen
            platforms={state.platforms}
            completedPlatforms={state.completedPlatforms}
            scorecard={state.scorecard}
            totalScore={state.totalScore}
            autoPlayEnabled={state.autoPlayEnabled}
            onOpenPlatform={(index: number) =>
              dispatch({ type: 'OPEN_PLATFORM', payload: index })
            }
            onToggleNPCEncounters={() =>
              dispatch({ type: 'TOGGLE_NPC_ENCOUNTERS' })
            }
            onToggleAutoPlay={() => dispatch({ type: 'TOGGLE_AUTO_PLAY' })}
            onViewEncounterDetail={(entry) =>
              dispatch({ type: 'VIEW_ENCOUNTER_DETAIL', payload: entry })
            }
          />
        )}

        {/* Complete Screen */}
        {state.phase === 'complete' && (
          <CompleteScreen
            totalScore={state.totalScore}
            scorecard={state.scorecard}
            onReset={() => dispatch({ type: 'RESET_GAME' })}
            onViewAllEncounters={() => dispatch({ type: 'TOGGLE_NPC_ENCOUNTERS' })}
            onViewEncounterDetail={(entry) =>
              dispatch({ type: 'VIEW_ENCOUNTER_DETAIL', payload: entry })
            }
          />
        )}

        {/* Game Modal */}
        {state.showGameModal &&
          state.currentPlatformIndex !== null &&
          !state.autoPlayEnabled && (
            <GameModal
              platformIndex={state.currentPlatformIndex}
              opponentStrategy={state.platforms[state.currentPlatformIndex]}
              modalState={state.modalState}
              history={state.history}
              playerScore={state.playerScore}
              opponentScore={state.opponentScore}
              lastRoundResult={state.lastRoundResult}
              autoPlaying={state.autoPlaying}
              onPlayRound={(move: Move) =>
                dispatch({ type: 'PLAY_ROUND', payload: move })
              }
              onAutoPlay={autoPlay}
              onComplete={() => dispatch({ type: 'COMPLETE_PLATFORM' })}
              onClose={() => dispatch({ type: 'CLOSE_GAME_MODAL' })}
            />
          )}

        {/* All Encounters Modal */}
        {state.showNPCEncounters && (
          <AllEncountersModal
            encounters={state.globalEncounters}
            onClose={() => dispatch({ type: 'TOGGLE_NPC_ENCOUNTERS' })}
            onViewEncounter={(encounter) =>
              dispatch({ type: 'VIEW_GLOBAL_ENCOUNTER', payload: encounter })
            }
          />
        )}

        {/* Encounter Detail Modal */}
        {state.showEncounterDetail && state.selectedEncounter && (
          <EncounterDetailModal
            encounter={state.selectedEncounter}
            onClose={() => dispatch({ type: 'CLOSE_ENCOUNTER_DETAIL' })}
          />
        )}

        {/* Payoff Info */}
        <PayoffInfo />
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default GameTheoryTrail;
