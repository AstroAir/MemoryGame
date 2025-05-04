import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ACHIEVEMENTS } from '@/constants/game-config';
import type { Achievement, GameStats } from '@/types/memory-game';

interface UseAchievementsProps {
  initialAchievements?: Achievement[];
  onUnlock?: (achievement: Achievement) => void;
}

interface AchievementsData {
  unlockedAchievements: Achievement[];
  checkAchievements: (gameStats: GameStats) => void;
}

/**
 * 自定义钩子，用于管理游戏成就系统
 * 
 * @param options - 配置选项
 * @returns 成就数据和操作方法
 */
export function useAchievements({
  initialAchievements = [],
  onUnlock
}: UseAchievementsProps = {}): AchievementsData {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>(initialAchievements);
  
  /**
   * 检查并处理成就解锁
   */
  const checkAchievements = useCallback((gameStats: GameStats) => {
    ACHIEVEMENTS.forEach((achievement) => {
      // 检查是否已经解锁
      if (unlockedAchievements.some(a => a.id === achievement.id)) {
        return;
      }
      
      // 检查成就条件
      if (achievement.condition(gameStats)) {
        // 解锁新成就
        setUnlockedAchievements(prev => [...prev, achievement]);
        
        // 显示成就通知
        toast("🏅 成就解锁！", {
          description: `${achievement.name}: ${achievement.description}`,
          className: "bg-green-900 text-green-100 border-green-700",
        });
        
        // 调用外部回调
        if (onUnlock) {
          onUnlock(achievement);
        }
      }
    });
  }, [unlockedAchievements, onUnlock]);
  
  return {
    unlockedAchievements,
    checkAchievements
  };
}