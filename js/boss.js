// Boss class with attack patterns

class Boss {
    constructor(x, y, level) {
        this.x = x;
        this.y = y;
        this.level = level;
        
        // Every 3rd level is a mega boss
        this.isMegaBoss = (level % 3 === 0);
        this.baseSize = 80;
        this.size = this.isMegaBoss ? this.baseSize * 1.5 : this.baseSize * 0.95;
        this.hitboxRadius = this.size * 0.4;
        
        // Movement
        this.vx = 0;
        this.vy = 0;
        this.maxSpeed = 2.5;
        this.acceleration = 0.15;
        this.friction = 0.92;
        this.targetX = x;
        this.targetY = y;
        this.moveTimer = 0;
        
        // Rotation
        this.rotation = Math.PI / 2; // Start facing down
        this.targetRotation = Math.PI / 2;
        this.angularVelocity = 0;
        
        // Attack patterns
        this.maxPatterns = Math.min(2 + level, 15);
        this.patternType = Math.floor(Math.random() * this.maxPatterns);
        this.shootTimer = 0;
        this.shootInterval = Math.max(45, 75 - level * 2);
        
        // Health (hits needed to defeat)
        this.maxHealth = this.isMegaBoss ? 3 : 2;
        this.health = this.maxHealth;
        this.flashTimer = 0;
        
        // Phase system (attack rhythm)
        this.isAssaultPhase = true;
        this.phaseTimer = 0;
        this.assaultDuration = 300 + level * 8;
        this.recoveryDuration = Math.max(150, 210 - level * 4);
        this.assaultSpeedMult = this.isMegaBoss ? 1.95 : 1.8;
        this.recoverySpeedMult = 0.4;
        
        // Vulnerability window
        this.vulnerable = false;
        this.vulnerabilityTimer = 0;
        this.vulnerabilityDuration = 1200; // 20 seconds
        this.invulnerabilityTimer = 180; // 3 seconds at start
        
        // Animation
        this.bladeRotation = 0;
        this.entranceY = -200;
        this.entering = true;
        this.dying = false;
        this.deathTimer = 0;
        this.deathScale = 1;
        this.deathRotation = 0;
        
        // Type (alternates for variety)
        this.bossType = level % 2 === 0 ? 'helicopter' : 'plane';
    }
    
    update(deltaTime, screenWidth, screenHeight, playerX, playerY, bulletManager) {
        // Entrance animation
        if (this.entering) {
            this.y = MathUtils.lerp(this.entranceY, screenHeight * 0.2, 0.02);
            if (this.y >= screenHeight * 0.2 - 10) {
                this.entering = false;
                this.y = screenHeight * 0.2;
            }
            return;
        }
        
        // Death animation
        if (this.dying) {
            this.deathTimer += deltaTime;
            this.deathScale = 1 + this.deathTimer * 0.01;
            this.deathRotation += 0.1 * deltaTime;
            return;
        }
        
        // Update timers
        if (this.flashTimer > 0) this.flashTimer -= deltaTime;
        if (this.invulnerabilityTimer > 0) this.invulnerabilityTimer -= deltaTime;
        
        // Vulnerability timer
        if (this.vulnerable) {
            this.vulnerabilityTimer -= deltaTime;
            if (this.vulnerabilityTimer <= 0) {
                this.vulnerable = false;
            }
        }
        
        // Phase switching (assault/recovery rhythm)
        this.phaseTimer += deltaTime;
        const phaseDuration = this.isAssaultPhase ? this.assaultDuration : this.recoveryDuration;
        if (this.phaseTimer >= phaseDuration) {
            this.isAssaultPhase = !this.isAssaultPhase;
            this.phaseTimer = 0;
        }
        
        // Movement - pick new target periodically
        this.moveTimer -= deltaTime;
        if (this.moveTimer <= 0) {
            this.moveTimer = MathUtils.randomRange(60, 180);
            const margin = this.size;
            this.targetX = MathUtils.randomRange(margin, screenWidth - margin);
            this.targetY = MathUtils.randomRange(margin, screenHeight * 0.4);
        }
        
        // Move towards target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 10) {
            this.vx += (dx / dist) * this.acceleration * deltaTime;
            this.vy += (dy / dist) * this.acceleration * deltaTime;
        }
        
        // Apply friction
        this.vx *= Math.pow(this.friction, deltaTime);
        this.vy *= Math.pow(this.friction, deltaTime);
        
        // Clamp speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }
        
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Update rotation to face movement direction
        if (speed > 0.5) {
            this.targetRotation = Math.atan2(this.vy, this.vx) + Math.PI / 2;
        }
        
        // Smooth rotation
        let angleDiff = this.targetRotation - this.rotation;
        while (angleDiff > Math.PI) angleDiff -= MathUtils.TWO_PI;
        while (angleDiff < -Math.PI) angleDiff += MathUtils.TWO_PI;
        this.angularVelocity += angleDiff * 0.015;
        this.angularVelocity *= 0.85;
        this.rotation += this.angularVelocity * deltaTime;
        
        // Blade rotation for helicopters
        this.bladeRotation += 0.3 * deltaTime;
        
        // Shooting
        const speedMult = this.isAssaultPhase ? this.assaultSpeedMult : this.recoverySpeedMult;
        this.shootTimer += deltaTime * speedMult;
        
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            this.shoot(bulletManager, playerX, playerY, screenWidth, screenHeight);
            
            // Change pattern occasionally
            if (Math.random() < 0.1) {
                this.patternType = Math.floor(Math.random() * this.maxPatterns);
            }
        }
    }
    
    shoot(bulletManager, playerX, playerY, screenWidth, screenHeight) {
        const baseSpeed = 3 + this.level * 0.2;
        const bulletCount = Math.min(3 + Math.floor(this.level / 2), 12);
        
        switch (this.patternType % 15) {
            case 0: // Spiral
                this.shootSpiral(bulletManager, baseSpeed, bulletCount);
                break;
            case 1: // Circle burst
                this.shootCircle(bulletManager, baseSpeed, bulletCount * 2);
                break;
            case 2: // Aimed shots
                this.shootAimed(bulletManager, playerX, playerY, baseSpeed);
                break;
            case 3: // Wave pattern
                this.shootWave(bulletManager, baseSpeed, bulletCount);
                break;
            case 4: // Random spray
                this.shootRandom(bulletManager, baseSpeed, bulletCount);
                break;
            case 5: // Cross pattern
                this.shootCross(bulletManager, baseSpeed);
                break;
            case 6: // Homing missiles
                this.shootHoming(bulletManager, playerX, playerY);
                break;
            case 7: // Spiral burst
                this.shootSpiralBurst(bulletManager, baseSpeed);
                break;
            case 8: // Shotgun
                this.shootShotgun(bulletManager, playerX, playerY, baseSpeed);
                break;
            case 9: // Ring
                this.shootRing(bulletManager, baseSpeed);
                break;
            case 10: // Double spiral
                this.shootDoubleSpiral(bulletManager, baseSpeed);
                break;
            case 11: // Accelerating
                this.shootAccelerating(bulletManager, playerX, playerY);
                break;
            case 12: // Bouncing
                this.shootBouncing(bulletManager, baseSpeed);
                break;
            case 13: // Splitting
                this.shootSplitting(bulletManager, playerX, playerY);
                break;
            case 14: // Bomb
                this.shootBomb(bulletManager, playerX, playerY);
                break;
        }
    }
    
    shootSpiral(bulletManager, speed, count) {
        const startAngle = Date.now() * 0.003;
        for (let i = 0; i < count; i++) {
            const angle = startAngle + (i / count) * MathUtils.TWO_PI;
            bulletManager.spawn(
                this.x, this.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                BulletType.NORMAL
            );
        }
    }
    
    shootCircle(bulletManager, speed, count) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * MathUtils.TWO_PI;
            bulletManager.spawn(
                this.x, this.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                BulletType.NORMAL
            );
        }
    }
    
    shootAimed(bulletManager, playerX, playerY, speed) {
        const angle = MathUtils.angle(this.x, this.y, playerX, playerY);
        for (let i = -2; i <= 2; i++) {
            const spreadAngle = angle + i * 0.15;
            bulletManager.spawn(
                this.x, this.y,
                Math.cos(spreadAngle) * speed,
                Math.sin(spreadAngle) * speed,
                BulletType.FAST
            );
        }
    }
    
    shootWave(bulletManager, speed, count) {
        const baseAngle = Math.PI / 2 + Math.sin(Date.now() * 0.005) * 0.5;
        for (let i = 0; i < count; i++) {
            const angle = baseAngle + (i - count/2) * 0.2;
            bulletManager.spawn(
                this.x, this.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                BulletType.WAVE
            );
        }
    }
    
    shootRandom(bulletManager, speed, count) {
        for (let i = 0; i < count; i++) {
            const angle = MathUtils.randomRange(0, MathUtils.TWO_PI);
            const spd = speed * MathUtils.randomRange(0.7, 1.3);
            bulletManager.spawn(
                this.x, this.y,
                Math.cos(angle) * spd,
                Math.sin(angle) * spd,
                BulletType.NORMAL
            );
        }
    }
    
    shootCross(bulletManager, speed) {
        const angles = [0, Math.PI/2, Math.PI, Math.PI * 1.5];
        const offset = Date.now() * 0.002;
        for (const angle of angles) {
            for (let i = 0; i < 3; i++) {
                bulletManager.spawn(
                    this.x, this.y,
                    Math.cos(angle + offset) * speed * (0.8 + i * 0.3),
                    Math.sin(angle + offset) * speed * (0.8 + i * 0.3),
                    BulletType.LARGE
                );
            }
        }
    }
    
    shootHoming(bulletManager, playerX, playerY) {
        const angle = MathUtils.angle(this.x, this.y, playerX, playerY);
        bulletManager.spawn(
            this.x, this.y,
            Math.cos(angle) * 2,
            Math.sin(angle) * 2,
            BulletType.HOMING
        );
    }
    
    shootSpiralBurst(bulletManager, speed) {
        const count = 12;
        const offset = Date.now() * 0.004;
        for (let i = 0; i < count; i++) {
            const angle = offset + (i / count) * MathUtils.TWO_PI;
            bulletManager.spawn(
                this.x, this.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                BulletType.SPIRAL
            );
        }
    }
    
    shootShotgun(bulletManager, playerX, playerY, speed) {
        const angle = MathUtils.angle(this.x, this.y, playerX, playerY);
        for (let i = 0; i < 8; i++) {
            const spread = (i - 3.5) * 0.12;
            const spd = speed * MathUtils.randomRange(0.8, 1.2);
            bulletManager.spawn(
                this.x, this.y,
                Math.cos(angle + spread) * spd,
                Math.sin(angle + spread) * spd,
                BulletType.FAST
            );
        }
    }
    
    shootRing(bulletManager, speed) {
        const count = 16;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * MathUtils.TWO_PI;
            bulletManager.spawn(
                this.x, this.y,
                Math.cos(angle) * speed * 0.8,
                Math.sin(angle) * speed * 0.8,
                BulletType.LARGE
            );
        }
    }
    
    shootDoubleSpiral(bulletManager, speed) {
        const count = 6;
        const offset = Date.now() * 0.003;
        for (let i = 0; i < count; i++) {
            const angle1 = offset + (i / count) * MathUtils.TWO_PI;
            const angle2 = -offset + (i / count) * MathUtils.TWO_PI + Math.PI;
            bulletManager.spawn(this.x, this.y, Math.cos(angle1) * speed, Math.sin(angle1) * speed, BulletType.NORMAL);
            bulletManager.spawn(this.x, this.y, Math.cos(angle2) * speed, Math.sin(angle2) * speed, BulletType.NORMAL);
        }
    }
    
    shootAccelerating(bulletManager, playerX, playerY) {
        const angle = MathUtils.angle(this.x, this.y, playerX, playerY);
        for (let i = -1; i <= 1; i++) {
            bulletManager.spawn(
                this.x, this.y,
                Math.cos(angle + i * 0.2) * 1.5,
                Math.sin(angle + i * 0.2) * 1.5,
                BulletType.ACCELERATING
            );
        }
    }
    
    shootBouncing(bulletManager, speed) {
        for (let i = 0; i < 4; i++) {
            const angle = MathUtils.randomRange(0, MathUtils.TWO_PI);
            bulletManager.spawn(
                this.x, this.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                BulletType.BOUNCING
            );
        }
    }
    
    shootSplitting(bulletManager, playerX, playerY) {
        const angle = MathUtils.angle(this.x, this.y, playerX, playerY);
        bulletManager.spawn(
            this.x, this.y,
            Math.cos(angle) * 3,
            Math.sin(angle) * 3,
            BulletType.SPLITTING
        );
    }
    
    shootBomb(bulletManager, playerX, playerY) {
        const angle = MathUtils.angle(this.x, this.y, playerX, playerY);
        bulletManager.spawn(
            this.x, this.y,
            Math.cos(angle) * 4,
            Math.sin(angle) * 4,
            BulletType.BOMB
        );
    }
    
    takeDamage() {
        this.health--;
        this.flashTimer = 30;
        this.vulnerable = false;
        
        if (this.health <= 0) {
            this.dying = true;
            return true;
        }
        return false;
    }
    
    makeVulnerable() {
        if (this.invulnerabilityTimer <= 0 && !this.vulnerable) {
            this.vulnerable = true;
            this.vulnerabilityTimer = this.vulnerabilityDuration;
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Death animation
        if (this.dying) {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.deathRotation);
            ctx.scale(this.deathScale, this.deathScale);
            ctx.globalAlpha = Math.max(0, 1 - this.deathTimer / 180);
        } else {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
        }
        
        // Flash effect when hit
        if (this.flashTimer > 0 && Math.floor(this.flashTimer / 3) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // Draw shadow
        ctx.save();
        ctx.globalAlpha *= 0.3;
        ctx.translate(8, 8);
        this.drawBody(ctx, '#000');
        ctx.restore();
        
        // Draw body
        if (this.bossType === 'helicopter') {
            this.drawHelicopter(ctx);
        } else {
            this.drawPlane(ctx);
        }
        
        // Vulnerability indicator
        if (this.vulnerable) {
            ctx.restore();
            ctx.save();
            ctx.strokeStyle = Colors.gold;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.7, 0, MathUtils.TWO_PI);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Health bar
        if (!this.dying) {
            this.drawHealthBar(ctx);
        }
        
        // Phase indicator
        if (!this.dying && !this.entering) {
            this.drawPhaseIndicator(ctx);
        }
    }
    
    drawBody(ctx, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.6, this.size * 0.4, 0, 0, MathUtils.TWO_PI);
        ctx.fill();
    }
    
    drawPlane(ctx) {
        // Body
        const gradient = ctx.createLinearGradient(-this.size/2, 0, this.size/2, 0);
        gradient.addColorStop(0, '#444');
        gradient.addColorStop(0.5, '#666');
        gradient.addColorStop(1, '#444');
        ctx.fillStyle = gradient;
        
        // Main body
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.25, this.size * 0.6, 0, 0, MathUtils.TWO_PI);
        ctx.fill();
        
        // Wings
        ctx.fillStyle = this.isMegaBoss ? '#8a2be2' : '#c0392b';
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.6, 0);
        ctx.lineTo(-this.size * 0.1, -this.size * 0.15);
        ctx.lineTo(this.size * 0.1, -this.size * 0.15);
        ctx.lineTo(this.size * 0.6, 0);
        ctx.lineTo(this.size * 0.1, this.size * 0.15);
        ctx.lineTo(-this.size * 0.1, this.size * 0.15);
        ctx.closePath();
        ctx.fill();
        
        // Cockpit
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.ellipse(0, -this.size * 0.3, this.size * 0.12, this.size * 0.15, 0, 0, MathUtils.TWO_PI);
        ctx.fill();
        
        // Tail
        ctx.fillStyle = this.isMegaBoss ? '#8a2be2' : '#c0392b';
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.2, this.size * 0.4);
        ctx.lineTo(0, this.size * 0.55);
        ctx.lineTo(this.size * 0.2, this.size * 0.4);
        ctx.closePath();
        ctx.fill();
    }
    
    drawHelicopter(ctx) {
        // Body
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 0.5);
        gradient.addColorStop(0, '#555');
        gradient.addColorStop(1, '#333');
        ctx.fillStyle = gradient;
        
        // Main body
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.35, this.size * 0.25, 0, 0, MathUtils.TWO_PI);
        ctx.fill();
        
        // Cockpit
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.ellipse(0, -this.size * 0.15, this.size * 0.2, this.size * 0.12, 0, 0, Math.PI);
        ctx.fill();
        
        // Tail boom
        ctx.fillStyle = '#444';
        ctx.fillRect(-this.size * 0.08, this.size * 0.15, this.size * 0.16, this.size * 0.4);
        
        // Tail rotor
        ctx.save();
        ctx.translate(0, this.size * 0.5);
        ctx.fillStyle = this.isMegaBoss ? '#9b59b6' : '#e74c3c';
        ctx.fillRect(-this.size * 0.15, -2, this.size * 0.3, 4);
        ctx.restore();
        
        // Main rotor blades
        ctx.save();
        ctx.rotate(this.bladeRotation);
        ctx.fillStyle = '#777';
        ctx.fillRect(-this.size * 0.8, -3, this.size * 1.6, 6);
        ctx.rotate(Math.PI / 2);
        ctx.fillRect(-this.size * 0.8, -3, this.size * 1.6, 6);
        ctx.restore();
        
        // Rotor hub
        ctx.fillStyle = this.isMegaBoss ? '#9b59b6' : '#e74c3c';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.08, 0, MathUtils.TWO_PI);
        ctx.fill();
    }
    
    drawHealthBar(ctx) {
        const barWidth = this.size * 1.2;
        const barHeight = 8;
        const x = this.x - barWidth / 2;
        const y = this.y - this.size * 0.8;
        
        // Background
        ctx.fillStyle = Colors.darkGray;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? Colors.green : healthPercent > 0.25 ? Colors.gold : Colors.red;
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
        
        // Border
        ctx.strokeStyle = Colors.white;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Hit markers
        for (let i = 1; i < this.maxHealth; i++) {
            const markerX = x + (barWidth / this.maxHealth) * i;
            ctx.strokeStyle = Colors.white;
            ctx.beginPath();
            ctx.moveTo(markerX, y);
            ctx.lineTo(markerX, y + barHeight);
            ctx.stroke();
        }
    }
    
    drawPhaseIndicator(ctx) {
        const text = this.isAssaultPhase ? '⚔️ ASSAULT' : '🛡️ RECOVERY';
        const color = this.isAssaultPhase ? Colors.red : Colors.green;
        
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.8;
        ctx.fillText(text, this.x, this.y + this.size * 0.9);
    }
    
    // Check collision with player
    collidesWith(playerX, playerY) {
        const dx = this.x - playerX;
        const dy = this.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.hitboxRadius;
    }
}

// Export
window.Boss = Boss;
