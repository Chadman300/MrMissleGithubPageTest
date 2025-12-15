// Game data persistence using localStorage

class GameData {
    constructor() {
        this.reset();
        this.load();
    }
    
    reset() {
        // Score and money
        this.score = 0;
        this.totalMoney = 0;
        this.runMoney = 0;
        
        // Level progression
        this.currentLevel = 1;
        this.maxUnlockedLevel = 1;
        this.defeatedBosses = {};
        
        // Upgrades
        this.speedUpgrade = 0;
        this.bulletSlowUpgrade = 0;
        this.luckyDodgeUpgrade = 0;
        this.attackWindowUpgrade = 0;
        
        // Stats
        this.totalBossesDefeated = 0;
        this.totalDeaths = 0;
        this.bestLevel = 1;
        this.totalPlayTime = 0;
        
        // Settings
        this.soundEnabled = true;
        this.masterVolume = 0.7;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
    }
    
    // Save to localStorage
    save() {
        try {
            const data = {
                score: this.score,
                totalMoney: this.totalMoney,
                currentLevel: this.currentLevel,
                maxUnlockedLevel: this.maxUnlockedLevel,
                defeatedBosses: this.defeatedBosses,
                speedUpgrade: this.speedUpgrade,
                bulletSlowUpgrade: this.bulletSlowUpgrade,
                luckyDodgeUpgrade: this.luckyDodgeUpgrade,
                attackWindowUpgrade: this.attackWindowUpgrade,
                totalBossesDefeated: this.totalBossesDefeated,
                totalDeaths: this.totalDeaths,
                bestLevel: this.bestLevel,
                totalPlayTime: this.totalPlayTime,
                soundEnabled: this.soundEnabled,
                masterVolume: this.masterVolume,
                musicVolume: this.musicVolume,
                sfxVolume: this.sfxVolume
            };
            localStorage.setItem('mrMissle_gameData', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save game data:', e);
        }
    }
    
    // Load from localStorage
    load() {
        try {
            const saved = localStorage.getItem('mrMissle_gameData');
            if (saved) {
                const data = JSON.parse(saved);
                Object.assign(this, data);
            }
        } catch (e) {
            console.warn('Could not load game data:', e);
        }
    }
    
    // Add money
    addMoney(amount) {
        this.runMoney += amount;
        this.totalMoney += amount;
        this.save();
    }
    
    // Spend money
    spendMoney(amount) {
        if (this.totalMoney >= amount) {
            this.totalMoney -= amount;
            this.save();
            return true;
        }
        return false;
    }
    
    // Unlock next level
    unlockLevel(level) {
        if (level > this.maxUnlockedLevel) {
            this.maxUnlockedLevel = level;
            this.save();
        }
    }
    
    // Mark boss as defeated
    defeatBoss(level) {
        this.defeatedBosses[level] = true;
        this.totalBossesDefeated++;
        if (level > this.bestLevel) {
            this.bestLevel = level;
        }
        this.save();
    }
    
    // Record death
    recordDeath() {
        this.totalDeaths++;
        this.runMoney = 0;
        this.save();
    }
    
    // Get upgrade cost
    getUpgradeCost(upgradeLevel) {
        return 100 * Math.pow(2, upgradeLevel);
    }
    
    // Buy upgrade
    buyUpgrade(type) {
        let level = 0;
        switch (type) {
            case 'speed': level = this.speedUpgrade; break;
            case 'bulletSlow': level = this.bulletSlowUpgrade; break;
            case 'luckyDodge': level = this.luckyDodgeUpgrade; break;
            case 'attackWindow': level = this.attackWindowUpgrade; break;
        }
        
        const cost = this.getUpgradeCost(level);
        if (level < 5 && this.spendMoney(cost)) {
            switch (type) {
                case 'speed': this.speedUpgrade++; break;
                case 'bulletSlow': this.bulletSlowUpgrade++; break;
                case 'luckyDodge': this.luckyDodgeUpgrade++; break;
                case 'attackWindow': this.attackWindowUpgrade++; break;
            }
            this.save();
            return true;
        }
        return false;
    }
    
    // Get speed multiplier
    getSpeedMultiplier() {
        return 1 + this.speedUpgrade * 0.15;
    }
    
    // Get bullet slow multiplier
    getBulletSlowMultiplier() {
        return 1 - this.bulletSlowUpgrade * 0.1;
    }
    
    // Get lucky dodge chance
    getLuckyDodgeChance() {
        return this.luckyDodgeUpgrade * 0.05;
    }
    
    // Get attack window bonus
    getAttackWindowBonus() {
        return this.attackWindowUpgrade * 0.15;
    }
}

// Export
window.GameData = GameData;
