// Player class

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.size = 20;
        this.hitboxRadius = 5; // Small hitbox for bullet hell gameplay
        this.maxSpeed = 6;
        this.acceleration = 0.5;
        this.friction = 0.85;
        this.speedMultiplier = 1;
        
        // Visual effects
        this.squashX = 1;
        this.squashY = 1;
        this.rotation = -Math.PI / 2; // Start pointing up
        this.flickerTimer = 0;
        
        // Invincibility
        this.invincible = false;
        this.invincibilityTimer = 0;
        
        // Trail effect
        this.trail = [];
        this.trailMaxLength = 10;
    }
    
    update(input, screenWidth, screenHeight, deltaTime = 1) {
        // Decrement timers
        if (this.flickerTimer > 0) this.flickerTimer -= deltaTime;
        if (this.invincibilityTimer > 0) {
            this.invincibilityTimer -= deltaTime;
            if (this.invincibilityTimer <= 0) {
                this.invincible = false;
            }
        }
        
        // Store previous velocity
        const prevVX = this.vx;
        const prevVY = this.vy;
        
        // Calculate acceleration from input
        let ax = 0, ay = 0;
        
        if (input.isMovingUp()) ay -= this.acceleration;
        if (input.isMovingDown()) ay += this.acceleration;
        if (input.isMovingLeft()) ax -= this.acceleration;
        if (input.isMovingRight()) ax += this.acceleration;
        
        // Normalize diagonal movement
        if (ax !== 0 && ay !== 0) {
            ax *= MathUtils.INV_SQRT_2;
            ay *= MathUtils.INV_SQRT_2;
        }
        
        // Apply acceleration
        this.vx += ax * deltaTime;
        this.vy += ay * deltaTime;
        
        // Apply friction when no input
        if (ax === 0) this.vx *= Math.pow(this.friction, deltaTime);
        if (ay === 0) this.vy *= Math.pow(this.friction, deltaTime);
        
        // Clamp to max speed
        const maxSpeed = this.maxSpeed * this.speedMultiplier;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > maxSpeed) {
            const ratio = maxSpeed / speed;
            this.vx *= ratio;
            this.vy *= ratio;
        }
        
        // Calculate squash/stretch
        const speedRatio = speed / maxSpeed;
        let targetSquashX = 1 - speedRatio * 0.15;
        let targetSquashY = 1 + speedRatio * 0.2;
        
        // Direction change squash
        if ((this.vx > 0 && prevVX < 0) || (this.vx < 0 && prevVX > 0)) {
            targetSquashX = 1.2;
            targetSquashY = 0.8;
        }
        if ((this.vy > 0 && prevVY < 0) || (this.vy < 0 && prevVY > 0)) {
            targetSquashY = 1.2;
            targetSquashX = 0.8;
        }
        
        // Smooth squash interpolation
        this.squashX += (targetSquashX - this.squashX) * 0.2;
        this.squashY += (targetSquashY - this.squashY) * 0.2;
        
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Calculate rotation based on velocity
        if (this.vx !== 0 || this.vy !== 0) {
            this.rotation = Math.atan2(this.vy, this.vx);
        }
        
        // Keep player on screen
        const margin = 10;
        if (this.x < margin) {
            this.x = margin;
            this.vx *= -0.3;
        }
        if (this.x > screenWidth - margin) {
            this.x = screenWidth - margin;
            this.vx *= -0.3;
        }
        if (this.y < margin) {
            this.y = margin;
            this.vy *= -0.3;
        }
        if (this.y > screenHeight - margin) {
            this.y = screenHeight - margin;
            this.vy *= -0.3;
        }
        
        // Update trail
        if (speed > 1) {
            this.trail.unshift({ x: this.x, y: this.y, alpha: 1 });
            if (this.trail.length > this.trailMaxLength) {
                this.trail.pop();
            }
        }
        
        // Fade trail
        for (let i = 0; i < this.trail.length; i++) {
            this.trail[i].alpha = 1 - (i / this.trailMaxLength);
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Draw trail
        for (let i = this.trail.length - 1; i >= 0; i--) {
            const t = this.trail[i];
            ctx.globalAlpha = t.alpha * 0.3;
            ctx.fillStyle = Colors.accent;
            const trailSize = this.size * 0.5 * t.alpha;
            ctx.beginPath();
            ctx.arc(t.x, t.y, trailSize, 0, MathUtils.TWO_PI);
            ctx.fill();
        }
        
        // Flicker effect for invincibility
        let alpha = 1;
        if (this.flickerTimer > 0 || this.invincible) {
            alpha = (Math.floor(Date.now() / 50) % 2 === 0) ? 0.3 : 1;
        }
        ctx.globalAlpha = alpha;
        
        // Transform for rotation and squash
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation + Math.PI / 2); // Offset so 0 is up
        ctx.scale(this.squashX, this.squashY);
        
        // Draw shadow
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        this.drawMissileShape(ctx, 4, 4);
        ctx.fill();
        
        // Draw missile body
        ctx.globalAlpha = alpha;
        
        // Body gradient
        const bodyGradient = ctx.createLinearGradient(-this.size/2, 0, this.size/2, 0);
        bodyGradient.addColorStop(0, '#333');
        bodyGradient.addColorStop(0.3, '#555');
        bodyGradient.addColorStop(0.5, '#666');
        bodyGradient.addColorStop(0.7, '#555');
        bodyGradient.addColorStop(1, '#333');
        
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        this.drawMissileShape(ctx, 0, 0);
        ctx.fill();
        
        // Outline
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.beginPath();
        this.drawMissileShape(ctx, 0, 0);
        ctx.stroke();
        
        // Engine glow
        ctx.fillStyle = Colors.primary;
        ctx.beginPath();
        ctx.ellipse(0, this.size * 0.4, 4, 6, 0, 0, MathUtils.TWO_PI);
        ctx.fill();
        
        ctx.fillStyle = Colors.gold;
        ctx.beginPath();
        ctx.ellipse(0, this.size * 0.35, 2, 3, 0, 0, MathUtils.TWO_PI);
        ctx.fill();
        
        ctx.restore();
        
        // Draw hitbox indicator (small red dot)
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = Colors.red;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.hitboxRadius, 0, MathUtils.TWO_PI);
        ctx.fill();
        
        ctx.fillStyle = Colors.white;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.hitboxRadius * 0.5, 0, MathUtils.TWO_PI);
        ctx.fill();
        ctx.restore();
    }
    
    drawMissileShape(ctx, offsetX, offsetY) {
        const w = this.size * 0.4;
        const h = this.size * 0.8;
        
        ctx.moveTo(offsetX, offsetY - h);
        // Right side
        ctx.quadraticCurveTo(offsetX + w, offsetY - h * 0.5, offsetX + w * 0.8, offsetY + h * 0.3);
        // Fin
        ctx.lineTo(offsetX + w * 1.2, offsetY + h);
        ctx.lineTo(offsetX + w * 0.5, offsetY + h * 0.5);
        // Bottom
        ctx.lineTo(offsetX, offsetY + h * 0.6);
        ctx.lineTo(offsetX - w * 0.5, offsetY + h * 0.5);
        // Left fin
        ctx.lineTo(offsetX - w * 1.2, offsetY + h);
        ctx.lineTo(offsetX - w * 0.8, offsetY + h * 0.3);
        // Left side
        ctx.quadraticCurveTo(offsetX - w, offsetY - h * 0.5, offsetX, offsetY - h);
        ctx.closePath();
    }
    
    // Grant temporary invincibility
    setInvincible(duration) {
        this.invincible = true;
        this.invincibilityTimer = duration;
    }
    
    // Trigger flicker effect
    triggerFlicker() {
        this.flickerTimer = 15;
    }
    
    // Reset position
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.trail = [];
        this.invincible = false;
        this.invincibilityTimer = 0;
        this.flickerTimer = 0;
    }
}

// Export
window.Player = Player;
