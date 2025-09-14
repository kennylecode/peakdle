import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ onReset }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Calculate initial time until midnight
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow.getTime() - now.getTime();
    };

    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // If time is up, call onReset callback
      if (newTimeLeft <= 0 && onReset) {
        onReset();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onReset]);

  const formatTime = (milliseconds) => {
    if (milliseconds <= 0) return '00:00:00';

    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="countdown-timer">
      <div className="countdown-display">
        <span className="countdown-time">{formatTime(timeLeft)}</span>
      </div>
      <p className="countdown-text">New {timeLeft <= 0 ? 'game available!' : 'game in:'}</p>
    </div>
  );
};

export default CountdownTimer;
