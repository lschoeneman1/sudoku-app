import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameSettings, Difficulty } from '../types/sudoku';
import { generateSolvedBoard, createCellBoard, isBoardComplete } from '../utils/sudokuLogic';
import SudokuBoard from './SudokuBoard';
import GameControls from './GameControls';
import GameStats from './GameStats';
import './SudokuGame.css';

// Create puzzle by removing cells from solved board based on difficulty
const createPuzzleFromSolved = (solvedBoard: number[][], difficulty: Difficulty): number[][] => {
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

interface Move {
  row: number;
  col: number;
  previousValue: number | null;
  previousPencilMarks: number[];
  newValue: number | null;
  newPencilMarks: number[];
}

const SudokuGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    difficulty: 'easy',
    timer: 0,
    isComplete: false,
    mistakes: 0,
    hints: 0
  });

  const [settings, setSettings] = useState<GameSettings>({
    difficulty: 'easy',
    pencilMode: false,
    showAvailableNumbers: false,
    showMistakes: true
  });

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [solvedBoard, setSolvedBoard] = useState<number[][]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const startNewGame = useCallback((difficulty: Difficulty) => {
    // Generate a solved board first
    const solvedBoard = generateSolvedBoard();
    // Create puzzle by removing cells based on difficulty
    const puzzle = createPuzzleFromSolved(solvedBoard, difficulty);
    const cellBoard = createCellBoard(puzzle);
    
    // Store the original solved board for validation
    const solved = solvedBoard.map(row => [...row]);
    
    setGameState({
      board: cellBoard,
      difficulty,
      timer: 0,
      isComplete: false,
      mistakes: 0,
      hints: 0
    });
    
    setSettings(prev => ({ ...prev, difficulty }));
    setSelectedCell(null);
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
    setSolvedBoard(solved);
    
    startTimeRef.current = Date.now();
  }, []);

  // Initialize game
  useEffect(() => {
    startNewGame('easy');
  }, [startNewGame]);

  // Timer effect
  useEffect(() => {
    if (!gameState.isComplete) {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timer: Math.floor((Date.now() - startTimeRef.current) / 1000)
        }));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.isComplete]);

  const handleCellClick = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
  }, []);

  const handleNumberInput = useCallback((row: number, col: number, value: number | null) => {
    if (gameState.board[row][col].isOriginal) return;

    const previousCell = gameState.board[row][col];
    const newBoard = gameState.board.map(r => [...r]);
    
    if (settings.pencilMode) {
      // Handle pencil marks
      const newPencilMarks = value !== null 
        ? previousCell.pencilMarks.includes(value)
          ? previousCell.pencilMarks.filter(mark => mark !== value)
          : [...previousCell.pencilMarks, value]
        : [];
      
      newBoard[row][col] = {
        ...previousCell,
        pencilMarks: newPencilMarks,
        value: null
      };
    } else {
      // Handle regular number input
      newBoard[row][col] = {
        ...previousCell,
        value,
        pencilMarks: [],
        isWrong: false
      };

      // Check if the move is correct
      if (value !== null && solvedBoard[row][col] !== value) {
        newBoard[row][col].isWrong = true;
        setGameState(prev => ({ ...prev, mistakes: prev.mistakes + 1 }));
      }
    }

    // Add move to history
    const move: Move = {
      row,
      col,
      previousValue: previousCell.value,
      previousPencilMarks: [...previousCell.pencilMarks],
      newValue: newBoard[row][col].value,
      newPencilMarks: [...newBoard[row][col].pencilMarks]
    };

    const newMoveHistory = moveHistory.slice(0, currentMoveIndex + 1);
    newMoveHistory.push(move);
    
    setMoveHistory(newMoveHistory);
    setCurrentMoveIndex(newMoveHistory.length - 1);

    // Update game state
    setGameState(prev => {
      const newState = { ...prev, board: newBoard };
      
      // Check if board is complete
      if (isBoardComplete(newBoard)) {
        newState.isComplete = true;
      }
      
      return newState;
    });
  }, [gameState.board, settings.pencilMode, moveHistory, currentMoveIndex, solvedBoard]);

  const handlePencilToggle = useCallback((row: number, col: number) => {
    if (gameState.board[row][col].isOriginal) return;

    const newBoard = gameState.board.map(r => [...r]);
    newBoard[row][col] = {
      ...newBoard[row][col],
      isPencilMode: !newBoard[row][col].isPencilMode
    };

    setGameState(prev => ({ ...prev, board: newBoard }));
  }, [gameState.board]);

  const handlePencilModeToggle = useCallback(() => {
    setSettings(prev => ({ ...prev, pencilMode: !prev.pencilMode }));
  }, []);

  const handleShowAvailableNumbersToggle = useCallback(() => {
    setSettings(prev => ({ ...prev, showAvailableNumbers: !prev.showAvailableNumbers }));
  }, []);

  const handleShowMistakesToggle = useCallback(() => {
    setSettings(prev => ({ ...prev, showMistakes: !prev.showMistakes }));
  }, []);

  const handleHint = useCallback(() => {
    if (gameState.hints >= 3 || !selectedCell) return;

    const { row, col } = selectedCell;
    if (gameState.board[row][col].value !== null) return;

    const correctValue = solvedBoard[row][col];
    handleNumberInput(row, col, correctValue);
    
    setGameState(prev => ({ ...prev, hints: prev.hints + 1 }));
  }, [gameState.hints, selectedCell, solvedBoard, handleNumberInput]);

  const handleUndo = useCallback(() => {
    if (currentMoveIndex < 0) return;

    const move = moveHistory[currentMoveIndex];
    const newBoard = gameState.board.map(r => [...r]);
    
    newBoard[move.row][move.col] = {
      ...newBoard[move.row][move.col],
      value: move.previousValue,
      pencilMarks: move.previousPencilMarks,
      isWrong: false
    };

    setGameState(prev => ({ ...prev, board: newBoard }));
    setCurrentMoveIndex(prev => prev - 1);
  }, [currentMoveIndex, moveHistory, gameState.board]);

  const handleRedo = useCallback(() => {
    if (currentMoveIndex >= moveHistory.length - 1) return;

    const move = moveHistory[currentMoveIndex + 1];
    const newBoard = gameState.board.map(r => [...r]);
    
    newBoard[move.row][move.col] = {
      ...newBoard[move.row][move.col],
      value: move.newValue,
      pencilMarks: move.newPencilMarks,
      isWrong: false
    };

    setGameState(prev => ({ ...prev, board: newBoard }));
    setCurrentMoveIndex(prev => prev + 1);
  }, [currentMoveIndex, moveHistory, gameState.board]);

  return (
    <div className="sudoku-game">
      <div className="game-header">
        <h1>Sudoku</h1>
        <GameStats
          timer={gameState.timer}
          mistakes={gameState.mistakes}
          hints={gameState.hints}
          isComplete={gameState.isComplete}
          difficulty={gameState.difficulty}
        />
      </div>
      
      <div className="game-content">
        <div className="game-board-container">
          <SudokuBoard
            board={gameState.board}
            selectedCell={selectedCell}
            onCellClick={handleCellClick}
            onNumberInput={handleNumberInput}
            onPencilToggle={handlePencilToggle}
            showAvailableNumbers={settings.showAvailableNumbers}
          />
        </div>
        
        <div className="game-sidebar">
          <GameControls
            onNewGame={startNewGame}
            onPencilModeToggle={handlePencilModeToggle}
            onShowAvailableNumbersToggle={handleShowAvailableNumbersToggle}
            onShowMistakesToggle={handleShowMistakesToggle}
            onHint={handleHint}
            onUndo={handleUndo}
            onRedo={handleRedo}
            pencilMode={settings.pencilMode}
            showAvailableNumbers={settings.showAvailableNumbers}
            showMistakes={settings.showMistakes}
            hintsRemaining={3 - gameState.hints}
            canUndo={currentMoveIndex >= 0}
            canRedo={currentMoveIndex < moveHistory.length - 1}
          />
        </div>
      </div>
    </div>
  );
};

export default SudokuGame;
