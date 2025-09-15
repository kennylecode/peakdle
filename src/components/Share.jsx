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

const copyShareGrid = (message, gridText) => {
    const copiedText = `${message}\n${gridText}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(copiedText);
    } else {
      // fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

const Share = ({ buttonText, message, statsGrid }) => {
  const grid = getEmojiGrid(statsGrid);

  console.log(grid);
  
  return (
    <div>
        <div className = "share-game-container">
            {grid}
        </div>
        <button className="share-game-btn" onClick={copyShareGrid(message, grid)} title="Copy results to clipboard" >
          {buttonText}
        </button>
    </div>
  );
};

export default Share;