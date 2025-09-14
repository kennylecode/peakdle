import React, { useState, useEffect, useRef } from 'react';
import badgesData from '../data/badges.json';
import cosmeticsData from '../data/cosmetics.json';
import dateTextToNumberDJB2 from '../dateTextToNumber';
import { hasPlayedToday, getResultToday, getPrimaryGuessesToday, getSecondaryGuessesToday, markAsPlayed } from '../localStorage';
import CountdownTimer from './CountdownTimer';

const BadgesGame = ({ onBack }) => {
  const badgePath = "images/badges/";
  const cosmeticPath = "images/cosmetics/";
  const maxZoomLevel = 20;

  const [badgeOriginW, setBadgeOriginW] = useState(Math.floor((Math.random()) * 80) + 10);
  const [badgeOriginH, setBadgeOriginH] = useState(Math.floor((Math.random()) * 80) + 10);
  const [targetBadge, setTargetBadge] = useState(null);
  const [badgeGuesses, setBadgeGuesses] = useState([]);
  const [badgeGameWon, setBadgeGameWon] = useState(false);
  const [availableBadges, setAvailableBadges] = useState([]);
  const [badgeDropdownOpen, setBadgeDropdownOpen] = useState(false);
  const [badgeFilterText, setBadgeFilterText] = useState('');
  const badgeInputRef = useRef(null);

  const [currentZoomLevel, setCurrentZoomLevel] = useState(maxZoomLevel);
  const [cosmeticGuesses, setCosmeticGuesses] = useState([]);
  const [cosmeticGameWon, setCosmeticGameWon] = useState(false);
  const [availableCosmetics, setAvailableCosmetics] = useState([]);
  const [cosmeticDropdownOpen, setCosmeticDropdownOpen] = useState(false);
  const [cosmeticFilterText, setCosmeticFilterText] = useState('');
  const [hasPlayedBadges, setHasPlayedBadges] = useState(false);
  const badgeDropdownRef = useRef(null);
  const cosmeticDropdownRef = useRef(null);
  const cosmeticInputRef = useRef(null);

  useEffect(() => {
    const badges = sortByName(badgesData);
    const cosmetics = sortByName(cosmeticsData)

    setAvailableBadges(badges);
    setAvailableCosmetics(cosmetics);

    const key = "badges";
    // Check if player has already played today
    const playedToday = hasPlayedToday(key);
    setHasPlayedBadges(playedToday);

    // Select a deterministic badge
    const randomIndex = dateTextToNumberDJB2(new Date(), key, badges.length);
    setTargetBadge(badges[randomIndex]);
    setCurrentZoomLevel(maxZoomLevel);

    if (playedToday) {
      setBadgeGuesses(getPrimaryGuessesToday(key));
      setCosmeticGuesses(getSecondaryGuessesToday(key));
      setBadgeGameWon(true);
      setCosmeticGameWon(true);
    }
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
      if (currentZoomLevel > 0) {
        setCurrentZoomLevel(currentZoomLevel - 1); 
      }
    }
  };

  const getImageStyle = () => {
    const scale = 1 + currentZoomLevel / 5;

    return {
      transformOrigin: `${badgeOriginW}% ${badgeOriginH}%`,
      transform: `scale(${scale})`
    };
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
      // Mark as played today
      markAsPlayed('badges', badgeGuesses.length + cosmeticGuesses.length, badgeGuesses, newGuesses);
      setHasPlayedBadges(true);
    }
  };

  const getBadgeStatClass = (guessedValue, targetValue) => {
    if (guessedValue === targetValue) return 'correct';
    
    return 'incorrect';
  };

  const getCosmeticStatClass = (guessedValue, targetValues) => {
    if (targetValues.length === 1) {
      if (guessedValue === targetValues[0]) 
        return 'correct';
      else
        return 'incorrect';
    }

    if (targetValues.includes(guessedValue))
      return 'partial';

    return 'incorrect';
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

  // Handle timer reset (when new day begins)
  const handleTimerReset = () => {
    setHasPlayedBadges(false);
    // Reset game state for new day
    setBadgeGuesses([]);
    setCosmeticGuesses([]);
    setBadgeGameWon(false);
    setCosmeticGameWon(false);
    setCurrentZoomLevel(maxZoomLevel);
  };

  if (!targetBadge) return <div>Loading...</div>;

  return (
    <div>
      <div className="game-board">
        {hasPlayedBadges && (
          <div className="daily-play-completed">
            <h2>You've completed today's badges challenge!</h2>
            <p>The next challenge will be available in:</p>
            <CountdownTimer onReset={handleTimerReset} />
          </div>
        )}

        {!hasPlayedBadges && (
          <div className="badge-game">
            <div className="badge-image-container">
              <img
                src={targetBadge.imagePath ? badgePath + targetBadge.imagePath : null}
                alt="Badge"
                className="badge-image"
                style={getImageStyle()}
              />
            </div>
          </div>
        )}

        {!badgeGameWon && !hasPlayedBadges && (
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
          <div className="guesses-section">
            <h4>Badge Guesses:</h4>
            <div className="guesses-images">
              {badgeGuesses.map((guess) => (
                <div 
                  key={guess.name}
                  className={`guesses-image ${getBadgeStatClass(guess.name, targetBadge.name)}`}>
                  <img
                    src={guess.imagePath ? badgePath + guess.imagePath : null}
                    alt={guess.name}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {badgeGameWon && (
          <div className="game-result win">
            <h4>🎉 Great! You found the badge! Now guess the cosmetic reward:</h4>
            <p className="cosmetic-description">Which cosmetic goes with the {targetBadge.name}?</p>

            {!cosmeticGameWon && (
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
            )}
          </div>
        )}

        {cosmeticGuesses.length > 0 && (
          <div className="guesses-section">
            <h4>Cosmetic Guesses:</h4>
            <div className="guesses-images">
              {cosmeticGuesses.map((guess) => (
                <div 
                  key={guess.name}
                  className={`guesses-image ${getCosmeticStatClass(guess.name, targetBadge.cosmeticReward)}`}>
                  <img
                    src={guess.imagePath ? cosmeticPath + guess.imagePath : null}
                    alt={guess.name}
                  />
                </div>
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
