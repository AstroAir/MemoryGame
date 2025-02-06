"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Heart,
  Star,
  Sun,
  Moon,
  Cloud,
  Flower2,
  Zap,
  TreesIcon as Tree,
  Umbrella,
  Coffee,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  DIFFICULTIES,
  ACHIEVEMENTS,
  POINTS_PER_MATCH,
  POINTS_PER_SECOND_SAVED,
  POINTS_PER_MOVE_SAVED,
  HINT_PENALTY,
  STORAGE_KEY,
  ANTI_CHEAT_TIMEOUT,
} from "@/constants";
import type {
  Difficulty,
  GameStats,
  BestScores,
  Achievement,
  GameHistory,
  GameState,
} from "@/types";
import { LoadingSpinner } from "@/components/loading-spinner";
import React from "react";

type MemoryCard = {
  id: string;
  icon: LucideIcon;
  isMatched: boolean;
  color: string;
  value: string;
  isFlipped: boolean;
};

const iconConfigs = [
  { icon: Heart, color: "text-rose-400" },
  { icon: Star, color: "text-amber-400" },
  { icon: Sun, color: "text-yellow-400" },
  { icon: Moon, color: "text-purple-400" },
  { icon: Cloud, color: "text-sky-400" },
  { icon: Flower2, color: "text-emerald-400" },
  { icon: Zap, color: "text-orange-400" },
  { icon: Tree, color: "text-green-400" },
  { icon: Umbrella, color: "text-blue-400" },
  { icon: Coffee, color: "text-brown-400" },
];

const createCards = (difficulty: Difficulty): MemoryCard[] => {
  const { pairs } = DIFFICULTIES[difficulty];
  const cards: MemoryCard[] = [];

  for (let i = 0; i < pairs; i++) {
    const { icon, color } = iconConfigs[i];
    cards.push(
      {
        id: (i * 2).toString(),
        icon,
        color,
        isMatched: false,
        value: "",
        isFlipped: false,
      },
      {
        id: (i * 2 + 1).toString(),
        icon,
        color,
        isMatched: false,
        value: "",
        isFlipped: false,
      }
    );
  }

  return shuffleCards(cards);
};

const shuffleCards = (cards: MemoryCard[]): MemoryCard[] => {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function MemoryGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [cards, setCards] = useState<MemoryCard[]>(createCards(difficulty));
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
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
  const [score, setScore] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<
    Achievement[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const gameStateRef = useRef<GameState | null>(null);
  const lastActionTimeRef = useRef<number>(Date.now());

  const resetGame = useCallback(() => {
    setIsLoading(true);
    setCards(createCards(difficulty));
    setFlippedIndexes([]);
    setMatches(0);
    setIsChecking(false);
    setMoves(0);
    setTime(0);
    setIsGameActive(true);
    setScore(0);
    setTimeout(() => setIsLoading(false), 300);
  }, [difficulty]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const {
        bestScores: savedBestScores,
        gameStats: savedGameStats,
        gameHistory: savedGameHistory,
      } = JSON.parse(savedData);
      setBestScores(savedBestScores);
      setGameStats(savedGameStats);
      setGameHistory(savedGameHistory || []);
    }
  }, []);

  const saveGameState = useCallback(() => {
    if (isGameActive) {
      gameStateRef.current = {
        cards,
        flippedIndexes,
        matches,
        moves,
        time,
        score,
      };
    }
  }, [isGameActive, cards, flippedIndexes, matches, moves, time, score]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGameActive) {
      timer = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          saveGameState();
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isGameActive, saveGameState]);

  const handleCardClick = (clickedIndex: number) => {
    const currentTime = Date.now();
    if (currentTime - lastActionTimeRef.current < ANTI_CHEAT_TIMEOUT) {
      toast("🚫 Slow down! Actions too fast.", {
        description: "Please wait before making another move.",
        className: "bg-red-900 text-red-100 border-red-700",
      });
      return;
    }
    lastActionTimeRef.current = currentTime;

    if (
      isChecking ||
      cards[clickedIndex].isMatched ||
      flippedIndexes.includes(clickedIndex) ||
      flippedIndexes.length === 2
    )
      return;

    const newFlipped = [...flippedIndexes, clickedIndex];
    setFlippedIndexes(newFlipped);
    setMoves((prevMoves) => prevMoves + 1);

    if (newFlipped.length === 2) {
      setIsChecking(true);
      const [firstIndex, secondIndex] = newFlipped;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.icon === secondCard.icon) {
        setTimeout(() => {
          setCards(
            cards.map((card, index) =>
              index === firstIndex || index === secondIndex
                ? { ...card, isMatched: true }
                : card
            )
          );
          setFlippedIndexes([]);
          setMatches((m) => {
            const newMatches = m + 1;
            setScore((prevScore) => prevScore + POINTS_PER_MATCH);
            if (newMatches === cards.length / 2) {
              endGame();
            }
            return newMatches;
          });
          setIsChecking(false);
          saveGameState();
        }, 500);
      } else {
        setTimeout(() => {
          setFlippedIndexes([]);
          setIsChecking(false);
          saveGameState();
        }, 1000);
      }
    } else {
      saveGameState();
    }
  };

  const handleHint = () => {
    const unmatched = cards.filter((card) => !card.isMatched);
    if (unmatched.length > 0) {
      const randomCard =
        unmatched[Math.floor(Math.random() * unmatched.length)];
      const hintIndexes = cards.reduce((acc, card, index) => {
        if (card.icon === randomCard.icon && !card.isMatched) {
          acc.push(index);
        }
        return acc;
      }, [] as number[]);

      hintIndexes.forEach((index) => {
        setTimeout(() => {
          setFlippedIndexes((prev) => [...prev, index]);
          setTimeout(() => {
            setFlippedIndexes((prev) => prev.filter((i) => i !== index));
          }, 1000);
        }, 0);
      });

      setMoves((prev) => prev + 1);
      setScore((prevScore) => prevScore - HINT_PENALTY);
      setGameStats((prev) => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    }
  };

  const endGame = () => {
    setIsGameActive(false);
    const currentScore = { moves, time };
    let newBestScores = { ...bestScores };

    if (
      currentScore.moves < bestScores[difficulty].moves ||
      (currentScore.moves === bestScores[difficulty].moves &&
        currentScore.time < bestScores[difficulty].time)
    ) {
      newBestScores = { ...newBestScores, [difficulty]: currentScore };
      setBestScores(newBestScores);
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

    const newGameStats = {
      gamesPlayed: gameStats.gamesPlayed + 1,
      totalMoves: gameStats.totalMoves + moves,
      totalTime: gameStats.totalTime + time,
      matchesFound: gameStats.matchesFound + matches,
      hintsUsed: gameStats.hintsUsed,
      perfectGames:
        gameStats.hintsUsed === 0
          ? gameStats.perfectGames + 1
          : gameStats.perfectGames,
    };
    setGameStats(newGameStats);

    const newGameHistory: GameHistory = {
      date: new Date().toISOString(),
      difficulty,
      moves,
      time,
      score,
    };
    const updatedGameHistory = [...gameHistory, newGameHistory].slice(-10); // Keep only the last 10 games
    setGameHistory(updatedGameHistory);

    // Save data to localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        bestScores: newBestScores,
        gameStats: newGameStats,
        gameHistory: updatedGameHistory,
      })
    );

    toast("🎉 Congratulations! You've found all the matches! 🎈", {
      description: `Moves: ${moves}, Time: ${time}s, Score: ${score}`,
      className: "bg-purple-900 text-purple-100 border-purple-700",
    });
    checkAchievements();
  };

  const checkAchievements = () => {
    ACHIEVEMENTS.forEach((achievement) => {
      if (
        !unlockedAchievements.some((a) => a.id === achievement.id) &&
        achievement.condition(gameStats)
      ) {
        setUnlockedAchievements((prev) => [...prev, achievement]);
        setScore((prevScore) => prevScore + achievement.points);
        toast("🏅 Achievement Unlocked!", {
          description: `${achievement.name}: ${achievement.description}`,
          className: "bg-green-900 text-green-100 border-green-700",
        });
      }
    });
  };

  const { gridSize } = DIFFICULTIES[difficulty];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8 bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950">
      <div className="text-center space-y-4 w-full max-w-4xl">
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 text-transparent bg-clip-text">
          Memory Match Game
        </h1>
        <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
          <p className="text-indigo-200">Moves: {moves}</p>
          <p className="text-indigo-200">Time: {time}s</p>
          <p className="text-indigo-200">
            Matches: {matches} of {cards.length / 2}
          </p>
          <p className="text-indigo-200">Score: {score}</p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-4">
          <Select onValueChange={(value: Difficulty) => setDifficulty(value)}>
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
            onClick={handleHint}
            variant="outline"
            size="sm"
            className="bg-indigo-950 border-indigo-700 hover:bg-indigo-900 hover:border-indigo-500 text-indigo-200 hover:text-indigo-100"
          >
            Hint (-{HINT_PENALTY} points)
          </Button>
        </div>
      </div>

      <div
        className={`grid gap-2 sm:gap-4 p-2 sm:p-6 rounded-xl bg-indigo-950/50 backdrop-blur-sm w-full max-w-4xl`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ rotateY: 0 }}
            animate={{
              rotateY:
                card.isMatched || flippedIndexes.includes(index) ? 180 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="perspective-1000"
          >
            <Card
              className={`relative w-full aspect-square cursor-pointer transform-style-3d transition-all duration-300 ${
                card.isMatched
                  ? "bg-indigo-900/50 border-indigo-400/50"
                  : flippedIndexes.includes(index)
                  ? "bg-indigo-800/50 border-indigo-500/50"
                  : "bg-indigo-950 border-indigo-800 hover:border-indigo-600 hover:bg-indigo-900/80"
              }`}
              onClick={() => handleCardClick(index)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-indigo-500/5 to-white/5" />
              <AnimatePresence>
                {(card.isMatched || flippedIndexes.includes(index)) && (
                  <motion.div
                    initial={{ opacity: 0, rotateY: 180 }}
                    animate={{ opacity: 1, rotateY: 180 }}
                    exit={{ opacity: 0, rotateY: 180 }}
                    className="absolute inset-0 flex items-center justify-center backface-hidden"
                  >
                    <card.icon
                      className={`w-1/2 h-1/2 ${
                        card.isMatched
                          ? `${card.color} filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`
                          : card.color
                      }`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4 w-full max-w-4xl">
        <Button
          onClick={resetGame}
          variant="outline"
          size="lg"
          className="w-full bg-indigo-950 border-indigo-700 hover:bg-indigo-900 hover:border-indigo-500 text-indigo-200 hover:text-indigo-100"
        >
          Start New Game
        </Button>
        <div className="text-indigo-200 text-center">
          <p>Best Score ({difficulty}):</p>
          <p>
            Moves:{" "}
            {bestScores[difficulty].moves === Number.POSITIVE_INFINITY
              ? "-"
              : bestScores[difficulty].moves}
          </p>
          <p>
            Time:{" "}
            {bestScores[difficulty].time === Number.POSITIVE_INFINITY
              ? "-"
              : `${bestScores[difficulty].time}s`}
          </p>
        </div>
      </div>

      <div className="mt-8 w-full max-w-4xl">
        <h2 className="text-xl md:text-2xl font-bold text-indigo-200 mb-4">
          Achievements
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg ${
                unlockedAchievements.some((a) => a.id === achievement.id)
                  ? "bg-green-800 text-green-100"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              <div className="w-6 h-6 md:w-8 md:h-8 mb-2">
                {React.createElement(achievement.icon, {})}
              </div>
              <h3 className="font-bold text-sm md:text-base">
                {achievement.name}
              </h3>
              <p className="text-xs md:text-sm">{achievement.description}</p>
              <p className="text-xs mt-2">Points: {achievement.points}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 w-full max-w-4xl">
        <h2 className="text-xl md:text-2xl font-bold text-indigo-200 mb-4">
          Game History
        </h2>
        <div className="overflow-x-auto">
          <Table className="text-indigo-200">
            <TableHeader className="bg-indigo-900">
              <TableRow>
                <TableHead className="text-xs uppercase">Date</TableHead>
                <TableHead className="text-xs uppercase">Difficulty</TableHead>
                <TableHead className="text-xs uppercase">Moves</TableHead>
                <TableHead className="text-xs uppercase">Time</TableHead>
                <TableHead className="text-xs uppercase">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gameHistory.map((game, index) => (
                <TableRow
                  key={index}
                  className="bg-indigo-950 border-b border-indigo-800 hover:bg-indigo-900/50"
                >
                  <TableCell>{new Date(game.date).toLocaleString()}</TableCell>
                  <TableCell className="capitalize">
                    {game.difficulty}
                  </TableCell>
                  <TableCell>{game.moves}</TableCell>
                  <TableCell>{game.time}s</TableCell>
                  <TableCell>{game.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
