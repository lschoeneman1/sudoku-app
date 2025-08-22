import { Cell, Difficulty } from '../types/sudoku';

// Generate a solved Sudoku board
export const generateSolvedBoard = (): number[][] => {
  const board: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));
  
  // Fill diagonal 3x3 boxes first (these can be filled independently)
  for (let box = 0; box < 9; box += 4) {
    const startRow = Math.floor(box / 3) * 3;
    const startCol = (box % 3) * 3;
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const randomIndex = Math.floor(Math.random() * numbers.length);
        board[startRow + i][startCol + j] = numbers[randomIndex];
        numbers.splice(randomIndex, 1);
      }
    }
  }
  
  // Solve the rest of the board
  solveSudoku(board);
  return board;
};

// Solve Sudoku using backtracking
const solveSudoku = (board: number[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidMove(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) {
              return true;
            }
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

// Check if a move is valid
export const isValidMove = (board: number[][], row: number, col: number, num: number): boolean => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }
  
  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }
  
  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }
  
  return true;
};

// Generate puzzle by removing numbers based on difficulty
export const generatePuzzle = (difficulty: Difficulty): number[][] => {
  const solvedBoard = generateSolvedBoard();
  const puzzle = solvedBoard.map(row => [...row]);
  
  let cellsToRemove: number;
  switch (difficulty) {
    case 'easy':
      cellsToRemove = 40; // Keep 41 cells
      break;
    case 'medium':
      cellsToRemove = 50; // Keep 31 cells
      break;
    case 'hard':
      cellsToRemove = 60; // Keep 21 cells
      break;
    default:
      cellsToRemove = 40;
  }
  
  // Remove random cells
  let removed = 0;
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }
  
  return puzzle;
};

// Convert number board to Cell board
export const createCellBoard = (puzzle: number[][]): Cell[][] => {
  return puzzle.map(row => 
    row.map(cell => ({
      value: cell === 0 ? null : cell,
      isOriginal: cell !== 0,
      isWrong: false,
      pencilMarks: [],
      isPencilMode: false
    }))
  );
};

// Get available numbers for a specific cell
export const getAvailableNumbers = (board: Cell[][], row: number, col: number): number[] => {
  if (board[row][col].value !== null) return [];
  
  const available: number[] = [];
  for (let num = 1; num <= 9; num++) {
    if (isValidMoveForCell(board, row, col, num)) {
      available.push(num);
    }
  }
  return available;
};

// Check if a move is valid for a cell (considering current board state)
const isValidMoveForCell = (board: Cell[][], row: number, col: number, num: number): boolean => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (x !== col && board[row][x].value === num) return false;
  }
  
  // Check column
  for (let x = 0; x < 9; x++) {
    if (x !== row && board[x][col].value === num) return false;
  }
  
  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const checkRow = startRow + i;
      const checkCol = startCol + j;
      if ((checkRow !== row || checkCol !== col) && board[checkRow][checkCol].value === num) {
        return false;
      }
    }
  }
  
  return true;
};

// Check if the board is complete and valid
export const isBoardComplete = (board: Cell[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col].value === null) return false;
    }
  }
  
  // Check if all rows, columns, and boxes are valid
  for (let i = 0; i < 9; i++) {
    if (!isRowValid(board, i) || !isColumnValid(board, i)) return false;
  }
  
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      if (!isBoxValid(board, boxRow * 3, boxCol * 3)) return false;
    }
  }
  
  return true;
};

// Check if a row is valid
const isRowValid = (board: Cell[][], row: number): boolean => {
  const seen = new Set<number>();
  for (let col = 0; col < 9; col++) {
    const value = board[row][col].value;
    if (value === null) return false;
    if (seen.has(value)) return false;
    seen.add(value);
  }
  return true;
};

// Check if a column is valid
const isColumnValid = (board: Cell[][], col: number): boolean => {
  const seen = new Set<number>();
  for (let row = 0; row < 9; row++) {
    const value = board[row][col].value;
    if (value === null) return false;
    if (seen.has(value)) return false;
    seen.add(value);
  }
  return true;
};

// Check if a 3x3 box is valid
const isBoxValid = (board: Cell[][], startRow: number, startCol: number): boolean => {
  const seen = new Set<number>();
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const value = board[startRow + i][startCol + j].value;
      if (value === null) return false;
      if (seen.has(value)) return false;
      seen.add(value);
    }
  }
  return true;
};

// Get available numbers for a 3x3 box
export const getBoxAvailableNumbers = (board: Cell[][], boxRow: number, boxCol: number): number[] => {
  const usedNumbers = new Set<number>();
  const startRow = boxRow * 3;
  const startCol = boxCol * 3;
  
  // Collect all numbers currently in the box
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const value = board[startRow + i][startCol + j].value;
      if (value !== null) {
        usedNumbers.add(value);
      }
    }
  }
  
  // Return available numbers
  const available: number[] = [];
  for (let num = 1; num <= 9; num++) {
    if (!usedNumbers.has(num)) {
      available.push(num);
    }
  }
  
  return available;
};
