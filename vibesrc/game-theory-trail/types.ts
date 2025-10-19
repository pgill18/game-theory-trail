// Core game types
export type Move = 'C' | 'D'; // Cooperate or Defect

export type Outcome = 'win' | 'loss' | 'tie';

export interface Payoff {
  player: number;
  opponent: number;
}

export interface PayoffMatrix {
  CC: Payoff;
  CD: Payoff;
  DC: Payoff;
  DD: Payoff;
}

// Game history
export interface RoundHistory {
  player: Move;
  opponent: Move;
}

export interface NPCRoundHistory {
  npc1: Move;
  npc2: Move;
}

// Strategy definition
export type StrategyKey =
  | 'random'
  | 'alwaysCooperate'
  | 'alwaysDefect'
  | 'titForTat'
  | 'titForTwoTats'
  | 'generousTFT'
  | 'grudger'
  | 'suspicious'
  | 'pavlov'
  | 'majority';

export interface Strategy {
  name: string;
  icon: string;
  getMove: (history: RoundHistory[]) => Move;
}

export type StrategyMap = Record<StrategyKey, Strategy>;

// Platform and positioning
export interface PlatformPosition {
  x: number;
  y: number;
  scale: number;
}

// Scorecard entry
export interface ScorecardEntry {
  platform: number;
  opponent: string;
  score: number;
  opponentScore: number;
  history: RoundHistory[];
  playerStrategy: string;
  outcome: Outcome;
}

// Leaderboard entries
export interface PersonalLeaderboardEntry {
  rank: number;
  score: number;
  strategy: string;
  platformsCompleted: number;
  timestamp: string;
}

// Encounter types
export interface UserEncounter {
  isUserEncounter: true;
  player: string;
  opponent: string;
  playerScore: number;
  opponentScore: number;
  winner: string;
  timestamp: string;
  history: RoundHistory[];
}

export interface NPCEncounter {
  isUserEncounter?: false;
  npc1: string;
  npc2: string;
  npc1Score: number;
  npc2Score: number;
  winner: string;
  timestamp: string;
  history: NPCRoundHistory[];
}

export type GlobalEncounter = UserEncounter | NPCEncounter;

// Game state
export type GamePhase = 'setup' | 'trail' | 'complete';
export type ModalState = 'playing' | 'platformComplete';

export interface GameState {
  // Main game phase
  phase: GamePhase;
  playerStrategy: StrategyKey | null;
  platformCount: number;
  platforms: StrategyKey[];

  // Progress tracking
  scorecard: ScorecardEntry[];
  totalScore: number;
  completedPlatforms: number[];

  // Leaderboards
  personalLeaderboard: PersonalLeaderboardEntry[];
  npcLeaderboard: Record<string, number>;
  globalEncounters: GlobalEncounter[];

  // Current game modal state
  currentPlatformIndex: number | null;
  modalState: ModalState;
  history: RoundHistory[];
  playerScore: number;
  opponentScore: number;
  lastRoundResult: {
    player: Move;
    opponent: Move;
    playerPoints: number;
    opponentPoints: number;
  } | null;

  // UI state
  showGameModal: boolean;
  showNPCEncounters: boolean;
  showEncounterDetail: boolean;
  selectedEncounter: ScorecardEntry | null;
  strategyLeaderboardExpanded: boolean;
  personalLeaderboardExpanded: boolean;
  autoPlayEnabled: boolean;
  autoPlaying: boolean;
}

// Action types for reducer
export type GameAction =
  | { type: 'SET_PLAYER_STRATEGY'; payload: StrategyKey }
  | { type: 'SET_PLATFORM_COUNT'; payload: number }
  | { type: 'START_TRAIL' }
  | { type: 'OPEN_PLATFORM'; payload: number }
  | { type: 'PLAY_ROUND'; payload: Move }
  | {
      type: 'UPDATE_AUTO_PLAY_STATE';
      payload: {
        history: RoundHistory[];
        playerScore: number;
        opponentScore: number;
        lastRoundResult: {
          player: Move;
          opponent: Move;
          playerPoints: number;
          opponentPoints: number;
        };
      };
    }
  | { type: 'SET_AUTO_PLAYING'; payload: boolean }
  | { type: 'COMPLETE_PLATFORM' }
  | { type: 'RESET_GAME' }
  | { type: 'CLOSE_GAME_MODAL' }
  | { type: 'TOGGLE_NPC_ENCOUNTERS' }
  | { type: 'TOGGLE_STRATEGY_LEADERBOARD' }
  | { type: 'TOGGLE_PERSONAL_LEADERBOARD' }
  | { type: 'TOGGLE_AUTO_PLAY' }
  | { type: 'VIEW_ENCOUNTER_DETAIL'; payload: ScorecardEntry }
  | { type: 'CLOSE_ENCOUNTER_DETAIL' }
  | { type: 'VIEW_GLOBAL_ENCOUNTER'; payload: GlobalEncounter };
