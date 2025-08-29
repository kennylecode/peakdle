import React, { useState, useEffect } from 'react';
import equipmentData from '../data/equipment.json';

const EquipmentGame = ({ onComplete, onBack }) => {
  const [targetEquipment, setTargetEquipment] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [maxGuesses] = useState(6);

  useEffect(() => {
    // Select a random equipment as the target
    const randomIndex = Math.floor(Math.random() * equipmentData.length);
    setTargetEquipment(equipmentData[randomIndex]);
  }, []);

  const handleGuess = () => {
    if (!currentGuess.trim()) return;

    const guessedEquipment = equipmentData.find(
      equipment => equipment.name.toLowerCase() === currentGuess.toLowerCase()
    );

    if (guessedEquipment) {
      const newGuess = {
        name: guessedEquipment.name,
        weight: guessedEquipment.weight,
        statusAilment: guessedEquipment.statusAilment,
        type: guessedEquipment.type,
        rarity: guessedEquipment.rarity,
        range: guessedEquipment.range
      };

      const newGuesses = [...guesses, newGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      // Check if won
      if (guessedEquipment.name === targetEquipment.name) {
        setGameWon(true);
        onComplete({
          mode: 'equipment',
          won: true,
          guesses: newGuesses.length,
          target: targetEquipment.name
        });
      } else if (newGuesses.length >= maxGuesses) {
        setGameLost(true);
        onComplete({
          mode: 'equipment',
          won: false,
          guesses: maxGuesses,
          target: targetEquipment.name
        });
      }
    }
  };

  const getStatClass = (guessedValue, targetValue, statType) => {
    if (guessedValue === targetValue) return 'correct';
    
    if (statType === 'weight') {
      const diff = Math.abs(guessedValue - targetValue);
      if (diff <= 1.0) return 'partial';
      return 'incorrect';
    }
    
    if (statType === 'range') {
      const diff = Math.abs(guessedValue - targetValue);
      if (diff <= 3) return 'partial';
      return 'incorrect';
    }
    
    if (statType === 'statusAilment' || statType === 'type' || statType === 'rarity') {
      return 'incorrect';
    }
    
    return 'incorrect';
  };

  const getStatHint = (guessedValue, targetValue, statType) => {
    if (guessedValue === targetValue) return 'Correct!';
    
    if (statType === 'weight') {
      if (guessedValue > targetValue) return 'Too heavy';
      return 'Too light';
    }
    
    if (statType === 'range') {
      if (guessedValue > targetValue) return 'Too far';
      return 'Too close';
    }
    
    return 'Wrong';
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#6b7280';
      case 'uncommon': return '#10b981';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  if (!targetEquipment) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          onClick={onBack}
          style={{
            padding: '10px 20px',
            background: '#718096',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginRight: '15px'
          }}
        >
          ← Back to Menu
        </button>
        <h2>Equipment Challenge</h2>
        <p>Guess the equipment piece in {maxGuesses} tries!</p>
        <p>Target: {gameWon || gameLost ? targetEquipment.name : '???'}</p>
      </div>

      <div className="game-board">
        <div className="stats-grid">
          {guesses.map((guess, guessIndex) => (
            <div key={guessIndex} style={{ gridColumn: 'span 5' }}>
              <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>
                Guess {guessIndex + 1}: {guess.name}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                <div className={`stat-card ${getStatClass(guess.weight, targetEquipment.weight, 'weight')}`}>
                  <h4>Weight</h4>
                  <div className="value">{guess.weight}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                    {getStatHint(guess.weight, targetEquipment.weight, 'weight')}
                  </div>
                </div>
                <div className={`stat-card ${getStatClass(guess.statusAilment, targetEquipment.statusAilment, 'statusAilment')}`}>
                  <h4>Status</h4>
                  <div className="value">{guess.statusAilment}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                    {getStatClass(guess.statusAilment, targetEquipment.statusAilment, 'statusAilment') === 'correct' ? 'Correct!' : 'Wrong'}
                  </div>
                </div>
                <div className={`stat-card ${getStatClass(guess.type, targetEquipment.type, 'type')}`}>
                  <h4>Type</h4>
                  <div className="value">{guess.type}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                    {getStatClass(guess.type, targetEquipment.type, 'type') === 'correct' ? 'Correct!' : 'Wrong'}
                  </div>
                </div>
                <div className={`stat-card ${getStatClass(guess.rarity, targetEquipment.rarity, 'rarity')}`}>
                  <h4>Rarity</h4>
                  <div className="value" style={{ color: getRarityColor(guess.rarity) }}>
                    {guess.rarity}
                  </div>
                  <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                    {getStatClass(guess.rarity, targetEquipment.rarity, 'rarity') === 'correct' ? 'Correct!' : 'Wrong'}
                  </div>
                </div>
                <div className={`stat-card ${getStatClass(guess.range, targetEquipment.range, 'range')}`}>
                  <h4>Range</h4>
                  <div className="value">{guess.range}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                    {getStatHint(guess.range, targetEquipment.range, 'range')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!gameWon && !gameLost && (
          <div className="guess-input">
            <input
              type="text"
              value={currentGuess}
              onChange={(e) => setCurrentGuess(e.target.value)}
              placeholder="Enter equipment name..."
              onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
            />
            <button onClick={handleGuess} disabled={!currentGuess.trim()}>
              Guess
            </button>
          </div>
        )}

        {gameWon && (
          <div className="game-result win">
            <h3>🎉 Congratulations! You found the equipment!</h3>
            <p>You guessed {targetEquipment.name} in {guesses.length} tries!</p>
            <button className="new-game-btn" onClick={onBack}>
              Play Again
            </button>
          </div>
        )}

        {gameLost && (
          <div className="game-result lose">
            <h3>😔 Game Over!</h3>
            <p>The equipment was: {targetEquipment.name}</p>
            <button className="new-game-btn" onClick={onBack}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentGame;
