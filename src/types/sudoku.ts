export interface Cell {
  value: number | null;
  isOriginal: boolean;
  isWrong: boolean;
  pencilMarks: number[];
  isPencilMode: boolean;
  moveOwner?: 'human' | 'ai';
}

export interface GameState {
  board: Cell[][];
  difficulty: 'easy' | 'medium' | 'hard';
  timer: number;
  isComplete: boolean;
  mistakes: number;
  hints: number;
}

export interface GameSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  pencilMode: boolean;
  showAvailableNumbers: boolean;
  showMistakes: boolean;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
