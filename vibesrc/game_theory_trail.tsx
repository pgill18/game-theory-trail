import React, { useState } from 'react';
import { RotateCcw, Info, X } from 'lucide-react';

const GameTheoryGame = () => {
  const PAYOFF_MATRIX = {
    'CC': { player: 3, opponent: 3 },
    'CD': { player: 0, opponent: 5 },
    'DC': { player: 5, opponent: 0 },
    'DD': { player: 1, opponent: 1 }
  };

  const strategies = {
    random: { name: 'Random', icon: '🎲', getMove: (h) => Math.random() < 0.5 ? 'C' : 'D' },
    alwaysCooperate: { name: 'Always Cooperate', icon: '😊', getMove: () => 'C' },
    alwaysDefect: { name: 'Always Defect', icon: '😈', getMove: () => 'D' },
    titForTat: { name: 'Tit-for-Tat', icon: '🪞', getMove: (h) => h.length === 0 ? 'C' : h[h.length - 1].player },
    titForTwoTats: { name: 'Tit-for-Two-Tats', icon: '⏰', getMove: (h) => h.length < 2 ? 'C' : h.slice(-2).every(m => m.player === 'D') ? 'D' : 'C' },
    generousTFT: { name: 'Generous Tit-for-Tat', icon: '💝', getMove: (h) => h.length === 0 ? 'C' : (h[h.length - 1].player === 'D' && Math.random() < 0.1) ? 'C' : h[h.length - 1].player },
    grudger: { name: 'Grudger', icon: '😠', getMove: (h) => h.some(m => m.player === 'D') ? 'D' : 'C' },
    suspicious: { name: 'Suspicious', icon: '👀', getMove: (h) => h.length === 0 ? 'D' : h[h.length - 1].player },
    pavlov: { name: 'Pavlov', icon: '🐕', getMove: (h) => h.length === 0 ? 'C' : (h[h.length - 1].player === h[h.length - 1].opponent) ? h[h.length - 1].player : (h[h.length - 1].player === 'C' ? 'D' : 'C') },
    majority: { name: 'Majority', icon: '📊', getMove: (h) => {
      if (h.length === 0) return 'C';
      const opponentMoves = h.map(m => m.opponent);
      const cooperations = opponentMoves.filter(m => m === 'C').length;
      const defections = opponentMoves.filter(m => m === 'D').length;
      return cooperations >= defections ? 'C' : 'D';
    }}
  };

  // Platform positions - evenly spread with NO OVERLAPS and 20px gaps
  const PLATFORM_POSITIONS = [];
  
  // Generate 25 positions dynamically
  const totalPlatforms = 25;
  const baseRadius = 28; // Base platform radius in px
  const minGap = 20; // Minimum gap between circles in px
  const svgHeight = 600; // SVG viewBox height
  const svgWidth = 1000; // SVG viewBox width
  
  let currentY = 78; // Start 100px higher (95% - 17% for 600px height)
  
  for (let i = 0; i < totalPlatforms; i++) {
    // Calculate scale and radius for current platform
    const scale = 1.2 - (i * 0.8 / (totalPlatforms - 1));
    const radius = baseRadius * scale;
    
    // Calculate x position using S-curve (reversed, moderate curve)
    const progress = i / (totalPlatforms - 1);
    const x = 50 - 35 * Math.sin(progress * Math.PI * 2 - Math.PI / 2);
    
    // Calculate y position
    let y = currentY;
    
    // If not first platform, ensure no overlap with previous platform
    if (i > 0) {
      const prevPlatform = PLATFORM_POSITIONS[i - 1];
      const prevRadius = baseRadius * prevPlatform.scale;
      
      // Calculate minimum distance needed (in pixels)
      const minDistancePx = radius + prevRadius + minGap;
      
      // Calculate actual distance between current and previous
      const dx = (x - prevPlatform.x) * svgWidth / 100; // Convert % to px
      const dy = (prevPlatform.y - y) * svgHeight / 100; // Convert % to px
      const actualDistance = Math.sqrt(dx * dx + dy * dy);
      
      // If too close, push this platform up more
      if (actualDistance < minDistancePx) {
        const neededDy = Math.sqrt(minDistancePx * minDistancePx - dx * dx);
        y = prevPlatform.y - (neededDy * 100 / svgHeight); // Convert px back to %
      }
    }
    
    currentY = y;
    PLATFORM_POSITIONS.push({ x, y, scale });
  }

  // Main states
  const [mainGameState, setMainGameState] = useState('setup');
  const [playerStrategy, setPlayerStrategy] = useState(null);
  const [platformCount, setPlatformCount] = useState(10);
  const [platforms, setPlatforms] = useState([]);
  const [scorecard, setScorecard] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [completedPlatforms, setCompletedPlatforms] = useState([]);
  const [personalLeaderboard, setPersonalLeaderboard] = useState([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [npcLeaderboard, setNpcLeaderboard] = useState({});
  const [showNPCEncounters, setShowNPCEncounters] = useState(false);
  const [strategyLeaderboardExpanded, setStrategyLeaderboardExpanded] = useState(false);
  const [personalLeaderboardExpanded, setPersonalLeaderboardExpanded] = useState(false);
  const [showEncounterDetail, setShowEncounterDetail] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState(null);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);

  // Modal game states
  const [showGameModal, setShowGameModal] = useState(false);
  const [currentPlatformIndex, setCurrentPlatformIndex] = useState(null);
  const [gameState, setGameState] = useState('playing');
  const [history, setHistory] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [lastRoundResult, setLastRoundResult] = useState(null);
  const [autoPlaying, setAutoPlaying] = useState(false);

  const maxRounds = 10;

  const startTrail = () => {
    // Generate platforms based on selected count
    const strategyKeys = Object.keys(strategies);
    const newPlatforms = Array.from({ length: platformCount }, (_, i) => {
      return strategyKeys[i % strategyKeys.length];
    });
    setPlatforms(newPlatforms);
    setScorecard([]);
    setTotalScore(0);
    setCompletedPlatforms([]);
    setMainGameState('trail');
  };

  const openPlatform = (platformIndex) => {
    const isCompleted = completedPlatforms.includes(platformIndex);
    
    // Don't allow opening if completed and auto-replay is disabled
    if (isCompleted && !autoReplayEnabled) return;
    
    setCurrentPlatformIndex(platformIndex);
    setHistory([]);
    setPlayerScore(0);
    setOpponentScore(0);
    setLastRoundResult(null);
    setGameState('playing');
    setShowGameModal(true);
    
    // If it's a completed platform and auto-replay is enabled, auto-play immediately
    if (isCompleted && autoReplayEnabled) {
      setTimeout(() => autoPlay(), 100);
    }
  };

  const playRound = (playerMove) => {
    const strategy = strategies[platforms[currentPlatformIndex]];
    const opponentMove = strategy.getMove(history);
    
    const key = playerMove + opponentMove;
    const payoff = PAYOFF_MATRIX[key];
    
    const newHistory = [...history, { player: playerMove, opponent: opponentMove }];
    setHistory(newHistory);
    setPlayerScore(playerScore + payoff.player);
    setOpponentScore(opponentScore + payoff.opponent);
    setLastRoundResult({ playerMove, opponentMove, ...payoff });

    if (newHistory.length >= maxRounds) {
      setGameState('platformComplete');
    }
  };

  const autoPlay = async () => {
    setAutoPlaying(true);
    let currentHistory = history;
    let currentPlayerScore = playerScore;
    let currentOpponentScore = opponentScore;

    for (let i = history.length; i < maxRounds; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const strategy = strategies[platforms[currentPlatformIndex]];
      const playerStrategyFunc = strategies[playerStrategy];
      
      const playerMove = playerStrategyFunc.getMove(currentHistory);
      const opponentMove = strategy.getMove(currentHistory);
      
      const key = playerMove + opponentMove;
      const payoff = PAYOFF_MATRIX[key];
      
      currentHistory = [...currentHistory, { player: playerMove, opponent: opponentMove }];
      currentPlayerScore += payoff.player;
      currentOpponentScore += payoff.opponent;
      
      setHistory(currentHistory);
      setPlayerScore(currentPlayerScore);
      setOpponentScore(currentOpponentScore);
      setLastRoundResult({ playerMove, opponentMove, ...payoff });
    }

    setGameState('platformComplete');
    setAutoPlaying(false);
  };

  const completePlatform = () => {
    // Determine outcome
    const outcome = playerScore > opponentScore ? 'win' : 
                    playerScore < opponentScore ? 'loss' : 'tie';
    
    const newScorecard = [...scorecard, {
      platform: currentPlatformIndex + 1,
      opponent: strategies[platforms[currentPlatformIndex]].name,
      score: playerScore,
      opponentScore: opponentScore,
      history: history,
      playerStrategy: strategies[playerStrategy].name,
      outcome: outcome
    }];
    setScorecard(newScorecard);
    setTotalScore(totalScore + playerScore);
    const newCompletedPlatforms = [...completedPlatforms, currentPlatformIndex];
    setCompletedPlatforms(newCompletedPlatforms);
    
    // Add user's encounter to global leaderboard
    const userStrategyName = strategies[playerStrategy].name;
    const opponentStrategyName = strategies[platforms[currentPlatformIndex]].name;
    
    const userEncounter = {
      isUserEncounter: true,
      player: userStrategyName,
      opponent: opponentStrategyName,
      playerScore: playerScore,
      opponentScore: opponentScore,
      winner: playerScore > opponentScore ? userStrategyName : opponentScore > playerScore ? opponentStrategyName : 'Tie',
      timestamp: new Date().toLocaleTimeString(),
      history: history
    };
    
    // Calculate current encounter counts for each NPC
    const npcEncounterCounts = {};
    Object.keys(strategies).forEach(key => {
      npcEncounterCounts[strategies[key].name] = 0;
    });
    
    // Count encounters from NPC vs NPC battles
    globalLeaderboard.forEach(encounter => {
      npcEncounterCounts[encounter.npc1]++;
      npcEncounterCounts[encounter.npc2]++;
    });
    
    // Count user encounters for the strategies the user has played against
    scorecard.forEach(entry => {
      npcEncounterCounts[entry.opponent]++;
    });
    
    // Count the current opponent from this game
    npcEncounterCounts[opponentStrategyName]++;
    
    // Count user's own strategy encounters
    npcEncounterCounts[userStrategyName] = Math.max(npcEncounterCounts[userStrategyName], newCompletedPlatforms.length);
    
    // Generate NPC encounters - exactly one per NPC that needs to catch up
    const targetEncounters = newCompletedPlatforms.length;
    const newGlobalEntries = [];
    const updatedNpcLeaderboard = { ...npcLeaderboard };
    
    // Add user's scores to the leaderboard
    updatedNpcLeaderboard[userStrategyName] = (updatedNpcLeaderboard[userStrategyName] || 0) + playerScore;
    updatedNpcLeaderboard[opponentStrategyName] = (updatedNpcLeaderboard[opponentStrategyName] || 0) + opponentScore;
    
    const usedPairs = new Set(); // Track which pairs we've already used this round
    
    // Get list of NPCs that need more encounters
    const strategyNames = Object.values(strategies).map(s => s.name);
    let npcsThatNeedEncounters = strategyNames.filter(name => npcEncounterCounts[name] < targetEncounters);
    
    // Generate one encounter per NPC that needs it (pairing them optimally)
    while (npcsThatNeedEncounters.length > 0) {
      // Pick first NPC that needs encounters
      const npc1Name = npcsThatNeedEncounters[0];
      
      // Pick second NPC - prefer another that needs encounters, but must not have paired this round
      let npc2Name;
      let attempts = 0;
      let found = false;
      
      // Try to find a suitable second NPC
      while (attempts < 50 && !found) {
        if (npcsThatNeedEncounters.length > 1) {
          // Try pairing with another NPC that needs encounters
          const candidates = npcsThatNeedEncounters.filter(name => name !== npc1Name);
          npc2Name = candidates[Math.floor(Math.random() * candidates.length)];
        } else {
          // Only one NPC needs encounters, pair with any other
          const otherNpcs = strategyNames.filter(name => name !== npc1Name);
          npc2Name = otherNpcs[Math.floor(Math.random() * otherNpcs.length)];
        }
        
        // Check if this pair hasn't been used yet this round
        const pairKey = [npc1Name, npc2Name].sort().join('|');
        if (!usedPairs.has(pairKey)) {
          usedPairs.add(pairKey);
          found = true;
        }
        
        attempts++;
      }
      
      if (!found) {
        // Fallback if we can't find a unique pair
        break;
      }
      
      // Find the strategy keys
      const npc1Key = Object.keys(strategies).find(key => strategies[key].name === npc1Name);
      const npc2Key = Object.keys(strategies).find(key => strategies[key].name === npc2Name);
      
      const npc1Strategy = strategies[npc1Key];
      const npc2Strategy = strategies[npc2Key];
      
      // Simulate the encounter
      let npc1Score = 0;
      let npc2Score = 0;
      let history = [];
      
      for (let i = 0; i < maxRounds; i++) {
        const npc1Move = npc1Strategy.getMove(history.map(h => ({ player: h.npc1, opponent: h.npc2 })));
        const npc2Move = npc2Strategy.getMove(history.map(h => ({ player: h.npc2, opponent: h.npc1 })));
        
        const key = npc1Move + npc2Move;
        const payoff = PAYOFF_MATRIX[key];
        
        npc1Score += payoff.player;
        npc2Score += payoff.opponent;
        history.push({ npc1: npc1Move, npc2: npc2Move });
      }
      
      // Record the encounter
      newGlobalEntries.push({
        npc1: npc1Name,
        npc2: npc2Name,
        npc1Score,
        npc2Score,
        winner: npc1Score > npc2Score ? npc1Name : npc2Score > npc1Score ? npc2Name : 'Tie',
        timestamp: new Date().toLocaleTimeString(),
        history: history
      });
      
      // Update leaderboard
      updatedNpcLeaderboard[npc1Name] = (updatedNpcLeaderboard[npc1Name] || 0) + npc1Score;
      updatedNpcLeaderboard[npc2Name] = (updatedNpcLeaderboard[npc2Name] || 0) + npc2Score;
      
      // Update encounter counts
      npcEncounterCounts[npc1Name]++;
      npcEncounterCounts[npc2Name]++;
      
      // Recalculate NPCs that still need encounters
      npcsThatNeedEncounters = strategyNames.filter(name => npcEncounterCounts[name] < targetEncounters);
    }
    
    setNpcLeaderboard(updatedNpcLeaderboard);
    setGlobalLeaderboard([...globalLeaderboard, userEncounter, ...newGlobalEntries]);
    
    if (newCompletedPlatforms.length === platforms.length) {
      const newLeaderboardEntry = {
        rank: personalLeaderboard.length + 1,
        score: totalScore + playerScore,
        strategy: strategies[playerStrategy].name,
        platformsCompleted: platforms.length,
        timestamp: new Date().toLocaleTimeString()
      };
      setPersonalLeaderboard([...personalLeaderboard, newLeaderboardEntry].sort((a, b) => b.score - a.score));
      setMainGameState('complete');
    }
  };

  const resetGame = () => {
    setMainGameState('setup');
    setPlayerStrategy(null);
    setPlatforms([]);
    setScorecard([]);
    setTotalScore(0);
    setCompletedPlatforms([]);
    setShowGameModal(false);
  };

  const moveEmoji = (move) => move === 'C' ? '🤝' : '⚔️';

  const viewEncounterDetail = (encounter) => {
    setSelectedEncounter(encounter);
    setShowEncounterDetail(true);
  };

  const viewGlobalEncounter = (encounter) => {
    // Transform global encounter to match the expected format
    const transformed = {
      platform: encounter.isUserEncounter ? 'User Encounter' : 'NPC Encounter',
      playerStrategy: encounter.isUserEncounter ? encounter.player : encounter.npc1,
      opponent: encounter.isUserEncounter ? encounter.opponent : encounter.npc2,
      score: encounter.isUserEncounter ? encounter.playerScore : encounter.npc1Score,
      opponentScore: encounter.isUserEncounter ? encounter.opponentScore : encounter.npc2Score,
      history: encounter.history || [],
      timestamp: encounter.timestamp
    };
    setSelectedEncounter(transformed);
    setShowEncounterDetail(true);
  };

  const simulateNPCEncounter = () => {
    const strategyKeys = Object.keys(strategies);
    const npc1Key = strategyKeys[Math.floor(Math.random() * strategyKeys.length)];
    let npc2Key = strategyKeys[Math.floor(Math.random() * strategyKeys.length)];
    
    // Ensure different NPCs
    while (npc2Key === npc1Key) {
      npc2Key = strategyKeys[Math.floor(Math.random() * strategyKeys.length)];
    }

    const npc1Strategy = strategies[npc1Key];
    const npc2Strategy = strategies[npc2Key];
    
    let npc1Score = 0;
    let npc2Score = 0;
    let history = [];

    // Play 10 rounds
    for (let i = 0; i < maxRounds; i++) {
      const npc1Move = npc1Strategy.getMove(history.map(h => ({ player: h.npc1, opponent: h.npc2 })));
      const npc2Move = npc2Strategy.getMove(history.map(h => ({ player: h.npc2, opponent: h.npc1 })));
      
      const key = npc1Move + npc2Move;
      const payoff = PAYOFF_MATRIX[key];
      
      npc1Score += payoff.player;
      npc2Score += payoff.opponent;
      history.push({ npc1: npc1Move, npc2: npc2Move });
    }

    return {
      npc1: npc1Strategy.name,
      npc2: npc2Strategy.name,
      npc1Score,
      npc2Score,
      winner: npc1Score > npc2Score ? npc1Strategy.name : npc2Score > npc1Score ? npc2Strategy.name : 'Tie'
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 p-8 relative">
      {/* Personal Leaderboard - Top Left */}
      {(mainGameState === 'trail' || mainGameState === 'complete') && (
        <div className="fixed top-4 left-4 z-40">
          <div 
            className={`bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 rounded-lg border border-white/20 transition-all cursor-pointer ${
              personalLeaderboardExpanded ? 'w-80' : 'w-20'
            }`}
            onClick={() => setPersonalLeaderboardExpanded(!personalLeaderboardExpanded)}
          >
            <div className="p-4">
              {personalLeaderboardExpanded ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">👤 Personal LB</h2>
                    <button className="text-emerald-200 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <style dangerouslySetInnerHTML={{__html: `
                    .personal-scroll::-webkit-scrollbar {
                      width: 8px;
                    }
                    .personal-scroll::-webkit-scrollbar-track {
                      background: rgba(16, 185, 129, 0.1);
                      border-radius: 4px;
                    }
                    .personal-scroll::-webkit-scrollbar-thumb {
                      background: #10b981;
                      border-radius: 4px;
                    }
                    .personal-scroll::-webkit-scrollbar-thumb:hover {
                      background: #059669;
                    }
                  `}} />
                  
                  <div 
                    className="personal-scroll max-h-80 overflow-y-auto space-y-2 pr-2" 
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#10b981 rgba(16, 185, 129, 0.1)'
                    }}
                  >
                    {personalLeaderboard.length === 0 ? (
                      <p className="text-emerald-200 text-center py-4 text-sm">Complete all platforms to record your score!</p>
                    ) : (
                      personalLeaderboard.map((entry, idx) => (
                        <div key={idx} className="bg-white/10 rounded p-2 border border-white/10 hover:border-emerald-400 transition-all">
                          <div className="flex justify-between items-start text-sm">
                            <div className="flex items-center gap-2">
                              <div className="text-lg text-yellow-400 w-6 text-center">
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{entry.strategy}</div>
                                <div className="text-xs text-emerald-200">{entry.timestamp}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-yellow-400">{entry.score}</div>
                              <div className="text-xs text-emerald-200">{entry.platformsCompleted}p</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-2xl mb-1">👤</div>
                  <div className="text-xs text-emerald-200 font-semibold">LB</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Strategy Leaderboard - Top Right */}
      {(mainGameState === 'trail' || mainGameState === 'complete') && (
        <div className="fixed top-4 right-4 z-40">
          <div 
            className={`bg-gradient-to-br from-slate-900 via-yellow-900 to-amber-900 rounded-lg border border-white/20 transition-all cursor-pointer ${
              strategyLeaderboardExpanded ? 'w-80' : 'w-20'
            }`}
            onClick={() => setStrategyLeaderboardExpanded(!strategyLeaderboardExpanded)}
          >
            <div className="p-4">
              {strategyLeaderboardExpanded ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">📊 Strategy LB</h2>
                    <button className="text-yellow-200 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <style dangerouslySetInnerHTML={{__html: `
                    .strategy-scroll::-webkit-scrollbar {
                      width: 8px;
                    }
                    .strategy-scroll::-webkit-scrollbar-track {
                      background: rgba(251, 191, 36, 0.1);
                      border-radius: 4px;
                    }
                    .strategy-scroll::-webkit-scrollbar-thumb {
                      background: #fbbf24;
                      border-radius: 4px;
                    }
                    .strategy-scroll::-webkit-scrollbar-thumb:hover {
                      background: #f59e0b;
                    }
                  `}} />
                  
                  <div 
                    className="strategy-scroll max-h-80 overflow-y-auto space-y-2 pr-2" 
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#fbbf24 rgba(251, 191, 36, 0.1)'
                    }}
                  >
                    {Object.keys(npcLeaderboard).length === 0 ? (
                      <p className="text-yellow-200 text-center py-4 text-sm">Play to see scores!</p>
                    ) : (
                      Object.entries(npcLeaderboard)
                        .sort((a, b) => b[1] - a[1])
                        .map(([strategyName, score], idx) => {
                          const isUserStrategy = playerStrategy && strategies[playerStrategy].name === strategyName;
                          return (
                            <div key={strategyName} className="bg-white/10 rounded p-2 border border-white/10 hover:border-yellow-400 transition-all">
                              <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="text-lg text-yellow-400 w-6 text-center">
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                                  </div>
                                  <div className="font-semibold text-white">
                                    {strategyName.length > 12 ? strategyName.substring(0, 12) + '...' : strategyName} {isUserStrategy && '👤'}
                                  </div>
                                </div>
                                <div className="text-lg font-bold text-yellow-400">{score}</div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-2xl mb-1">📊</div>
                  <div className="text-xs text-yellow-200 font-semibold">LB</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🥾 Game Theory Trail</h1>
          <p className="text-emerald-200">Navigate the trail and master game theory strategies</p>
        </div>

        {mainGameState === 'setup' && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Welcome to the Trail</h2>
            <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/20">
              <p className="text-emerald-200 mb-3">Hike through platforms, each with a different opponent strategy. Choose one strategy and see how far it takes you!</p>
              <p className="text-emerald-200 text-sm flex items-center flex-wrap gap-1">
                Trail has{' '}
                <select 
                  value={platformCount}
                  onChange={(e) => setPlatformCount(Number(e.target.value))}
                  className="bg-white/5 text-white font-bold px-3 py-1 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all cursor-pointer mx-1"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                </select>
                {' '}platforms, each platform has 10 rounds of prisoner's dilemma
              </p>
            </div>

            <div className="mb-6">
              <label className="text-white block font-bold mb-4">Select Your Strategy:</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(strategies).map(([key, strategy]) => (
                  <button
                    key={key}
                    onClick={() => setPlayerStrategy(key)}
                    className={`p-3 rounded-lg border-2 transition-all text-left text-sm ${
                      playerStrategy === key
                        ? 'bg-emerald-500/30 border-emerald-400'
                        : 'bg-white/5 border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="font-bold text-white">{strategy.icon} {strategy.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startTrail}
              disabled={!playerStrategy}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
            >
              Start Hiking 🔥️
            </button>
          </div>
        )}

        {mainGameState === 'trail' && (
          <div>
            <div className="mb-8 flex justify-center gap-3 flex-wrap">
              <div className="inline-block bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <div className="text-sm text-emerald-200 mb-1">Trail Score</div>
                <div className="text-4xl font-bold text-yellow-400">{totalScore}</div>
                <div className="text-xs text-emerald-200 mt-2">{completedPlatforms.length}/{platforms.length} platforms</div>
              </div>
              <button
                onClick={() => setShowNPCEncounters(true)}
                className="bg-white/10 backdrop-blur-md rounded-lg px-5 py-6 border border-white/20 hover:border-purple-400 hover:bg-purple-500/10 transition-all text-white font-bold text-center text-sm"
              >
                ⚔️ All<br/>Encounters
              </button>
              <button
                onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                className={`backdrop-blur-md rounded-lg px-5 py-6 border-2 transition-all text-white font-bold text-center text-sm ${
                  autoPlayEnabled 
                    ? 'bg-emerald-500/30 border-emerald-400' 
                    : 'bg-white/10 border-white/20 hover:border-white/40'
                }`}
              >
                ⚡ Auto<br/>Play
              </button>
            </div>

            {/* Trail SVG */}
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-8 border border-white/20 mb-8 overflow-hidden">
              <svg viewBox="0 0 1000 600" className="w-full h-auto">
                {/* Background gradient for field effect */}
                <defs>
                  <linearGradient id="fieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgba(34, 197, 94, 0.1)', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: 'rgba(34, 197, 94, 0.3)', stopOpacity: 0.6 }} />
                  </linearGradient>
                  <linearGradient id="trailGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgba(34, 197, 94, 0.2)', stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: 'rgba(34, 197, 94, 0.4)', stopOpacity: 0.8 }} />
                  </linearGradient>
                </defs>
                
                {/* Field background */}
                <rect width="1000" height="600" fill="url(#fieldGradient)" />
                
                {/* Trail path - S-curve from bottom to top with more pronounced curves */}
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
                  const pos = PLATFORM_POSITIONS[idx];
                  const x = (pos.x / 100) * 1000;
                  const y = (pos.y / 100) * 600;
                  const scale = pos.scale || 1;
                  const baseRadius = 28 * scale;
                  const glowRadius = 35 * scale;
                  const isCompleted = completedPlatforms.includes(idx);
                  const opacity = 0.6 + (scale * 0.4);
                  
                  // Get outcome for this platform
                  const platformResult = scorecard.find(s => s.platform === idx + 1);
                  const outcome = platformResult?.outcome;
                  
                  // Determine colors based on outcome
                  let fillColor, strokeColor;
                  if (isCompleted) {
                    if (outcome === 'win') {
                      fillColor = 'rgba(34, 197, 94, 0.7)'; // Green
                      strokeColor = '#22c55e';
                    } else if (outcome === 'loss') {
                      fillColor = 'rgba(147, 51, 234, 0.4)'; // Purple (more transparent)
                      strokeColor = '#9333ea';
                    } else { // tie
                      fillColor = 'rgba(250, 250, 250, 0.4)'; // Warm white/pale (more transparent)
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
                        <circle cx={x} cy={y} r={glowRadius} fill="rgba(34, 197, 94, 0.3)" />
                      )}
                      
                      {/* Platform circle */}
                      <circle
                        cx={x}
                        cy={y}
                        r={baseRadius}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={3 * scale}
                        style={{ cursor: isCompleted ? 'default' : 'pointer' }}
                        onClick={() => openPlatform(idx)}
                      />
                      
                      {/* Platform icon */}
                      <text 
                        x={x} 
                        y={y} 
                        textAnchor="middle" 
                        dominantBaseline="central" 
                        style={{ fontSize: `${24 * scale}px` }}
                        className="select-none"
                      >
                        {strategies[platformKey].icon}
                      </text>
                      
                      {/* Platform number */}
                      <text 
                        x={x} 
                        y={y + (45 * scale)} 
                        textAnchor="middle" 
                        style={{ fontSize: `${12 * scale}px` }}
                        className="fill-white font-bold select-none"
                      >
                        {idx + 1}
                      </text>
                      
                      {/* Completion checkmark */}
                      {isCompleted && (
                        <text 
                          x={x + (20 * scale)} 
                          y={y - (20 * scale)} 
                          style={{ fontSize: `${20 * scale}px` }}
                          className={`select-none ${outcome === 'win' ? 'fill-green-600' : outcome === 'loss' ? 'fill-purple-600' : 'fill-gray-400'}`}
                        >
                          ✓
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Scorecard */}
            {scorecard.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 max-w-3xl mx-auto">
                <h3 className="text-white font-bold mb-4">📊 Trail Progress</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {scorecard.map((entry, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white/5 rounded p-3 border border-white/10 hover:border-emerald-400 hover:bg-white/10 transition-all cursor-pointer"
                      onClick={() => viewEncounterDetail(entry)}
                    >
                      <div className="text-xs text-emerald-200">Platform {entry.platform}</div>
                      <div className="text-sm font-semibold text-white">{entry.opponent}</div>
                      <div className="text-lg font-bold text-yellow-400">{entry.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {mainGameState === 'complete' && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">🏆 Trail Complete!</h2>
              <div className="text-6xl font-bold text-yellow-400 mb-2">{totalScore}</div>
              <p className="text-emerald-200 text-lg">Total Points Earned</p>
            </div>

            <div className="bg-white/5 rounded-lg p-6 mb-8 border border-white/20">
              <h3 className="text-white font-bold text-lg mb-4">Final Results</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                {scorecard.map((entry, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white/5 rounded p-2 text-center hover:bg-white/10 hover:border hover:border-emerald-400 transition-all cursor-pointer"
                    onClick={() => viewEncounterDetail(entry)}
                  >
                    <div className="text-xs text-emerald-200">{entry.opponent}</div>
                    <div className="font-bold text-yellow-400">{entry.score} pts</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              Start New Trail
            </button>

            <button
              onClick={() => setShowNPCEncounters(true)}
              className="w-full mt-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold py-3 rounded-lg transition-all text-sm"
            >
              ⚔️ View All Encounters
            </button>
          </div>
        )}

        {/* All Encounters Modal */}
        {showNPCEncounters && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 rounded-lg border border-white/20 max-w-lg w-full max-h-96 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/20">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">⚔️ All Encounters</h2>
                  <button
                    onClick={() => setShowNPCEncounters(false)}
                    className="text-purple-200 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {globalLeaderboard.length === 0 ? (
                  <p className="text-purple-200 text-center py-8">Play encounters to see battle history!</p>
                ) : (
                  <div className="space-y-3">
                    {[...globalLeaderboard].reverse().map((entry, idx) => (
                      <div 
                        key={idx} 
                        className={`rounded-lg p-4 border transition-all cursor-pointer ${
                          entry.isUserEncounter 
                            ? 'bg-green-500/20 border-green-400 hover:border-green-300' 
                            : 'bg-white/10 border-white/20 hover:border-purple-400'
                        }`}
                        onClick={() => viewGlobalEncounter(entry)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm text-purple-200">{entry.timestamp} {entry.isUserEncounter && '👤 USER'}</div>
                          <div className="text-sm font-semibold text-yellow-400">
                            {entry.winner === 'Tie' ? '🤝 ' : '🥇 '}{entry.winner}
                          </div>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex-1 bg-white/5 rounded p-2">
                            <div className="text-xs text-purple-200">{entry.isUserEncounter ? entry.player : entry.npc1}</div>
                            <div className="text-lg font-bold text-yellow-400">{entry.isUserEncounter ? entry.playerScore : entry.npc1Score}</div>
                          </div>
                          <div className="text-white font-bold">vs</div>
                          <div className="flex-1 bg-white/5 rounded p-2 text-right">
                            <div className="text-xs text-purple-200">{entry.isUserEncounter ? entry.opponent : entry.npc2}</div>
                            <div className="text-lg font-bold text-blue-400">{entry.isUserEncounter ? entry.opponentScore : entry.npc2Score}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Encounter Detail Modal */}
        {showEncounterDetail && selectedEncounter && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 rounded-lg border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/20">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Platform {selectedEncounter.platform}</h2>
                    <p className="text-emerald-200">{selectedEncounter.playerStrategy} vs {selectedEncounter.opponent}</p>
                  </div>
                  <button
                    onClick={() => setShowEncounterDetail(false)}
                    className="text-emerald-200 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div className="text-center">
                    <div className="text-sm font-bold text-white mb-1">Your Score</div>
                    <div className="text-4xl font-bold text-yellow-400">{selectedEncounter.score}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-white mb-1">Opponent Score</div>
                    <div className="text-4xl font-bold text-blue-400">{selectedEncounter.opponentScore}</div>
                  </div>
                </div>

                <div className="text-2xl font-bold text-white mb-4 text-center">
                  {selectedEncounter.score > selectedEncounter.opponentScore
                    ? "🎉 You Won!"
                    : selectedEncounter.score === selectedEncounter.opponentScore
                    ? "🤝 Tie!"
                    : "😢 You Lost"}
                </div>

                <div className="space-y-2">
                  <h3 className="text-white font-bold mb-3">Round by Round:</h3>
                  {selectedEncounter.history.map((round, idx) => {
                    // Handle both user encounters (player/opponent) and NPC encounters (npc1/npc2)
                    const playerMove = round.player || round.npc1;
                    const opponentMove = round.opponent || round.npc2;
                    const key = playerMove + opponentMove;
                    const payoff = PAYOFF_MATRIX[key];
                    return (
                      <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/20">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-emerald-200">Round {idx + 1}</div>
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <div className="text-2xl">{moveEmoji(playerMove)}</div>
                              <div className="text-xs text-yellow-400 font-bold">+{payoff.player}</div>
                            </div>
                            <div className="text-white font-bold">vs</div>
                            <div className="text-center">
                              <div className="text-2xl">{moveEmoji(opponentMove)}</div>
                              <div className="text-xs text-blue-400 font-bold">+{payoff.opponent}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Modal */}
        {showGameModal && currentPlatformIndex !== null && !autoPlayEnabled && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 rounded-lg border border-white/20 max-w-lg w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Platform {currentPlatformIndex + 1}</h2>
                    <p className="text-emerald-200">vs {strategies[platforms[currentPlatformIndex]].name} {strategies[platforms[currentPlatformIndex]].icon}</p>
                  </div>
                  <button
                    onClick={() => setShowGameModal(false)}
                    className="text-emerald-200 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                {gameState === 'playing' && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <div className="text-center">
                        <div className="text-sm text-emerald-200">You</div>
                        <div className="text-3xl font-bold text-yellow-400">{playerScore}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-emerald-200">Opponent</div>
                        <div className="text-3xl font-bold text-blue-400">{opponentScore}</div>
                      </div>
                    </div>

                    <div className="mb-4 text-center text-white">
                      <p>Round {history.length + 1} of {maxRounds}</p>
                      <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${(history.length / maxRounds) * 100}%` }}
                        />
                      </div>
                    </div>

                    {lastRoundResult && (
                      <div className="bg-white/5 rounded-lg p-3 mb-4 border border-white/20">
                        <p className="text-white text-center">
                          <span className="text-2xl">{moveEmoji(lastRoundResult.playerMove)}</span>
                          <span className="text-white mx-2">vs</span>
                          <span className="text-2xl">{moveEmoji(lastRoundResult.opponentMove)}</span>
                        </p>
                        <p className="text-emerald-200 text-center text-xs mt-1">
                          +{lastRoundResult.player} vs +{lastRoundResult.opponent}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button
                        onClick={() => playRound('C')}
                        disabled={autoPlaying}
                        className="bg-green-500/30 hover:bg-green-500/50 border-2 border-green-400 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                      >
                        🤝
                      </button>
                      <button
                        onClick={() => playRound('D')}
                        disabled={autoPlaying}
                        className="bg-red-500/30 hover:bg-red-500/50 border-2 border-red-400 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                      >
                        ⚔️
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShowGameModal(false)}
                        disabled={autoPlaying}
                        className="bg-gray-500/30 hover:bg-gray-500/50 border border-gray-400 text-white font-semibold py-2 rounded text-sm transition-all disabled:opacity-50"
                      >
                        Exit
                      </button>
                      <button
                        onClick={autoPlay}
                        disabled={autoPlaying}
                        className="bg-purple-500/30 hover:bg-purple-500/50 border border-purple-400 text-white font-semibold py-2 rounded text-sm transition-all disabled:opacity-50"
                      >
                        ⚡ Auto
                      </button>
                    </div>
                  </>
                )}

                {gameState === 'platformComplete' && (
                  <div className="text-center">
                    <div className="grid grid-cols-2 gap-8 mb-6">
                      <div>
                        <div className="text-sm font-bold text-white mb-1">Your Score</div>
                        <div className="text-4xl font-bold text-yellow-400">{playerScore}</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white mb-1">Opponent</div>
                        <div className="text-4xl font-bold text-blue-400">{opponentScore}</div>
                      </div>
                    </div>

                    <div className="text-2xl font-bold text-white mb-6">
                      {playerScore > opponentScore
                        ? "🎉 You Won!"
                        : playerScore === opponentScore
                        ? "🤝 Tie!"
                        : "😢 You Lost"}
                    </div>

                    <button
                      onClick={completePlatform}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition-all"
                    >
                      Continue Trail →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white/5 rounded-lg p-6 border border-white/20 max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <Info className="text-emerald-400 mt-1 flex-shrink-0" size={20} />
            <div>
              <h3 className="text-white font-bold mb-2">Payoff Matrix</h3>
              <div className="text-emerald-200 text-sm space-y-1">
                <p>🤝🤝 Both Cooperate: 3 points each</p>
                <p>🤝⚔️ You Cooperate, Opponent Defects: 0 points (they get 5)</p>
                <p>⚔️🤝 You Defect, Opponent Cooperates: 5 points (they get 0)</p>
                <p>⚔️⚔️ Both Defect: 1 point each</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameTheoryGame;