# Code Structure - One Hit Man

## Overview
The codebase has been refactored into separate, focused classes for better organization and maintainability.

## File Structure

### Core Game Files

#### **App.java**
- Entry point of the application
- Creates JFrame and initializes Game panel
- Handles window setup

#### **Game.java** (276 lines)
- Main game controller
- Manages game loop and state transitions
- Coordinates between all systems
- Handles input processing
- Delegates rendering to Renderer class

### State Management

#### **GameState.java**
- Enum defining all possible game states
- States: MENU, INFO, STATS, LEVEL_SELECT, PLAYING, GAME_OVER, WIN, SHOP

#### **GameData.java**
- Manages all persistent game data
- Tracks score, money, survival time
- Manages level progression (current level, max unlocked)
- Stores upgrade levels (purchased and active)
- Provides getters/setters for all data
- Handles upgrade allocation logic

### Systems

#### **ShopManager.java**
- Manages shop interface
- Handles item selection
- Processes purchases
- Calculates item costs (scales with upgrade level)
- Provides shop item descriptions

#### **Renderer.java**
- Handles all rendering/drawing
- Draws all game screens:
  - Menu
  - Info page
  - Stats & loadout screen
  - Level select grid
  - Game (players, boss, bullets, HUD)
  - Shop
  - Game over / Win screens
- Manages gradient backgrounds
- Draws upgrade allocation UI with progress bars

### Game Objects

#### **Player.java**
- Player movement with acceleration physics
- Velocity, friction, and speed multipliers
- Collision detection
- Supports speed upgrades (15% per level)

#### **Boss.java**
- Boss AI with 12 attack patterns
- Geometric shape rendering (sides = level + 2)
- Fires 9 different bullet types
- Adapts difficulty based on level

#### **Bullet.java**
- 9 bullet types with unique behaviors:
  - NORMAL, FAST, LARGE
  - HOMING (tracks player)
  - BOUNCING (reflects off walls)
  - SPIRAL (rotates while moving)
  - SPLITTING (divides into 4)
  - ACCELERATING (speeds up over time)
  - WAVE (sine wave pattern)
- Warning system (45 frames)
- Slow effect support for upgrades

## Architecture Benefits

### Separation of Concerns
- **Game.java**: Game logic and coordination
- **Renderer.java**: All visual representation
- **GameData.java**: Data management
- **ShopManager.java**: Shop-specific logic

### Easy to Modify
- **Adding new upgrade**: Modify GameData and ShopManager
- **Adding new screen**: Add to GameState enum and Renderer
- **Changing visuals**: Only touch Renderer.java
- **Adjusting gameplay**: Modify Game.java logic

### Maintainability
- Each file has a single, clear responsibility
- No duplicate code
- Easy to locate specific functionality
- Smaller files (250-350 lines vs original 950+ lines)

## Data Flow

```
App → Game (main controller)
      ↓
      ├→ GameData (state & progression)
      ├→ ShopManager (uses GameData)
      ├→ Renderer (uses GameData & ShopManager)
      ├→ Player, Boss, Bullets (game objects)
      └→ Input handling (KeyAdapter)
```

## Key Features

### Upgrade System
- **Purchased Upgrades**: Bought from shop using money
- **Active Upgrades**: Allocated from purchased upgrades
- **Allocation**: Players can customize which upgrades are active via Stats screen

### Progression
- 100 levels supported
- Bosses gain geometric complexity (sides) each level
- Money earned from boss defeats and survival time
- First-time boss defeat bonuses
- Persistent currency across runs

### Visual System
- Dynamic gradient backgrounds (7 color schemes)
- Geometric boss shapes with depth layers
- Progress bars for upgrade allocation
- Color-coded UI elements
- Smooth animations

## File Count
- **Core**: 3 files (App, Game, GameState)
- **Data**: 1 file (GameData)
- **Systems**: 2 files (ShopManager, Renderer)
- **Objects**: 3 files (Player, Boss, Bullet)

**Total**: 9 organized files vs 1 monolithic 950+ line file
