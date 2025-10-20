import './gameState.js';
import { selectors } from './selectors.js';
import { LocationSystem } from './runSubsystem/LocationSystem.js';
import { MapGenerator } from './runSubsystem/MapGenerator.js';
import { MovementSystem } from './runSubsystem/MovementSystem.js';
import { TileInteractionSystem } from './runSubsystem/TileInteractionSystem.js';
import { showSection } from './utility.js';

export class runSubsystem {
    static runTimer = null;

    // Initialize run system
    static initializeRunSystem() {
        this.setupRunEventListeners();
        this.setupMovementControls();
    }

    // Set up run-related event listeners
    static setupRunEventListeners() {
        // Start run button
        const startRunBtn = document.getElementById('start-run');
        if (startRunBtn) {
            startRunBtn.addEventListener('click', () => {
                this.showLocationSelection();
            });
        }

        // Run navigation
        document.querySelectorAll('.nav-button[data-section]').forEach(button => {
            if (button.getAttribute('data-section') === 'run') {
                button.addEventListener('click', () => {
                    if (selectors.isInRun(gameState)) {
                        this.showRunInterface();
                    } else {
                        this.showLocationSelection();
                    }
                });
            }
        });
    }

    // Set up movement controls
    static setupMovementControls() {
        this.setupMovementButton('move-up', 0, -1);
        this.setupMovementButton('move-down', 0, 1);
        this.setupMovementButton('move-left', -1, 0);
        this.setupMovementButton('move-right', 1, 0);
        
        const waitBtn = document.getElementById('wait');
        if (waitBtn) {
            waitBtn.addEventListener('click', () => {
                if (selectors.isInRun(gameState)) {
                    MovementSystem.waitTurn();
                    this.updateRunInterface();
                }
            });
        }
    }

    static setupMovementButton(buttonId, dx, dy) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        // Remove existing listeners by cloning
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', () => {
            if (selectors.isInRun(gameState)) {
                MovementSystem.movePlayer(dx, dy);
                TileInteractionSystem.handleTileInteraction();
                this.updateRunInterface();
            }
        });
    }

    // Show location selection screen
    static showLocationSelection() {
        showSection('run');
        this.renderLocationSelection();
    }

    // Render location selection cards
    static renderLocationSelection() {
        const container = document.getElementById('location-cards');
        if (!container) return;

        container.innerHTML = '';
        
        const availableLocations = LocationSystem.getAvailableLocations();
        
        availableLocations.forEach(location => {
            const card = this.createLocationCard(location);
            container.appendChild(card);
        });

        // Show/hide UI sections
        document.getElementById('run-location-selection').style.display = 'block';
        document.getElementById('run-interface').style.display = 'none';
    }

    // Create location card element
    static createLocationCard(location) {
        const card = document.createElement('div');
        card.className = 'location-card';
        card.innerHTML = `
            <h5>${location.name}</h5>
            <div class="location-difficulty">
                Difficulty: ${'★'.repeat(location.difficulty)}
            </div>
            <p>${location.description}</p>
            <button class="select-location" data-location="${location.id}">
                Enter
            </button>
        `;

        const button = card.querySelector('.select-location');
        button.addEventListener('click', () => {
            this.startRun(location.id);
        });

        return card;
    }

    // Start a run in the selected location
    static startRun(locationId) {
        try {
            // Initialize run data
            const runData = LocationSystem.startRun(locationId);
            const location = LocationSystem.getLocation(locationId);
            
            // Generate map
            const map = MapGenerator.generateMap(7, 7, location);
            
            // Set player starting position (center)
            const startX = Math.floor(map[0].length / 2);
            const startY = Math.floor(map.length / 2);

            gameState.update({
                'gameState.currentRun.map': [map],
                'gameState.currentRun.playerPosition': [{ x: startX, y: startY }]
            });

            // Show run interface
            this.showRunInterface();
            
            // Start run timer
            this.startRunTimer();

        } catch (error) {
            console.error('Failed to start run:', error);
            alert(`Failed to start run: ${error.message}`);
        }
    }

    // Show run interface
    static showRunInterface() {
        document.getElementById('run-location-selection').style.display = 'none';
        document.getElementById('run-interface').style.display = 'block';
        
        this.updateRunInterface();
    }

    // Update run interface with current state
    static updateRunInterface() {
        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun) return;

        const location = LocationSystem.getLocation(currentRun.location);
        
        // Update run info
        document.getElementById('run-location-name').textContent = 
            `Location: ${location?.name || 'Unknown'}`;
        document.getElementById('run-health').textContent = currentRun.health;
        document.getElementById('run-stamina').textContent = currentRun.stamina;
        document.getElementById('run-moves').textContent = currentRun.moves;
        
        // Render map
        this.renderMap();
        
        // Update movement controls
        this.updateMovementControls();
    }

    // Render the map grid
    static renderMap() {
        const mapGrid = document.getElementById('map-grid');
        if (!mapGrid) return;

        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun || !currentRun.map) return;

        const { map, playerPosition } = currentRun;
        
        mapGrid.innerHTML = '';
        mapGrid.style.gridTemplateColumns = `repeat(${map[0].length}, 20px)`;
        mapGrid.style.gridTemplateRows = `repeat(${map.length}, 20px)`;

        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                const tile = map[y][x];
                const tileElement = this.createTileElement(tile, x, y, playerPosition);
                mapGrid.appendChild(tileElement);
            }
        }
    }

    // Create individual tile element
    static createTileElement(tile, x, y, playerPosition) {
        const tileElement = document.createElement('div');
        tileElement.className = `tile ${tile.explored ? tile.type : 'unexplored'}`;
        
        // Add player marker
        if (x === playerPosition.x && y === playerPosition.y) {
            tileElement.classList.add('player');
            tileElement.innerHTML = '👤';
        } else if (tile.explored) {
            // Add appropriate icon based on tile type
            tileElement.innerHTML = this.getTileIcon(tile);
            
            // Make explored tiles clickable for interactions
            if (this.isTileInteractable(tile)) {
                tileElement.classList.add('accessible');
                tileElement.addEventListener('click', () => {
                    this.handleTileClick(tile, x, y);
                });
            }
        }

        return tileElement;
    }

    // Get appropriate icon for tile type
    static getTileIcon(tile) {
        if (!tile.explored) return '';
        
        const icons = {
            resource: '📦',
            encounter: tile.content?.resolved ? '☠️' : '⚔️',
            building: '🏠',
            safe: '🛌',
            extraction: '🚪',
            special: '💎',
            explored: '·',
            start: '🚩'
        };
        
        return icons[tile.type] || '';
    }

    // Check if tile can be interacted with
    static isTileInteractable(tile) {
        if (!tile.explored) return false;
        
        return [
            'resource',
            'encounter', 
            'building',
            'safe',
            'extraction',
            'special'
        ].includes(tile.type);
    }

    // Handle tile click for interactions
    static handleTileClick(tile, x, y) {
        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun) return;

        // Move player to clicked tile if adjacent
        const { playerPosition } = currentRun;
        const distance = Math.abs(x - playerPosition.x) + Math.abs(y - playerPosition.y);
        
        if (distance === 1) {
            MovementSystem.movePlayer(x - playerPosition.x, y - playerPosition.y);
            TileInteractionSystem.handleTileInteraction();
            this.updateRunInterface();
        } else {
            // Add log entry for too far away
            this.addLogEntry("That's too far away to interact with.");
        }
    }

    // Update movement controls state
    static updateMovementControls() {
        const accessibleTiles = MovementSystem.getAccessibleTiles();
        const canMove = MovementSystem.canMove();
        
        // Update button states based on accessibility and stamina
        document.getElementById('move-up').disabled = 
            !accessibleTiles.some(tile => tile.direction === 'up') || !canMove;
        document.getElementById('move-down').disabled = 
            !accessibleTiles.some(tile => tile.direction === 'down') || !canMove;
        document.getElementById('move-left').disabled = 
            !accessibleTiles.some(tile => tile.direction === 'left') || !canMove;
        document.getElementById('move-right').disabled = 
            !accessibleTiles.some(tile => tile.direction === 'right') || !canMove;
    }

    // Start run timer
    static startRunTimer() {
        if (this.runTimer) {
            clearInterval(this.runTimer);
        }

        this.runTimer = setInterval(() => {
            if (!selectors.isInRun(gameState)) {
                this.stopRunTimer();
                return;
            }

            // Update run time display
            const duration = LocationSystem.getCurrentRunDuration();
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;
            
            const timeElement = document.getElementById('run-time');
            if (timeElement) {
                timeElement.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }

        }, 1000);
    }

    // Stop run timer
    static stopRunTimer() {
        if (this.runTimer) {
            clearInterval(this.runTimer);
            this.runTimer = null;
        }
    }

    // Add entry to run log
    static addLogEntry(message) {
        const logEntries = document.querySelector('.log-entries');
        if (!logEntries) return;

        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        logEntries.appendChild(entry);
        
        // Auto-scroll to bottom
        logEntries.scrollTop = logEntries.scrollHeight;
    }

    // Handle run failure
    static runFailed(reason) {
        LocationSystem.endRun('failed', reason);
        this.stopRunTimer();
        alert(`Run failed: ${reason}`);
        showSection('storage');
    }

    // Extract from current run
    static extractFromRun() {
        if (selectors.canExtract(gameState)) {
            TileInteractionSystem.extractFromRun();
            this.stopRunTimer();
            showSection('storage');
        } else {
            this.addLogEntry("You're not at an extraction point!");
        }
    }

    static handleTileInteraction(x, y) {
        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun) return;

        const { playerPosition } = currentRun;
        const dx = x - playerPosition.x;
        const dy = y - playerPosition.y;

        MovementSystem.movePlayer(dx, dy);
        TileInteractionSystem.handleTileInteraction();
        this.updateRunInterface();
    }

    static getAccessibleTiles() {
        return MovementSystem.getAccessibleTiles();
    }

    static enterBuilding(tile) {
        import('./BuildingSystem.js').then(({ BuildingSystem }) => {
            if (BuildingSystem.enterBuilding(tile)) {
                this.addLogEntry(`You enter the building.`);
            }
        });
    }

    static exitBuilding() {
        import('./BuildingSystem.js').then(({ BuildingSystem }) => {
            BuildingSystem.exitBuilding();
            this.addLogEntry("You exit the building and return to the streets.");
        });
    }
}

// Set up state listeners for run changes
gameState.subscribe('currentRun', (newRun, oldRun) => {
    if (!newRun && oldRun) {
        // Run ended
        runSubsystem.stopRunTimer();
    }
});