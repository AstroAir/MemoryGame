import React, { JSX } from "react";
import type { Achievement } from "@/types/memory-game";

interface AchievementsListProps {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
}

/**
 * 成就列表组件
 * 显示所有可用成就及其解锁状态
 */
export function AchievementsList({
  achievements,
  unlockedAchievements,
}: AchievementsListProps): JSX.Element {
  return (
    <div className="mt-8 w-full">
      <h2 className="text-xl md:text-2xl font-bold text-indigo-200 mb-4">
        成就
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const isUnlocked = unlockedAchievements.some(
            (a) => a.id === achievement.id
          );

          return (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg transition-all duration-300 ${
                isUnlocked
                  ? "bg-green-800 text-green-100"
                  : "bg-gray-800 text-gray-400"
              }`}
              data-testid={`achievement-${achievement.id}`}
            >
              <div className="w-6 h-6 md:w-8 md:h-8 mb-2">
                {React.createElement(achievement.icon, {})}
              </div>
              <h3 className="font-bold text-sm md:text-base">
                {achievement.name}
              </h3>
              <p className="text-xs md:text-sm">{achievement.description}</p>
              <p className="text-xs mt-2">奖励分: {achievement.points}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
