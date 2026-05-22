// Physics Engine (Enhanced version)

class PhysicsEngine {
    constructor() {
        this.gravity = 0.2;
        this.friction = 0.95;
        this.maxVelocity = 15;
    }
    
    // Calculate velocity based on acceleration
    calculateVelocity(velocity, acceleration, friction = this.friction) {
        velocity += acceleration;
        velocity *= friction;
        
        // Limit velocity
        if (Math.abs(velocity) > this.maxVelocity) {
            velocity = velocity > 0 ? this.maxVelocity : -this.maxVelocity;
        }
        
        return velocity;
    }
    
    // Calculate drift effect
    calculateDriftEffect(angle, driftMultiplier) {
        return Math.sin(angle) * driftMultiplier;
    }
    
    // Check collision
    checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 &&
               x1 + w1 > x2 &&
               y1 < y2 + h2 &&
               y1 + h1 > y2;
    }
    
    // Calculate distance
    calculateDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// Initialize physics engine
const physics = new PhysicsEngine();