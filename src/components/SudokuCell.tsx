import React from 'react';
import { Cell } from '../types/sudoku';
import './SudokuCell.css';

interface SudokuCellProps {
  cell: Cell;
  row: number;
  col: number;
  isSelected: boolean;
  isHighlighted: boolean;
  onCellClick: (row: number, col: number) => void;
  onNumberInput: (row: number, col: number, value: number | null) => void;
  onPencilToggle: (row: number, col: number) => void;
  showAvailableNumbers: boolean;
  availableNumbers: number[];
  moveOwner?: 'human' | 'ai';
}

const SudokuCell: React.FC<SudokuCellProps> = ({
  cell,
  row,
  col,
  isSelected,
  isHighlighted,
  onCellClick,
  onNumberInput,
  onPencilToggle,
  showAvailableNumbers,
  availableNumbers,
  moveOwner
}) => {
  const handleClick = () => {
    onCellClick(row, col);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (cell.isOriginal) return;

    // Keep keyboard support for desktop users
    if (e.key >= '1' && e.key <= '9') {
      const num = parseInt(e.key);
      if (cell.isPencilMode) {
        // Toggle pencil mark
        const newPencilMarks = cell.pencilMarks.includes(num)
          ? cell.pencilMarks.filter(mark => mark !== num)
          : [...cell.pencilMarks, num];
        
        // This would need to be handled by the parent component
        // For now, we'll just call onNumberInput with null to clear the cell
        onNumberInput(row, col, null);
      } else {
        onNumberInput(row, col, num);
      }
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      onNumberInput(row, col, null);
    } else if (e.key === 'p' || e.key === 'P') {
      onPencilToggle(row, col);
    }
  };

  const getCellClassName = () => {
    let className = 'sudoku-cell';
    
    if (cell.isOriginal) className += ' original';
    if (cell.isWrong) className += ' wrong';
    if (isSelected) className += ' selected';
    if (isHighlighted) className += ' highlighted';
    
    // Add move owner styling
    if (moveOwner === 'human') className += ' human-move';
    if (moveOwner === 'ai') className += ' ai-move';
    
    // Debug logging
    if (moveOwner) {
      console.log(`Cell ${row}-${col} has moveOwner: ${moveOwner}, className: ${className}`);
    }
    
    // Add box border styling
    if (row % 3 === 0) className += ' top-border';
    if (row === 8) className += ' bottom-border';
    if (col % 3 === 0) className += ' left-border';
    if (col === 8) className += ' right-border';
    
    return className;
  };

  const renderContent = () => {
    if (cell.value !== null) {
      return <span className="cell-value">{cell.value}</span>;
    }
    
    if (cell.pencilMarks.length > 0) {
      return (
        <div className="pencil-marks">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <span
              key={num}
              className={`pencil-mark ${cell.pencilMarks.includes(num) ? 'active' : ''}`}
            >
              {cell.pencilMarks.includes(num) ? num : ''}
            </span>
          ))}
        </div>
      );
    }
    
    if (showAvailableNumbers && availableNumbers.length > 0) {
      return (
        <div className="available-numbers">
          {availableNumbers.map(num => (
            <span key={num} className="available-number">
              {num}
            </span>
          ))}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div
      className={getCellClassName()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Cell ${row + 1}, ${col + 1}`}
    >
      {renderContent()}
      {cell.isPencilMode && <div className="pencil-mode-indicator">✏️</div>}
    </div>
  );
};

export default SudokuCell;
