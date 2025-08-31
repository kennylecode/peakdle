import React from 'react';

const GameModeSelector = ({ onSelect, gameHistory }) => {
  const gameModes = [
    {
      id: 'edibles',
      name: 'Edibles',
      description: 'Guess the edible item based on its stats: hunger, weight, stamina, status effects, and location.',
      stats: ['Hunger', 'Weight', 'Stamina', 'Status Effects', 'Location']
    },
    {
      id: 'equipments',
      name: 'Equipments',
      description: 'Identify the equipment piece using its stats: weight, status ailment, type, rarity, and range.',
      stats: ['Weight', 'Status Ailment', 'Type', 'Rarity', 'Range']
    },
    {
      id: 'badges',
      name: 'Badges',
      description: 'Guess the badge from a zoomed-in image that gradually reveals more as you guess. Then match it with the correct outfit reward.',
      stats: ['Image Recognition', 'Outfit Matching']
    }
  ];

  const getWinRate = (mode) => {
    const modeGames = gameHistory.filter(game => game.mode === mode);
    if (modeGames.length === 0) return 0;
    const wins = modeGames.filter(game => game.won).length;
    return Math.round((wins / modeGames.length) * 100);
  };

  return (
    <div>
      <div className="game-modes">
        {gameModes.map((mode) => (
          <div 
            key={mode.id} 
            className="game-mode-card"
            onClick={() => onSelect(mode.id)}
          >
            <h3>{mode.name}</h3>
            <p>{mode.description}</p>
            <div className="stats">
              <h4>Stats to Guess:</h4>
              <ul>
                {mode.stats.map((stat, index) => (
                  <li key={index}>{stat}</li>
                ))}
              </ul>
            </div>
            {gameHistory.length > 0 && (
              <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#718096' }}>
                Win Rate: {getWinRate(mode.id)}% ({gameHistory.filter(g => g.mode === mode.id).length} games)
              </div>
            )}
          </div>
        ))}
      </div>
      
      {gameHistory.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <h3 style={{ color: 'white', marginBottom: '15px' }}>Recent Games</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {gameHistory.slice(-5).reverse().map((game, index) => (
              <div 
                key={index} 
                style={{
                  background: game.won ? '#48bb78' : '#e53e3e',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              >
                {game.mode.charAt(0).toUpperCase() + game.mode.slice(1)}: {game.won ? 'Won' : 'Lost'} in {game.guesses} guesses
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameModeSelector;
