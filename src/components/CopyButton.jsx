import React from 'react';

const statToEmoji = (stat) => {
  if (stat === 'correct') return '🟩';
  if (stat === 'partial') return '🟨';
  return '🟥';
};

const getEmojiGrid = (statsGrid) => {
  const grid = statsGrid
    .map((row) => 
      row.map((stat) => 
        statToEmoji(stat)
      ).join('')
    ).join('\n');

  return grid;
};

const copyShareGrid = async (message, gridText) => {
  const dateStr = new Date().toLocaleDateString();
  const copiedText = `${dateStr}\n${message}\n${gridText}\n${window.location.href}`;
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(copiedText);
      // console.log('Text copied to clipboard!');
    } else {
      // fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = copiedText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      // console.log('Text copied to clipboard! (fallback)');
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};

const CopyButton = ({ buttonText, message, statsGrid }) => {
  const grid = getEmojiGrid(statsGrid);
  const dateStr = new Date().toLocaleDateString();
  const handleCopyClick = () => copyShareGrid(message, grid);
  
  return (
    <div className = "share-game-container">
        <div>
          {dateStr}
          <div className = "share-game-message">
            {message}
          </div>
          <div className = "share-game-grid">
            {grid}
          </div>
          <div className = "share-game-url">
            {document.location.href}
          </div>
        </div>
        <button className="share-game-btn" onClick={handleCopyClick} title="Copy results to clipboard" >
          {buttonText}
        </button>
    </div>
  );
};

export default CopyButton;