import React, { useState, useEffect, useRef } from 'react';
import ediblesData from '../data/edibles/edibles.json';
import ediblesCooked from '../data/edibles/edibles-cooked.json';
import ediblesWellDone from '../data/edibles/edibles-well-done.json';
import ediblesBurnt from '../data/edibles/edibles-burnt.json';
import ediblesIncinerated from '../data/edibles/edibles-incinerated.json';

const EdiblesGame = ({ onComplete, onBack }) => {
  const defaultNumGuesses = 6;
  const srcPath = "src/data/edibles";
  const [targetEdible, setTargetEdible] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState({});
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [maxGuesses, setMaxGuesses] = useState(defaultNumGuesses);
  const [cookingLevel, setCookingLevel] = useState(0); // 0=Base, 1=Cooked, 2=Well-Done, 3=Burnt, 4=Incinerated
  const [availableEdibles, setAvailableEdibles] = useState(ediblesData);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Update available edibles based on cooking level
    let allEdibles = [...ediblesData];
    
    if (cookingLevel >= 1) {
      allEdibles = [...allEdibles, ...ediblesCooked];
    }
    if (cookingLevel >= 2) {
      allEdibles = [...allEdibles, ...ediblesWellDone];
    }
    if (cookingLevel >= 3) {
      allEdibles = [...allEdibles, ...ediblesBurnt];
    }
    if (cookingLevel >= 4) {
      allEdibles = [...allEdibles, ...ediblesIncinerated];
    }
    
    setAvailableEdibles(allEdibles);
    
    // Select a new random edible from the updated pool
    const randomIndex = Math.floor(Math.random() * allEdibles.length);
    setTargetEdible(allEdibles[randomIndex]);
    
    // Reset game state
    setGuesses([]);
    setMaxGuesses(defaultNumGuesses+cookingLevel);
    setGameWon(false);
    setGameLost(false);
    setCurrentGuess({});
  }, [cookingLevel]);

  const handleGuess = () => {
    if (!currentGuess) return;

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess({});

    // Check if won
    if (currentGuess.name === targetEdible.name) {
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
  };

  const getStatArrow = (guessedValue, targetValue) => {
    if (guessedValue === targetValue) return null;
    if (guessedValue > targetValue) return { symbol: '↓', class: 'up' };
    return { symbol: '↑', class: 'down' };
  };

  const getStatClass = (guessedValue, targetValue, statType) => {
    if (guessedValue === targetValue) return 'correct';

    if (statType === 'statusEffect' || statType === 'location') {
      // Handle array comparisons
      if (Array.isArray(guessedValue) && Array.isArray(targetValue)) {
        const commonElements = guessedValue.filter(item => targetValue.includes(item));
        if (commonElements.length > 0) {
          if (commonElements.length === targetValue.length && guessedValue.length === targetValue.length) {
            return 'correct';
          }
          return 'partial';
        }
      }
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
    
    if (statType === 'statusEffect' || statType === 'location') {
      if (Array.isArray(guessedValue) && Array.isArray(targetValue)) {
        const commonElements = guessedValue.filter(item => targetValue.includes(item));
        if (commonElements.length > 0) {
          return `${commonElements.length} correct`;
        }
      }
      return 'Wrong';
    }
    
    return 'Wrong';
  };

  const formatArrayValue = (value) => {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'None';
    }
    return value;
  };

  const getCookingLevelLabel = (level) => {
    const labels = ['Base', 'Cooked', 'Well-Done', 'Burnt', 'Incinerated'];
    return labels[level] || 'Base';
  };

  const getCookingLevelDescription = (level) => {
    const descriptions = [
      'Default',
      'LET. HIM. COOK!',
      'Well, it\'s Done',
      'When you cross the Mesa during the day',
      'Should have waited for the lava to drop in the Caldera'
    ];
    return descriptions[level] || 'Base edibles only';
  };

  if (!targetEdible) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        
        <h2>Edibles Challenge</h2>
        <p>Guess the edible item in {maxGuesses} tries!</p>
        <p>Target: {gameWon || gameLost ? targetEdible.name : '???'}</p>
        
        {/* Cooking Level Slider */}
        <div style={{ margin: '20px 0', padding: '20px', background: '#f7fafc', borderRadius: '8px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>Cooking Level: {getCookingLevelLabel(cookingLevel)}</h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#4a5568' }}>
            {getCookingLevelDescription(cookingLevel)}
          </p>
          <input
            type="range"
            min="0"
            max="4"
            value={cookingLevel}
            onChange={(e) => setCookingLevel(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '20px',
              borderRadius: '5px',
              background: '#e2e8f0',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>

      <div className="game-board">
        <div className="stats-grid">
          {guesses.map((guess, guessIndex) => {
            const hungerArrow = getStatArrow(guess.hunger, targetEdible.hunger);
            const weightArrow = getStatArrow(guess.weight, targetEdible.weight);
            const staminaArrow = getStatArrow(guess.stamina, targetEdible.stamina);
            
            return (
              <div key={guessIndex} style={{ gridColumn: 'span 5' }}>
                <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>
                  Guess {guessIndex + 1}: {guess.name}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                  <div className={`stat-card ${getStatClass(guess.hunger, targetEdible.hunger, 'hunger')}`}>
                    <h4>Hunger</h4>
                    <div className="value">
                      {guess.hunger} {hungerArrow && <span className={`arrow ${hungerArrow.class}`}>{hungerArrow.symbol}</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                      {getStatHint(guess.hunger, targetEdible.hunger, 'hunger')}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.weight, targetEdible.weight, 'weight')}`}>
                    <h4>Weight</h4>
                    <div className="value">
                      {guess.weight} {weightArrow && <span className={`arrow ${weightArrow.class}`}>{weightArrow.symbol}</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                      {getStatHint(guess.weight, targetEdible.weight, 'weight')}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.stamina, targetEdible.stamina, 'stamina')}`}>
                    <h4>Stamina</h4>
                    <div className="value">
                      {guess.stamina} {staminaArrow && <span className={`arrow ${staminaArrow.class}`}>{staminaArrow.symbol}</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                      {getStatHint(guess.stamina, targetEdible.stamina, 'stamina')}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.statusEffect, targetEdible.statusEffect, 'statusEffect')}`}>
                    <h4>Status</h4>
                    <div className="value">{formatArrayValue(guess.statusEffect)}</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                      {getStatHint(guess.statusEffect, targetEdible.statusEffect, 'statusEffect')}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.location, targetEdible.location, 'location')}`}>
                    <h4>Location</h4>
                    <div className="value">{formatArrayValue(guess.location)}</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                      {getStatHint(guess.location, targetEdible.location, 'location')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!gameWon && !gameLost && (
          <div className="guess-input">
            <div className="custom-dropdown" ref={dropdownRef}>
              <div 
                className="dropdown-header"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {currentGuess.name ? (
                  <>
                    <img 
                      src={currentGuess.imageUrl ? srcPath + currentGuess.imageUrl : null} 
                      alt={currentGuess.name}
                      style={{ width: '100px', height: '100px', marginRight: '20px' }}
                    />
                    <span>{currentGuess.name}</span>
                  </>
                ) : (
                  <span style={{ color: '#666' }}>Select an edible...</span>
                )}
                <span style={{ marginLeft: 'auto' }}>▼</span>
              </div>
              
              {dropdownOpen && (
                <div className="dropdown-options">
                  {availableEdibles.map((edible) => (
                    <div
                      key={edible.name}
                      className="dropdown-option"
                      onClick={() => {
                        setCurrentGuess(edible); // Set the entire edible object
                        setDropdownOpen(false);
                      }}
                    >
                      <img 
                        src={edible.imageUrl ? srcPath + edible.imageUrl : null} 
                        alt={edible.name}
                        style={{ width: '100px', height: '100px', marginRight: '20px' }}
                      />
                      <span>{edible.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleGuess} disabled={!currentGuess.name}>
              Guess
            </button>
          </div>
        )}

        {gameWon && (
          <div className="game-result win">
            <h3>🎉 Congratulations! You found the edible!</h3>
            <p>You guessed {targetEdible.name} in {guesses.length} tries!</p>
            <button className="new-game-btn" onClick={onBack}>
              Main Menu
            </button>
          </div>
        )}

        {gameLost && (
          <div className="game-result lose">
            <h3>😔 Game Over!</h3>
            <p>The edible was: {targetEdible.name}</p>
            <button className="new-game-btn" onClick={onBack}>
              Main Menu
            </button>
          </div>
        )}
      </div>

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
        </div>
    </div>
  );
};

export default EdiblesGame;
