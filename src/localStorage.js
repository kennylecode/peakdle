// Local storage utility for managing daily game plays
// {
//   "badges": {
//      "date": "2025-09-13", 
//      "result": 9 // count of guesses
//    },
//   "edibles-base": {
//      "date": "2025-09-13", 
//      "result": "win" // result of games
//    },
//   "edibles-cooked": {...}
//   "edibles-well-done": {...},
//   "edibles-burnt": {...},
//   "edibles-incinerated": {...},
//   "equipments": {...},
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

  if (dailyPlays[gameModeStr] == null) {
    return false;
  }

  if (dailyPlays[gameModeStr]["date"] == null) {
    return false;
  }

  const prevDateISO = dailyPlays[gameModeStr]["date"];

  return prevDateISO === todayDateISO;
}

// check result of today for a specific game mode
export function getResultToday(gameModeStr) {
  const dailyPlays = getDailyPlays();

  if (dailyPlays[gameModeStr] == null) {
    return 0;
  }

  if (dailyPlays[gameModeStr]["result"] == null) {
    return 0;
  }

  return dailyPlays[gameModeStr]["result"];
}

// check primary guesses of today for a specific game mode
export function getPrimaryGuessesToday(gameModeStr) {
  const dailyPlays = getDailyPlays();

  if (dailyPlays[gameModeStr] == null) {
    return {};
  }

  if (dailyPlays[gameModeStr]["primaryGuesses"] == null) {
    return {};
  }

  return dailyPlays[gameModeStr]["primaryGuesses"];
}

// check secondary guesses of today for a specific game mode
export function getSecondaryGuessesToday(gameModeStr) {
  const dailyPlays = getDailyPlays();

  if (dailyPlays[gameModeStr] == null) {
    return {};
  }

  if (dailyPlays[gameModeStr]["secondaryGuesses"] == null) {
    return {};
  }

  return dailyPlays[gameModeStr]["secondaryGuesses"];
}

// Mark a game mode as played today
export function markAsPlayed(gameModeStr, result = {}, primaryGuesses = {}, secondaryGuesses = {}) {
  const dailyPlays = getDailyPlays();
  const todayDateISO = getISOString(new Date());

  const json = {
    "date": todayDateISO,
    "result": result ,
    "primaryGuesses": primaryGuesses,
    "secondaryGuesses": secondaryGuesses
  }

  dailyPlays[gameModeStr] = json;

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