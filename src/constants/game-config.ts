import { Heart, Star, Sun, Moon, Cloud, Flower2, Zap, TreesIcon as Tree, Umbrella, Coffee, Trophy, Medal, Award, Clock, Target } from "lucide-react";
import type { DifficultySettings, Achievement, GameStats, IconConfig } from "@/types/memory-game";

export const STORAGE_KEY = "memory-game-data";

export const ANTI_CHEAT_TIMEOUT = 300; // Minimum time in ms between actions

export const POINTS_PER_MATCH = 100;
export const POINTS_PER_SECOND_SAVED = 10;
export const POINTS_PER_MOVE_SAVED = 20;
export const HINT_PENALTY = 50;

export const DIFFICULTIES: DifficultySettings = {
  easy: {
    pairs: 4,
    gridSize: 4
  },
  medium: {
    pairs: 8,
    gridSize: 4
  },
  hard: {
    pairs: 10,
    gridSize: 5
  }
};

export const ICON_CONFIGS: IconConfig[] = [
  { icon: Heart, color: "text-rose-400" },
  { icon: Star, color: "text-amber-400" },
  { icon: Sun, color: "text-yellow-400" },
  { icon: Moon, color: "text-purple-400" },
  { icon: Cloud, color: "text-sky-400" },
  { icon: Flower2, color: "text-emerald-400" },
  { icon: Zap, color: "text-orange-400" },
  { icon: Tree, color: "text-green-400" },
  { icon: Umbrella, color: "text-blue-400" },
  { icon: Coffee, color: "text-brown-400" }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-win",
    name: "First Victory",
    description: "Complete your first game",
    icon: Trophy,
    points: 100,
    condition: (stats: GameStats) => stats.gamesPlayed >= 1
  },
  {
    id: "fast-fingers",
    name: "Fast Fingers",
    description: "Complete a game in less than 30 seconds",
    icon: Clock,
    points: 200,
    condition: (stats: GameStats) => stats.totalTime / stats.gamesPlayed < 30
  },
  {
    id: "perfect-memory",
    name: "Perfect Memory",
    description: "Complete a game without using hints",
    icon: Medal,
    points: 300,
    condition: (stats: GameStats) => stats.perfectGames >= 1
  },
  {
    id: "memory-master",
    name: "Memory Master",
    description: "Complete 5 games",
    icon: Award,
    points: 500,
    condition: (stats: GameStats) => stats.gamesPlayed >= 5
  },
  {
    id: "efficiency",
    name: "Efficiency",
    description: "Average less than 2 moves per match",
    icon: Target,
    points: 400,
    condition: (stats: GameStats) => (stats.totalMoves / stats.matchesFound) < 2
  }
];