// Renderer for UI elements

class Renderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.gradientTime = 0;
    }
    
    // Update gradient animation
    update(deltaTime) {
        this.gradientTime += deltaTime * 0.02;
    }
    
    // Draw animated background gradient
    drawBackground() {
        const ctx = this.ctx;
        
        // Animated colors
        const hue1 = (this.gradientTime * 10) % 360;
        const hue2 = (hue1 + 40) % 360;
        
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, `hsl(${hue1}, 30%, 15%)`);
        gradient.addColorStop(0.5, `hsl(${hue2}, 25%, 12%)`);
        gradient.addColorStop(1, `hsl(${hue1 + 20}, 35%, 10%)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Subtle grid pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        const gridSize = 50;
        for (let x = 0; x < this.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        for (let y = 0; y < this.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
    }
    
    // Draw main menu
    drawMenu(selectedItem) {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        
        // Title
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Title glow
        ctx.shadowColor = Colors.primary;
        ctx.shadowBlur = 30;
        ctx.fillStyle = Colors.primary;
        ctx.font = 'bold 72px Arial';
        ctx.fillText('MR. MISSLE', centerX, this.height * 0.2);
        ctx.shadowBlur = 0;
        
        // Subtitle
        ctx.fillStyle = Colors.white;
        ctx.globalAlpha = 0.7;
        ctx.font = '24px Arial';
        ctx.fillText('A Bullet Hell Experience', centerX, this.height * 0.28);
        ctx.globalAlpha = 1;
        
        // Menu items
        const menuItems = [
            'PLAY GAME',
            'HOW TO PLAY',
            'UPGRADES',
            'SETTINGS'
        ];
        
        const startY = this.height * 0.45;
        const spacing = 70;
        
        menuItems.forEach((item, index) => {
            const y = startY + index * spacing;
            const isSelected = index === selectedItem;
            
            // Button background
            const buttonWidth = 300;
            const buttonHeight = 50;
            const x = centerX - buttonWidth / 2;
            
            if (isSelected) {
                // Selected glow
                ctx.shadowColor = Colors.primary;
                ctx.shadowBlur = 20;
                ctx.fillStyle = Colors.primary;
            } else {
                ctx.shadowBlur = 0;
                ctx.fillStyle = Colors.darkGray;
            }
            
            // Draw rounded rectangle
            this.drawRoundedRect(x, y - buttonHeight/2, buttonWidth, buttonHeight, 10);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Text
            ctx.fillStyle = isSelected ? Colors.white : Colors.gray;
            ctx.font = isSelected ? 'bold 24px Arial' : '22px Arial';
            ctx.fillText(item, centerX, y);
            
            // Selection indicator
            if (isSelected) {
                ctx.fillStyle = Colors.primary;
                ctx.fillText('►', centerX - buttonWidth/2 - 30, y);
                ctx.fillText('◄', centerX + buttonWidth/2 + 30, y);
            }
        });
        
        // Controls hint
        ctx.fillStyle = Colors.white;
        ctx.globalAlpha = 0.5;
        ctx.font = '16px Arial';
        ctx.fillText('Use WASD or Arrow Keys to navigate • SPACE or ENTER to select', centerX, this.height - 50);
        
        ctx.restore();
    }
    
    // Draw how to play screen
    drawHowToPlay() {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        
        ctx.save();
        ctx.textAlign = 'center';
        
        // Title
        ctx.fillStyle = Colors.primary;
        ctx.font = 'bold 48px Arial';
        ctx.fillText('HOW TO PLAY', centerX, 80);
        
        // Instructions
        const instructions = [
            { icon: '🎮', text: 'Move with WASD or Arrow Keys' },
            { icon: '❤️', text: 'You have 1 HP - one hit and you die!' },
            { icon: '👊', text: 'Touch the boss to damage it' },
            { icon: '⚡', text: 'Wait for the boss to become vulnerable (golden glow)' },
            { icon: '🎯', text: 'Your hitbox is the small red dot in the center' },
            { icon: '💰', text: 'Graze bullets (near misses) to earn bonus points' },
            { icon: '🏆', text: 'Defeat bosses to unlock new levels' }
        ];
        
        ctx.textAlign = 'left';
        ctx.font = '22px Arial';
        
        const startY = 160;
        const spacing = 55;
        
        instructions.forEach((inst, index) => {
            const y = startY + index * spacing;
            
            ctx.fillStyle = Colors.white;
            ctx.font = '28px Arial';
            ctx.fillText(inst.icon, centerX - 250, y);
            
            ctx.fillStyle = Colors.white;
            ctx.globalAlpha = 0.9;
            ctx.font = '20px Arial';
            ctx.fillText(inst.text, centerX - 200, y);
            ctx.globalAlpha = 1;
        });
        
        // Back hint
        ctx.textAlign = 'center';
        ctx.fillStyle = Colors.white;
        ctx.globalAlpha = 0.5;
        ctx.font = '18px Arial';
        ctx.fillText('Press ESC or SPACE to go back', centerX, this.height - 50);
        
        ctx.restore();
    }
    
    // Draw upgrades screen
    drawUpgrades(gameData, selectedItem) {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        
        ctx.save();
        ctx.textAlign = 'center';
        
        // Title
        ctx.fillStyle = Colors.gold;
        ctx.font = 'bold 48px Arial';
        ctx.fillText('UPGRADES', centerX, 80);
        
        // Money display
        ctx.fillStyle = Colors.gold;
        ctx.font = 'bold 28px Arial';
        ctx.fillText(`💰 ${gameData.totalMoney}`, centerX, 130);
        
        // Upgrades
        const upgrades = [
            { name: 'Speed Boost', level: gameData.speedUpgrade, desc: '+15% movement speed per level', color: Colors.accent },
            { name: 'Bullet Time', level: gameData.bulletSlowUpgrade, desc: '-10% enemy bullet speed per level', color: Colors.accentLight },
            { name: 'Lucky Dodge', level: gameData.luckyDodgeUpgrade, desc: '+5% chance to survive a hit per level', color: Colors.purple },
            { name: 'Attack Window', level: gameData.attackWindowUpgrade, desc: '+15% vulnerability window duration', color: Colors.gold }
        ];
        
        const startY = 200;
        const spacing = 100;
        
        upgrades.forEach((upgrade, index) => {
            const y = startY + index * spacing;
            const isSelected = index === selectedItem;
            const cost = gameData.getUpgradeCost(upgrade.level);
            const maxed = upgrade.level >= 5;
            
            // Background
            ctx.fillStyle = isSelected ? Colors.withAlpha(upgrade.color, 0.3) : Colors.withAlpha(Colors.darkGray, 0.5);
            this.drawRoundedRect(centerX - 350, y - 35, 700, 80, 10);
            ctx.fill();
            
            if (isSelected) {
                ctx.strokeStyle = upgrade.color;
                ctx.lineWidth = 2;
                this.drawRoundedRect(centerX - 350, y - 35, 700, 80, 10);
                ctx.stroke();
            }
            
            // Name
            ctx.textAlign = 'left';
            ctx.fillStyle = upgrade.color;
            ctx.font = 'bold 24px Arial';
            ctx.fillText(upgrade.name, centerX - 320, y - 5);
            
            // Description
            ctx.fillStyle = Colors.white;
            ctx.globalAlpha = 0.7;
            ctx.font = '16px Arial';
            ctx.fillText(upgrade.desc, centerX - 320, y + 20);
            ctx.globalAlpha = 1;
            
            // Level indicators
            ctx.textAlign = 'right';
            for (let i = 0; i < 5; i++) {
                const dotX = centerX + 200 + i * 25;
                ctx.fillStyle = i < upgrade.level ? upgrade.color : Colors.darkGray;
                ctx.beginPath();
                ctx.arc(dotX, y, 8, 0, MathUtils.TWO_PI);
                ctx.fill();
            }
            
            // Cost/Max
            ctx.textAlign = 'right';
            if (maxed) {
                ctx.fillStyle = Colors.green;
                ctx.font = 'bold 20px Arial';
                ctx.fillText('MAX', centerX + 330, y);
            } else {
                ctx.fillStyle = gameData.totalMoney >= cost ? Colors.gold : Colors.red;
                ctx.font = 'bold 20px Arial';
                ctx.fillText(`💰 ${cost}`, centerX + 330, y);
            }
        });
        
        // Instructions
        ctx.textAlign = 'center';
        ctx.fillStyle = Colors.white;
        ctx.globalAlpha = 0.5;
        ctx.font = '18px Arial';
        ctx.fillText('Press SPACE to purchase • ESC to go back', centerX, this.height - 50);
        
        ctx.restore();
    }
    
    // Draw settings screen
    drawSettings(gameData, selectedItem) {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        
        ctx.save();
        ctx.textAlign = 'center';
        
        // Title
        ctx.fillStyle = Colors.accent;
        ctx.font = 'bold 48px Arial';
        ctx.fillText('SETTINGS', centerX, 80);
        
        const settings = [
            { name: 'Sound', value: gameData.soundEnabled ? 'ON' : 'OFF', type: 'toggle' },
            { name: 'Master Volume', value: Math.round(gameData.masterVolume * 100) + '%', type: 'slider' },
            { name: 'Music Volume', value: Math.round(gameData.musicVolume * 100) + '%', type: 'slider' },
            { name: 'SFX Volume', value: Math.round(gameData.sfxVolume * 100) + '%', type: 'slider' },
            { name: 'Reset Progress', value: 'RESET', type: 'button', color: Colors.red }
        ];
        
        const startY = 180;
        const spacing = 80;
        
        settings.forEach((setting, index) => {
            const y = startY + index * spacing;
            const isSelected = index === selectedItem;
            
            // Background
            ctx.fillStyle = isSelected ? Colors.withAlpha(Colors.accent, 0.2) : Colors.withAlpha(Colors.darkGray, 0.3);
            this.drawRoundedRect(centerX - 300, y - 30, 600, 60, 10);
            ctx.fill();
            
            if (isSelected) {
                ctx.strokeStyle = Colors.accent;
                ctx.lineWidth = 2;
                this.drawRoundedRect(centerX - 300, y - 30, 600, 60, 10);
                ctx.stroke();
            }
            
            // Name
            ctx.textAlign = 'left';
            ctx.fillStyle = Colors.white;
            ctx.font = '22px Arial';
            ctx.fillText(setting.name, centerX - 270, y + 5);
            
            // Value
            ctx.textAlign = 'right';
            ctx.fillStyle = setting.color || Colors.accent;
            ctx.font = 'bold 22px Arial';
            ctx.fillText(setting.value, centerX + 270, y + 5);
            
            // Arrows for adjustable settings
            if (isSelected && setting.type !== 'button') {
                ctx.fillStyle = Colors.accent;
                ctx.font = '24px Arial';
                ctx.textAlign = 'right';
                ctx.fillText('◄', centerX + 180, y + 5);
                ctx.textAlign = 'left';
                ctx.fillText('►', centerX + 220, y + 5);
            }
        });
        
        // Instructions
        ctx.textAlign = 'center';
        ctx.fillStyle = Colors.white;
        ctx.globalAlpha = 0.5;
        ctx.font = '18px Arial';
        ctx.fillText('Use LEFT/RIGHT to adjust • ESC to go back', centerX, this.height - 50);
        
        ctx.restore();
    }
    
    // Draw level select
    drawLevelSelect(gameData, selectedLevel) {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        
        ctx.save();
        ctx.textAlign = 'center';
        
        // Title
        ctx.fillStyle = Colors.primary;
        ctx.font = 'bold 48px Arial';
        ctx.fillText('SELECT LEVEL', centerX, 80);
        
        // Level grid
        const cols = 5;
        const rows = 4;
        const cellSize = 100;
        const startX = centerX - (cols * cellSize) / 2 + cellSize / 2;
        const startY = 180;
        
        for (let i = 0; i < cols * rows; i++) {
            const level = i + 1;
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * cellSize;
            const y = startY + row * cellSize;
            
            const isUnlocked = level <= gameData.maxUnlockedLevel;
            const isDefeated = gameData.defeatedBosses[level];
            const isSelected = level === selectedLevel;
            const isMegaBoss = level % 3 === 0;
            
            // Cell background
            if (isSelected) {
                ctx.shadowColor = Colors.primary;
                ctx.shadowBlur = 20;
            }
            
            if (!isUnlocked) {
                ctx.fillStyle = Colors.darkGray;
            } else if (isDefeated) {
                ctx.fillStyle = Colors.withAlpha(Colors.green, 0.3);
            } else {
                ctx.fillStyle = Colors.withAlpha(Colors.primary, 0.3);
            }
            
            this.drawRoundedRect(x - 40, y - 40, 80, 80, 10);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            if (isSelected && isUnlocked) {
                ctx.strokeStyle = Colors.primary;
                ctx.lineWidth = 3;
                this.drawRoundedRect(x - 40, y - 40, 80, 80, 10);
                ctx.stroke();
            }
            
            // Level number or lock
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            if (!isUnlocked) {
                ctx.fillStyle = Colors.gray;
                ctx.font = '32px Arial';
                ctx.fillText('🔒', x, y);
            } else {
                ctx.fillStyle = isMegaBoss ? Colors.purple : Colors.white;
                ctx.font = 'bold 32px Arial';
                ctx.fillText(level.toString(), x, y);
                
                // Defeated check
                if (isDefeated) {
                    ctx.fillStyle = Colors.green;
                    ctx.font = '20px Arial';
                    ctx.fillText('✓', x + 25, y - 25);
                }
                
                // Mega boss indicator
                if (isMegaBoss) {
                    ctx.fillStyle = Colors.purple;
                    ctx.font = '14px Arial';
                    ctx.fillText('MEGA', x, y + 30);
                }
            }
        }
        
        // Selected level info
        if (selectedLevel <= gameData.maxUnlockedLevel) {
            ctx.textAlign = 'center';
            ctx.fillStyle = Colors.white;
            ctx.font = '24px Arial';
            const bossType = selectedLevel % 3 === 0 ? 'MEGA BOSS' : 'Boss';
            ctx.fillText(`Level ${selectedLevel} - ${bossType}`, centerX, this.height - 100);
        }
        
        // Instructions
        ctx.fillStyle = Colors.white;
        ctx.globalAlpha = 0.5;
        ctx.font = '18px Arial';
        ctx.fillText('Arrow Keys to select • SPACE to start • ESC to go back', centerX, this.height - 50);
        
        ctx.restore();
    }
    
    // Draw game over screen
    drawGameOver(score, level, gameData) {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        ctx.save();
        
        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.width, this.height);
        
        ctx.textAlign = 'center';
        
        // Game Over text
        ctx.shadowColor = Colors.red;
        ctx.shadowBlur = 30;
        ctx.fillStyle = Colors.red;
        ctx.font = 'bold 72px Arial';
        ctx.fillText('GAME OVER', centerX, centerY - 80);
        ctx.shadowBlur = 0;
        
        // Stats
        ctx.fillStyle = Colors.white;
        ctx.font = '28px Arial';
        ctx.fillText(`Level: ${level}`, centerX, centerY);
        ctx.fillText(`Score: ${score}`, centerX, centerY + 40);
        ctx.fillText(`Money Earned: 💰${gameData.runMoney}`, centerX, centerY + 80);
        
        // Instructions
        ctx.globalAlpha = 0.7;
        ctx.font = '22px Arial';
        ctx.fillText('Press SPACE to retry • ESC for menu', centerX, centerY + 150);
        
        ctx.restore();
    }
    
    // Draw win screen
    drawWin(score, level, time, gameData) {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        ctx.save();
        
        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.width, this.height);
        
        ctx.textAlign = 'center';
        
        // Victory text
        ctx.shadowColor = Colors.gold;
        ctx.shadowBlur = 30;
        ctx.fillStyle = Colors.gold;
        ctx.font = 'bold 72px Arial';
        ctx.fillText('VICTORY!', centerX, centerY - 100);
        ctx.shadowBlur = 0;
        
        // Stats
        ctx.fillStyle = Colors.white;
        ctx.font = '28px Arial';
        ctx.fillText(`Level ${level} Complete!`, centerX, centerY - 20);
        ctx.fillText(`Score: ${score}`, centerX, centerY + 25);
        ctx.fillText(`Time: ${time.toFixed(1)}s`, centerX, centerY + 65);
        ctx.fillText(`Money Earned: 💰${gameData.runMoney}`, centerX, centerY + 105);
        
        // Instructions
        ctx.globalAlpha = 0.7;
        ctx.font = '22px Arial';
        ctx.fillText('Press SPACE for next level • ESC for menu', centerX, centerY + 170);
        
        ctx.restore();
    }
    
    // Draw HUD during gameplay
    drawHUD(level, score, grazeCount, bossHealth, bossMaxHealth, gameTime, combo) {
        const ctx = this.ctx;
        
        ctx.save();
        
        // Top left - Level and score
        ctx.fillStyle = Colors.white;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Level ${level}`, 20, 35);
        
        ctx.fillStyle = Colors.gold;
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 20, 65);
        
        // Graze counter
        if (grazeCount > 0) {
            ctx.fillStyle = Colors.accent;
            ctx.fillText(`Graze: ${grazeCount}`, 20, 95);
        }
        
        // Combo
        if (combo > 1) {
            ctx.fillStyle = Colors.purple;
            ctx.font = 'bold 22px Arial';
            ctx.fillText(`${combo}x COMBO!`, 20, 125);
        }
        
        // Top right - Timer
        ctx.textAlign = 'right';
        ctx.fillStyle = Colors.white;
        ctx.font = '20px Arial';
        ctx.fillText(`Time: ${gameTime.toFixed(1)}s`, this.width - 20, 35);
        
        // Boss health bar at top center
        const barWidth = 400;
        const barHeight = 20;
        const barX = (this.width - barWidth) / 2;
        const barY = 20;
        
        // Background
        ctx.fillStyle = Colors.darkGray;
        this.drawRoundedRect(barX, barY, barWidth, barHeight, 5);
        ctx.fill();
        
        // Health
        const healthPercent = bossHealth / bossMaxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? Colors.green : healthPercent > 0.25 ? Colors.gold : Colors.red;
        if (healthPercent > 0) {
            this.drawRoundedRect(barX, barY, barWidth * healthPercent, barHeight, 5);
            ctx.fill();
        }
        
        // Border
        ctx.strokeStyle = Colors.white;
        ctx.lineWidth = 2;
        this.drawRoundedRect(barX, barY, barWidth, barHeight, 5);
        ctx.stroke();
        
        // Boss label
        ctx.textAlign = 'center';
        ctx.fillStyle = Colors.white;
        ctx.font = 'bold 14px Arial';
        ctx.fillText('BOSS', this.width / 2, barY + 15);
        
        ctx.restore();
    }
    
    // Draw pause overlay
    drawPause() {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        ctx.save();
        
        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.width, this.height);
        
        ctx.textAlign = 'center';
        ctx.fillStyle = Colors.white;
        ctx.font = 'bold 48px Arial';
        ctx.fillText('PAUSED', centerX, centerY);
        
        ctx.globalAlpha = 0.7;
        ctx.font = '22px Arial';
        ctx.fillText('Press ESC to resume', centerX, centerY + 50);
        
        ctx.restore();
    }
    
    // Helper: Draw rounded rectangle path
    drawRoundedRect(x, y, width, height, radius) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}

// Export
window.Renderer = Renderer;
