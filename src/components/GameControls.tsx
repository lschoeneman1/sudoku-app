import React from 'react';
import { Difficulty } from '../types/sudoku';
import './GameControls.css';

interface GameControlsProps {
  onNewGame: (difficulty: Difficulty) => void;
  onPencilModeToggle: () => void;
  onShowAvailableNumbersToggle: () => void;
  onShowMistakesToggle: () => void;
  onHint: () => void;
  onUndo: () => void;
  onRedo: () => void;
  pencilMode: boolean;
  showAvailableNumbers: boolean;
  showMistakes: boolean;
  hintsRemaining: number;
  canUndo: boolean;
  canRedo: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onPencilModeToggle,
  onShowAvailableNumbersToggle,
  onShowMistakesToggle,
  onHint,
  onUndo,
  onRedo,
  pencilMode,
  showAvailableNumbers,
  showMistakes,
  hintsRemaining,
  canUndo,
  canRedo
}) => {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  return (
    <div className="game-controls">
      <div className="control-section">
        <h3>New Game</h3>
        <div className="difficulty-buttons">
          {difficulties.map(difficulty => (
            <button
              key={difficulty}
              className={`difficulty-btn ${difficulty}`}
              onClick={() => onNewGame(difficulty)}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="control-section">
        <h3>Tools</h3>
        <div className="tool-buttons">
          <button
            className={`tool-btn ${pencilMode ? 'active' : ''}`}
            onClick={onPencilModeToggle}
            title="Toggle Pencil Mode (P)"
          >
            ✏️ Pencil Mode
          </button>
          <button
            className={`tool-btn ${showAvailableNumbers ? 'active' : ''}`}
            onClick={onShowAvailableNumbersToggle}
            title="Show Available Numbers for 3x3 Boxes"
          >
            📊 Show Available
          </button>
          <button
            className={`tool-btn ${showMistakes ? 'active' : ''}`}
            onClick={onShowMistakesToggle}
            title="Show Mistakes in Red"
          >
            ❌ Show Mistakes
          </button>
        </div>
      </div>

      <div className="control-section">
        <h3>Actions</h3>
        <div className="action-buttons">
          <button
            className="action-btn hint-btn"
            onClick={onHint}
            disabled={hintsRemaining === 0}
            title={`Get a hint (${hintsRemaining} remaining)`}
          >
            💡 Hint ({hintsRemaining})
          </button>
          <button
            className="action-btn undo-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo last move"
          >
            ↩️ Undo
          </button>
          <button
            className="action-btn redo-btn"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo last move"
          >
            ↪️ Redo
          </button>
        </div>
      </div>

      <div className="control-section">
        <h3>Number Pad</h3>
        <div className="number-pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              className="number-btn"
              onClick={() => {
                // This will be handled by the parent component
                // when a cell is selected
              }}
            >
              {num}
            </button>
          ))}
          <button className="number-btn clear-btn">
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;
