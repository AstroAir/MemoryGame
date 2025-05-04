import React, { JSX } from "react";
import type { Difficulty } from "@/types/memory-game";

interface GameStatsDisplayProps {
  moves: number;
  time: number;
  matches: number;
  totalPairs: number;
  score: number;
}

/**
 * 游戏统计组件
 * 显示当前游戏的统计数据
 */
export function GameStatsDisplay({
  moves,
  time,
  matches,
  totalPairs,
  score,
}: GameStatsDisplayProps): JSX.Element {
  return (
    <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
      <p className="text-indigo-200">步数: {moves}</p>
      <p className="text-indigo-200">时间: {time}秒</p>
      <p className="text-indigo-200">
        匹配: {matches} / {totalPairs}
      </p>
      <p className="text-indigo-200">得分: {score}</p>
    </div>
  );
}

interface BestScoreDisplayProps {
  difficulty: Difficulty;
  moves: number;
  time: number;
}

/**
 * 最佳得分显示组件
 */
export function BestScoreDisplay({
  difficulty,
  moves,
  time,
}: BestScoreDisplayProps): JSX.Element {
  return (
    <div className="text-indigo-200 text-center">
      <p>最佳成绩 ({difficulty}):</p>
      <p>步数: {moves === Number.POSITIVE_INFINITY ? "-" : moves}</p>
      <p>时间: {time === Number.POSITIVE_INFINITY ? "-" : `${time}秒`}</p>
    </div>
  );
}
