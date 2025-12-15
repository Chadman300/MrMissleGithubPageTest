// Particle system for visual effects

class Particle {
    constructor(x, y, vx, vy, color, lifetime, size, type) {
        this.reset(x, y, vx, vy, color, lifetime, size, type);
    }
    
    reset(x, y, vx, vy, color, lifetime, size, type) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.size = size;
        this.type = type || 'spark';
        this.progress = 0;
        this.active = true;
    }
    
    update(deltaTime = 1) {
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Apply gravity for certain types
        if (this.type === 'spark' || this.type === 'explosion') {
            this.vy += 0.2 * deltaTime;
        }
        
        // Fade out and slow down
        this.lifetime -= deltaTime;
        this.vx *= 0.98;
        this.vy *= 0.98;
        
        // Calculate progress
        this.progress = 1 - (this.lifetime / this.maxLifetime);
        
        if (this.lifetime <= 0) {
            this.active = false;
        }
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        const alpha = Math.max(0, Math.min(1, this.lifetime / this.maxLifetime));
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        switch (this.type) {
            case 'spark':
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size / 2, 0, MathUtils.TWO_PI);
                ctx.fill();
                break;
                
            case 'trail':
                const trailSize = this.size * (1 - this.progress * 0.5);
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, trailSize / 2, 0, MathUtils.TWO_PI);
                ctx.fill();
                break;
                
            case 'explosion':
                const expSize = this.size * (1 + this.progress * 2);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 3 * (1 - this.progress);
                ctx.beginPath();
                ctx.arc(this.x, this.y, expSize, 0, MathUtils.TWO_PI);
                ctx.stroke();
                break;
                
            case 'smoke':
                const smokeSize = this.size * (1.5 + this.progress * 2.5);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = alpha * 0.5;
                ctx.beginPath();
                ctx.arc(this.x, this.y, smokeSize, 0, MathUtils.TWO_PI);
                ctx.fill();
                break;
                
            case 'dodge':
                const dodgeSize = this.size * (1 + this.progress);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2 * (1 - this.progress);
                ctx.beginPath();
                ctx.arc(this.x, this.y, dodgeSize, 0, MathUtils.TWO_PI);
                ctx.stroke();
                break;
                
            case 'ring':
                const ringSize = this.size * (1 + this.progress * 3);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 4 * (1 - this.progress);
                ctx.beginPath();
                ctx.arc(this.x, this.y, ringSize, 0, MathUtils.TWO_PI);
                ctx.stroke();
                break;
        }
        
        ctx.restore();
    }
}

// Particle pool for performance
class ParticleSystem {
    constructor(maxParticles = 300) {
        this.particles = [];
        this.pool = [];
        this.maxParticles = maxParticles;
    }
    
    // Get particle from pool or create new one
    getParticle() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return new Particle(0, 0, 0, 0, '#fff', 0, 0, 'spark');
    }
    
    // Return particle to pool
    returnToPool(particle) {
        particle.active = false;
        this.pool.push(particle);
    }
    
    // Spawn a new particle
    spawn(x, y, vx, vy, color, lifetime, size, type) {
        if (this.particles.length >= this.maxParticles) {
            // Remove oldest particle
            const old = this.particles.shift();
            this.returnToPool(old);
        }
        
        const particle = this.getParticle();
        particle.reset(x, y, vx, vy, color, lifetime, size, type);
        this.particles.push(particle);
        return particle;
    }
    
    // Spawn explosion effect
    spawnExplosion(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = MathUtils.randomRange(0, MathUtils.TWO_PI);
            const speed = MathUtils.randomRange(2, 6);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const size = MathUtils.randomRange(3, 8);
            const lifetime = MathUtils.randomRange(20, 40);
            this.spawn(x, y, vx, vy, color, lifetime, size, 'spark');
        }
        // Add expanding ring
        this.spawn(x, y, 0, 0, color, 30, 10, 'ring');
    }
    
    // Spawn trail effect
    spawnTrail(x, y, color) {
        const vx = MathUtils.randomRange(-0.5, 0.5);
        const vy = MathUtils.randomRange(-0.5, 0.5);
        this.spawn(x, y, vx, vy, color, 15, 6, 'trail');
    }
    
    // Spawn dodge effect
    spawnDodge(x, y) {
        this.spawn(x, y, 0, 0, Colors.green, 30, 20, 'dodge');
        // Add some sparkles
        for (let i = 0; i < 5; i++) {
            const angle = MathUtils.randomRange(0, MathUtils.TWO_PI);
            const speed = MathUtils.randomRange(1, 3);
            this.spawn(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, Colors.green, 20, 4, 'spark');
        }
    }
    
    // Spawn player death effect
    spawnPlayerDeath(x, y) {
        this.spawnExplosion(x, y, Colors.red, 20);
        this.spawn(x, y, 0, 0, Colors.red, 40, 30, 'ring');
    }
    
    // Spawn boss damage effect
    spawnBossDamage(x, y) {
        this.spawnExplosion(x, y, Colors.gold, 15);
        this.spawn(x, y, 0, 0, Colors.gold, 30, 40, 'ring');
    }
    
    // Update all particles
    update(deltaTime = 1) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (!particle.active) {
                this.returnToPool(particle);
                this.particles.splice(i, 1);
            }
        }
    }
    
    // Draw all particles
    draw(ctx) {
        for (const particle of this.particles) {
            particle.draw(ctx);
        }
    }
    
    // Clear all particles
    clear() {
        for (const particle of this.particles) {
            this.returnToPool(particle);
        }
        this.particles = [];
    }
}

// Export
window.Particle = Particle;
window.ParticleSystem = ParticleSystem;
