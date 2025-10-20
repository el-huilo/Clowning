import './gameState.js';
import { selectors } from './selectors.js';
import { runSubsystem } from './runSubsystem.js';
import { showSection } from './utility.js';

export const tileMap = {
    // Initialize tile map system
    initialize() {
        this.setupEventListeners();
        this.setupStateListeners();
    },

    // Set up event listeners
    setupEventListeners() {
        // Movement controls are now handled by runSubsystem
        // This module focuses on rendering and UI updates
    },

    // Set up state listeners for reactive updates
    setupStateListeners() {
        // Listen for run state changes
        gameState.subscribe('currentRun', (newRun, oldRun) => {
            if (newRun && !oldRun) {
                // Run started
                this.renderRunInterface();
            } else if (!newRun && oldRun) {
                // Run ended
                this.renderLocationSelection();
            }
        });

        // Listen for map changes
        gameState.subscribe('currentRun.map', () => {
            if (selectors.isInRun(gameState)) {
                this.renderMap();
            }
        });

        // Listen for player position changes
        gameState.subscribe('currentRun.playerPosition', () => {
            if (selectors.isInRun(gameState)) {
                this.renderMap();
                runSubsystem.updateMovementControls();
            }
        });

        // Listen for run stats changes
        gameState.subscribe('currentRun.health', () => {
            this.updateRunStats();
        });
        gameState.subscribe('currentRun.stamina', () => {
            this.updateRunStats();
        });
        gameState.subscribe('currentRun.moves', () => {
            this.updateRunStats();
        });
    },

    // Render location selection screen
    renderLocationSelection() {
        showSection('run');
        
        const locationSelection = document.getElementById('run-location-selection');
        const runInterface = document.getElementById('run-interface');
        
        if (locationSelection) locationSelection.style.display = 'block';
        if (runInterface) runInterface.style.display = 'none';
        
        runSubsystem.renderLocationSelection();
    },

    // Render run interface
    renderRunInterface() {
        const locationSelection = document.getElementById('run-location-selection');
        const runInterface = document.getElementById('run-interface');
        
        if (locationSelection) locationSelection.style.display = 'none';
        if (runInterface) runInterface.style.display = 'block';
        
        this.updateRunInterface();
    },

    // Update run interface with current state
    updateRunInterface() {
        this.updateRunStats();
        this.renderMap();
        runSubsystem.updateMovementControls();
    },

    // Update run statistics display
    updateRunStats() {
        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun) return;

        const healthElement = document.getElementById('run-health');
        const staminaElement = document.getElementById('run-stamina');
        const movesElement = document.getElementById('run-moves');

        if (healthElement) healthElement.textContent = currentRun.health;
        if (staminaElement) staminaElement.textContent = currentRun.stamina;
        if (movesElement) movesElement.textContent = currentRun.moves;
    },

    // Render the map grid
    renderMap() {
        const mapGrid = document.getElementById('map-grid');
        if (!mapGrid) return;

        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun || !currentRun.map) return;

        const { map, playerPosition } = currentRun;
        
        // Clear and set up grid
        mapGrid.innerHTML = '';
        mapGrid.style.gridTemplateColumns = `repeat(${map[0].length}, 20px)`;
        mapGrid.style.gridTemplateRows = `repeat(${map.length}, 20px)`;

        // Render each tile
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                const tile = map[y][x];
                const tileElement = this.createTileElement(tile, x, y, playerPosition);
                mapGrid.appendChild(tileElement);
            }
        }
    },

    // Create individual tile element
    createTileElement(tile, x, y, playerPosition) {
        const tileElement = document.createElement('div');
        
        // Set base classes
        tileElement.className = `tile ${tile.explored ? tile.type : 'unexplored'}`;
        
        // Check if this is player position
        const isPlayerPosition = x === playerPosition.x && y === playerPosition.y;
        
        if (isPlayerPosition) {
            tileElement.classList.add('player');
            tileElement.innerHTML = '👤';
        } else if (tile.explored) {
            // Add content for explored tiles
            tileElement.innerHTML = this.getTileIcon(tile);
            
            // Make interactable tiles clickable
            if (this.isTileInteractable(tile)) {
                tileElement.classList.add('accessible');
                tileElement.addEventListener('click', () => {
                    this.handleTileClick(tile, x, y);
                });
            }
        } else {
            // Unexplored tile
            tileElement.innerHTML = '';
        }

        // Add tooltip
        this.addTileTooltip(tileElement, tile, isPlayerPosition);

        return tileElement;
    },

    // Get appropriate icon for tile type
    getTileIcon(tile) {
        if (!tile.explored) return '';

        const iconMap = {
            resource: '📦',
            encounter: tile.content?.resolved ? '☠️' : '⚔️',
            building: '🏠',
            safe: '🛌',
            extraction: '🚪',
            special: '💎',
            explored: '·',
            start: '🚩'
        };

        return iconMap[tile.type] || '';
    },

    // Check if tile can be interacted with
    isTileInteractable(tile) {
        if (!tile.explored) return false;
        
        const interactableTypes = [
            'resource',
            'encounter', 
            'building',
            'safe',
            'extraction',
            'special'
        ];
        
        return interactableTypes.includes(tile.type);
    },

    // Handle tile click for interactions
    handleTileClick(tile, x, y) {
        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun) return;

        const { playerPosition } = currentRun;
        const distance = Math.abs(x - playerPosition.x) + Math.abs(y - playerPosition.y);
        
        if (distance === 1) {
            // Tile is adjacent - move to it and interact
            runSubsystem.handleTileInteraction(x, y);
        } else {
            // Tile is too far - show message
            runSubsystem.addLogEntry("That's too far away to interact with.");
        }
    },

    // Add tooltip to tile
    addTileTooltip(tileElement, tile, isPlayerPosition) {
        if (isPlayerPosition) {
            tileElement.title = "Your position";
            return;
        }

        if (!tile.explored) {
            tileElement.title = "Unexplored";
            return;
        }

        const tooltipMap = {
            resource: "Resource node - may contain materials",
            encounter: tile.content?.resolved ? "Defeated enemy" : "Encounter - be prepared for combat",
            building: tile.content?.explored ? "Explored building" : "Building - may contain loot and enemies",
            safe: "Safe area - rest and recover here",
            extraction: "Extraction point - leave the area here",
            special: "Special event - unknown contents",
            explored: "Explored area"
        };

        tileElement.title = tooltipMap[tile.type] || "Unknown area";
    },

    // Render building interior (if we're in a building)
    renderBuildingInterior() {
        // This would be called when entering a building
        // For now, we'll handle building rendering separately
        console.log("Rendering building interior - to be implemented");
    },

    // Update the run timer display
    updateRunTimer(duration) {
        const timeElement = document.getElementById('run-time');
        if (!timeElement) return;

        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        timeElement.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    // Show extraction points
    showExtractionPoints() {
        const extractionList = document.getElementById('extraction-list');
        if (!extractionList) return;

        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun || !currentRun.map) return;

        // Find all extraction points
        const extractionPoints = [];
        currentRun.map.forEach((row, y) => {
            row.forEach((tile, x) => {
                if (tile.type === 'extraction' && tile.explored) {
                    extractionPoints.push({ x, y, tile });
                }
            });
        });

        // Render extraction points
        extractionList.innerHTML = '';
        extractionPoints.forEach(point => {
            const pointElement = document.createElement('button');
            pointElement.className = 'extraction-point';
            pointElement.textContent = `Extract (${point.x}, ${point.y})`;
            pointElement.addEventListener('click', () => {
                runSubsystem.extractFromRun();
            });
            extractionList.appendChild(pointElement);
        });
    },

    // Add visual effect to tile (for combat, events, etc.)
    addTileEffect(x, y, effectType) {
        const mapGrid = document.getElementById('map-grid');
        if (!mapGrid) return;

        const tileElement = mapGrid.querySelector(`.tile:nth-child(${y * 7 + x + 1})`);
        if (!tileElement) return;

        // Add effect class
        tileElement.classList.add(`effect-${effectType}`);

        // Remove after animation
        setTimeout(() => {
            tileElement.classList.remove(`effect-${effectType}`);
        }, 1000);
    },

    // Highlight accessible tiles
    highlightAccessibleTiles() {
        const accessibleTiles = runSubsystem.getAccessibleTiles();
        const mapGrid = document.getElementById('map-grid');
        if (!mapGrid) return;

        // Remove previous highlights
        mapGrid.querySelectorAll('.tile.accessible').forEach(tile => {
            tile.classList.remove('highlighted');
        });

        // Add highlights to accessible tiles
        accessibleTiles.forEach(({ x, y }) => {
            const tileElement = mapGrid.querySelector(`.tile:nth-child(${y * 7 + x + 1})`);
            if (tileElement) {
                tileElement.classList.add('highlighted');
            }
        });
    },

    // Show combat scene
    showCombatScene(monster) {
        const fightScene = document.getElementById('fight-scene');
        const runInterface = document.getElementById('run-interface');
        
        if (fightScene) fightScene.style.display = 'block';
        if (runInterface) runInterface.style.display = 'none';
        
        // Update combat UI with monster info
        this.updateCombatUI(monster);
    },

    // Hide combat scene
    hideCombatScene() {
        const fightScene = document.getElementById('fight-scene');
        const runInterface = document.getElementById('run-interface');
        
        if (fightScene) fightScene.style.display = 'none';
        if (runInterface) runInterface.style.display = 'block';
    },

    // Update combat UI
    updateCombatUI(monster) {
        // Update enemy info
        const enemyName = document.getElementById('enemy-name');
        const enemyLevel = document.getElementById('enemy-level');
        const enemySprite = document.getElementById('enemy-sprite');

        if (enemyName) enemyName.textContent = monster.name;
        if (enemyLevel) enemyLevel.textContent = monster.level;
        if (enemySprite) enemySprite.textContent = this.getMonsterIcon(monster);
    },

    // Get monster icon based on type
    getMonsterIcon(monster) {
        const iconMap = {
            goblin: '👺',
            woodlandSpirit: '🌿',
            stoneGolem: '🗿',
            wolf: '🐺'
        };

        return iconMap[monster.id] || '👹';
    },

    // Show run results
    showRunResults(runResult) {
        // Create results modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Run ${runResult.status === 'extracted' ? 'Completed' : 'Failed'}</h3>
                <div class="run-results">
                    <p>Location: ${runResult.location}</p>
                    <p>Duration: ${Math.floor(runResult.duration / 60)}:${(runResult.duration % 60).toString().padStart(2, '0')}</p>
                    <p>Moves: ${runResult.moves}</p>
                    ${runResult.status === 'extracted' ? 
                        `<p>Items Extracted: ${runResult.extractedItems.length}</p>` :
                        `<p>Reason: ${runResult.reason}</p>`
                    }
                </div>
                <button class="modal-close">Continue</button>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
};

// Initialize on import
tileMap.initialize();

// Add CSS for additional visual effects
const tileMapStyles = `
    .tile.highlighted {
        border: 2px solid #6aff6a;
        box-shadow: 0 0 10px #6aff6a;
    }
    
    .tile.effect-combat {
        animation: combatPulse 0.5s ease-in-out;
    }
    
    .tile.effect-resource {
        animation: resourceGlow 1s ease-in-out;
    }
    
    @keyframes combatPulse {
        0%, 100% { background-color: normal; }
        50% { background-color: #ff6a6a; }
    }
    
    @keyframes resourceGlow {
        0%, 100% { box-shadow: none; }
        50% { box-shadow: 0 0 15px #6a6aff; }
    }
    
    .run-results {
        margin: 15px 0;
        padding: 15px;
        background: #2a2a5a;
        border-radius: 5px;
    }
    
    .run-results p {
        margin: 5px 0;
    }
`;

// Inject styles
if (!document.querySelector('#tilemap-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'tilemap-styles';
    styleElement.textContent = tileMapStyles;
    document.head.appendChild(styleElement);
}