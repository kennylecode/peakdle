// Local storage utility for managing daily game plays
// New structure example:
// {
//   "badges": "2025-09-13",
//   "edibles-base": "2025-09-13",
//   "edibles-cooked": "2025-09-12",
//   "edibles-well-done": "2025-09-11",
//   "edibles-burnt": "2025-09-10",
//   "edibles-incinerated": "2025-09-09",
//   "equipments": "2025-09-13"
// }
const STORAGE_KEY = 'peakdle-daily-plays';

// Get date string in YYYY-MM-DD format
function getISOString(date) {
  return date.toISOString().split('T')[0];
}

// Get stored daily plays data
function getDailyPlays() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const data = JSON.parse(stored);

    return data;
  } catch (error) {
    console.error('Error reading daily plays from localStorage:', error);
    return {};
  }
}

// Save daily plays data
function saveDailyPlays(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving daily plays to localStorage:', error);
  }
}

// Check if player has already played today for a specific game mode
export function hasPlayedToday(gameModeStr) {
  const dailyPlays = getDailyPlays();
  const todayDateISO = getISOString(new Date());

  if (dailyPlays[gameModeStr] === null) {
    return false;
  }

  const prevDateISO = dailyPlays[gameModeStr];

  return prevDateISO === todayDateISO;
}

// Mark a game mode as played today
export function markAsPlayed(gameModeStr) {
  const dailyPlays = getDailyPlays();
  const todayDateISO = getISOString(new Date());

  dailyPlays[gameModeStr] = todayDateISO;

  saveDailyPlays(dailyPlays);
}

// Get time until next daily reset (tomorrow at midnight)
export function getTimeUntilReset() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return tomorrow.getTime() - now.getTime();
}