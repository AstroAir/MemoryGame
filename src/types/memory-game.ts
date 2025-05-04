import type { LucideIcon } from "lucide-react";

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameStats = {
  gamesPlayed: number;
  totalMoves: number;
  totalTime: number;
  matchesFound: number;
  hintsUsed: number;
  perfectGames: number;
};

export type BestScores = {
  [key in Difficulty]: {
    moves: number;
    time: number;
  };
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  points: number;
  condition: (stats: GameStats) => boolean;
};

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
  icon: LucideIcon;
  isMatched: boolean;
  color: string;
  value: string;
  isFlipped: boolean;
};

export type IconConfig = {
  icon: LucideIcon;
  color: string;
};

export type DifficultyConfig = {
  pairs: number;
  gridSize: number;
};

export type DifficultySettings = {
  [key in Difficulty]: DifficultyConfig;
};