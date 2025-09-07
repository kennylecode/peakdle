import React, { useState, useEffect, useRef } from 'react';
import badgesData from '../data/badges.json';
import cosmeticsData from '../data/cosmetics.json';

const BadgesGame = ({ onBack }) => {
  const badgePath = "images/badges/";
  const cosmeticPath = "images/cosmetics/";

  const [targetBadge, setTargetBadge] = useState(null);
  const [badgeGuesses, setBadgeGuesses] = useState([]);
  const [badgeGameWon, setBadgeGameWon] = useState(false);
  const [availableBadges, setAvailableBadges] = useState([]);
  const [badgeDropdownOpen, setBadgeDropdownOpen] = useState(false);
  const [badgeFilterText, setBadgeFilterText] = useState('');
  const badgeInputRef = useRef(null);

  const [currentZoomLevel, setCurrentZoomLevel] = useState(5);
  const [cosmeticGuesses, setCosmeticGuesses] = useState([]);
  const [cosmeticGameWon, setCosmeticGameWon] = useState(false);
  const [availableCosmetics, setAvailableCosmetics] = useState([]);
  const [cosmeticDropdownOpen, setCosmeticDropdownOpen] = useState(false);
  const [cosmeticFilterText, setCosmeticFilterText] = useState('');
  const badgeDropdownRef = useRef(null);
  const cosmeticDropdownRef = useRef(null);
  const cosmeticInputRef = useRef(null);

  useEffect(() => {
    const badges = sortByName(badgesData);
    const cosmetics = sortByName(cosmeticsData)
    
    setAvailableBadges(badges);
    setAvailableCosmetics(cosmetics);

    // Select a random badge as the target
    const randomIndex = Math.floor(Math.random() * badges.length);
    setTargetBadge(badges[randomIndex]);
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

    const newGuesses = [guessedBadge, ...badgeGuesses];
    setBadgeGuesses(newGuesses);
    setAvailableBadges(availableBadges.filter(badge => badge.name !== guessedBadge.name));

    // Check if won
    if (guessedBadge.name === targetBadge.name) {
      setBadgeGameWon(true);
      // Don't complete yet - need to guess outfit
    } else {
      // Zoom out the image
      setCurrentZoomLevel(currentZoomLevel + 1); 
    }
  };

  const handleCosmeticGuess = (guessedCosmetic) => {
    if (!guessedCosmetic) return;
    
    const newGuesses = [guessedCosmetic, ...cosmeticGuesses];
    setCosmeticGuesses(newGuesses);
    setAvailableCosmetics(availableCosmetics.filter(cosmetic => cosmetic.name !== guessedCosmetic.name));

    let allCosmeticsSelected = true; 

    for (const cosmeticReward of targetBadge.cosmeticReward) {
      if (!newGuesses.map(guesses => guesses.name).includes(cosmeticReward)) {
        allCosmeticsSelected = false;
      }
    }

    if (allCosmeticsSelected) {
      setCosmeticGameWon(true);
    }
  };

  // Get filtered badges based on search text
  const getFilteredBadges = () => {
    if (!badgeFilterText.trim()) {
      return availableBadges;
    }
    return availableBadges.filter(badge =>
      badge.name.toLowerCase().includes(badgeFilterText.toLowerCase())
    );
  };

  // Get filtered cosmetics based on search text
  const getFilteredCosmetics = () => {
    if (!cosmeticFilterText.trim()) {
      return availableCosmetics;
    }
    return availableCosmetics.filter(cosmetic =>
      cosmetic.name.toLowerCase().includes(cosmeticFilterText.toLowerCase())
    );
  };

   // Sort array alphabetically by name
   const sortByName = (array) => {
    return [...array].sort((a, b) => a.name.localeCompare(b.name));
  };

  if (!targetBadge) return <div>Loading...</div>;

  return (
    <div>
      <div className="game-board">
        <div className="badge-game">
          <div style={{ overflow: 'hidden', minWidth: '400px', margin: '0 auto' }}>
            <img
              src={targetBadge.imagePath ? badgePath + targetBadge.imagePath : null}
              alt="Badge"
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

        {badgeGuesses.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h4>Badge Guesses:</h4>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {badgeGuesses.map((guess) => (
                <img
                  src={guess.imagePath ? badgePath + guess.imagePath : null}
                  alt={guess.name}
                />
              ))}
            </div>
          </div>
        )}

        {badgeGameWon && !cosmeticGameWon && (
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

        {cosmeticGuesses.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h4>Cosmetic Guesses:</h4>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {cosmeticGuesses.map((guess) => (
                <img
                  src={guess.imagePath ? cosmeticPath + guess.imagePath : null}
                  alt={guess.name}
                />
              ))}
            </div>
          </div>
        )}

        {cosmeticGameWon && (
          <div className="game-result win">
            <h3>🎉 Congratulations! You found the cosmetic!</h3>
            <p>You guessed {targetBadge.cosmeticReward.join(', ')} in {cosmeticGuesses.length} tries!</p>
            <button className="new-game-btn" onClick={onBack}>
              Main Menu
            </button>
          </div>
        )}
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

export default BadgesGame;
