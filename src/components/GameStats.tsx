import React from 'react';
import './GameStats.css';

interface GameStatsProps {
  timer: number;
  mistakes: number;
  hints: number;
  isComplete: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

const GameStats: React.FC<GameStatsProps> = ({ timer, mistakes, hints, isComplete, difficulty }) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="game-stats">
      <div className="stat-item">
        <span className="stat-label">Time:</span>
        <span className="stat-value">{formatTime(timer)}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Mistakes:</span>
        <span className="stat-value">{mistakes}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Hints:</span>
        <span className="stat-value">{hints}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Difficulty:</span>
        <span className="stat-value">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
      </div>
      {isComplete && (
        <div className="stat-item complete">
          <span className="stat-label">Status:</span>
          <span className="stat-value">Complete!</span>
        </div>
      )}
    </div>
  );
};

export default GameStats;
