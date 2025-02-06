import type { Achievement, Difficulty } from "@/types";
import { Trophy, Zap, Clock, Target, Star, Award } from "lucide-react";

export const DIFFICULTIES: Record<
  Difficulty,
  { pairs: number; gridSize: number }
> = {
  easy: { pairs: 6, gridSize: 3 },
  medium: { pairs: 8, gridSize: 4 },
  hard: { pairs: 10, gridSize: 5 },
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "firstWin",
    name: "First Victory",
    description: "Complete your first game",
    condition: (stats) => stats.gamesPlayed >= 1,
    icon: Trophy,
    points: 10,
  },
  {
    id: "speedDemon",
    name: "Speed Demon",
    description: "Complete a game in under 30 seconds",
    condition: (stats) => stats.totalTime > 0 && stats.totalTime <= 30,
    icon: Zap,
    points: 50,
  },
  {
    id: "marathonRunner",
    name: "Marathon Runner",
    description: "Play for a total of 1 hour",
    condition: (stats) => stats.totalTime >= 3600,
    icon: Clock,
    points: 100,
  },
  {
    id: "sharpShooter",
    name: "Sharpshooter",
    description: "Complete a game with less than 15 moves",
    condition: (stats) => stats.totalMoves > 0 && stats.totalMoves <= 15,
    icon: Target,
    points: 75,
  },
  {
    id: "perfectMemory",
    name: "Perfect Memory",
    description: "Complete a game without using any hints",
    condition: (stats) => stats.perfectGames >= 1,
    icon: Star,
    points: 100,
  },
  {
    id: "grandMaster",
    name: "Grand Master",
    description: "Complete 100 games",
    condition: (stats) => stats.gamesPlayed >= 100,
    icon: Award,
    points: 500,
  },
];

export const POINTS_PER_MATCH = 10;
export const POINTS_PER_SECOND_SAVED = 1;
export const POINTS_PER_MOVE_SAVED = 5;
export const HINT_PENALTY = 20;

// Add these new constants
export const STORAGE_KEY = "memoryGameData";
export const ANTI_CHEAT_TIMEOUT = 500; // ms
