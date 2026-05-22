// Game State
const gameState = {
    credits: 0,
    level: 1,
    totalDrifts: 0,
    currentCar: 0,
    sessionCredits: 0,
    cars: [
        {
            id: 0,
            name: 'Starter Car',
            icon: '🏎️',
            owned: true,
            speed: 100,
            acceleration: 80,
            handling: 75,
            engine: 1,
            tires: 1,
            camber: 0,
            price: 0
        },
        {
            id: 1,
            name: 'Drift King',
            icon: '🏁',
            owned: false,
            speed: 150,
            acceleration: 120,
            handling: 95,
            engine: 2,
            tires: 2,
            camber: 1,
            price: 5000
        },
        {
            id: 2,
            name: 'Night Runner',
            icon: '🌙',
            owned: false,
            speed: 180,
            acceleration: 140,
            handling: 100,
            engine: 3,
            tires: 3,
            camber: 2,
            price: 10000
        },
        {
            id: 3,
            name: 'Lightning Bolt',
            icon: '⚡',
            owned: false,
            speed: 200,
            acceleration: 180,
            handling: 110,
            engine: 4,
            tires: 4,
            camber: 3,
            price: 20000
        }
    ],
    upgrades: {
        engine: [
            { id: 0, name: 'Stock Engine', level: 1, effect: 0, price: 0 },
            { id: 1, name: 'Performance Tune', level: 2, effect: 25, price: 2000 },
            { id: 2, name: 'Turbo Upgrade', level: 3, effect: 50, price: 5000 },
            { id: 3, name: 'Super Turbo', level: 4, effect: 80, price: 10000 }
        ],
        tires: [
            { id: 0, name: 'Street Tires', level: 1, effect: 0, price: 0 },
            { id: 1, name: 'Sport Tires', level: 2, effect: 20, price: 1500 },
            { id: 2, name: 'Racing Slicks', level: 3, effect: 40, price: 4000 },
            { id: 3, name: 'Formula Compound', level: 4, effect: 60, price: 8000 }
        ],
        camber: [
            { id: 0, name: 'No Camber', level: 0, effect: 0, price: 0 },
            { id: 1, name: 'Slight Camber', level: 1, effect: 15, price: 1000 },
            { id: 2, name: 'Aggressive Camber', level: 2, effect: 30, price: 3000 },
            { id: 3, name: 'Extreme Camber', level: 3, effect: 50, price: 6000 }
        ]
    }
};

// Game Physics
let gamePhysics = {
    playerX: 500,
    playerY: 300,
    playerWidth: 40,
    playerHeight: 25,
    velocityX: 0,
    velocityY: 0,
    angle: 0,
    speed: 0,
    isDrifting: false,
    driftScore: 0,
    driftMultiplier: 1.0,
    coins: [],
    particles: []
};

const keys = {};
let gameRunning = false;
let gameCanvas = null;
let gameCtx = null;

// Initialize game
function initGame() {
    gameCanvas = document.getElementById('game-canvas');
    gameCtx = gameCanvas.getContext('2d');
    
    loadGameState();
    updateUI();
    
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === ' ') e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
}

// Start drift session
function startDriftSession() {
    gameRunning = true;
    gamePhysics.playerX = 500;
    gamePhysics.playerY = 300;
    gamePhysics.velocityX = 0;
    gamePhysics.velocityY = 0;
    gamePhysics.speed = 0;
    gamePhysics.isDrifting = false;
    gamePhysics.driftScore = 0;
    gamePhysics.driftMultiplier = 1.0;
    gamePhysics.coins = generateCoins();
    gamePhysics.particles = [];
    gameSessionLoop();
}

// Game session loop
function gameSessionLoop() {
    if (!gameRunning) return;
    
    // Update
    updatePlayer();
    updateCoins();
    updateParticles();
    
    // Draw
    drawGame();
    updateGameHUD();
    
    requestAnimationFrame(gameSessionLoop);
}

// Update player movement
function updatePlayer() {
    const car = gameState.cars[gameState.currentCar];
    const carSpeed = car.speed + car.engine * 20;
    const carAccel = car.acceleration;
    
    let accelX = 0;
    let accelY = 0;
    
    if (keys['ArrowUp'] || keys['w']) accelY = -1;
    if (keys['ArrowDown'] || keys['s']) accelY = 1;
    if (keys['ArrowLeft'] || keys['a']) accelX = -1;
    if (keys['ArrowRight'] || keys['d']) accelX = 1;
    
    if (keys[' ']) {
        gamePhysics.isDrifting = true;
        gamePhysics.driftMultiplier = Math.min(gamePhysics.driftMultiplier + 0.02, 3.0);
    } else {
        gamePhysics.isDrifting = false;
        gamePhysics.driftMultiplier = 1.0;
    }
    
    // Update velocity
    gamePhysics.velocityX += accelX * (carAccel * 0.1);
    gamePhysics.velocityY += accelY * (carAccel * 0.1);
    
    // Calculate current speed
    gamePhysics.speed = Math.sqrt(gamePhysics.velocityX ** 2 + gamePhysics.velocityY ** 2);
    
    // Limit max speed
    const maxSpeed = carSpeed / 100;
    if (gamePhysics.speed > maxSpeed) {
        const scale = maxSpeed / gamePhysics.speed;
        gamePhysics.velocityX *= scale;
        gamePhysics.velocityY *= scale;
        gamePhysics.speed = maxSpeed;
    }
    
    // Friction
    gamePhysics.velocityX *= 0.95;
    gamePhysics.velocityY *= 0.95;
    
    // Update position
    gamePhysics.playerX += gamePhysics.velocityX;
    gamePhysics.playerY += gamePhysics.velocityY;
    
    // Boundaries
    gamePhysics.playerX = Math.max(20, Math.min(gameCanvas.width - 20, gamePhysics.playerX));
    gamePhysics.playerY = Math.max(20, Math.min(gameCanvas.height - 20, gamePhysics.playerY));
    
    // Update angle
    if (gamePhysics.speed > 0.1) {
        gamePhysics.angle = Math.atan2(gamePhysics.velocityY, gamePhysics.velocityX);
    }
    
    // Drift particles
    if (gamePhysics.isDrifting && gamePhysics.speed > 2) {
        createDriftParticles();
        gamePhysics.driftScore += gamePhysics.speed * gamePhysics.driftMultiplier;
        gameState.sessionCredits += Math.floor(gamePhysics.speed * gamePhysics.driftMultiplier * 0.5);
    }
}

// Create drift particles
function createDriftParticles() {
    for (let i = 0; i < 3; i++) {
        const offsetX = (Math.random() - 0.5) * 50;
        const offsetY = (Math.random() - 0.5) * 50;
        gamePhysics.particles.push({
            x: gamePhysics.playerX + offsetX,
            y: gamePhysics.playerY + offsetY,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 1.0,
            size: Math.random() * 5 + 2
        });
    }
}

// Update particles
function updateParticles() {
    gamePhysics.particles = gamePhysics.particles.filter(p => p.life > 0);
    gamePhysics.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
    });
}

// Generate coins on map
function generateCoins() {
    const coins = [];
    for (let i = 0; i < 15; i++) {
        coins.push({
            x: Math.random() * gameCanvas.width,
            y: Math.random() * gameCanvas.height,
            collected: false,
            size: 8
        });
    }
    return coins;
}

// Update coins
function updateCoins() {
    gamePhysics.coins.forEach(coin => {
        if (!coin.collected) {
            const dx = coin.x - gamePhysics.playerX;
            const dy = coin.y - gamePhysics.playerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 30) {
                coin.collected = true;
                gameState.sessionCredits += 100;
            }
        }
    });
}

// Draw game
function drawGame() {
    // Clear canvas
    gameCtx.fillStyle = 'rgba(10, 37, 64, 0.8)';
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Draw grid
    drawGrid();
    
    // Draw coins
    gamePhysics.coins.forEach(coin => {
        if (!coin.collected) {
            gameCtx.fillStyle = '#FFD700';
            gameCtx.beginPath();
            gameCtx.arc(coin.x, coin.y, coin.size, 0, Math.PI * 2);
            gameCtx.fill();
            gameCtx.strokeStyle = '#FFA500';
            gameCtx.lineWidth = 2;
            gameCtx.stroke();
        }
    });
    
    // Draw particles
    gamePhysics.particles.forEach(p => {
        gameCtx.fillStyle = `rgba(233, 69, 96, ${p.life})`;
        gameCtx.beginPath();
        gameCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        gameCtx.fill();
    });
    
    // Draw player car
    drawCar();
}

// Draw grid
function drawGrid() {
    gameCtx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
    gameCtx.lineWidth = 1;
    
    for (let i = 0; i < gameCanvas.width; i += 50) {
        gameCtx.beginPath();
        gameCtx.moveTo(i, 0);
        gameCtx.lineTo(i, gameCanvas.height);
        gameCtx.stroke();
    }
    
    for (let i = 0; i < gameCanvas.height; i += 50) {
        gameCtx.beginPath();
        gameCtx.moveTo(0, i);
        gameCtx.lineTo(gameCanvas.width, i);
        gameCtx.stroke();
    }
}

// Draw car
function drawCar() {
    gameCtx.save();
    gameCtx.translate(gamePhysics.playerX, gamePhysics.playerY);
    gameCtx.rotate(gamePhysics.angle);
    
    // Car body
    gameCtx.fillStyle = gamePhysics.isDrifting ? '#e94560' : '#00d4ff';
    gameCtx.fillRect(-gamePhysics.playerWidth / 2, -gamePhysics.playerHeight / 2, gamePhysics.playerWidth, gamePhysics.playerHeight);
    
    // Car details
    gameCtx.fillStyle = '#000';
    gameCtx.fillRect(-gamePhysics.playerWidth / 2 + 5, -gamePhysics.playerHeight / 2 + 3, 8, 5);
    gameCtx.fillRect(-gamePhysics.playerWidth / 2 + 5, gamePhysics.playerHeight / 2 - 8, 8, 5);
    
    // Drift effect
    if (gamePhysics.isDrifting) {
        gameCtx.strokeStyle = '#ff6b6b';
        gameCtx.lineWidth = 2;
        gameCtx.beginPath();
        gameCtx.arc(0, 0, gamePhysics.playerWidth + 5, 0, Math.PI * 2);
        gameCtx.stroke();
    }
    
    gameCtx.restore();
}

// Update game HUD
function updateGameHUD() {
    document.getElementById('speed-display').textContent = Math.floor(gamePhysics.speed * 100);
    document.getElementById('drift-display').textContent = Math.floor(gamePhysics.driftScore);
    document.getElementById('multiplier-display').textContent = gamePhysics.driftMultiplier.toFixed(1) + 'x';
    document.getElementById('play-credits').textContent = gameState.sessionCredits;
}

// End drift session
function endDriftSession() {
    gameRunning = false;
    gameState.credits += gameState.sessionCredits;
    gameState.totalDrifts += Math.floor(gamePhysics.driftScore);
    saveGameState();
    goToScreen('home-screen');
    updateUI();
}

// Save game state
function saveGameState() {
    localStorage.setItem('driftKingState', JSON.stringify(gameState));
}

// Load game state
function loadGameState() {
    const saved = localStorage.getItem('driftKingState');
    if (saved) {
        const loaded = JSON.parse(saved);
        Object.assign(gameState, loaded);
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', initGame);