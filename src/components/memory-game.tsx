"use client";

import { useState, useEffect, useCallback, JSX } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  DIFFICULTIES,
  ACHIEVEMENTS,
  POINTS_PER_MATCH,
  POINTS_PER_SECOND_SAVED,
  POINTS_PER_MOVE_SAVED,
  HINT_PENALTY,
} from "@/constants/game-config";
import type { Difficulty, GameHistory } from "@/types/memory-game";

// Import custom hooks
import { useGameState } from "@/hooks/use-game-state";
import { useMemoryCards } from "@/hooks/use-memory-cards";
import { useGameTimer } from "@/hooks/use-game-timer";
import { useAchievements } from "@/hooks/use-achievements";

// Import decomposed UI components
import { MemoryCard } from "@/components/memory-card";
import { GameStatsDisplay, BestScoreDisplay } from "@/components/game-stats";
import { AchievementsList } from "@/components/achievements-list";
import { GameHistoryTable } from "@/components/game-history";

/**
 * Main Memory Game component
 * Integrates all game logic and UI components
 */
export default function MemoryGame(): JSX.Element {
  // Game difficulty state
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  // Loading state
  const [isResetting, setIsResetting] = useState(false);

  // Use custom hook to manage game state
  const {
    score,
    moves,
    time,
    matches,
    isGameActive,
    bestScores,
    gameStats,
    unlockedAchievements,
    gameHistory,
    lastActionTimeRef,
    setScore,
    setMoves,
    setMatches,
    setTime,
    setIsGameActive,
    setBestScores,
    setGameStats,
    setGameHistory,
    saveGameState,
    saveProgress,
  } = useGameState();

  // Use achievement system hook
  const { checkAchievements } = useAchievements({
    initialAchievements: unlockedAchievements,
    onUnlock: (achievement) => {
      setScore((prevScore) => prevScore + achievement.points);
    },
  });

  // Callback for successful match
  const handleMatchSuccess = useCallback(() => {
    setMatches((prevMatches) => {
      const newMatches = prevMatches + 1;
      setScore((prevScore) => prevScore + POINTS_PER_MATCH);

      // Save game state
      saveGameState({
        matches: newMatches,
        score: score + POINTS_PER_MATCH,
      });

      return newMatches;
    });
  }, [score, setMatches, setScore, saveGameState]);

  // Use card management hook
  const { cards, flippedIndexes, resetCards, handleCardClick, handleHint } =
    useMemoryCards({
      difficulty,
      onMatch: handleMatchSuccess,
      lastActionTimeRef,
      saveGameState,
    });

  // Use game timer hook
  useGameTimer({
    isGameActive,
    setTime,
    onTick: () => {
      saveGameState({ time: time + 1 });
    },
  });

  // Reset the game
  const resetGame = useCallback(() => {
    // 显示重置动画而不是加载状态
    setIsResetting(true);
    
    // 短暂延迟后重置游戏状态
    setTimeout(() => {
      resetCards();
      setMatches(0);
      setMoves(0);
      setTime(0);
      setIsGameActive(true);
      setScore(0);
      
      // 重置动画结束
      setIsResetting(false);
    }, 600);
  }, [resetCards, setMatches, setMoves, setTime, setIsGameActive, setScore]);

  // Reset game when difficulty changes
  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);

  // Check if the game has ended
  useEffect(() => {
    if (matches === cards.length / 2 && matches > 0) {
      endGame();
    }
  }, [matches, cards.length]); // Added endGame to dependency array

  // Handle game end
  const endGame = useCallback(() => {
    setIsGameActive(false);

    const currentScore = { moves, time };
    let newBestScores = { ...bestScores };

    // Check if it's a new best score
    if (
      currentScore.moves < bestScores[difficulty].moves ||
      (currentScore.moves === bestScores[difficulty].moves &&
        currentScore.time < bestScores[difficulty].time)
    ) {
      newBestScores = { ...newBestScores, [difficulty]: currentScore };
      setBestScores(newBestScores);

      // Calculate bonus points
      const movesSaved = bestScores[difficulty].moves - moves;
      const timeSaved = bestScores[difficulty].time - time;

      setScore(
        (prevScore) =>
          prevScore +
          Math.max(0, movesSaved * POINTS_PER_MOVE_SAVED) +
          Math.max(0, timeSaved * POINTS_PER_SECOND_SAVED)
      );

      toast("🏆 New Best Score!", {
        description: `Moves: ${moves}, Time: ${time}s`,
        className: "bg-yellow-900 text-yellow-100 border-yellow-700",
      });
    }

    // Update game statistics
    const newGameStats = {
      gamesPlayed: gameStats.gamesPlayed + 1,
      totalMoves: gameStats.totalMoves + moves,
      totalTime: gameStats.totalTime + time,
      matchesFound: gameStats.matchesFound + matches,
      hintsUsed: gameStats.hintsUsed, // This should be updated when hint is used
      perfectGames:
        gameStats.hintsUsed === 0 // This logic might need adjustment based on when hintsUsed is updated
          ? gameStats.perfectGames + 1
          : gameStats.perfectGames,
    };
    setGameStats(newGameStats);

    // Update game history
    const newGameHistory: GameHistory = {
      date: new Date().toISOString(),
      difficulty,
      moves,
      time,
      score, // Use the final score after potential bonus points
    };

    // Keep only the last 10 game history entries
    const updatedGameHistory = [...gameHistory, newGameHistory].slice(-10);
    setGameHistory(updatedGameHistory);

    // Save data to localStorage
    saveProgress({
      bestScores: newBestScores,
      gameStats: newGameStats,
      gameHistory: updatedGameHistory,
    });

    // Show success message
    toast("🎉 Congratulations! You found all pairs!", {
      description: `Moves: ${moves}, Time: ${time}s, Score: ${score}`, // Use final score
      className: "bg-purple-900 text-purple-100 border-purple-700",
    });

    // Check for unlocked achievements
    checkAchievements(newGameStats);
  }, [
    setIsGameActive,
    moves,
    time,
    bestScores,
    difficulty,
    gameStats, // Include the whole gameStats object for simplicity or list all used properties
    matches,
    setGameStats,
    score,
    gameHistory,
    setGameHistory,
    saveProgress,
    checkAchievements,
    setBestScores,
    setScore,
  ]); // Simplified dependency array

  // Handle hint button click
  const onHintClick = useCallback(() => {
    handleHint();
    setMoves((prev) => prev + 1);
    setScore((prevScore) => prevScore - HINT_PENALTY);
    setGameStats((prev) => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
  }, [handleHint, setMoves, setScore, setGameStats]);

  // Get grid size for the current difficulty
  const { gridSize } = DIFFICULTIES[difficulty];

  // 移除加载判断，保留原来的页面结构
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8 bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950">
      <div className="text-center space-y-4 w-full max-w-4xl">
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 text-transparent bg-clip-text">
          Memory Match Game
        </h1>

        {/* Game statistics display */}
        <GameStatsDisplay
          moves={moves}
          time={time}
          matches={matches}
          totalPairs={cards.length / 2}
          score={score}
        />

        {/* Game control area */}
        <div className="flex flex-wrap justify-center items-center gap-4">
          <Select
            value={difficulty}
            onValueChange={(value: Difficulty) => setDifficulty(value)}
            disabled={isResetting}
          >
            <SelectTrigger className="w-[140px] md:w-[180px] bg-indigo-950 border-indigo-700 text-indigo-200">
              <SelectValue placeholder="Select Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={onHintClick}
            variant="outline"
            size="sm"
            className="bg-indigo-950 border-indigo-700 hover:bg-indigo-900 hover:border-indigo-500 text-indigo-200 hover:text-indigo-100"
            disabled={!isGameActive || isResetting}
          >
            Hint (-{HINT_PENALTY} pts)
          </Button>
        </div>
      </div>

      {/* 使用条件类名添加过渡动画，而不是使用加载组件 */}
      <div
        className={`grid gap-2 sm:gap-4 p-2 sm:p-6 rounded-xl bg-indigo-950/50 backdrop-blur-sm w-full max-w-4xl transition-all duration-500 ${
          isResetting ? "opacity-60 scale-95" : "opacity-100 scale-100"
        }`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {isResetting ? (
          // 在重置时显示翻转中的卡片
          Array(DIFFICULTIES[difficulty].pairs * 2)
            .fill(null)
            .map((_, index) => (
              <div 
                key={`reset-card-${index}`}
                className="aspect-square rounded-md bg-indigo-700/50 animate-pulse"
                style={{
                  animationDelay: `${index * 20}ms`,
                  transform: `rotate(${Math.random() * 10 - 5}deg)`
                }}
              />
            ))
        ) : (
          // 正常游戏卡片
          cards.map((card, index) => (
            <MemoryCard
              key={card.id}
              card={card}
              index={index}
              isFlipped={card.isMatched || flippedIndexes.includes(index)}
              onClick={handleCardClick}
            />
          ))
        )}
      </div>

      {/* Game controls and best score display */}
      <div className="space-y-4 w-full max-w-4xl">
        <Button
          onClick={resetGame}
          variant="outline"
          size="lg"
          className="w-full bg-indigo-950 border-indigo-700 hover:bg-indigo-900 hover:border-indigo-500 text-indigo-200 hover:text-indigo-100"
          data-testid="new-game-button"
          disabled={isResetting}
        >
          {isResetting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" cy="12" r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                  fill="none" 
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              洗牌中...
            </span>
          ) : (
            "开始新游戏"
          )}
        </Button>

        <BestScoreDisplay
          difficulty={difficulty}
          moves={bestScores[difficulty].moves}
          time={bestScores[difficulty].time}
        />
      </div>

      {/* Achievements list */}
      <AchievementsList
        achievements={ACHIEVEMENTS}
        unlockedAchievements={unlockedAchievements}
      />

      {/* Game history table */}
      <GameHistoryTable gameHistory={gameHistory} />
    </div>
  );
}
