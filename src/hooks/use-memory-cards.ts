import { useState, useCallback, RefObject } from "react"; // Import useRef and RefObject
import { toast } from "sonner";
import {
  ICON_CONFIGS,
  DIFFICULTIES,
  ANTI_CHEAT_TIMEOUT,
} from "@/constants/game-config";
import type { MemoryCard, Difficulty } from "@/types/memory-game";

// Define a type for the partial game state updates
interface PartialGameState {
  cards?: MemoryCard[];
  flippedIndexes?: number[];
}

interface UseMemoryCardsProps {
  difficulty: Difficulty;
  onMatch: () => void;
  // Use RefObject as suggested by the deprecation warning,
  // although MutableRefObject might be semantically more accurate for mutation.
  // Ensure the ref passed in is compatible.
  lastActionTimeRef: RefObject<number>;
  // Use the specific PartialGameState type instead of any
  saveGameState: (state: PartialGameState) => void;
}

interface MemoryCardsData {
  cards: MemoryCard[];
  flippedIndexes: number[];
  isChecking: boolean;
  resetCards: () => void;
  handleCardClick: (index: number) => void;
  handleHint: () => void;
}

/**
 * Custom hook to manage memory card state and actions
 *
 * @param options - Configuration options
 * @returns Card state and action methods
 */
export function useMemoryCards({
  difficulty,
  onMatch,
  lastActionTimeRef,
  saveGameState,
}: UseMemoryCardsProps): MemoryCardsData {
  // Helper function defined outside or memoized if defined inside
  const createCards = useCallback((diff: Difficulty): MemoryCard[] => {
    const { pairs } = DIFFICULTIES[diff];
    const availableIcons = [...ICON_CONFIGS]; // Copy to avoid mutation if ICON_CONFIGS is used elsewhere
    const selectedIcons = availableIcons.slice(0, pairs); // Select the required number of pairs

    const newCards: MemoryCard[] = [];

    selectedIcons.forEach(({ icon, color }, i) => {
      newCards.push(
        {
          id: `${icon}-${i * 2}`, // Use icon and index for potentially more stable IDs
          icon,
          color,
          isMatched: false,
          value: "", // Consider removing if unused
          isFlipped: false,
        },
        {
          id: `${icon}-${i * 2 + 1}`, // Use icon and index for potentially more stable IDs
          icon,
          color,
          isMatched: false,
          value: "", // Consider removing if unused
          isFlipped: false,
        }
      );
    });

    return shuffleCards(newCards);
  }, []); // No dependencies needed if ICON_CONFIGS and DIFFICULTIES are constant imports

  /**
   * Shuffle algorithm (Fisher-Yates)
   */
  const shuffleCards = (cardArray: MemoryCard[]): MemoryCard[] => {
    const shuffled = [...cardArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
    return shuffled;
  };

  const [cards, setCards] = useState<MemoryCard[]>(() =>
    createCards(difficulty)
  );
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  /**
   * Reset card state
   */
  const resetCards = useCallback(() => {
    setCards(createCards(difficulty));
    setFlippedIndexes([]);
    setIsChecking(false);
    // Optionally save the reset state
    // saveGameState({ cards: createCards(difficulty), flippedIndexes: [] });
  }, [difficulty, createCards]); // Add createCards dependency

  /**
   * Handle card click event
   */
  const handleCardClick = useCallback(
    (clickedIndex: number) => {
      // Anti-cheat: Prevent rapid clicks
      const currentTime = Date.now();
      // Check if lastActionTimeRef and its current property are valid
      if (
        lastActionTimeRef &&
        lastActionTimeRef.current !== null && // Check for null if applicable
        currentTime - lastActionTimeRef.current < ANTI_CHEAT_TIMEOUT
      ) {
        toast("🚫 Operation too fast! Please wait a moment.", {
          description: "Please wait before continuing.",
          className: "bg-red-900 text-red-100 border-red-700",
        });
        return;
      }
      // Update last action time - requires the ref to be mutable.
      // If using RefObject strictly, this mutation is problematic.
      // Consider if the parent component should manage this ref's update logic.
      if (lastActionTimeRef && "current" in lastActionTimeRef) {
        // This cast might be necessary if using RefObject, but indicates a type mismatch.
        (lastActionTimeRef as React.MutableRefObject<number>).current =
          currentTime;
      }

      // Ignore click if checking match, card is matched, card is already flipped, or two cards are already flipped
      if (
        isChecking ||
        cards[clickedIndex].isMatched ||
        flippedIndexes.includes(clickedIndex) ||
        flippedIndexes.length === 2
      )
        return;

      const newFlipped = [...flippedIndexes, clickedIndex];
      setFlippedIndexes(newFlipped);

      // Save partial state
      saveGameState({ flippedIndexes: newFlipped });

      // Check for match if two cards are flipped
      if (newFlipped.length === 2) {
        setIsChecking(true);
        const [firstIndex, secondIndex] = newFlipped;
        const firstCard = cards[firstIndex];
        const secondCard = cards[secondIndex];

        if (firstCard.icon === secondCard.icon) {
          // Match success
          setTimeout(() => {
            let updatedCards: MemoryCard[] = [];
            setCards((currentCards) => {
              updatedCards = currentCards.map((card, index) =>
                index === firstIndex || index === secondIndex
                  ? { ...card, isMatched: true }
                  : card
              );
              // Save updated cards state after successful match
              saveGameState({ cards: updatedCards, flippedIndexes: [] });
              return updatedCards;
            });
            setFlippedIndexes([]);
            onMatch(); // Callback for match event
            setIsChecking(false);
          }, 500); // Delay for visual feedback
        } else {
          // Match failed
          setTimeout(() => {
            setFlippedIndexes([]);
            setIsChecking(false);
            // Save state after failed match (only flipped indexes reset)
            saveGameState({ flippedIndexes: [] });
          }, 1000); // Delay to allow user to see the cards
        }
      }
    },
    [
      cards,
      flippedIndexes,
      isChecking,
      lastActionTimeRef,
      onMatch,
      saveGameState, // Add saveGameState to dependencies
    ]
  );

  /**
   * Hint functionality: Briefly reveals a matching pair
   */
  const handleHint = useCallback(() => {
    const unmatchedCards = cards.filter((card) => !card.isMatched);
    if (unmatchedCards.length > 1) {
      // Need at least two unmatched cards for a hint
      // Find a random unmatched card
      const randomCard =
        unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];

      // Find the indices of the pair (including the random card itself)
      const hintIndexes = cards.reduce((acc, card, index) => {
        if (card.icon === randomCard.icon && !card.isMatched) {
          acc.push(index);
        }
        return acc;
      }, [] as number[]);

      // Temporarily flip the hint cards if exactly two are found
      if (hintIndexes.length === 2) {
        const [index1, index2] = hintIndexes;
        // Flip the first card
        setFlippedIndexes((prev) => [...prev, index1]);
        setTimeout(() => {
          setFlippedIndexes((prev) => prev.filter((i) => i !== index1));
        }, 1000); // Duration the hint is shown

        // Flip the second card shortly after the first
        setTimeout(() => {
          setFlippedIndexes((prev) => [...prev, index2]);
          setTimeout(() => {
            setFlippedIndexes((prev) => prev.filter((i) => i !== index2));
          }, 1000); // Duration the hint is shown
        }, 100); // Small delay between flipping the two hint cards

        // Save state to indicate hint was used (optional)
        // saveGameState({}); // Consider what state change represents using a hint
      }
    } else {
      toast("💡 No more pairs to hint!", {
        description:
          "All remaining cards are matched or there's only one left.",
      });
    }
  }, [cards]); // Add saveGameState to dependencies

  return {
    cards,
    flippedIndexes,
    isChecking,
    resetCards,
    handleCardClick,
    handleHint,
  };
}
