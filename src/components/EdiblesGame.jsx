import React, { useState, useEffect } from 'react';
import ediblesData from '../data/edibles.json';

const EdiblesGame = ({ onComplete, onBack }) => {
  const [targetEdible, setTargetEdible] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [maxGuesses] = useState(6);

  useEffect(() => {
    // Select a random edible as the target
    const randomIndex = Math.floor(Math.random() * ediblesData.length);
    setTargetEdible(ediblesData[randomIndex]);
  }, []);

  const handleGuess = () => {
    if (!currentGuess.trim()) return;

    const guessedEdible = ediblesData.find(
      edible => edible.name.toLowerCase() === currentGuess.toLowerCase()
    );

    if (guessedEdible) {
      const newGuess = {
        name: guessedEdible.name,
        hunger: guessedEdible.hunger,
        weight: guessedEdible.weight,
        stamina: guessedEdible.stamina,
        statusAilment: guessedEdible.statusAilment,
        location: guessedEdible.location
      };

      const newGuesses = [...guesses, newGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      // Check if won
      if (guessedEdible.name === targetEdible.name) {
        setGameWon(true);
        onComplete({
          mode: 'edibles',
          won: true,
          guesses: newGuesses.length,
          target: targetEdible.name
        });
      } else if (newGuesses.length >= maxGuesses) {
        setGameLost(true);
        onComplete({
          mode: 'edibles',
          won: false,
          guesses: maxGuesses,
          target: targetEdible.name
        });
      }
    }
  };

  const getStatClass = (guessedValue, targetValue, statType) => {
    if (guessedValue === targetValue) return 'correct';
    
    if (statType === 'hunger' || statType === 'stamina') {
      const diff = Math.abs(guessedValue - targetValue);
      if (diff <= 10) return 'partial';
      return 'incorrect';
    }
    
    if (statType === 'weight') {
      const diff = Math.abs(guessedValue - targetValue);
      if (diff <= 0.5) return 'partial';
      return 'incorrect';
    }
    
    if (statType === 'statusAilment' || statType === 'location') {
      return 'incorrect';
    }
    
    return 'incorrect';
  };

  const getStatHint = (guessedValue, targetValue, statType) => {
    if (guessedValue === targetValue) return 'Correct!';
    
    if (statType === 'hunger' || statType === 'stamina') {
      if (guessedValue > targetValue) return 'Too high';
      return 'Too low';
    }
    
    if (statType === 'weight') {
      if (guessedValue > targetValue) return 'Too heavy';
      return 'Too light';
    }
    
    return 'Wrong';
  };

  if (!targetEdible) return <div>Loading...</div>;

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
        <h2>Edibles Challenge</h2>
        <p>Guess the edible item in {maxGuesses} tries!</p>
        <p>Target: {gameWon || gameLost ? targetEdible.name : '???'}</p>
      </div>

      <div className="game-board">
        <div className="stats-grid">
          {guesses.map((guess, guessIndex) => (
            <div key={guessIndex} style={{ gridColumn: 'span 5' }}>
              <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>
                Guess {guessIndex + 1}: {guess.name}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                <div className={`stat-card ${getStatClass(guess.hunger, targetEdible.hunger, 'hunger')}`}>
                  <h4>Hunger</h4>
                  <div className="value">{guess.hunger}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                    {getStatHint(guess.hunger, targetEdible.hunger, 'hunger')}
                  </div>
                </div>
                <div className={`stat-card ${getStatClass(guess.weight, targetEdible.weight, 'weight')}`}>
                  <h4>Weight</h4>
                  <div className="value">{guess.weight}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                    {getStatHint(guess.weight, targetEdible.weight, 'weight')}
                  </div>
                </div>
                <div className={`stat-card ${getStatClass(guess.stamina, targetEdible.stamina, 'stamina')}`}>
                  <h4>Stamina</h4>
                  <div className="value">{guess.stamina}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                    {getStatHint(guess.stamina, targetEdible.stamina, 'stamina')}
                  </div>
                </div>
                <div className={`stat-card ${getStatClass(guess.statusAilment, targetEdible.statusAilment, 'statusAilment')}`}>
                  <h4>Status</h4>
                  <div className="value">{guess.statusAilment}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                    {getStatClass(guess.statusAilment, targetEdible.statusAilment, 'statusAilment') === 'correct' ? 'Correct!' : 'Wrong'}
                  </div>
                </div>
                <div className={`stat-card ${getStatClass(guess.location, targetEdible.location, 'location')}`}>
                  <h4>Location</h4>
                  <div className="value">{guess.location}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                    {getStatClass(guess.location, targetEdible.location, 'location') === 'correct' ? 'Correct!' : 'Wrong'}
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
              placeholder="Enter edible name..."
              onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
            />
            <button onClick={handleGuess} disabled={!currentGuess.trim()}>
              Guess
            </button>
          </div>
        )}

        {gameWon && (
          <div className="game-result win">
            <h3>🎉 Congratulations! You found the edible!</h3>
            <p>You guessed {targetEdible.name} in {guesses.length} tries!</p>
            <button className="new-game-btn" onClick={onBack}>
              Play Again
            </button>
          </div>
        )}

        {gameLost && (
          <div className="game-result lose">
            <h3>😔 Game Over!</h3>
            <p>The edible was: {targetEdible.name}</p>
            <button className="new-game-btn" onClick={onBack}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EdiblesGame;
