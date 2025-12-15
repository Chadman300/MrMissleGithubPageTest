// Bullet class for enemy projectiles

const BulletType = {
    NORMAL: 'normal',
    FAST: 'fast',
    LARGE: 'large',
    HOMING: 'homing',
    BOUNCING: 'bouncing',
    SPIRAL: 'spiral',
    SPLITTING: 'splitting',
    ACCELERATING: 'accelerating',
    WAVE: 'wave',
    BOMB: 'bomb',
    FRAGMENT: 'fragment'
};

class Bullet {
    constructor(x, y, vx, vy, type = BulletType.NORMAL) {
        this.reset(x, y, vx, vy, type);
    }
    
    reset(x, y, vx, vy, type = BulletType.NORMAL) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.active = true;
        this.age = 0;
        this.spiralAngle = 0;
        this.hasSplit = false;
        this.bounceCount = 0;
        this.hasGrazed = false;
        this.explosionTimer = 120; // For bombs
        
        // Set size based on type
        switch (type) {
            case BulletType.LARGE:
            case BulletType.BOMB:
                this.size = 12;
                break;
            case BulletType.FAST:
            case BulletType.FRAGMENT:
                this.size = 4;
                break;
            default:
                this.size = 6;
        }
        
        // Set color based on type
        this.color = this.getColorForType();
    }
    
    getColorForType() {
        switch (this.type) {
            case BulletType.FAST: return Colors.orange;
            case BulletType.LARGE: return Colors.purple;
            case BulletType.HOMING: return Colors.red;
            case BulletType.BOUNCING: return Colors.green;
            case BulletType.SPIRAL: return Colors.accent;
            case BulletType.SPLITTING: return Colors.gold;
            case BulletType.ACCELERATING: return Colors.orange;
            case BulletType.WAVE: return Colors.accentLight;
            case BulletType.BOMB: return Colors.red;
            case BulletType.FRAGMENT: return Colors.primaryLight;
            default: return Colors.primary;
        }
    }
    
    update(deltaTime = 1, screenWidth, screenHeight, playerX, playerY, bulletManager) {
        this.age += deltaTime;
        
        // Type-specific behaviors
        switch (this.type) {
            case BulletType.HOMING:
                // Slightly track player
                if (this.age < 480) { // 8 seconds lifetime
                    const angle = MathUtils.angle(this.x, this.y, playerX, playerY);
                    const currentAngle = Math.atan2(this.vy, this.vx);
                    const diff = angle - currentAngle;
                    const turnSpeed = 0.02;
                    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                    const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed);
                    this.vx = Math.cos(newAngle) * speed;
                    this.vy = Math.sin(newAngle) * speed;
                }
                break;
                
            case BulletType.SPIRAL:
                // Spiral movement
                this.spiralAngle += 0.1 * deltaTime;
                const spiralOffset = Math.sin(this.spiralAngle) * 2;
                const perpAngle = Math.atan2(this.vy, this.vx) + MathUtils.HALF_PI;
                this.x += Math.cos(perpAngle) * spiralOffset;
                this.y += Math.sin(perpAngle) * spiralOffset;
                break;
                
            case BulletType.WAVE:
                // Wave pattern
                const waveOffset = Math.sin(this.age * 0.1) * 2;
                const waveAngle = Math.atan2(this.vy, this.vx) + MathUtils.HALF_PI;
                this.x += Math.cos(waveAngle) * waveOffset;
                this.y += Math.sin(waveAngle) * waveOffset;
                break;
                
            case BulletType.ACCELERATING:
                // Speed up over time
                const accelFactor = 1 + this.age * 0.001;
                this.vx *= 1.002;
                this.vy *= 1.002;
                break;
                
            case BulletType.BOUNCING:
                // Bounce off walls
                if (this.bounceCount < 1) {
                    if (this.x < 0 || this.x > screenWidth) {
                        this.vx = -this.vx;
                        this.bounceCount++;
                    }
                    if (this.y < 0 || this.y > screenHeight) {
                        this.vy = -this.vy;
                        this.bounceCount++;
                    }
                }
                break;
                
            case BulletType.SPLITTING:
                // Split after some time
                if (!this.hasSplit && this.age > 60) {
                    this.hasSplit = true;
                    if (bulletManager) {
                        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                        const baseAngle = Math.atan2(this.vy, this.vx);
                        for (let i = -1; i <= 1; i += 2) {
                            const angle = baseAngle + i * 0.5;
                            bulletManager.spawn(this.x, this.y, 
                                Math.cos(angle) * speed * 0.8,
                                Math.sin(angle) * speed * 0.8,
                                BulletType.FRAGMENT);
                        }
                    }
                }
                break;
                
            case BulletType.BOMB:
                // Slow down then explode
                this.vx *= 0.98;
                this.vy *= 0.98;
                this.explosionTimer -= deltaTime;
                if (this.explosionTimer <= 0 && bulletManager) {
                    // Explode into fragments
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * MathUtils.TWO_PI;
                        const speed = 4;
                        bulletManager.spawn(this.x, this.y,
                            Math.cos(angle) * speed,
                            Math.sin(angle) * speed,
                            BulletType.FRAGMENT);
                    }
                    this.active = false;
                }
                break;
        }
        
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Check if off screen
        const margin = 50;
        if (this.x < -margin || this.x > screenWidth + margin ||
            this.y < -margin || this.y > screenHeight + margin) {
            this.active = false;
        }
        
        // Homing bullets have limited lifetime
        if (this.type === BulletType.HOMING && this.age > 480) {
            this.active = false;
        }
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Draw shadow
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 3, this.y + 3, this.size, 0, MathUtils.TWO_PI);
        ctx.fill();
        
        // Draw bullet
        ctx.globalAlpha = 1;
        
        // Bomb flicker effect
        if (this.type === BulletType.BOMB && this.explosionTimer < 30) {
            ctx.globalAlpha = (Math.floor(this.explosionTimer / 3) % 2 === 0) ? 1 : 0.5;
        }
        
        // Glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, Colors.withAlpha(this.color, 0.5));
        gradient.addColorStop(1, Colors.withAlpha(this.color, 0));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, MathUtils.TWO_PI);
        ctx.fill();
        
        // Core
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, MathUtils.TWO_PI);
        ctx.fill();
        
        // Bright center
        ctx.fillStyle = Colors.white;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.4, 0, MathUtils.TWO_PI);
        ctx.fill();
        
        ctx.restore();
    }
    
    // Check collision with a point (player hitbox)
    collidesWith(px, py, hitboxRadius) {
        const dx = this.x - px;
        const dy = this.y - py;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.size + hitboxRadius;
    }
    
    // Check graze (near miss)
    checkGraze(px, py, grazeRadius) {
        if (this.hasGrazed) return false;
        
        const dx = this.x - px;
        const dy = this.y - py;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < grazeRadius && distance > this.size + 5) {
            this.hasGrazed = true;
            return true;
        }
        return false;
    }
}

// Bullet pool manager
class BulletManager {
    constructor(maxBullets = 500) {
        this.bullets = [];
        this.pool = [];
        this.maxBullets = maxBullets;
    }
    
    getFromPool() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return new Bullet(0, 0, 0, 0);
    }
    
    returnToPool(bullet) {
        bullet.active = false;
        this.pool.push(bullet);
    }
    
    spawn(x, y, vx, vy, type = BulletType.NORMAL) {
        if (this.bullets.length >= this.maxBullets) {
            const old = this.bullets.shift();
            this.returnToPool(old);
        }
        
        const bullet = this.getFromPool();
        bullet.reset(x, y, vx, vy, type);
        this.bullets.push(bullet);
        return bullet;
    }
    
    update(deltaTime, screenWidth, screenHeight, playerX, playerY) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(deltaTime, screenWidth, screenHeight, playerX, playerY, this);
            
            if (!bullet.active) {
                this.returnToPool(bullet);
                this.bullets.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        for (const bullet of this.bullets) {
            bullet.draw(ctx);
        }
    }
    
    clear() {
        for (const bullet of this.bullets) {
            this.returnToPool(bullet);
        }
        this.bullets = [];
    }
    
    // Check collision with player
    checkCollision(playerX, playerY, hitboxRadius) {
        for (const bullet of this.bullets) {
            if (bullet.active && bullet.collidesWith(playerX, playerY, hitboxRadius)) {
                return bullet;
            }
        }
        return null;
    }
    
    // Check graze with player
    checkGraze(playerX, playerY, grazeRadius) {
        let grazeCount = 0;
        for (const bullet of this.bullets) {
            if (bullet.active && bullet.checkGraze(playerX, playerY, grazeRadius)) {
                grazeCount++;
            }
        }
        return grazeCount;
    }
}

// Export
window.BulletType = BulletType;
window.Bullet = Bullet;
window.BulletManager = BulletManager;
