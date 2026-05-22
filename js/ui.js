// UI Functions

function goToScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenName);
    if (targetScreen) {
        targetScreen.classList.add('active');
        
        // Initialize screen content
        if (screenName === 'play-screen') {
            startDriftSession();
        } else if (screenName === 'garage-screen') {
            updateGarageScreen();
        } else if (screenName === 'shop-screen') {
            updateShopScreen();
        } else if (screenName === 'home-screen') {
            updateHomeScreen();
        }
    }
}

function updateUI() {
    document.getElementById('credits-display').textContent = gameState.credits;
    document.getElementById('level-display').textContent = gameState.level;
    document.getElementById('drifts-display').textContent = gameState.totalDrifts;
    
    const car = gameState.cars[gameState.currentCar];
    document.getElementById('current-car-name').textContent = car.name;
}

function updateHomeScreen() {
    updateUI();
}

function updateGarageScreen() {
    const carListDiv = document.getElementById('car-list');
    const carDetailsDiv = document.getElementById('car-details');
    
    carListDiv.innerHTML = '';
    
    gameState.cars.forEach((car, index) => {
        const carItem = document.createElement('div');
        carItem.className = 'car-item' + (index === gameState.currentCar ? ' selected' : '');
        carItem.innerHTML = `
            <div class="car-item-name">${car.icon} ${car.name}</div>
            <div class="car-item-level">Speed: ${car.speed}</div>
        `;
        
        carItem.addEventListener('click', () => {
            if (car.owned) {
                gameState.currentCar = index;
                saveGameState();
                updateGarageScreen();
            }
        });
        
        carListDiv.appendChild(carItem);
    });
    
    // Show first car details
    const car = gameState.cars[gameState.currentCar];
    carDetailsDiv.innerHTML = `
        <h3>${car.icon} ${car.name}</h3>
        <div class="detail-item">
            <span class="detail-label">Speed:</span>
            <span>${car.speed}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Acceleration:</span>
            <span>${car.acceleration}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Handling:</span>
            <span>${car.handling}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Engine Level:</span>
            <span>${car.engine}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Tire Level:</span>
            <span>${car.tires}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Camber Level:</span>
            <span>${car.camber}</span>
        </div>
    `;
}

function updateShopScreen() {
    updateShopTab('cars');
    document.getElementById('shop-credits').textContent = gameState.credits;
}

function switchShopTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    updateShopTab(tab);
}

function updateShopTab(tab) {
    const shopItemsDiv = document.getElementById('shop-items');
    shopItemsDiv.innerHTML = '';
    
    let items = [];
    
    if (tab === 'cars') {
        items = gameState.cars.map((car, index) => ({
            id: index,
            name: car.name,
            icon: car.icon,
            price: car.price,
            desc: `Speed: ${car.speed}`,
            owned: car.owned,
            type: 'car'
        }));
    } else if (tab === 'engine') {
        items = gameState.upgrades.engine.map(eng => ({
            ...eng,
            icon: '⚙️',
            desc: `+${eng.effect} Speed`,
            type: 'engine'
        }));
    } else if (tab === 'tires') {
        items = gameState.upgrades.tires.map(tire => ({
            ...tire,
            icon: '🛞',
            desc: `+${tire.effect} Grip`,
            type: 'tires'
        }));
    } else if (tab === 'camber') {
        items = gameState.upgrades.camber.map(camber => ({
            ...camber,
            icon: '🔧',
            desc: `+${camber.effect} Handling`,
            type: 'camber'
        }));
    }
    
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';
        itemDiv.innerHTML = `
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-desc">${item.desc}</div>
            <div class="shop-item-price">${item.price} Credits</div>
            <button class="buy-btn" onclick="buyItem(${item.id}, '${item.type}')" ${item.owned || gameState.credits < item.price ? 'disabled' : ''}>
                ${item.owned ? 'OWNED' : 'BUY'}
            </button>
        `;
        shopItemsDiv.appendChild(itemDiv);
    });
}

function buyItem(id, type) {
    if (type === 'car') {
        const car = gameState.cars[id];
        if (gameState.credits >= car.price && !car.owned) {
            gameState.credits -= car.price;
            car.owned = true;
            saveGameState();
            updateShopScreen();
        }
    } else {
        const upgrade = gameState.upgrades[type][id];
        if (gameState.credits >= upgrade.price) {
            gameState.credits -= upgrade.price;
            const car = gameState.cars[gameState.currentCar];
            car[type] = id;
            saveGameState();
            updateShopScreen();
        }
    }
}

function resetProgress() {
    if (confirm('Are you sure you want to reset all progress?')) {
        localStorage.removeItem('driftKingState');
        location.reload();
    }
}