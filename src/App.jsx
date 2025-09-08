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
        <h1>PEAKdle</h1>
        <p>Master the mountain in this PEAK-Wordle mashup game!</p>
      </div>
      <div className="main">
        {renderGameMode()}
      </div>
      <div className="footer">
        <p>All contents belong to the game PEAK and the developers/publishers <a href="https://aggrocrab.com/">Aggro Crab</a> and <a href="https://landfall.se/">Landfall Games</a>.</p>
        <p>Much love to my friends for coming up with the ideas and supporting this project.</p>
        <a href="https://www.linkedin.com/in/kenny-le-code/">
          <i class="fab fa-linkedin"></i>
        </a>
      </div>
    </div>
  );
}

export default App;
