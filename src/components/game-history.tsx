import React, { JSX } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import type { GameHistory } from "@/types/memory-game";

interface GameHistoryTableProps {
  gameHistory: GameHistory[];
}

/**
 * 游戏历史记录表格组件
 * 显示过去游戏的历史记录
 */
export function GameHistoryTable({
  gameHistory,
}: GameHistoryTableProps): JSX.Element {
  return (
    <div className="mt-8 w-full">
      <h2 className="text-xl md:text-2xl font-bold text-indigo-200 mb-4">
        游戏历史
      </h2>
      <div className="overflow-x-auto">
        <Table className="text-indigo-200">
          <TableHeader className="bg-indigo-900">
            <TableRow>
              <TableHead className="text-xs uppercase">日期</TableHead>
              <TableHead className="text-xs uppercase">难度</TableHead>
              <TableHead className="text-xs uppercase">步数</TableHead>
              <TableHead className="text-xs uppercase">时间</TableHead>
              <TableHead className="text-xs uppercase">得分</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gameHistory.length > 0 ? (
              gameHistory.map((game, index) => (
                <TableRow
                  key={`${game.date}-${index}`}
                  className="bg-indigo-950 border-b border-indigo-800 hover:bg-indigo-900/50"
                >
                  <TableCell>{new Date(game.date).toLocaleString()}</TableCell>
                  <TableCell className="capitalize">
                    {game.difficulty}
                  </TableCell>
                  <TableCell>{game.moves}</TableCell>
                  <TableCell>{game.time}秒</TableCell>
                  <TableCell>{game.score}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  暂无游戏记录
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
