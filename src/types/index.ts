import type { FC } from "react";

export type Difficulty = "easy" | "medium" | "hard";

export type Achievement = {
  id: string;
  name: string;
  description: string;
  condition: (stats: GameStats) => boolean;
  icon: FC;
  points: number;
};

export type GameStats = {
  gamesPlayed: number;
  totalMoves: number;
  totalTime: number;
  matchesFound: number;
  hintsUsed: number;
  perfectGames: number;
};

export type Score = {
  moves: number;
  time: number;
};

export type BestScores = Record<Difficulty, Score>;

// Add these new types
export type GameHistory = {
  date: string;
  difficulty: Difficulty;
  moves: number;
  time: number;
  score: number;
};

export type GameState = {
  cards: MemoryCard[];
  flippedIndexes: number[];
  matches: number;
  moves: number;
  time: number;
  score: number;
};

export type MemoryCard = {
  id: string;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
};
