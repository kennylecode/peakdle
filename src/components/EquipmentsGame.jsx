import React, { useState, useEffect, useRef } from 'react';
import equipmentsData from '../data/equipments.json';
import dateTextToNumberDJB2 from '../dateTextToNumber';
import { hasPlayedToday, getResultToday, getPrimaryGuessesToday, markAsPlayed } from '../localStorage';
import CountdownTimer from './CountdownTimer';

const EquipmentsGame = ({ onComplete, onBack }) => {
  const maxGuesses = 6;
  const srcPath = "images/equipments/";
  const [targetEquipment, setTargetEquipment] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [hasPlayedEquipments, setHasPlayedEquipments] = useState(false);
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
    const allEquipment = sortByEquipmentName(equipmentsData);

    setAvailableEquipment(allEquipment);

    const key = "equipments";
    // Check if player has already played today
    const playedToday = hasPlayedToday(key);
    setHasPlayedEquipments(playedToday);

    // Select a deterministic equipment
    const randomIndex = dateTextToNumberDJB2(new Date(), key, allEquipment.length);
    setTargetEquipment(allEquipment[randomIndex]);

    if (playedToday) {
      const result = getResultToday(key);

      setGuesses(getPrimaryGuessesToday(key));

      if (result === 1) {
        setGameWon(true);
        setGameLost(false);
      } else if (result === 0) {
        setGameWon(false);
        setGameLost(true);
      }
    }
  }, []);

  const handleGuess = (currentGuess) => {
    if (!currentGuess) return;

    const newGuesses = [currentGuess, ...guesses];
    setGuesses(newGuesses);
    setAvailableEquipment(availableEquipment.filter(equipment => equipment.name !== currentGuess.name));

    // Check if won
    if (currentGuess.name === targetEquipment.name) {
      setGameWon(true);
      // Mark as played today
      markAsPlayed('equipments', 1, newGuesses);
      setHasPlayedEquipments(true);
      onComplete({
        mode: 'equipments',
        won: true,
        guesses: newGuesses.length,
        target: targetEquipment.name
      });
    } else if (newGuesses.length >= maxGuesses) {
      setGameLost(true);
      // Mark as played today
      markAsPlayed('equipments', 0, newGuesses);
      setHasPlayedEquipments(true);
      onComplete({
        mode: 'equipments',
        won: false,
        guesses: maxGuesses,
        target: targetEquipment.name
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
        
    if (statType === 'statusEffect') {
      // Handle array comparisons for status effects if they exist
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
      return 'incorrect';
    }
    
    return 'incorrect';
  };

  const getStatHint = (guessedValue, targetValue, statType) => {
    if (guessedValue === targetValue) return 'Correct';
    
    if (statType === 'weight') {
      if (guessedValue > targetValue) return 'Too heavy';
      return 'Too light';
    }
    
    if (statType === 'range') {
      if (guessedValue > targetValue) return 'Too long';
      return 'Too short';
    }
    
    if (statType === 'statusEffect') {
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
      return 'Incorrect';
    }
    
    return 'Incorrect';
  };

  const formatArrayValue = (value) => {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'None';
    }
    return value;
  };

  // Sort equipment array alphabetically by name
  const sortByEquipmentName = (equipmentArray) => {
    return [...equipmentArray].sort((a, b) => a.name.localeCompare(b.name));
  };

  // Get filtered equipment based on search text
  const getFilteredEquipment = () => {
    if (!filterText.trim()) {
      return availableEquipment;
    }
    return availableEquipment.filter(equipment =>
      equipment.name.toLowerCase().includes(filterText.toLowerCase())
    );
  };

  // Handle timer reset (when new day begins)
  const handleTimerReset = () => {
    setHasPlayedEquipments(false);
    // Reset game state for new day
    setGuesses([]);
    setGameWon(false);
    setGameLost(false);
  };

  if (!targetEquipment) return <div>Loading...</div>;

  return (
    <div>
      <div className="game-board">
        {hasPlayedEquipments && (
          <div className="daily-play-completed">
            <h2>You've completed today's equipments challenge!</h2>
            <p>The next challenge will be available in:</p>
            <CountdownTimer onReset={handleTimerReset} />
          </div>
        )}

        {!gameWon && !gameLost && !hasPlayedEquipments && (
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
                  placeholder="Search equipment..."
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
                  {getFilteredEquipment().map((equipment) => (
                    <div
                      key={equipment.name}
                      className="dropdown-option"
                      onClick={() => {
                        setDropdownOpen(false);
                        setFilterText('');
                        handleGuess(equipment);
                      }}
                    >
                      <img
                        src={equipment.imagePath ? srcPath + equipment.imagePath : null}
                        alt={equipment.name}
                      />
                      <span>{equipment.name}</span>
                      <span></span>
                    </div>
                  ))}
                  {getFilteredEquipment().length === 0 && filterText.trim() && (
                    <div className="no-results-message">
                      No equipment found matching "{filterText}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {gameWon && (
          <div className="game-result win">
            <h3>🎉 Congratulations! You found the equipment!</h3>
            <p>You guessed {targetEquipment.name} in {guesses.length} tries!</p>
            <button className="new-game-btn" onClick={onBack}>
              Main Menu
            </button>
          </div>
        )}

        {gameLost && (
          <div className="game-result lose">
            <h3>😞 Game Over!</h3>
            <p>The equipment was: {targetEquipment.name}</p>
            <button className="new-game-btn" onClick={onBack}>
              Main Menu
            </button>
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
                <h4>Weight</h4>
              </div>
              <div className="stat-card header-card" title="Injury, Poison, Cold, Hot, Drowsy, Thorned, Curse">
                <h4>Status Effects (?)</h4>
              </div>
              <div className="stat-card header-card" title="Status Effect, Traversal, Other">
                <h4>Type (?)</h4>
              </div>
              <div className="stat-card header-card" title="Base, Common, Uncommon, Mystical">
                <h4>Rarity (?)</h4>
              </div>
              <div className="stat-card header-card">
                <h4>Range</h4>
              </div>
            </div>
          </div>

          {guesses.map((guess, guessIndex) => {
            const weightArrow = getStatArrow(guess.weight, targetEquipment.weight);
            const rangeArrow = getStatArrow(guess.range, targetEquipment.range);
            
            return (
              <div key={guessIndex} className="guess-row">
                <div className="guess-grid">
                  <div className={`stat-card ${getStatClass(guess.name, targetEquipment.name, null)}`}>
                    <div className="value">
                      {guess.name}
                    </div>
                    <div className="stat-hint">
                      {getStatHint(guess.name, targetEquipment.name, null)}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.weight, targetEquipment.weight, 'weight')}`}>
                    <div className="value">
                      {guess.weight} {weightArrow && <span className={`arrow ${weightArrow.class}`}>{weightArrow.symbol}</span>}
                    </div>
                    <div className="stat-hint">
                      {getStatHint(guess.weight, targetEquipment.weight, 'weight')}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.statusEffect, targetEquipment.statusEffect, 'statusEffect')}`}>
                    <div className="value">{formatArrayValue(guess.statusEffect)}</div>
                    <div className="stat-hint">
                      {getStatHint(guess.statusEffect, targetEquipment.statusEffect, 'statusEffect')}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.type, targetEquipment.type, 'type')}`}>
                    <div className="value">{guess.type}</div>
                    <div className="stat-hint">
                      {getStatHint(guess.type, targetEquipment.type, 'type')}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.rarity, targetEquipment.rarity, 'rarity')}`}>
                    <div className="value">
                      {guess.rarity}
                    </div>
                    <div className="stat-hint">
                      {getStatHint(guess.rarity, targetEquipment.rarity, 'rarity')}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.range, targetEquipment.range, 'range')}`}>
                    <div className="value">
                      {guess.range} {rangeArrow && <span className={`arrow ${rangeArrow.class}`}>{rangeArrow.symbol}</span>}
                    </div>
                    <div className="stat-hint">
                      {getStatHint(guess.range, targetEquipment.range, 'range')}
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

export default EquipmentsGame;