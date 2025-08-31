# Peakdle - Peak Wordle Game

A Wordle-style game based on the cooperative game Peak, featuring three unique game modes that challenge players to guess items based on their stats and characteristics.

## 🎮 Game Modes

### 1. Edibles Challenge
- **Objective**: Guess the edible item based on its stats
- **Stats to guess**: Hunger, Weight, Stamina, Status Effects, Locations
- **Gameplay**: Players have 6+ attempts to guess the correct edible
- **Feedback**: Stats show as correct (green), partial (orange), or incorrect (red)

### 2. Equipments Challenge
- **Objective**: Identify the equipment piece using its stats
- **Stats to guess**: Weight, Status Effects, Type, Rarity, Range
- **Gameplay**: Players have 6 attempts to guess the correct equipment
- **Feedback**: Stats show as correct (green), partial (orange), or incorrect (red)

### 3. Badges Challenge
- **Objective**: Guess the badge from a zoomed-in image, then match the achievement reward
- **Gameplay**: 
  - Image starts at maximum zoom (5x) and gradually reveals more with each guess
  - After guessing the badge correctly, players must match it with the correct achievement reward

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd peakdle
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to play the game

### Build for Production
```bash
npm run build
npm run preview
```

## 🎯 How to Play

1. **Choose a Game Mode**: Select from Edibles, Equipments, or Badges
2. **Make Your Guess**: Type the name of an item and submit
3. **Analyze Feedback**: Use the color-coded stat feedback to refine your next guess
4. **Win or Lose**: 
   - Win by guessing correctly within 6 attempts
   - For Badges mode, also correctly match the outfit reward
   - Lose if you run out of attempts

## 🎨 Features

- **Responsive Design**: Works on desktop and mobile devices
- **Visual Feedback**: Color-coded stat feedback system
- **Game History**: Track your performance across all modes
- **Win Rates**: Monitor your success rate for each game mode
- **Modern UI**: Beautiful gradient backgrounds and smooth animations
- **Accessibility**: Keyboard navigation and clear visual indicators

## 🛠️ Technical Details

- **Frontend**: React 18 with modern hooks
- **Build Tool**: Vite for fast development and building
- **Styling**: CSS with modern features and responsive design
- **Data**: JSON files for easy content management
- **State Management**: React useState for local component state

## 🔧 Customization

### Adding New Items
To add new items to any game mode, simply edit the corresponding JSON file:
- `src/data/edibles.json` - Add new edible items
- `src/data/equipments.json` - Add new equipment pieces
- `src/data/badges.json` - Add new badge achievements

### Modifying Game Rules
- Change the difficulty of the Edibles game mode by adding cooked, well-done, burnt, and incinerated items

## 🎯 Game Balance

The game is designed with balanced difficulty:
- **Edibles**: Mix of common and rare items with varied stat ranges
- **Equipment**: Different rarity levels and stat combinations
- **Badges**: Progressive difficulty with zoom mechanics

## 📝 License

This project is based on the Peak co-op game and data/assets from that game, gathered from the following sources. Appreciate the game devs for the amazing game and these info sites for their knowledge base.

- https://steamcommunity.com/sharedfiles/filedetails/?id=3506303339
- https://peakgame.wiki/
- https://peak.wiki.gg/

## 🎮 Enjoy Playing!

Master the mountain in this Peak-inspired Wordle game! Challenge yourself across all three modes and see how well you know the world of Peak.
