import { useEffect } from "react";

interface UseGameTimerProps {
  isGameActive: boolean;
  setTime: React.Dispatch<React.SetStateAction<number>>;
  onTick?: () => void;
}

/**
 * Custom hook to manage the game timer
 *
 * @param options - Configuration options
 */
export function useGameTimer({
  isGameActive,
  setTime,
  onTick,
}: UseGameTimerProps): void {
  // Start the timer when the game is active
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (isGameActive) {
      timer = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          if (onTick) {
            onTick();
          }
          return newTime;
        });
      }, 1000);
    }

    // Cleanup the timer
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isGameActive, setTime, onTick]);
}
