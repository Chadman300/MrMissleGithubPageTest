# MR. MISSLE 🚀

A 2D top-down bullet hell game - now playable in your browser!

## 🎮 Play Online

Play the game directly at: **[Your GitHub Pages URL]**

## Game Concept
**Genre:** Bullet Hell  
**Rule:** 1 HP for everyone

## How It Works
- **You have 1 HP** - One hit from any bullet and you die!
- **Boss has multiple phases** - Hit the boss when it's vulnerable (golden glow)!
- **Dodge massive bullet patterns** while trying to reach the boss
- **Graze bullets** (near misses) to earn bonus points and build combos
- **Progressive difficulty** - Each level gets harder with more complex patterns

## 🎯 Controls
- **Move:** WASD or Arrow Keys
- **Navigate Menus:** Arrow Keys or WASD
- **Select:** SPACE or ENTER
- **Pause:** ESC
- **Back:** ESC

## ✨ Features
- 🎯 Precise hitbox system (small red dot on player)
- 💥 15 different bullet patterns including:
  - Spiral attacks
  - Circle bursts
  - Homing missiles
  - Splitting bullets
  - Wave patterns
  - And more!
- 📈 20 levels with increasing difficulty
- 🛒 Upgrade shop with 4 different upgrades:
  - Speed Boost
  - Bullet Time
  - Lucky Dodge
  - Attack Window
- 💾 Progress saves automatically
- ⚡ Smooth 60 FPS gameplay
- 🎨 Beautiful animated backgrounds
- 📱 Works on desktop browsers

## 🖥️ Running Locally

### Web Version (Recommended)
Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari).

For best results, use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Then open http://localhost:8000
```

### Java Version (Original)
```bash
cd src
javac *.java
java App
```

## 🚀 Deploying to GitHub Pages

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add web version of Mr. Missle"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **Deploy from a branch**
   - Select **main** branch and **/ (root)** folder
   - Click **Save**

3. **Access your game:**
   - Your game will be available at: `https://[username].github.io/[repository-name]/`
   - It may take a few minutes for the first deployment

## 🎮 Tips for Survival
1. Focus on the small red dot - that's your actual hitbox
2. Move smoothly and avoid panicking
3. Stay near the edges to have more escape routes
4. Watch for the golden glow - that's when the boss is vulnerable
5. Graze bullets to build combos and earn bonus money
6. Spend money on upgrades between runs!

## 🗂️ Project Structure

```
MrMissleGithubPageTest/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Game styling
├── js/
│   ├── game.js         # Main game controller
│   ├── player.js       # Player class
│   ├── boss.js         # Boss with attack patterns
│   ├── bullet.js       # Bullet system
│   ├── particle.js     # Visual effects
│   ├── renderer.js     # UI rendering
│   ├── gameData.js     # Save/load system
│   └── utils.js        # Utilities & helpers
├── src/                # Original Java source
└── sprites/            # Game sprites
```

## 🎨 Credits

- Game Design & Programming: [Your Name]
- Sound Effects: Various sources (see Licenses folder)
- Sprites: Custom made

## 📜 License

This project is open source. See individual files in the Licenses folder for asset-specific licenses.

---

**Enjoy the game and good luck dodging those bullets! 🎮**

