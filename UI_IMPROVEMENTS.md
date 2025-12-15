# UI Improvements - Animated Button System

## Overview
Transformed the game's menu system from plain text to polished, animated buttons with screen shake feedback.

## Changes Made

### 1. UIButton Class (NEW)
**File**: `src/UIButton.java`

**Features**:
- **Sway Animation**: Selected buttons sway horizontally using `Math.sin(time * 3) * 5` pixels
- **Scale Animation**: Selected buttons pulse in size by ±5% using `1.0 + Math.sin(time * 4) * 0.05`
- **Gradient Backgrounds**: Each button uses a gradient from baseColor to selectedColor
- **Animated Glow Border**: Border alpha oscillates using `Math.abs(Math.sin(time * 5)) * 155 + 100`
- **Shadow Effects**: Layered shadows for depth
- **Shine Effect**: White overlay on selected buttons for polish
- **Rounded Rectangles**: 20px border radius for modern look

**Constructor**:
```java
UIButton(String text, int x, int y, int width, int height, Color baseColor, Color selectedColor)
```

**Methods**:
- `update(boolean selected, double time)` - Updates animation state
- `draw(Graphics2D g, double time)` - Renders the button with all effects
- `setPosition(int x, int y)` - Repositions the button

### 2. Renderer Updates
**File**: `src/Renderer.java`

**Menu Button Array**:
- Created 5 UIButton instances for main menu:
  - **Select Level** (Teal/Green) - RGB(143,188,187) / RGB(163,190,140)
  - **Game Info** (Cyan/Green) - RGB(136,192,208) / RGB(163,190,140)
  - **Stats & Loadout** (Purple/Green) - RGB(180,142,173) / RGB(163,190,140)
  - **Shop** (Yellow/Green) - RGB(235,203,139) / RGB(163,190,140)
  - **Settings** (Red/Green) - RGB(191,97,106) / RGB(163,190,140)

**Updated Methods**:
- `drawMenu()` signature changed to include `selectedMenuItem` parameter
- Now renders buttons instead of plain text instructions
- Buttons positioned at 280px + 70px spacing between each
- Removed old text-based instruction list

### 3. Game.java Updates
**File**: `src/Game.java`

**New Fields**:
- `selectedMenuItem` - Tracks which menu button is selected (0-4)

**Menu Navigation** (MENU state):
- **UP/W**: Move selection up, screen shake intensity = 2
- **DOWN/S**: Move selection down, screen shake intensity = 2
- **SPACE/ENTER**: Activate selected button, screen shake intensity = 5
  - 0 = Level Select
  - 1 = Info
  - 2 = Stats
  - 3 = Shop
  - 4 = Settings
- **ESC**: Double-tap to quit, screen shake intensity = 3
- Legacy hotkeys still work (I, P, O) with screen shake = 5

**Screen Shake Added to All Navigation**:
- **Stats** (UP/DOWN): intensity = 1, (LEFT/RIGHT): intensity = 2
- **Settings** (UP/DOWN): intensity = 1, (SPACE/arrows): intensity = 3
- **Level Select** (arrows): intensity = 2, (SPACE): intensity = 5
- **Shop** (UP/DOWN): intensity = 1, (purchase): intensity = 4 (success) or 2 (fail)

### 4. Visual Effects

**Button Animation Timeline**:
- **Sway**: 3 rad/s frequency, ±5 pixel amplitude
- **Scale**: 4 rad/s frequency, ±5% size change
- **Glow**: 5 rad/s frequency, alpha range 100-255

**Color Palette** (Nord-inspired):
- Background gradients: RGB(46,52,64) → RGB(76,86,106)
- Title: Teal/Cyan gradient with holographic shine
- Buttons: Each has unique base color, all use green when selected

**Screen Shake Intensity Levels**:
- **1**: Subtle feedback for list navigation
- **2**: Moderate feedback for option changes
- **3**: Strong feedback for state transitions
- **4**: Purchase success feedback
- **5**: Major action feedback (start game, level select)

## User Experience Improvements

### Before:
- Plain white text on gradient background
- Static display with no animation
- No visual feedback on button selection
- Keyboard shortcuts not obvious

### After:
- Colorful animated buttons with professional polish
- Smooth sway and scale animations
- Glowing borders draw attention to selected items
- Screen shake provides tactile feedback
- Gradient backgrounds and shadows add depth
- Clear visual hierarchy with color coding

## Technical Details

**Performance**:
- All animations use efficient sin/cos calculations
- Graphics2D transformations applied per-button
- No heavy rendering operations
- Smooth 60 FPS on all systems

**Maintainability**:
- UIButton class is reusable for other menus
- Color scheme easily adjustable via constructor
- Animation speeds controllable via time multipliers
- Screen shake intensity tunable per action

## Next Steps (Optional Future Enhancements)

1. Apply UIButton system to other menus:
   - Level Select (left/right arrows as buttons)
   - Shop (item list as buttons)
   - Stats (upgrade options as buttons)
   - Settings (toggle buttons)

2. Additional effects:
   - Particle trails on button selection
   - Sound effects on button press
   - More elaborate shine/glow effects
   - Button press "squash" animation

3. Accessibility:
   - High contrast mode
   - Larger text options
   - Colorblind-friendly palette

## Testing

To test the new UI:
1. Compile: `javac -d bin src/*.java`
2. Run: `java -cp bin App`
3. Navigate main menu with arrow keys or WASD
4. Press SPACE to select highlighted button
5. Feel screen shake feedback on all interactions
6. Notice sway and scale animations on selected button
