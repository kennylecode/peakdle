import React, { useState, useEffect, useRef } from 'react';
import badgesData from '../data/badges.json';
import cosmeticsData from '../data/cosmetics.json';

const BadgesGame = ({ onComplete, onBack }) => {
  const badgePath = "images/badges/";
  const cosmeticPath = "images/cosmetics/";

  const [targetBadge, setTargetBadge] = useState(null);
  const [currentZoomLevel, setCurrentZoomLevel] = useState(5);
  const [guesses, setGuesses] = useState([]);
  const [badgeGameWon, setBadgeGameWon] = useState(false);
  const [cosmeticGameWon, setCosmeticGameWon] = useState(false);
  const [outfitGuessed, setOutfitGuessed] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [badgeDropdownOpen, setBadgeDropdownOpen] = useState(false);
  const [cosmeticDropdownOpen, setCosmeticDropdownOpen] = useState(false);
  const [badgeFilterText, setBadgeFilterText] = useState('');
  const [cosmeticFilterText, setCosmeticFilterText] = useState('');
  const badgeDropdownRef = useRef(null);
  const cosmeticDropdownRef = useRef(null);
  const badgeInputRef = useRef(null);
  const cosmeticInputRef = useRef(null);

  useEffect(() => {
    // Select a random badge as the target
    const randomIndex = Math.floor(Math.random() * badgesData.length);
    setTargetBadge(badgesData[randomIndex]);
  }, []);

  // Handle clicking outside badge dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (badgeDropdownRef.current && !badgeDropdownRef.current.contains(event.target)) {
        setBadgeDropdownOpen(false);
        setBadgeFilterText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle clicking outside cosmetic dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cosmeticDropdownRef.current && !cosmeticDropdownRef.current.contains(event.target)) {
        setCosmeticDropdownOpen(false);
        setCosmeticFilterText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus badge input when component mounts
  useEffect(() => {
    if (badgeInputRef.current) {
      badgeInputRef.current.focus();
    }
  }, []);

  const handleBadgeGuess = (guessedBadge) => {
    if (!guessedBadge) return;

    const newGuess = {
      name: guessedBadge.name,
      correct: guessedBadge.name === targetBadge.name
    };

    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);

    // Check if won
    if (guessedBadge.name === targetBadge.name) {
      setBadgeGameWon(true);
      // Don't complete yet - need to guess outfit
    } else {
      // Zoom out the image
      setCurrentZoomLevel(currentZoomLevel + 1); 
    }
  };

  const handleCosmeticGuess = (cosmetic) => {
    setSelectedOutfit(cosmetic.name);
    const correct = cosmetic.name === targetBadge.cosmeticReward;

    if (correct) {
      onComplete({
        mode: 'badges',
        won: true,
        guesses: guesses.length,
        target: targetBadge.name,
        outfitCorrect: true
      });
    } else {
      setOutfitGuessed(true);
    }
  };

  // Get filtered badges based on search text
  const getFilteredBadges = () => {
    if (!badgeFilterText.trim()) {
      return badgesData;
    }
    return badgesData.filter(badge =>
      badge.name.toLowerCase().includes(badgeFilterText.toLowerCase())
    );
  };

  // Get filtered cosmetics based on search text
  const getFilteredCosmetics = () => {
    if (!cosmeticFilterText.trim()) {
      return cosmeticsData;
    }
    return cosmeticsData.filter(cosmetic =>
      cosmetic.name.toLowerCase().includes(cosmeticFilterText.toLowerCase())
    );
  };

  const getImageStyle = () => {
    const scale = currentZoomLevel / 5;
    return {
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      transition: 'transform 0.5s ease',
      maxWidth: '400px',
      margin: '20px auto',
      borderRadius: '10px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
    };
  };

  if (!targetBadge) return <div>Loading...</div>;

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
        <h2>Badges Challenge</h2>
        <p>Guess the badge from the zoomed image, then match the cosmetic reward!</p>
        <p>Target: {badgeGameWon ? targetBadge.name : '???'}</p>
      </div>

      <div className="game-board">
        <div className="badge-game">
          <h3>Badge Image (Zoom Level: {currentZoomLevel}/5)</h3>
          <div style={{ overflow: 'hidden', maxWidth: '400px', margin: '0 auto' }}>
            <img
              src={targetBadge.imagePath ? badgePath + targetBadge.imagePath : null}
              alt="Badge"
              style={getImageStyle()}
              className="badge-image"
            />
          </div>
        </div>

        {!badgeGameWon && (
          <div className="guess-input">
            <div className="custom-dropdown" ref={badgeDropdownRef}>
              <div
                className="dropdown-header"
                onClick={() => {
                  if (!badgeDropdownOpen) {
                    setBadgeDropdownOpen(true);
                  }
                }}
              >
                <input
                  ref={badgeInputRef}
                  type="text"
                  placeholder="Search badges..."
                  value={badgeFilterText}
                  onChange={(e) => {
                    setBadgeFilterText(e.target.value);
                    if (!badgeDropdownOpen) setBadgeDropdownOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setBadgeDropdownOpen(false);
                      setBadgeFilterText('');
                    } else if (e.key === 'ArrowDown' && !badgeDropdownOpen) {
                      setBadgeDropdownOpen(true);
                    }
                  }}
                  className="dropdown-input"
                />
                <span>▼</span>
              </div>

              {badgeDropdownOpen && (
                <div className="dropdown-options">
                  {getFilteredBadges().map((badge) => (
                    <div
                      key={badge.name}
                      className="dropdown-option"
                      onClick={() => {
                        setBadgeDropdownOpen(false);
                        setBadgeFilterText('');
                        handleBadgeGuess(badge);
                      }}
                    >
                      <span>{badge.name}</span>
                      <span></span>
                    </div>
                  ))}
                  {getFilteredBadges().length === 0 && badgeFilterText.trim() && (
                    <div className="no-results-message">
                      No badges found matching "{badgeFilterText}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {guesses.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4>Your Guesses:</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {guesses.map((guess, index) => (
                <div
                  key={index}
                  style={{
                    padding: '10px 15px',
                    background: guess.correct ? '#48bb78' : '#e53e3e',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}
                >
                  {guess.name} {guess.correct ? '✓' : '✗'}
                </div>
              ))}
            </div>
          </div>
        )}

        {badgeGameWon && !outfitGuessed && (
          <div className="outfit-guess">
            <h4>🎉 Great! You found the badge! Now guess the cosmetic reward:</h4>
            <p style={{ marginBottom: '15px' }}>Which cosmetic goes with the "{targetBadge.name}" badge?</p>

            <div className="guess-input">
              <div className="custom-dropdown" ref={cosmeticDropdownRef}>
                <div
                  className="dropdown-header"
                  onClick={() => {
                    if (!cosmeticDropdownOpen) {
                      setCosmeticDropdownOpen(true);
                    }
                  }}
                >
                  <input
                    ref={cosmeticInputRef}
                    type="text"
                    placeholder="Search cosmetics..."
                    value={cosmeticFilterText}
                    onChange={(e) => {
                      setCosmeticFilterText(e.target.value);
                      if (!cosmeticDropdownOpen) setCosmeticDropdownOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setCosmeticDropdownOpen(false);
                        setCosmeticFilterText('');
                      } else if (e.key === 'ArrowDown' && !cosmeticDropdownOpen) {
                        setCosmeticDropdownOpen(true);
                      }
                    }}
                    className="dropdown-input"
                  />
                  <span>▼</span>
                </div>

                {cosmeticDropdownOpen && (
                  <div className="dropdown-options">
                    {getFilteredCosmetics().map((cosmetic) => (
                      <div
                        key={cosmetic.name}
                        className="dropdown-option"
                        onClick={() => {
                          setCosmeticDropdownOpen(false);
                          setCosmeticFilterText('');
                          handleCosmeticGuess(cosmetic);
                        }}
                      >
                        <img
                        src={cosmetic.imagePath ? cosmeticPath + cosmetic.imagePath : null}
                        alt={cosmetic.name}
                        />
                        <span>{cosmetic.name}</span>
                        <span></span>
                      </div>
                    ))}
                    {getFilteredCosmetics().length === 0 && cosmeticFilterText.trim() && (
                      <div className="no-results-message">
                        No cosmetics found matching "{cosmeticFilterText}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {outfitGuessed && (
          <div className="outfit-guess">
            <h4>Cosmetic Guessed!</h4>
            <div className="outfit-options">
              {cosmeticsData.map((cosmetic) => (
                <div
                  key={cosmetic.name}
                  className={`outfit-option ${
                    cosmetic.name === targetBadge.cosmeticReward
                      ? 'correct'
                      : selectedOutfit === cosmetic.name
                      ? 'incorrect'
                      : ''
                  }`}
                >
                  {cosmetic.name}
                  {cosmetic.name === targetBadge.cosmeticReward && ' ✓'}
                  {selectedOutfit === cosmetic.name && cosmetic.name !== targetBadge.cosmeticReward && ' ✗'}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <p>The correct cosmetic was: <strong>{targetBadge.cosmeticReward}</strong></p>
              <button className="new-game-btn" onClick={onBack}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgesGame;
