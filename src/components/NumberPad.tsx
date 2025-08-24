import React from 'react';
import './NumberPad.css';

interface NumberPadProps {
  onNumberInput: (value: number | null) => void;
  onPencilToggle: () => void;
  pencilMode: boolean;
  onClear: () => void;
}

const NumberPad: React.FC<NumberPadProps> = ({
  onNumberInput,
  onPencilToggle,
  pencilMode,
  onClear
}) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="number-pad">
      <div className="number-pad-grid">
        {numbers.map(num => (
          <button
            key={num}
            className="number-button"
            onClick={() => onNumberInput(num)}
            aria-label={`Enter number ${num}`}
          >
            {num}
          </button>
        ))}
      </div>
      
      <div className="number-pad-controls">
        <button
          className={`control-button pencil-toggle ${pencilMode ? 'active' : ''}`}
          onClick={onPencilToggle}
          aria-label="Toggle pencil mode"
        >
          ✏️
        </button>
        <button
          className="control-button clear-button"
          onClick={onClear}
          aria-label="Clear cell"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default NumberPad;
