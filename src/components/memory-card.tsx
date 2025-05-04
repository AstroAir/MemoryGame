import React, { JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { MemoryCard as MemoryCardType } from "@/types/memory-game";

interface MemoryCardProps {
  card: MemoryCardType;
  index: number;
  isFlipped: boolean;
  onClick: (index: number) => void;
}

/**
 * 记忆卡片组件
 * 处理单个卡片的展示和动画
 */
export function MemoryCard({
  card,
  index,
  isFlipped,
  onClick,
}: MemoryCardProps): JSX.Element {
  return (
    <motion.div
      key={card.id}
      initial={{ rotateY: 0 }}
      animate={{
        rotateY: isFlipped ? 180 : 0,
      }}
      transition={{ duration: 0.3 }}
      className="perspective-1000"
      data-testid={`memory-card-${index}`}
    >
      <Card
        className={`relative w-full aspect-square cursor-pointer transform-style-3d transition-all duration-300 ${
          card.isMatched
            ? "bg-indigo-900/50 border-indigo-400/50"
            : isFlipped
            ? "bg-indigo-800/50 border-indigo-500/50"
            : "bg-indigo-950 border-indigo-800 hover:border-indigo-600 hover:bg-indigo-900/80"
        }`}
        onClick={() => onClick(index)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-indigo-500/5 to-white/5" />
        <AnimatePresence>
          {isFlipped && (
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
  );
}
