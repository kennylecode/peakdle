import React, { useState, useEffect, useRef } from 'react';
import ediblesData from '../data/edibles/edibles.json';
import ediblesCooked from '../data/edibles/edibles-cooked.json';
import ediblesWellDone from '../data/edibles/edibles-well-done.json';
import ediblesBurnt from '../data/edibles/edibles-burnt.json';
import ediblesIncinerated from '../data/edibles/edibles-incinerated.json';
import dateTextToNumberDJB2 from '../dateTextToNumber';
import { hasPlayedToday, getResultToday, getPrimaryGuessesToday, markAsPlayed } from '../localStorage';
import CountdownTimer from './CountdownTimer';
import CopyButton from './CopyButton';

const EdiblesGame = ({ onComplete, onBack }) => {
  const defaultNumGuesses = 6;
  const srcPath = "images/edibles/";
  const [targetEdible, setTargetEdible] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [maxGuesses, setMaxGuesses] = useState(defaultNumGuesses);
  const [cookingLevel, setCookingLevel] = useState(0); // 0=Base, 1=Cooked, 2=Well-Done, 3=Burnt, 4=Incinerated
  const [availableEdibles, setAvailableEdibles] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [hasPlayedCurrentLevel, setHasPlayedCurrentLevel] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setFilterText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Update available edibles based on cooking level
    let allEdibles = sortByEdibleName(ediblesData);

    if (cookingLevel >= 1) {
      allEdibles = [...allEdibles, ...sortByEdibleName(ediblesCooked)];
    }
    if (cookingLevel >= 2) {
      allEdibles = [...allEdibles, ...sortByEdibleName(ediblesWellDone)];
    }
    if (cookingLevel >= 3) {
      allEdibles = [...allEdibles, ...sortByEdibleName(ediblesBurnt)];
    }
    if (cookingLevel >= 4) {
      allEdibles = [...allEdibles, ...sortByEdibleName(ediblesIncinerated)];
    }

    setAvailableEdibles(allEdibles);
    
    const key = "edibles-" + cookingLevel;
    // Check if player has already played this cooking level today
    const playedToday = hasPlayedToday(key);
    setHasPlayedCurrentLevel(playedToday);

    // Select a deterministic edible
    const randomIndex = dateTextToNumberDJB2(new Date(), key, allEdibles.length);
    setTargetEdible(allEdibles[randomIndex]);

    if (playedToday) {
      setGuesses(getPrimaryGuessesToday(key))
      const result = getResultToday(key);
      if (result === 1) {
        setGameWon(true);
        setGameLost(false);
      } else if (result === 0) {
        setGameWon(false);
        setGameLost(true);
      }
    } else {
      // Reset game state
      setGuesses([]);
      setMaxGuesses(defaultNumGuesses+cookingLevel);
      setGameWon(false);
      setGameLost(false);
    }
  }, [cookingLevel]);

  const handleGuess = (currentGuess) => {
    if (!currentGuess) return;

    const newGuesses = [currentGuess, ...guesses];
    setGuesses(newGuesses);
    setAvailableEdibles(availableEdibles.filter((edible) => edible.name !== currentGuess.name))

    // Check if won
    if (currentGuess.name === targetEdible.name) {
      setGameWon(true);
      // Mark current cooking level as played
      markAsPlayed('edibles-' + cookingLevel, 1, newGuesses);
      setHasPlayedCurrentLevel(true);
      onComplete({
        mode: 'edibles',
        won: true,
        guesses: newGuesses.length,
        target: targetEdible.name
      });
    } else if (newGuesses.length >= maxGuesses) {
      setGameLost(true);
      // Mark current cooking level as played
      markAsPlayed('edibles-' + cookingLevel, 0, newGuesses);
      setHasPlayedCurrentLevel(true);
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
        if (guessedValue.length === 0 && targetValue.length === 0) return 'correct';

        const commonElements = guessedValue.filter(item => targetValue.includes(item));
        if (commonElements.length > 0) {
          if (commonElements.length === targetValue.length && guessedValue.length === targetValue.length) {
            return 'correct';
          }
          return 'partial';
        }
      }
    }
    
    return 'incorrect';
  };

  const getStatHint = (guessedValue, targetValue, statType) => {
    if (guessedValue === targetValue) return 'Correct';
    
    if (statType === 'hunger' || statType === 'stamina') {
      if (guessedValue > targetValue) return 'Too high';
      return 'Too low';
    }
    
    if (statType === 'weight') {
      if (guessedValue > targetValue) return 'Too heavy';
      return 'Too light';
    }
    
    if (statType === 'statusEffect' || statType === 'location') {
      // Handle array comparisons
      if (Array.isArray(guessedValue) && Array.isArray(targetValue)) {
        if (guessedValue.length === 0 && targetValue.length === 0) return 'Correct';

        const commonElements = guessedValue.filter(item => targetValue.includes(item));
        if (commonElements.length > 0) {
          if (commonElements.length === targetValue.length && guessedValue.length === targetValue.length) {
            return 'Correct';
          }
          return `${commonElements.length} correct`;
        }
      }
    }
    
    return 'Incorrect';
  };

  const getStatsGrid = () => {
    let grid = guesses.map((guess) => 
      [
        getStatClass(guess.name, targetEdible.name, null),
        getStatClass(guess.hunger, targetEdible.hunger, 'hunger'),
        getStatClass(guess.weight, targetEdible.weight, 'weight'),
        getStatClass(guess.stamina, targetEdible.stamina, 'stamina'),
        getStatClass(guess.statusEffect, targetEdible.statusEffect, 'statusEffect'),
        getStatClass(guess.location, targetEdible.location, 'location')
      ]
    );

    return grid;
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
      'When you cross the Mesa during the day',
      'Should have waited for the lava to drop in the Caldera',
      'Lava caught up to you in the Kiln'
    ];
    return descriptions[level] || 'Default';
  };

  // Sort edibles array alphabetically by name
  const sortByEdibleName = (ediblesArray) => {
    return [...ediblesArray].sort((a, b) => a.name.localeCompare(b.name));
  };

  // Get filtered edibles based on search text
  const getFilteredEdibles = () => {
    if (!filterText.trim()) {
      return availableEdibles;
    }
    return availableEdibles.filter(edible =>
      edible.name.toLowerCase().includes(filterText.toLowerCase())
    );
  };

  // Handle timer reset (when new day begins)
  const handleTimerReset = () => {
    setHasPlayedCurrentLevel(false);
    // Reset game state for new day
    setGuesses([]);
    setGameWon(false);
    setGameLost(false);
  };

  const gameWonShareMessage = () => {
    const message = "😎 I figured out what I was eating in " +
      guesses.length + 
      (guesses.length > 1 ? " attempts" : " attempt") +
      " on PEAKdle (" + 
      getCookingLevelLabel(cookingLevel) +
      ")!";
    
    return message;
  }

  const gameLostShareMessage = () => {
    const message = "😵 I didn't know what edibles I was consuming on PEAKdle (" + 
      getCookingLevelLabel(cookingLevel) +
      ")!";

    return message;
  }

  if (!targetEdible) return <div>Loading...</div>;

  return (
    <div>
      <div className="center-content">
        {/* Cooking Level Slider */}
        <div className="cooking-level-container">
          <h3 className="cooking-level-title">Edibles Cooking Level: {getCookingLevelLabel(cookingLevel)} ({maxGuesses} Guesses)</h3>
          <input
            type="range"
            min="0"
            max="4"
            value={cookingLevel}
            onChange={(e) => setCookingLevel(parseInt(e.target.value))}
            className="cooking-level-slider"
          />
          <p className="cooking-level-description">
            {getCookingLevelDescription(cookingLevel)}
          </p>
        </div>
      </div>

      <div className="game-board">
        {hasPlayedCurrentLevel && (
          <div className="daily-play-completed">
            <h2>You've completed today's {getCookingLevelLabel(cookingLevel).toLowerCase()} edibles challenge!</h2>
            <p>The next challenge will be available in:</p>
            <CountdownTimer onReset={handleTimerReset} />
          </div>
        )}

        {!gameWon && !gameLost && !hasPlayedCurrentLevel && (
          <div className="guess-input">
            <div className="custom-dropdown" ref={dropdownRef}>
              <div
                className="dropdown-header"
                onClick={() => {
                  if (!dropdownOpen) {
                    setDropdownOpen(true);
                  }
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search edibles..."
                  value={filterText}
                  onChange={(e) => {
                    setFilterText(e.target.value);
                    if (!dropdownOpen) setDropdownOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setDropdownOpen(false);
                      setFilterText('');
                    } else if (e.key === 'ArrowDown' && !dropdownOpen) {
                      setDropdownOpen(true);
                    }
                  }}
                  className="dropdown-input"
                />
                <span>▼</span>
              </div>

              {dropdownOpen && (
                <div className="dropdown-options">
                  {getFilteredEdibles().map((edible) => (
                    <div
                      key={edible.name}
                      className="dropdown-option"
                      onClick={() => {
                        setDropdownOpen(false);
                        setFilterText('');
                        handleGuess(edible)
                      }}
                    >
                      <img
                        src={edible.imagePath ? srcPath + edible.imagePath : null}
                        alt={edible.name}
                      />
                      <span>{edible.name}</span>
                      <span></span>
                    </div>
                  ))}
                  {getFilteredEdibles().length === 0 && filterText.trim() && (
                    <div className="no-results-message">
                      No edibles found matching "{filterText}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {gameWon && (
          <div className="game-result win">
            <h3>🎉 Congratulations! You found the edible!</h3>
            <p>You guessed {targetEdible.name} in {guesses.length} {(guesses.length > 1 ? "tries" : "try")}!</p>
            <CopyButton
              buttonText="Copy Edibles Guesses"
              message={gameWonShareMessage()}
              statsGrid={getStatsGrid()}
            />
          </div>
        )}

        {gameLost && (
          <div className="game-result lose">
            <h3>😔 Game Over!</h3>
            <p>The edible was: {targetEdible.name}</p>
            <CopyButton
              buttonText="Copy Edibles Guesses"
              message={gameLostShareMessage()}
              statsGrid={getStatsGrid()}
            />
          </div>
        )}

        <div className="stats-grid">
          {/* Column Headers */}
          <div className="column-headers-row">
            <div className="column-headers-grid">
              <div className="stat-card header-card">
                <h4>Name</h4>
              </div>
              <div className="stat-card header-card">
                <h4>Hunger</h4>
              </div>
              <div className="stat-card header-card">
                <h4>Weight</h4>
              </div>
              <div className="stat-card header-card">
                <h4>Stamina</h4>
              </div>
              <div className="stat-card header-card" title="Injury, Poison, Cold, Hot, Drowsy, Thorned">
                <h4>Status Effects (?)</h4>
              </div>
              <div className="stat-card header-card" title="Shore, Tropics, Alpine, Mesa, Caldera, Kiln">
                <h4>Locations (?)</h4>
              </div>
            </div>
          </div>

          {guesses.map((guess, guessIndex) => {
            const hungerArrow = getStatArrow(guess.hunger, targetEdible.hunger);
            const weightArrow = getStatArrow(guess.weight, targetEdible.weight);
            const staminaArrow = getStatArrow(guess.stamina, targetEdible.stamina);
            
            return (
              <div key={guessIndex} className="guess-row">
                <div className="guess-grid">
                  <div className={`stat-card ${getStatClass(guess.name, targetEdible.name, null)}`}>
                    <div className="value">
                      {guess.name}
                    </div>
                    <div className="stat-hint">
                      {getStatHint(guess.name, targetEdible.name, null)}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.hunger, targetEdible.hunger, 'hunger')}`}>
                    <div className="value">
                      {guess.hunger} {hungerArrow && <span className={`arrow ${hungerArrow.class}`}>{hungerArrow.symbol}</span>}
                    </div>
                    <div className="stat-hint">
                      {getStatHint(guess.hunger, targetEdible.hunger, 'hunger')}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.weight, targetEdible.weight, 'weight')}`}>
                    <div className="value">
                      {guess.weight} {weightArrow && <span className={`arrow ${weightArrow.class}`}>{weightArrow.symbol}</span>}
                    </div>
                    <div className="stat-hint">
                      {getStatHint(guess.weight, targetEdible.weight, 'weight')}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.stamina, targetEdible.stamina, 'stamina')}`}>
                    <div className="value">
                      {guess.stamina} {staminaArrow && <span className={`arrow ${staminaArrow.class}`}>{staminaArrow.symbol}</span>}
                    </div>
                    <div className="stat-hint">
                      {getStatHint(guess.stamina, targetEdible.stamina, 'stamina')}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.statusEffect, targetEdible.statusEffect, 'statusEffect')}`}>
                    <div className="value">{formatArrayValue(guess.statusEffect)}</div>
                    <div className="stat-hint">
                      {getStatHint(guess.statusEffect, targetEdible.statusEffect, 'statusEffect')}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.location, targetEdible.location, 'location')}`}>
                    <div className="value">{formatArrayValue(guess.location)}</div>
                    <div className="stat-hint">
                      {getStatHint(guess.location, targetEdible.location, 'location')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="center-content">
        <button
            onClick={onBack}
            className="back-button"
          >
            ← Back to Menu
          </button>
        </div>
    </div>
  );
};

export default EdiblesGame;
