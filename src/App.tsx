// Larry
//
import React from 'react';
import './App.css';
import SudokuGame from './components/SudokuGame';
let x = 1
const App: React.FC = () => {
  return (
    <div className="App">
      <SudokuGame />
    </div>
  );
};

export default App;
