import { useState, useEffect, useCallback, useRef, RefObject } from "react"; // Import RefObject
import { STORAGE_KEY } from "@/constants/game-config";
import type {
  GameStats,
  BestScores,
  GameHistory,
  Achievement,
  // Difficulty type is no longer needed here if initialDifficulty is removed
  GameState,
} from "@/types/memory-game";

// Remove initialDifficulty if it's not used
// interface UseGameStateProps {
//   initialDifficulty?: Difficulty;
// }

interface GameStateData {
  score: number;
  moves: number;
  time: number;
  matches: number;
  isGameActive: boolean;
  bestScores: BestScores;
  gameStats: GameStats;
  unlockedAchievements: Achievement[];
  gameHistory: GameHistory[];
  // Use RefObject as suggested by the deprecation warning
  gameStateRef: RefObject<GameState | null>;
  // Use RefObject as suggested by the deprecation warning
  lastActionTimeRef: RefObject<number>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setMoves: React.Dispatch<React.SetStateAction<number>>;
  setTime: React.Dispatch<React.SetStateAction<number>>;
  setMatches: React.Dispatch<React.SetStateAction<number>>;
  setIsGameActive: React.Dispatch<React.SetStateAction<boolean>>;
  setBestScores: React.Dispatch<React.SetStateAction<BestScores>>;
  setGameStats: React.Dispatch<React.SetStateAction<GameStats>>;
  setUnlockedAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
  setGameHistory: React.Dispatch<React.SetStateAction<GameHistory[]>>;
  saveGameState: (state: Partial<GameState>) => void;
  saveProgress: (data: {
    bestScores: BestScores;
    gameStats: GameStats;
    gameHistory: GameHistory[];
  }) => void;
}

/**
 * Custom hook to manage game state
 *
 * @returns Game state and action methods
 */
// Remove unused initialDifficulty parameter and UseGameStateProps if empty
export function useGameState(): GameStateData {
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [bestScores, setBestScores] = useState<BestScores>({
    easy: { moves: Number.POSITIVE_INFINITY, time: Number.POSITIVE_INFINITY },
    medium: { moves: Number.POSITIVE_INFINITY, time: Number.POSITIVE_INFINITY },
    hard: { moves: Number.POSITIVE_INFINITY, time: Number.POSITIVE_INFINITY },
  });
  const [gameStats, setGameStats] = useState<GameStats>({
    gamesPlayed: 0,
    totalMoves: 0,
    totalTime: 0,
    matchesFound: 0,
    hintsUsed: 0,
    perfectGames: 0,
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState<
    Achievement[]
  >([]);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  // useRef still returns a mutable ref object, but the interface uses RefObject
  const gameStateRef = useRef<GameState | null>(null);
  const lastActionTimeRef = useRef<number>(Date.now());

  // Load game data from local storage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const {
          bestScores: savedBestScores,
          gameStats: savedGameStats,
          gameHistory: savedGameHistory,
          unlockedAchievements: savedAchievements,
        } = JSON.parse(savedData);

        // Ensure loaded data is valid before setting state
        if (savedBestScores) setBestScores(savedBestScores);
        if (savedGameStats) setGameStats(savedGameStats);
        if (savedGameHistory) setGameHistory(savedGameHistory || []); // Default to empty array if null/undefined
        if (savedAchievements) setUnlockedAchievements(savedAchievements || []); // Default to empty array
      }
    } catch (error) {
      console.error("Error loading game data:", error);
      // Optionally clear storage if data is corrupted
      // localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save current game state to ref
  const saveGameState = useCallback(
    (state: Partial<GameState>) => {
      // Only save if the game is active to prevent saving initial/reset state unintentionally
      if (isGameActive) {
        // Update the ref with the current state merged with the new partial state
        gameStateRef.current = {
          ...(gameStateRef.current || {
            // Provide a default empty object if current is null
            // Initialize with current state values if needed, though they aren't directly stored here
            score,
            moves,
            time,
            matches,
            // other relevant fields from GameState if necessary
          }),
          ...state, // Apply the partial update
        } as GameState; // Assert type if necessary, ensure all required GameState fields are present
      }
    },
    [isGameActive, score, moves, time, matches] // Include state values used in the potential default object
  );

  // Save game progress to local storage
  const saveProgress = useCallback(
    (data: {
      bestScores: BestScores;
      gameStats: GameStats;
      gameHistory: GameHistory[];
    }) => {
      try {
        // Structure the data to be saved
        const dataToSave = {
          bestScores: data.bestScores,
          gameStats: data.gameStats,
          gameHistory: data.gameHistory,
          unlockedAchievements, // Include current achievements
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Error saving game data:", error);
        // Handle potential storage errors (e.g., quota exceeded)
      }
    },
    [unlockedAchievements] // Dependency array includes state used directly in the function body
  );

  return {
    score,
    moves,
    time,
    matches,
    isGameActive,
    bestScores,
    gameStats,
    unlockedAchievements,
    gameHistory,
    // Return the refs - their types match the interface now
    gameStateRef,
    lastActionTimeRef,
    setScore,
    setMoves,
    setTime,
    setMatches,
    setIsGameActive,
    setBestScores,
    setGameStats,
    setUnlockedAchievements,
    setGameHistory,
    saveGameState,
    saveProgress,
  };
}
