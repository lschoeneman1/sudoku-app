import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameSettings, Difficulty } from '../types/sudoku';
import { generateSolvedBoard, createCellBoard, isBoardComplete } from '../utils/sudokuLogic';
import SudokuBoard from './SudokuBoard';
import GameControls from './GameControls';
import GameStats from './GameStats';
import NumberPad from './NumberPad';
import ConnectFourBoard from './ConnectFourBoard';
import './HybridGame.css';

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

interface ConnectFourMove {
  col: number;
  player: 'red' | 'yellow';
}

const HybridGame: React.FC = () => {
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
  
     // Connect Four state
   const [connectFourBoard, setConnectFourBoard] = useState<(string | null)[][]>(
     Array(6).fill(null).map(() => Array(7).fill(null))
   );
   const [currentPlayer, setCurrentPlayer] = useState<'human' | 'ai'>('human');
   const [connectFourWinner, setConnectFourWinner] = useState<string | null>(null);
   const [isConnectFourGameOver, setIsConnectFourGameOver] = useState(false);
  
  // Game flow state
  const [isAITurn, setIsAITurn] = useState(false);
  const [gameMode, setGameMode] = useState<'sudoku' | 'connect-four'>('sudoku');
  
  // Track who placed each number (human or AI)
  const [moveOwners, setMoveOwners] = useState<{ [key: string]: 'human' | 'ai' }>({});
  
     const timerRef = useRef<NodeJS.Timeout | null>(null);
   const startTimeRef = useRef<number>(Date.now());
   const aiTurnRef = useRef<boolean>(false);

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
    
               // Reset Connect Four
      setConnectFourBoard(Array(6).fill(null).map(() => Array(7).fill(null)));
      setCurrentPlayer('human');
     setConnectFourWinner(null);
     setIsConnectFourGameOver(false);
           setIsAITurn(false);
      aiTurnRef.current = false;
      
      // Reset move owners
      setMoveOwners({});
    
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
    if (isAITurn) return; // Prevent human moves during AI turn
    setSelectedCell({ row, col });
  }, [isAITurn]);

  const checkConnectFourWinner = useCallback((board: (string | null)[][], row: number, col: number, player: string): boolean => {
    // Check horizontal
    for (let c = Math.max(0, col - 3); c <= Math.min(6, col); c++) {
      if (c + 3 <= 6) {
        if (board[row][c] === player && 
            board[row][c + 1] === player &&
            board[row][c + 2] === player &&
            board[row][c + 3] === player) {
          return true;
        }
      }
    }

    // Check vertical
    for (let r = Math.max(0, row - 3); r <= Math.min(5, row); r++) {
      if (r + 3 <= 5) {
        if (board[r][col] === player && 
            board[r + 1][col] === player &&
            board[r + 2][col] === player &&
            board[r + 3][col] === player) {
          return true;
        }
      }
    }

    // Check diagonal (top-left to bottom-right)
    for (let r = Math.max(0, row - 3); r <= Math.min(5, row); r++) {
      for (let c = Math.max(0, col - 3); c <= Math.min(6, col); c++) {
        if (r + 3 <= 5 && c + 3 <= 6) {
          if (board[r][c] === player && 
              board[r + 1][c + 1] === player &&
              board[r + 2][c + 2] === player &&
              board[r + 3][c + 3] === player) {
            return true;
          }
        }
      }
    }

    // Check diagonal (top-right to bottom-left)
    for (let r = Math.max(0, row - 3); r <= Math.min(5, row); r++) {
      for (let c = Math.max(3, col); c <= Math.min(6, col + 3); c++) {
        if (r + 3 <= 5 && c - 3 >= 0) {
          if (board[r][c] === player && 
              board[r + 1][c - 1] === player &&
              board[r + 2][c - 2] === player &&
              board[r + 3][c - 3] === player) {
            return true;
          }
        }
      }
    }

    return false;
  }, []);

  const makeConnectFourMove = useCallback((sudokuRow: number, sudokuCol: number, value: number) => {
    // Map Sudoku value to Connect Four column (1-9 maps to 0-6 with modulo)
    const col = (value - 1) % 7;
    
    console.log('Making Connect Four move: row', sudokuRow, 'col', sudokuCol, 'value', value, '-> CF col', col);
    console.log('Current player for Connect Four:', currentPlayer);
    
    // Find the lowest empty row in the column
    let piecePlaced = false;
    for (let row = 5; row >= 0; row--) {
      if (connectFourBoard[row][col] === null) {
        const newBoard = connectFourBoard.map(r => [...r]);
        newBoard[row][col] = currentPlayer;
        setConnectFourBoard(newBoard);
        
        console.log('Placed', currentPlayer, 'piece at CF position', row, col);
        
        // Check for Connect Four win
        if (checkConnectFourWinner(newBoard, row, col, currentPlayer)) {
          setConnectFourWinner(currentPlayer);
          setIsConnectFourGameOver(true);
          console.log('Connect Four winner:', currentPlayer);
        }
        
        // Switch players AFTER placing the piece
        setCurrentPlayer(currentPlayer === 'human' ? 'ai' : 'human');
        piecePlaced = true;
        break;
      }
    }
    
    if (!piecePlaced) {
      console.log('Column', col, 'is full, cannot place piece');
    }
  }, [connectFourBoard, currentPlayer, checkConnectFourWinner]);

  const handleNumberInput = useCallback((row: number, col: number, value: number | null) => {
    if (gameState.board[row][col].isOriginal || isAITurn) return;

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
         isWrong: false,
         moveOwner: 'human' // Add move owner directly to cell
       };
       
       console.log('Set moveOwner to human for cell:', row, col, newBoard[row][col]);
       
                       // Track that this is a human move
         const newMoveOwners: { [key: string]: 'human' | 'ai' } = {
           ...moveOwners,
           [`${row}-${col}`]: 'human'
         };
         console.log('Updated moveOwners for human:', newMoveOwners);
         setMoveOwners(newMoveOwners);

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

    // Update game state FIRST to ensure the board is updated
    setGameState(prev => {
      const newState = { ...prev, board: newBoard };
      
      // Check if board is complete
      if (isBoardComplete(newBoard)) {
        newState.isComplete = true;
      }
      
      return newState;
    });
    
    // Ensure the board state is properly set before proceeding
    console.log('Board state updated with new value:', value, 'at position:', row, col);

                  // Make Connect Four move ONLY for correct Sudoku moves
      if (value !== null && solvedBoard[row][col] === value) {
        console.log('CORRECT move - placing Connect Four piece');
        console.log('Sudoku value:', value, 'Expected value:', solvedBoard[row][col]);
        makeConnectFourMove(row, col, value);
      } else {
        // For incorrect moves, just log
        console.log('Incorrect move - no Connect Four piece placed');
        console.log('Sudoku value:', value, 'Expected value:', solvedBoard[row][col]);
      }
      
      // Switch to AI turn after ANY move (correct or incorrect)
      setIsAITurn(true);
      aiTurnRef.current = true;
      console.log('Switching to AI turn...');
      console.log('isAITurn state set to true, scheduling AI move in 1 second...');
      setTimeout(() => {
        console.log('AI making move...');
        console.log('Current aiTurnRef state:', aiTurnRef.current);
        makeAIMove();
      }, 1000);
  }, [gameState.board, settings.pencilMode, moveHistory, currentMoveIndex, solvedBoard, makeConnectFourMove]);

  const makeAIMove = useCallback(() => {
    console.log('=== AI MOVE START ===');
    console.log('makeAIMove called, aiTurnRef:', aiTurnRef.current, 'gameComplete:', gameState.isComplete);
    console.log('Current moveOwners state:', moveOwners);
    
    if (aiTurnRef.current && !gameState.isComplete) {
      // Find an empty cell for AI to fill
      const emptyCells = [];
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (!gameState.board[row][col].isOriginal && 
              gameState.board[row][col].value === null) {
            emptyCells.push({ row, col });
          }
        }
      }

      console.log('Empty cells found:', emptyCells.length);

      if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const correctValue = solvedBoard[randomCell.row][randomCell.col];
        
        console.log('AI placing', correctValue, 'at', randomCell.row, randomCell.col);
        
        // AI makes the move - use functional update to avoid race conditions
        setGameState(prev => {
          const newBoard = prev.board.map(r => [...r]);
          newBoard[randomCell.row][randomCell.col] = {
            ...newBoard[randomCell.row][randomCell.col],
            value: correctValue,
            pencilMarks: [],
            isWrong: false,
            moveOwner: 'ai' // Add move owner directly to cell
          };
          
          console.log('Set moveOwner to AI for cell:', randomCell.row, randomCell.col, newBoard[randomCell.row][randomCell.col]);
          
          return { ...prev, board: newBoard };
        });
        
        // Update moveOwners
        const newMoveOwners: { [key: string]: 'human' | 'ai' } = {
          ...moveOwners,
          [`${randomCell.row}-${randomCell.col}`]: 'ai'
        };
        
        console.log('Updated moveOwners for AI:', newMoveOwners);
        setMoveOwners(newMoveOwners);

        // Make Connect Four move for AI (AI always makes correct moves)
        makeConnectFourMove(randomCell.row, randomCell.col, correctValue);

        // Switch back to human turn
        setIsAITurn(false);
        aiTurnRef.current = false;
        setSelectedCell(null);
        console.log('AI turn completed, switching to human');
        console.log('Final moveOwners state after AI move:', newMoveOwners);
        console.log('=== AI MOVE END ===');
      } else {
        // No more moves available - end AI turn
        console.log('No empty cells, ending AI turn');
        setIsAITurn(false);
        aiTurnRef.current = false;
        setSelectedCell(null);
      }
    } else {
      // AI turn ended or game complete - reset state
      console.log('AI turn conditions not met, resetting state');
      setIsAITurn(false);
      aiTurnRef.current = false;
      setSelectedCell(null);
    }
  }, [isAITurn, gameState.isComplete, solvedBoard, makeConnectFourMove, moveOwners]);

  const handlePencilToggle = useCallback((row: number, col: number) => {
    if (gameState.board[row][col].isOriginal || isAITurn) return;

    const newBoard = gameState.board.map(r => [...r]);
    newBoard[row][col] = {
      ...newBoard[row][col],
      isPencilMode: !newBoard[row][col].isPencilMode
    };

    setGameState(prev => ({ ...prev, board: newBoard }));
  }, [gameState.board, isAITurn]);

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
    if (gameState.hints >= 3 || !selectedCell || isAITurn) return;

    const { row, col } = selectedCell;
    if (gameState.board[row][col].value !== null) return;

    const correctValue = solvedBoard[row][col];
    handleNumberInput(row, col, correctValue);
    
    setGameState(prev => ({ ...prev, hints: prev.hints + 1 }));
  }, [gameState.hints, selectedCell, solvedBoard, handleNumberInput, isAITurn]);

  const handleUndo = useCallback(() => {
    if (currentMoveIndex < 0 || isAITurn) return;

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
  }, [currentMoveIndex, moveHistory, gameState.board, isAITurn]);

  const handleRedo = useCallback(() => {
    if (currentMoveIndex >= moveHistory.length - 1 || isAITurn) return;

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
  }, [currentMoveIndex, moveHistory, gameState.board, isAITurn]);

  const toggleGameMode = useCallback(() => {
    setGameMode(prev => prev === 'sudoku' ? 'connect-four' : 'sudoku');
  }, []);

  return (
    <div className="hybrid-game">
      <div className="game-header">
        <h1>🎯 Sudoku + Connect Four 🎯</h1>
        
        <GameStats
          timer={gameState.timer}
          mistakes={gameState.mistakes}
          hints={gameState.hints}
          isComplete={gameState.isComplete}
          difficulty={gameState.difficulty}
        />
      </div>
      
      <div className="game-content">
        <div className="game-boards-container">
          <div className="sudoku-section">
            <h3>🧩 Sudoku Board</h3>
            <SudokuBoard
              board={gameState.board}
              selectedCell={selectedCell}
              onCellClick={handleCellClick}
              onNumberInput={handleNumberInput}
              onPencilToggle={handlePencilToggle}
              showAvailableNumbers={settings.showAvailableNumbers}
              moveOwners={moveOwners}
            />

            
            {isAITurn && (
              <div className="ai-thinking">
                🤖 AI is thinking...
              </div>
            )}
          </div>
          
          <div className="connect-four-section">
            <h3>🎯 Connect Four Board</h3>
            <ConnectFourBoard
              board={connectFourBoard}
              winner={connectFourWinner}
              isGameOver={isConnectFourGameOver}
              currentPlayer={currentPlayer}
            />
          </div>
        </div>
        
        <div className="game-controls-section">
          <div className="number-pad-container">
            <h3>Number Input</h3>
            <NumberPad
              onNumberInput={(value) => {
                if (selectedCell && !isAITurn) {
                  handleNumberInput(selectedCell.row, selectedCell.col, value);
                }
              }}
              onPencilToggle={() => {
                if (selectedCell && !isAITurn) {
                  handlePencilToggle(selectedCell.row, selectedCell.col);
                }
              }}
              pencilMode={selectedCell ? gameState.board[selectedCell.row][selectedCell.col].isPencilMode : false}
              onClear={() => {
                if (selectedCell && !isAITurn) {
                  handleNumberInput(selectedCell.row, selectedCell.col, null);
                }
              }}
            />
          </div>
          
          <div className="game-controls">
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
              canUndo={currentMoveIndex >= 0 && !isAITurn}
              canRedo={currentMoveIndex < moveHistory.length - 1 && !isAITurn}
            />
          </div>
          
                     <div className="turn-indicator">
             <h3>Current Turn:</h3>
             <div className={`player-indicator ${currentPlayer}`}>
               {currentPlayer === 'human' ? '👤' : '🤖'} {currentPlayer.toUpperCase()}
             </div>
             {isAITurn && <div className="ai-turn">🤖 AI's Turn</div>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default HybridGame;
