import React from 'react';
import './ConnectFourBoard.css';

interface ConnectFourBoardProps {
  board: (string | null)[][];
  winner: string | null;
  isGameOver: boolean;
  currentPlayer: 'human' | 'ai';
}

const ConnectFourBoard: React.FC<ConnectFourBoardProps> = ({
  board,
  winner,
  isGameOver,
  currentPlayer
}) => {
  const BOARD_ROWS = 6;
  const BOARD_COLS = 7;

  return (
    <div className="connect-four-board">
      <div className="board-header">
        <h3>Connect Four Board</h3>
        {winner && (
          <div className="winner-announcement">
            🎉 {winner.toUpperCase()} Wins! 🎉
          </div>
        )}
        {isGameOver && !winner && (
          <div className="draw-announcement">
            😔 It's a Draw! 😔
          </div>
        )}
      </div>
      
      <div className="board-container">
        {Array.from({ length: BOARD_COLS }, (_, col) => (
          <div key={col} className="column">
            {Array.from({ length: BOARD_ROWS }, (_, row) => (
              <div
                key={`${row}-${col}`}
                className={`cell ${board[row][col] || ''}`}
              >
                {board[row][col] && (
                  <div className={`piece ${board[row][col]}`}>
                    {board[row][col] === 'human' ? '👤' : '🤖'}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="board-footer">
        <div className="current-player-info">
          <span>Current Player: </span>
          <span className={`player-indicator ${currentPlayer}`}>
            {currentPlayer === 'human' ? '👤' : '🤖'} {currentPlayer.toUpperCase()}
          </span>
        </div>
        <div className="board-instructions">
          <p>This board is controlled by Sudoku moves!</p>
          <p>Each Sudoku move places a piece in Connect Four.</p>
        </div>
      </div>
    </div>
  );
};

export default ConnectFourBoard;
