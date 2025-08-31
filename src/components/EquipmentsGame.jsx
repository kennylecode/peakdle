import React, { useState, useEffect, useRef } from 'react';
import equipmentsData from '../data/equipments.json';

const EquipmentsGame = ({ onComplete, onBack }) => {
  const [targetEquipment, setTargetEquipment] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [maxGuesses] = useState(6);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const inputRef = useRef(null);

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

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.closest('.custom-dropdown')) {
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
    // Set up available equipment (sorted)
    const sortedEquipment = sortByEquipmentName(equipmentsData);
    setAvailableEquipment(sortedEquipment);

    // Select a random equipment as the target
    const randomIndex = Math.floor(Math.random() * sortedEquipment.length);
    setTargetEquipment(sortedEquipment[randomIndex]);
  }, []);

  const handleGuess = (selectedEquipment) => {
    if (!selectedEquipment) return;

    const newGuess = {
      name: selectedEquipment.name,
      weight: selectedEquipment.weight,
      statusAilment: selectedEquipment.statusAilment,
      type: selectedEquipment.type,
      rarity: selectedEquipment.rarity,
      range: selectedEquipment.range
    };

    const newGuesses = [newGuess, ...guesses];
    setGuesses(newGuesses);
    setDropdownOpen(false);
    setFilterText('');

    // Check if won
    if (selectedEquipment.name === targetEquipment.name) {
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

    if (statType === 'statusAilment') {
      return guessedValue === targetValue ? 'Correct!' : 'Wrong';
    }

    if (statType === 'type') {
      return guessedValue === targetValue ? 'Correct!' : 'Wrong';
    }

    if (statType === 'rarity') {
      return guessedValue === targetValue ? 'Correct!' : 'Wrong';
    }

    return 'Incorrect';
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
      <div className="center-content">
        <h2>Equipments Challenge</h2>
        <p>Guess the equipment piece in {maxGuesses} tries!</p>
        <p>Target: {gameWon || gameLost ? targetEquipment.name : '???'}</p>
      </div>

      <div className="game-board">
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
              <div className="stat-card header-card">
                <h4>Status Effects</h4>
              </div>
              <div className="stat-card header-card">
                <h4>Type</h4>
              </div>
              <div className="stat-card header-card">
                <h4>Rarity</h4>
              </div>
              <div className="stat-card header-card">
                <h4>Range</h4>
              </div>
            </div>
          </div>

          {/* Guesses */}
          {guesses.map((guess, guessIndex) => {
            const weightArrow = guess.weight !== targetEquipment.weight ?
              (guess.weight > targetEquipment.weight ? '↓' : '↑') : null;
            const rangeArrow = guess.range !== targetEquipment.range ?
              (guess.range > targetEquipment.range ? '↓' : '↑') : null;

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
                      {guess.weight} {weightArrow && <span className={`arrow ${weightArrow === '↓' ? 'down' : 'up'}`}>{weightArrow}</span>}
                    </div>
                    <div className="stat-hint">
                      {getStatHint(guess.weight, targetEquipment.weight, 'weight')}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.statusAilment, targetEquipment.statusAilment, 'statusAilment')}`}>
                    <div className="value">{guess.statusAilment}</div>
                    <div className="stat-hint">
                      {getStatHint(guess.statusAilment, targetEquipment.statusAilment, 'statusAilment')}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.type, targetEquipment.type, 'type')}`}>
                    <div className="value">{guess.type}</div>
                    <div className="stat-hint">
                      {getStatHint(guess.type, targetEquipment.type, 'type')}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.rarity, targetEquipment.rarity, 'rarity')}`}>
                    <div className="value" style={{ color: getRarityColor(guess.rarity) }}>
                      {guess.rarity}
                    </div>
                    <div className="stat-hint">
                      {getStatHint(guess.rarity, targetEquipment.rarity, 'rarity')}
                    </div>
                  </div>
                  <div className={`stat-card ${getStatClass(guess.range, targetEquipment.range, 'range')}`}>
                    <div className="value">
                      {guess.range} {rangeArrow && <span className={`arrow ${rangeArrow === '↓' ? 'down' : 'up'}`}>{rangeArrow}</span>}
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

        {!gameWon && !gameLost && (
          <div className="guess-input">
            <div className="custom-dropdown">
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
                      onClick={() => handleGuess(equipment)}
                    >
                      <span>{equipment.name}</span>
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
            <h3>😔 Game Over!</h3>
            <p>The equipment was: {targetEquipment.name}</p>
            <button className="new-game-btn" onClick={onBack}>
              Main Menu
            </button>
          </div>
        )}
      </div>

      <div className="center-content">
        <button onClick={onBack} className="back-button">
          ← Back to Menu
        </button>
      </div>
    </div>
  );
};

export default EquipmentsGame;
