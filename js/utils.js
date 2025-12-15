// Utility functions for the game

// Color utilities
const Colors = {
    // Nord-inspired color palette
    background: '#2e3440',
    backgroundDark: '#1a1a2e',
    primary: '#e94560',
    primaryLight: '#ff6b6b',
    accent: '#88c0d0',
    accentLight: '#8fbcbb',
    gold: '#ebcb8b',
    green: '#a3be8c',
    purple: '#b48ead',
    red: '#bf616a',
    orange: '#d08770',
    yellow: '#ebcb8b',
    white: '#eceff4',
    gray: '#4c566a',
    darkGray: '#3b4252',
    
    // Create color with alpha
    withAlpha(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    
    // Get random color from palette
    randomBulletColor() {
        const colors = ['#e94560', '#ff6b6b', '#d08770', '#ebcb8b', '#b48ead'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
};

// Math utilities
const MathUtils = {
    TWO_PI: Math.PI * 2,
    HALF_PI: Math.PI / 2,
    INV_SQRT_2: 1 / Math.sqrt(2),
    
    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    // Linear interpolation
    lerp(a, b, t) {
        return a + (b - a) * t;
    },
    
    // Smooth interpolation (ease in-out)
    smoothStep(t) {
        return t * t * (3 - 2 * t);
    },
    
    // Random float in range
    randomRange(min, max) {
        return min + Math.random() * (max - min);
    },
    
    // Random integer in range (inclusive)
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Distance between two points
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    // Angle between two points
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },
    
    // Normalize angle to 0-2PI
    normalizeAngle(angle) {
        while (angle < 0) angle += this.TWO_PI;
        while (angle >= this.TWO_PI) angle -= this.TWO_PI;
        return angle;
    },
    
    // Ease out cubic
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    },
    
    // Ease in out quad
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
};

// Input manager
class InputManager {
    constructor() {
        this.keys = {};
        this.keysJustPressed = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;
        this.mouseJustClicked = false;
        
        // Bind event handlers
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
        window.addEventListener('touchstart', (e) => this.onTouchStart(e));
        window.addEventListener('touchmove', (e) => this.onTouchMove(e));
        window.addEventListener('touchend', (e) => this.onTouchEnd(e));
    }
    
    onKeyDown(e) {
        if (!this.keys[e.code]) {
            this.keysJustPressed[e.code] = true;
        }
        this.keys[e.code] = true;
        
        // Prevent default for game keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
            e.preventDefault();
        }
    }
    
    onKeyUp(e) {
        this.keys[e.code] = false;
    }
    
    onMouseMove(e) {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }
    
    onMouseDown(e) {
        this.mouseDown = true;
        this.mouseJustClicked = true;
    }
    
    onMouseUp(e) {
        this.mouseDown = false;
    }
    
    onTouchStart(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.touches[0].clientX - rect.left;
            this.mouseY = e.touches[0].clientY - rect.top;
            this.mouseDown = true;
            this.mouseJustClicked = true;
        }
    }
    
    onTouchMove(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.touches[0].clientX - rect.left;
            this.mouseY = e.touches[0].clientY - rect.top;
        }
    }
    
    onTouchEnd(e) {
        this.mouseDown = false;
    }
    
    // Check if key is currently held
    isKeyDown(code) {
        return this.keys[code] === true;
    }
    
    // Check if key was just pressed this frame
    isKeyJustPressed(code) {
        return this.keysJustPressed[code] === true;
    }
    
    // Check movement keys
    isMovingUp() {
        return this.keys['KeyW'] || this.keys['ArrowUp'];
    }
    
    isMovingDown() {
        return this.keys['KeyS'] || this.keys['ArrowDown'];
    }
    
    isMovingLeft() {
        return this.keys['KeyA'] || this.keys['ArrowLeft'];
    }
    
    isMovingRight() {
        return this.keys['KeyD'] || this.keys['ArrowRight'];
    }
    
    // Clear just pressed states (call at end of frame)
    clearJustPressed() {
        this.keysJustPressed = {};
        this.mouseJustClicked = false;
    }
}

// Simple sound manager (using Web Audio API)
class SoundManager {
    constructor() {
        this.enabled = true;
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.sounds = {};
    }
    
    // Play a simple beep sound
    playBeep(frequency = 440, duration = 0.1, volume = 0.3) {
        if (!this.enabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'square';
            
            gainNode.gain.value = volume * this.masterVolume * this.sfxVolume;
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            // Audio not supported
        }
    }
    
    // Pre-defined sounds
    playHit() { this.playBeep(200, 0.15, 0.4); }
    playDodge() { this.playBeep(600, 0.08, 0.3); }
    playBossHit() { this.playBeep(150, 0.3, 0.5); }
    playDeath() { this.playBeep(100, 0.5, 0.5); }
    playWin() { this.playBeep(800, 0.2, 0.4); }
    playSelect() { this.playBeep(500, 0.05, 0.2); }
    playCursor() { this.playBeep(400, 0.03, 0.15); }
}

// Screen shake manager
class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.decay = 0.9;
    }
    
    shake(intensity) {
        this.intensity = Math.max(this.intensity, intensity);
    }
    
    update() {
        if (this.intensity > 0.5) {
            this.offsetX = MathUtils.randomRange(-this.intensity, this.intensity);
            this.offsetY = MathUtils.randomRange(-this.intensity, this.intensity);
            this.intensity *= this.decay;
        } else {
            this.offsetX = 0;
            this.offsetY = 0;
            this.intensity = 0;
        }
    }
}

// Export for use in other files
window.Colors = Colors;
window.MathUtils = MathUtils;
window.InputManager = InputManager;
window.SoundManager = SoundManager;
window.ScreenShake = ScreenShake;
