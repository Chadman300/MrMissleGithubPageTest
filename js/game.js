// Main game controller

const GameState = {
    LOADING: 'loading',
    MENU: 'menu',
    HOW_TO_PLAY: 'howToPlay',
    UPGRADES: 'upgrades',
    SETTINGS: 'settings',
    LEVEL_SELECT: 'levelSelect',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    WIN: 'win'
};

class Game {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize systems
        this.input = new InputManager();
        this.sound = new SoundManager();
        this.screenShake = new ScreenShake();
        this.particles = new ParticleSystem();
        this.bullets = new BulletManager();
        this.gameData = new GameData();
        this.renderer = new Renderer(this.ctx, this.width, this.height);
        
        // Game state
        this.state = GameState.LOADING;
        this.previousState = null;
        this.selectedMenuItem = 0;
        this.selectedUpgrade = 0;
        this.selectedSetting = 0;
        this.selectedLevel = 1;
        
        // Game objects
        this.player = null;
        this.boss = null;
        
        // Game stats
        this.score = 0;
        this.grazeCount = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.gameTime = 0;
        this.currentLevel = 1;
        
        // Animation/timing
        this.lastTime = 0;
        this.deltaTime = 0;
        this.loadingProgress = 0;
        
        // Start loading
        this.startLoading();
    }
    
    resizeCanvas() {
        // Use window size but maintain aspect ratio
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        if (this.renderer) {
            this.renderer.width = this.width;
            this.renderer.height = this.height;
        }
    }
    
    startLoading() {
        // Simulate loading (can add actual asset loading here)
        const loadingBar = document.getElementById('loading-bar');
        const loadingText = document.getElementById('loading-text');
        
        const loadSteps = [
            { progress: 20, text: 'Loading game systems...' },
            { progress: 40, text: 'Initializing player...' },
            { progress: 60, text: 'Preparing boss patterns...' },
            { progress: 80, text: 'Setting up particles...' },
            { progress: 100, text: 'Ready!' }
        ];
        
        let stepIndex = 0;
        const loadInterval = setInterval(() => {
            if (stepIndex < loadSteps.length) {
                const step = loadSteps[stepIndex];
                loadingBar.style.width = step.progress + '%';
                loadingText.textContent = step.text;
                stepIndex++;
            } else {
                clearInterval(loadInterval);
                setTimeout(() => {
                    document.getElementById('loading-screen').classList.add('hidden');
                    this.state = GameState.MENU;
                    this.start();
                }, 500);
            }
        }, 300);
    }
    
    start() {
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    gameLoop(currentTime = 0) {
        // Calculate delta time
        this.deltaTime = Math.min((currentTime - this.lastTime) / 16.67, 2); // Cap at 2x speed
        this.lastTime = currentTime;
        
        // Update and render
        this.update();
        this.render();
        
        // Clear input states
        this.input.clearJustPressed();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update() {
        // Update screen shake
        this.screenShake.update();
        
        // Update renderer animations
        this.renderer.update(this.deltaTime);
        
        // State-specific updates
        switch (this.state) {
            case GameState.MENU:
                this.updateMenu();
                break;
            case GameState.HOW_TO_PLAY:
                this.updateHowToPlay();
                break;
            case GameState.UPGRADES:
                this.updateUpgrades();
                break;
            case GameState.SETTINGS:
                this.updateSettings();
                break;
            case GameState.LEVEL_SELECT:
                this.updateLevelSelect();
                break;
            case GameState.PLAYING:
                this.updatePlaying();
                break;
            case GameState.PAUSED:
                this.updatePaused();
                break;
            case GameState.GAME_OVER:
                this.updateGameOver();
                break;
            case GameState.WIN:
                this.updateWin();
                break;
        }
    }
    
    render() {
        const ctx = this.ctx;
        
        // Apply screen shake
        ctx.save();
        ctx.translate(this.screenShake.offsetX, this.screenShake.offsetY);
        
        // Draw background
        this.renderer.drawBackground();
        
        // State-specific rendering
        switch (this.state) {
            case GameState.MENU:
                this.renderer.drawMenu(this.selectedMenuItem);
                break;
            case GameState.HOW_TO_PLAY:
                this.renderer.drawHowToPlay();
                break;
            case GameState.UPGRADES:
                this.renderer.drawUpgrades(this.gameData, this.selectedUpgrade);
                break;
            case GameState.SETTINGS:
                this.renderer.drawSettings(this.gameData, this.selectedSetting);
                break;
            case GameState.LEVEL_SELECT:
                this.renderer.drawLevelSelect(this.gameData, this.selectedLevel);
                break;
            case GameState.PLAYING:
            case GameState.PAUSED:
                this.renderPlaying();
                if (this.state === GameState.PAUSED) {
                    this.renderer.drawPause();
                }
                break;
            case GameState.GAME_OVER:
                this.renderPlaying();
                this.renderer.drawGameOver(this.score, this.currentLevel, this.gameData);
                break;
            case GameState.WIN:
                this.renderPlaying();
                this.renderer.drawWin(this.score, this.currentLevel, this.gameTime, this.gameData);
                break;
        }
        
        ctx.restore();
    }
    
    // Menu state
    updateMenu() {
        if (this.input.isKeyJustPressed('ArrowUp') || this.input.isKeyJustPressed('KeyW')) {
            this.selectedMenuItem = Math.max(0, this.selectedMenuItem - 1);
            this.sound.playCursor();
            this.screenShake.shake(2);
        }
        if (this.input.isKeyJustPressed('ArrowDown') || this.input.isKeyJustPressed('KeyS')) {
            this.selectedMenuItem = Math.min(3, this.selectedMenuItem + 1);
            this.sound.playCursor();
            this.screenShake.shake(2);
        }
        if (this.input.isKeyJustPressed('Space') || this.input.isKeyJustPressed('Enter')) {
            this.sound.playSelect();
            this.screenShake.shake(5);
            switch (this.selectedMenuItem) {
                case 0: // Play Game
                    this.state = GameState.LEVEL_SELECT;
                    break;
                case 1: // How to Play
                    this.state = GameState.HOW_TO_PLAY;
                    break;
                case 2: // Upgrades
                    this.state = GameState.UPGRADES;
                    break;
                case 3: // Settings
                    this.state = GameState.SETTINGS;
                    break;
            }
        }
    }
    
    // How to play state
    updateHowToPlay() {
        if (this.input.isKeyJustPressed('Escape') || this.input.isKeyJustPressed('Space')) {
            this.state = GameState.MENU;
            this.sound.playSelect();
        }
    }
    
    // Upgrades state
    updateUpgrades() {
        if (this.input.isKeyJustPressed('ArrowUp') || this.input.isKeyJustPressed('KeyW')) {
            this.selectedUpgrade = Math.max(0, this.selectedUpgrade - 1);
            this.sound.playCursor();
        }
        if (this.input.isKeyJustPressed('ArrowDown') || this.input.isKeyJustPressed('KeyS')) {
            this.selectedUpgrade = Math.min(3, this.selectedUpgrade + 1);
            this.sound.playCursor();
        }
        if (this.input.isKeyJustPressed('Space') || this.input.isKeyJustPressed('Enter')) {
            const types = ['speed', 'bulletSlow', 'luckyDodge', 'attackWindow'];
            if (this.gameData.buyUpgrade(types[this.selectedUpgrade])) {
                this.sound.playSelect();
                this.screenShake.shake(5);
            }
        }
        if (this.input.isKeyJustPressed('Escape')) {
            this.state = GameState.MENU;
            this.sound.playSelect();
        }
    }
    
    // Settings state
    updateSettings() {
        if (this.input.isKeyJustPressed('ArrowUp') || this.input.isKeyJustPressed('KeyW')) {
            this.selectedSetting = Math.max(0, this.selectedSetting - 1);
            this.sound.playCursor();
        }
        if (this.input.isKeyJustPressed('ArrowDown') || this.input.isKeyJustPressed('KeyS')) {
            this.selectedSetting = Math.min(4, this.selectedSetting + 1);
            this.sound.playCursor();
        }
        
        // Adjust settings with left/right
        const adjustValue = (current, delta, min, max) => {
            return MathUtils.clamp(current + delta, min, max);
        };
        
        if (this.input.isKeyJustPressed('ArrowLeft') || this.input.isKeyJustPressed('KeyA')) {
            switch (this.selectedSetting) {
                case 0: // Sound toggle
                    this.gameData.soundEnabled = !this.gameData.soundEnabled;
                    this.sound.enabled = this.gameData.soundEnabled;
                    break;
                case 1: // Master volume
                    this.gameData.masterVolume = adjustValue(this.gameData.masterVolume, -0.1, 0, 1);
                    this.sound.masterVolume = this.gameData.masterVolume;
                    break;
                case 2: // Music volume
                    this.gameData.musicVolume = adjustValue(this.gameData.musicVolume, -0.1, 0, 1);
                    break;
                case 3: // SFX volume
                    this.gameData.sfxVolume = adjustValue(this.gameData.sfxVolume, -0.1, 0, 1);
                    this.sound.sfxVolume = this.gameData.sfxVolume;
                    break;
            }
            this.gameData.save();
            this.sound.playSelect();
        }
        
        if (this.input.isKeyJustPressed('ArrowRight') || this.input.isKeyJustPressed('KeyD')) {
            switch (this.selectedSetting) {
                case 0: // Sound toggle
                    this.gameData.soundEnabled = !this.gameData.soundEnabled;
                    this.sound.enabled = this.gameData.soundEnabled;
                    break;
                case 1: // Master volume
                    this.gameData.masterVolume = adjustValue(this.gameData.masterVolume, 0.1, 0, 1);
                    this.sound.masterVolume = this.gameData.masterVolume;
                    break;
                case 2: // Music volume
                    this.gameData.musicVolume = adjustValue(this.gameData.musicVolume, 0.1, 0, 1);
                    break;
                case 3: // SFX volume
                    this.gameData.sfxVolume = adjustValue(this.gameData.sfxVolume, 0.1, 0, 1);
                    this.sound.sfxVolume = this.gameData.sfxVolume;
                    break;
            }
            this.gameData.save();
            this.sound.playSelect();
        }
        
        // Reset progress
        if (this.selectedSetting === 4 && (this.input.isKeyJustPressed('Space') || this.input.isKeyJustPressed('Enter'))) {
            if (confirm('Are you sure you want to reset all progress?')) {
                this.gameData.reset();
                this.gameData.save();
                this.screenShake.shake(10);
            }
        }
        
        if (this.input.isKeyJustPressed('Escape')) {
            this.state = GameState.MENU;
            this.sound.playSelect();
        }
    }
    
    // Level select state
    updateLevelSelect() {
        const cols = 5;
        const maxLevel = 20;
        
        if (this.input.isKeyJustPressed('ArrowLeft') || this.input.isKeyJustPressed('KeyA')) {
            this.selectedLevel = Math.max(1, this.selectedLevel - 1);
            this.sound.playCursor();
        }
        if (this.input.isKeyJustPressed('ArrowRight') || this.input.isKeyJustPressed('KeyD')) {
            this.selectedLevel = Math.min(maxLevel, this.selectedLevel + 1);
            this.sound.playCursor();
        }
        if (this.input.isKeyJustPressed('ArrowUp') || this.input.isKeyJustPressed('KeyW')) {
            this.selectedLevel = Math.max(1, this.selectedLevel - cols);
            this.sound.playCursor();
        }
        if (this.input.isKeyJustPressed('ArrowDown') || this.input.isKeyJustPressed('KeyS')) {
            this.selectedLevel = Math.min(maxLevel, this.selectedLevel + cols);
            this.sound.playCursor();
        }
        
        if (this.input.isKeyJustPressed('Space') || this.input.isKeyJustPressed('Enter')) {
            if (this.selectedLevel <= this.gameData.maxUnlockedLevel) {
                this.startLevel(this.selectedLevel);
                this.sound.playSelect();
                this.screenShake.shake(8);
            }
        }
        
        if (this.input.isKeyJustPressed('Escape')) {
            this.state = GameState.MENU;
            this.sound.playSelect();
        }
    }
    
    // Start a level
    startLevel(level) {
        this.currentLevel = level;
        this.state = GameState.PLAYING;
        
        // Reset game state
        this.score = 0;
        this.grazeCount = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.gameTime = 0;
        this.gameData.runMoney = 0;
        
        // Clear objects
        this.bullets.clear();
        this.particles.clear();
        
        // Create player at bottom center
        this.player = new Player(this.width / 2, this.height * 0.8);
        this.player.speedMultiplier = this.gameData.getSpeedMultiplier();
        
        // Create boss at top
        this.boss = new Boss(this.width / 2, -100, level);
    }
    
    // Playing state
    updatePlaying() {
        // Pause
        if (this.input.isKeyJustPressed('Escape')) {
            this.state = GameState.PAUSED;
            return;
        }
        
        // Update game time
        this.gameTime += this.deltaTime / 60;
        
        // Update combo timer
        if (this.combo > 0) {
            this.comboTimer -= this.deltaTime;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }
        
        // Update player
        this.player.update(this.input, this.width, this.height, this.deltaTime);
        
        // Update boss
        if (this.boss && !this.boss.dying) {
            this.boss.update(this.deltaTime, this.width, this.height, 
                           this.player.x, this.player.y, this.bullets);
            
            // Make boss vulnerable periodically
            if (!this.boss.entering && !this.boss.vulnerable && Math.random() < 0.002) {
                this.boss.makeVulnerable();
            }
        }
        
        // Update bullets
        const bulletSlowMult = this.gameData.getBulletSlowMultiplier();
        this.bullets.update(this.deltaTime * bulletSlowMult, this.width, this.height, 
                          this.player.x, this.player.y);
        
        // Update particles
        this.particles.update(this.deltaTime);
        
        // Check graze
        const grazes = this.bullets.checkGraze(this.player.x, this.player.y, 25);
        if (grazes > 0) {
            this.grazeCount += grazes;
            this.score += grazes * 10;
            this.combo++;
            this.comboTimer = 180;
            this.sound.playDodge();
        }
        
        // Check bullet collision
        if (!this.player.invincible) {
            const hitBullet = this.bullets.checkCollision(
                this.player.x, this.player.y, this.player.hitboxRadius
            );
            
            if (hitBullet) {
                // Lucky dodge check
                if (Math.random() < this.gameData.getLuckyDodgeChance()) {
                    // Dodged!
                    this.player.triggerFlicker();
                    this.particles.spawnDodge(this.player.x, this.player.y);
                    hitBullet.active = false;
                    this.score += 100;
                    this.sound.playDodge();
                } else {
                    // Player dies
                    this.playerDeath();
                    return;
                }
            }
        }
        
        // Check player-boss collision
        if (this.boss && !this.boss.entering && !this.boss.dying && 
            this.boss.vulnerable && this.boss.collidesWith(this.player.x, this.player.y)) {
            // Damage boss
            this.particles.spawnBossDamage(this.boss.x, this.boss.y);
            this.sound.playBossHit();
            this.screenShake.shake(15);
            this.score += 500;
            
            if (this.boss.takeDamage()) {
                // Boss defeated!
                this.bossDefeated();
            } else {
                // Boss took damage but not dead
                this.player.setInvincible(60);
                this.player.reset(this.width / 2, this.height * 0.8);
                this.bullets.clear();
            }
        }
        
        // Boss death animation complete
        if (this.boss && this.boss.dying && this.boss.deathTimer >= 180) {
            this.state = GameState.WIN;
        }
    }
    
    playerDeath() {
        this.particles.spawnPlayerDeath(this.player.x, this.player.y);
        this.sound.playDeath();
        this.screenShake.shake(20);
        this.gameData.recordDeath();
        this.state = GameState.GAME_OVER;
    }
    
    bossDefeated() {
        // Award money based on level
        const moneyEarned = 50 + this.currentLevel * 25;
        this.gameData.addMoney(moneyEarned);
        this.gameData.defeatBoss(this.currentLevel);
        this.gameData.unlockLevel(this.currentLevel + 1);
        this.sound.playWin();
        
        // Big explosion
        for (let i = 0; i < 30; i++) {
            this.particles.spawnExplosion(
                this.boss.x + MathUtils.randomRange(-50, 50),
                this.boss.y + MathUtils.randomRange(-50, 50),
                Colors.gold
            );
        }
    }
    
    // Paused state
    updatePaused() {
        if (this.input.isKeyJustPressed('Escape')) {
            this.state = GameState.PLAYING;
        }
    }
    
    // Game over state
    updateGameOver() {
        if (this.input.isKeyJustPressed('Space') || this.input.isKeyJustPressed('Enter')) {
            this.startLevel(this.currentLevel);
        }
        if (this.input.isKeyJustPressed('Escape')) {
            this.state = GameState.MENU;
        }
    }
    
    // Win state
    updateWin() {
        if (this.input.isKeyJustPressed('Space') || this.input.isKeyJustPressed('Enter')) {
            // Next level
            const nextLevel = this.currentLevel + 1;
            if (nextLevel <= 20) {
                this.startLevel(nextLevel);
            } else {
                this.state = GameState.MENU;
            }
        }
        if (this.input.isKeyJustPressed('Escape')) {
            this.state = GameState.MENU;
        }
    }
    
    // Render playing state
    renderPlaying() {
        // Draw particles (behind everything)
        this.particles.draw(this.ctx);
        
        // Draw bullets
        this.bullets.draw(this.ctx);
        
        // Draw player
        if (this.player && this.state !== GameState.GAME_OVER) {
            this.player.draw(this.ctx);
        }
        
        // Draw boss
        if (this.boss) {
            this.boss.draw(this.ctx);
        }
        
        // Draw HUD
        const bossHealth = this.boss ? this.boss.health : 0;
        const bossMaxHealth = this.boss ? this.boss.maxHealth : 1;
        this.renderer.drawHUD(
            this.currentLevel, 
            this.score, 
            this.grazeCount,
            bossHealth,
            bossMaxHealth,
            this.gameTime,
            this.combo
        );
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
