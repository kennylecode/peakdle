import React, { useState, useEffect } from 'react';
import badgesData from '../data/badges.json';

const BadgesGame = ({ onComplete, onBack }) => {
  const [targetBadge, setTargetBadge] = useState(null);
  const [currentZoomLevel, setCurrentZoomLevel] = useState(5);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [maxGuesses] = useState(6);
  const [outfitGuessed, setOutfitGuessed] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState(null);

  useEffect(() => {
    // Select a random badge as the target
    const randomIndex = Math.floor(Math.random() * badgesData.length);
    setTargetBadge(badgesData[randomIndex]);
  }, []);

  const handleGuess = () => {
    if (!currentGuess.trim()) return;

    const guessedBadge = badgesData.find(
      badge => badge.name.toLowerCase() === currentGuess.toLowerCase()
    );

    if (guessedBadge) {
      const newGuess = {
        name: guessedBadge.name,
        correct: guessedBadge.name === targetBadge.name
      };

      const newGuesses = [...guesses, newGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      // Zoom out the image
      if (newGuesses.length < maxGuesses) {
        setCurrentZoomLevel(Math.max(1, 5 - newGuesses.length));
      }

      // Check if won
      if (guessedBadge.name === targetBadge.name) {
        setGameWon(true);
        // Don't complete yet - need to guess outfit
      } else if (newGuesses.length >= maxGuesses) {
        setGameLost(true);
        onComplete({
          mode: 'badges',
          won: false,
          guesses: maxGuesses,
          target: targetBadge.name
        });
      }
    }
  };

  const handleOutfitGuess = (outfit) => {
    setSelectedOutfit(outfit);
    const correct = outfit === targetBadge.outfitReward;
    
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

  const getPlaceholderImage = () => {
    // Create a placeholder image since we don't have actual images
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, 400, 300);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(targetBadge?.name || 'Badge', 200, 150);
    ctx.font = '16px Arial';
    ctx.fillText(`Zoom Level: ${currentZoomLevel}/5`, 200, 180);
    
    return canvas.toDataURL();
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
        <p>Guess the badge from the zoomed image, then match the outfit!</p>
        <p>Target: {gameWon || gameLost ? targetBadge.name : '???'}</p>
      </div>

      <div className="game-board">
        <div className="badge-game">
          <h3>Badge Image (Zoom Level: {currentZoomLevel}/5)</h3>
          <div style={{ overflow: 'hidden', maxWidth: '400px', margin: '0 auto' }}>
            <img
              src={getPlaceholderImage()}
              alt="Badge"
              style={getImageStyle()}
              className="badge-image"
            />
          </div>
          
          <p style={{ marginTop: '15px', color: '#718096' }}>
            {targetBadge.description}
          </p>
        </div>

        {!gameWon && !gameLost && (
          <div className="guess-input">
            <input
              type="text"
              value={currentGuess}
              onChange={(e) => setCurrentGuess(e.target.value)}
              placeholder="Enter badge name..."
              onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
            />
            <button onClick={handleGuess} disabled={!currentGuess.trim()}>
              Guess
            </button>
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

        {gameWon && !outfitGuessed && (
          <div className="outfit-guess">
            <h4>🎉 Great! You found the badge! Now guess the outfit reward:</h4>
            <p style={{ marginBottom: '15px' }}>Which outfit goes with the "{targetBadge.name}" badge?</p>
            
            <div className="outfit-options">
              {badgesData.map((badge) => (
                <div
                  key={badge.id}
                  className={`outfit-option ${selectedOutfit === badge.outfitReward ? 'selected' : ''}`}
                  onClick={() => handleOutfitGuess(badge.outfitReward)}
                >
                  {badge.outfitReward}
                </div>
              ))}
            </div>
          </div>
        )}

        {outfitGuessed && (
          <div className="outfit-guess">
            <h4>Outfit Guessed!</h4>
            <div className="outfit-options">
              {badgesData.map((badge) => (
                <div
                  key={badge.id}
                  className={`outfit-option ${
                    badge.outfitReward === targetBadge.outfitReward
                      ? 'correct'
                      : selectedOutfit === badge.outfitReward
                      ? 'incorrect'
                      : ''
                  }`}
                >
                  {badge.outfitReward}
                  {badge.outfitReward === targetBadge.outfitReward && ' ✓'}
                  {selectedOutfit === badge.outfitReward && badge.outfitReward !== targetBadge.outfitReward && ' ✗'}
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <p>The correct outfit was: <strong>{targetBadge.outfitReward}</strong></p>
              <button className="new-game-btn" onClick={onBack}>
                Play Again
              </button>
            </div>
          </div>
        )}

        {gameLost && (
          <div className="game-result lose">
            <h3>😔 Game Over!</h3>
            <p>The badge was: {targetBadge.name}</p>
            <p>The outfit reward was: {targetBadge.outfitReward}</p>
            <button className="new-game-btn" onClick={onBack}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgesGame;
