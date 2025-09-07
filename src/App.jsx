import React, { useState } from 'react';
import GameModeSelector from './components/GameModeSelector';
import EdiblesGame from './components/EdiblesGame';
import EquipmentsGame from './components/EquipmentsGame';
import BadgesGame from './components/BadgesGame';

function App() {
  const [currentGameMode, setCurrentGameMode] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);

  const handleGameModeSelect = (mode) => {
    setCurrentGameMode(mode);
  };

  const handleGameComplete = (gameData) => {
    setGameHistory([...gameHistory, gameData]);
  };

  const handleBackToMenu = () => {
    setCurrentGameMode(null);
  };

  const renderGameMode = () => {
    switch (currentGameMode) {
      case 'edibles':
        return <EdiblesGame onComplete={handleGameComplete} onBack={handleBackToMenu} />;
      case 'equipments':
        return <EquipmentsGame onComplete={handleGameComplete} onBack={handleBackToMenu} />;
      case 'badges':
        return <BadgesGame onBack={handleBackToMenu} />;
      default:
        return (
          <GameModeSelector 
            onSelect={handleGameModeSelect}
            gameHistory={gameHistory}
          />
        );
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Peakdle</h1>
        <p>Master the mountain in this Peak-inspired Wordle game!</p>
      </div>
      
      {renderGameMode()}
    </div>
  );
}

export default App;
