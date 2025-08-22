import React from 'react';
import { Cell } from '../types/sudoku';
import { getAvailableNumbers, getBoxAvailableNumbers } from '../utils/sudokuLogic';
import SudokuCell from './SudokuCell';
import './SudokuBoard.css';

interface SudokuBoardProps {
  board: Cell[][];
  selectedCell: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  onNumberInput: (row: number, col: number, value: number | null) => void;
  onPencilToggle: (row: number, col: number) => void;
  showAvailableNumbers: boolean;
}

const SudokuBoard: React.FC<SudokuBoardProps> = ({
  board,
  selectedCell,
  onCellClick,
  onNumberInput,
  onPencilToggle,
  showAvailableNumbers
}) => {
  const isHighlighted = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    
    const { row: selectedRow, col: selectedCol } = selectedCell;
    
    // Same row, column, or 3x3 box
    return (
      row === selectedRow ||
      col === selectedCol ||
      (Math.floor(row / 3) === Math.floor(selectedRow / 3) &&
       Math.floor(col / 3) === Math.floor(selectedCol / 3))
    );
  };

  const getAvailableNumbersForCell = (row: number, col: number): number[] => {
    if (board[row][col].value !== null) return [];
    return getAvailableNumbers(board, row, col);
  };

  const getBoxAvailableNumbersForCell = (row: number, col: number): number[] => {
    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);
    return getBoxAvailableNumbers(board, boxRow, boxCol);
  };

  return (
    <div className="sudoku-board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="sudoku-row">
          {row.map((cell, colIndex) => (
            <SudokuCell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              row={rowIndex}
              col={colIndex}
              isSelected={
                selectedCell?.row === rowIndex && selectedCell?.col === colIndex
              }
              isHighlighted={isHighlighted(rowIndex, colIndex)}
              onCellClick={onCellClick}
              onNumberInput={onNumberInput}
              onPencilToggle={onPencilToggle}
              showAvailableNumbers={showAvailableNumbers}
              availableNumbers={
                showAvailableNumbers
                  ? getBoxAvailableNumbersForCell(rowIndex, colIndex)
                  : getAvailableNumbersForCell(rowIndex, colIndex)
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SudokuBoard;
