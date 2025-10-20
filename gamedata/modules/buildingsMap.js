import './gameState.js';
import { selectors } from './selectors.js';
import { BuildingSystem } from './runSubsystem/BuildingSystem.js';
import { getMaterialName } from './utility.js';

export const buildingsMap = {
    currentBuilding: null,
    initialized: false,

    // Initialize building map system
    initialize() {
        if (this.initialized) return;
        
        this.setupEventListeners();
        this.setupStateListeners();
        this.initialized = true;
    },

    // Set up event listeners
    setupEventListeners() {
        // Event listeners are set up dynamically when building interface is created
    },

    // Set up state listeners for reactive updates
    setupStateListeners() {
        // Listen for building entry/exit
        gameState.subscribe('currentRun.currentBuilding', (newBuilding, oldBuilding) => {
            if (newBuilding && !oldBuilding) {
                // Entered building
                this.showBuildingInterface(newBuilding);
            } else if (!newBuilding && oldBuilding) {
                // Exited building
                this.hideBuildingInterface();
            }
        });

        // Listen for building layout changes
        gameState.subscribe('currentRun.buildingLayout', () => {
            if (selectors.isInBuilding(gameState)) {
                this.renderBuildingGrid();
                this.updateBuildingActions();
            }
        });

        // Listen for building position changes
        gameState.subscribe('currentRun.buildingPosition', () => {
            if (selectors.isInBuilding(gameState)) {
                this.renderBuildingGrid();
                this.updateBuildingActions();
            }
        });
    },

    // Show building interface
    showBuildingInterface(building) {
        this.currentBuilding = building;
        this.createBuildingInterface();
        this.renderBuildingGrid();
        this.updateBuildingActions();
    },

    // Create building interface HTML
    createBuildingInterface() {
        const buildingType = this.getCurrentBuildingType();
        if (!buildingType) return;

        // Create building interface container
        const buildingInterface = document.createElement('div');
        buildingInterface.className = 'building-interface';
        buildingInterface.innerHTML = `
            <h3 class="panel-title">${buildingType.name}</h3>
            <div class="building-info">
                <p>${buildingType.description}</p>
                <button id="exit-building" class="nav-button">Exit Building</button>
            </div>
            <div class="building-layout" id="building-layout">
                <!-- Building grid will be rendered here -->
            </div>
            <div class="building-actions" id="building-actions">
                <!-- Action buttons will appear here -->
            </div>
            <div class="building-log" id="building-log">
                <h4>Building Log</h4>
                <div class="log-entries"></div>
            </div>
        `;

        // Add to content area
        const contentArea = document.querySelector('.content-area');
        if (contentArea) {
            contentArea.appendChild(buildingInterface);
        }

        // Set up building-specific event listeners
        this.setupBuildingEventListeners();

        // Hide run interface
        const runInterface = document.getElementById('run-interface');
        if (runInterface) {
            runInterface.style.display = 'none';
        }
    },

    // Get current building type
    getCurrentBuildingType() {
        const currentBuilding = selectors.getCurrentBuilding(gameState);
        if (!currentBuilding) return null;

        // This would come from your buildingTypes database
        const buildingTypes = {
            house: { name: "Abandoned House", description: "A dilapidated residential building." },
            warehouse: { name: "Warehouse", description: "A large storage facility." },
            office: { name: "Office Building", description: "A multi-story office complex." }
        };

        return buildingTypes[currentBuilding.content.type] || { name: "Unknown Building", description: "A mysterious structure." };
    },

    // Set up building-specific event listeners
    setupBuildingEventListeners() {
        // Exit building button
        const exitButton = document.getElementById('exit-building');
        if (exitButton) {
            exitButton.addEventListener('click', () => {
                this.exitBuilding();
            });
        }
    },

    // Render building grid
    renderBuildingGrid() {
        const buildingGrid = document.getElementById('building-layout');
        const buildingLayout = selectors.getBuildingLayout(gameState);
        const buildingPosition = selectors.getBuildingPosition(gameState);

        if (!buildingGrid || !buildingLayout || !buildingPosition) return;

        buildingGrid.innerHTML = '';
        buildingGrid.style.gridTemplateColumns = `repeat(${buildingLayout[0].length}, 40px)`;
        buildingGrid.style.gridTemplateRows = `repeat(${buildingLayout.length}, 40px)`;

        for (let y = 0; y < buildingLayout.length; y++) {
            for (let x = 0; x < buildingLayout[y].length; x++) {
                const cell = buildingLayout[y][x];
                const cellElement = this.createBuildingCell(cell, x, y, buildingPosition);
                buildingGrid.appendChild(cellElement);
            }
        }
    },

    // Create individual building cell
    createBuildingCell(cell, x, y, playerPos) {
        const cellElement = document.createElement('div');
        cellElement.className = `building-cell ${cell.type} ${cell.explored ? 'explored' : ''}`;

        // Set cell content based on type and exploration status
        if (x === playerPos.x && y === playerPos.y) {
            cellElement.innerHTML = '👤';
            cellElement.classList.add('player');
        } else if (cell.explored) {
            cellElement.innerHTML = this.getBuildingCellIcon(cell);
            
            // Add interactivity for explored cells with content
            if (this.isBuildingCellInteractable(cell)) {
                cellElement.classList.add('accessible');
                cellElement.addEventListener('click', () => {
                    this.handleBuildingCellClick(cell, x, y);
                });
            }
        } else {
            // Unexplored cell
            cellElement.innerHTML = '?';
            
            // Make unexplored but accessible cells clickable for movement
            if (this.isCellAdjacentToPlayer(x, y, playerPos)) {
                cellElement.classList.add('accessible');
                cellElement.addEventListener('click', () => {
                    this.moveInBuilding(x, y);
                });
            }
        }

        // Add tooltip
        this.addBuildingCellTooltip(cellElement, cell, x, y, playerPos);

        return cellElement;
    },

    // Get appropriate icon for building cell
    getBuildingCellIcon(cell) {
        const iconMap = {
            wall: '🧱',
            door: '🚪',
            floor: '·'
        };

        if (cell.enemy && !cell.enemy.defeated) return '👹';
        if (cell.container && !cell.container.looted) return cell.container.icon || '📦';
        
        return iconMap[cell.type] || '?';
    },

    // Check if building cell can be interacted with
    isBuildingCellInteractable(cell) {
        if (!cell.explored) return false;
        
        return (cell.enemy && !cell.enemy.defeated) || 
               (cell.container && !cell.container.looted);
    },

    // Check if cell is adjacent to player
    isCellAdjacentToPlayer(x, y, playerPos) {
        return (Math.abs(x - playerPos.x) + Math.abs(y - playerPos.y)) === 1;
    },

    // Handle building cell click
    handleBuildingCellClick(cell, x, y) {
        const buildingPosition = selectors.getBuildingPosition(gameState);
        if (!buildingPosition) return;

        // Check if cell is adjacent to player
        if (!this.isCellAdjacentToPlayer(x, y, buildingPosition)) {
            this.addBuildingLogEntry("That's too far away to interact with.");
            return;
        }

        if (cell.enemy && !cell.enemy.defeated) {
            this.startCombat(cell.enemy);
        } else if (cell.container && !cell.container.looted) {
            this.lootContainer(cell, x, y);
        }
    },

    // Move within building
    moveInBuilding(x, y) {
        const success = BuildingSystem.moveInBuilding(x, y);
        if (success) {
            this.addBuildingLogEntry(`You move to position (${x}, ${y}).`);
            
            // Check for encounters or other events after moving
            this.checkCellEvents(x, y);
        }
    },

    // Check for events in the new cell
    checkCellEvents(x, y) {
        const buildingLayout = selectors.getBuildingLayout(gameState);
        if (!buildingLayout) return;

        const cell = buildingLayout[y][x];
        if (!cell.explored) return;

        if (cell.enemy && !cell.enemy.defeated) {
            this.addBuildingLogEntry(`You encounter a ${cell.enemy.name}!`);
            // Combat would be triggered automatically via the cell click handler
        } else if (cell.container && !cell.container.looted) {
            this.addBuildingLogEntry(`You find a ${cell.container.name}.`);
        }
    },

    // Start combat with enemy
    startCombat(enemy) {
        this.addBuildingLogEntry(`You engage the ${enemy.name} in combat!`);
        
        // Import and use combat system
        import('./fighting.js').then(({ fighting }) => {
            // This would transition to combat interface
            console.log("Starting combat with:", enemy);
            // fighting.startFightScene(enemy);
        });
    },

    // Loot container
    lootContainer(cell, x, y) {
        const success = BuildingSystem.lootContainer(x, y);
        if (success) {
            const items = cell.container.contents.map(item => 
                `${item.quantity}x ${getMaterialName(item.id)}`
            ).join(', ');
            
            this.addBuildingLogEntry(`You loot the ${cell.container.name} and find: ${items}`);
        }
    },

    // Update building actions panel
    updateBuildingActions() {
        const actionsPanel = document.getElementById('building-actions');
        if (!actionsPanel) return;

        actionsPanel.innerHTML = '';

        const adjacentCells = selectors.getAdjacentBuildingCells(gameState);
        
        if (adjacentCells.length === 0) {
            actionsPanel.innerHTML = '<p>No accessible directions from here.</p>';
            return;
        }

        adjacentCells.forEach(({ x, y, cell }) => {
            const actionButton = this.createActionButton(cell, x, y);
            if (actionButton) {
                actionsPanel.appendChild(actionButton);
            }
        });
    },

    // Create action button for adjacent cell
    createActionButton(cell, x, y) {
        const button = document.createElement('button');
        button.className = 'nav-button';
        
        if (!cell.explored) {
            button.textContent = `Explore (${x}, ${y})`;
            button.addEventListener('click', () => {
                this.moveInBuilding(x, y);
            });
        } else if (cell.enemy && !cell.enemy.defeated) {
            button.textContent = `Fight ${cell.enemy.name}`;
            button.addEventListener('click', () => {
                this.startCombat(cell.enemy);
            });
        } else if (cell.container && !cell.container.looted) {
            button.textContent = `Loot ${cell.container.name}`;
            button.addEventListener('click', () => {
                this.lootContainer(cell, x, y);
            });
        } else {
            button.textContent = `Move to (${x}, ${y})`;
            button.addEventListener('click', () => {
                this.moveInBuilding(x, y);
            });
        }

        return button;
    },

    // Add tooltip to building cell
    addBuildingCellTooltip(cellElement, cell, x, y, playerPos) {
        if (x === playerPos.x && y === playerPos.y) {
            cellElement.title = "Your position";
            return;
        }

        if (!cell.explored) {
            cellElement.title = "Unexplored area";
            return;
        }

        const tooltipMap = {
            wall: "Solid wall - cannot pass through",
            door: "Doorway - entrance/exit",
            floor: "Empty floor",
        };

        if (cell.enemy && !cell.enemy.defeated) {
            cellElement.title = `Enemy: ${cell.enemy.name} (Level ${cell.enemy.level})`;
        } else if (cell.container) {
            cellElement.title = cell.container.looted ? 
                `Empty ${cell.container.name}` : 
                `${cell.container.name} - may contain loot`;
        } else {
            cellElement.title = tooltipMap[cell.type] || "Unknown";
        }
    },

    // Add entry to building log
    addBuildingLogEntry(message) {
        const logEntries = document.querySelector('#building-log .log-entries');
        if (!logEntries) return;

        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        logEntries.appendChild(entry);
        
        // Auto-scroll to bottom
        logEntries.scrollTop = logEntries.scrollHeight;
    },

    // Exit building
    exitBuilding() {
        BuildingSystem.exitBuilding();
        this.addBuildingLogEntry("You exit the building.");
    },

    // Hide building interface
    hideBuildingInterface() {
        const buildingInterface = document.querySelector('.building-interface');
        if (buildingInterface) {
            buildingInterface.remove();
        }

        // Show run interface
        const runInterface = document.getElementById('run-interface');
        if (runInterface) {
            runInterface.style.display = 'block';
        }

        this.currentBuilding = null;
    },

    // Show building exploration progress
    showBuildingProgress() {
        const buildingLayout = selectors.getBuildingLayout(gameState);
        if (!buildingLayout) return;

        const totalCells = buildingLayout.flat().length;
        const exploredCells = buildingLayout.flat().filter(cell => cell.explored).length;
        const explorationPercent = Math.round((exploredCells / totalCells) * 100);

        this.addBuildingLogEntry(`Building exploration: ${explorationPercent}% (${exploredCells}/${totalCells} cells)`);
    },

    // Highlight interactive cells
    highlightInteractiveCells() {
        const buildingGrid = document.getElementById('building-layout');
        if (!buildingGrid) return;

        // Remove previous highlights
        buildingGrid.querySelectorAll('.building-cell.highlighted').forEach(cell => {
            cell.classList.remove('highlighted');
        });

        // Highlight accessible cells
        const adjacentCells = selectors.getAdjacentBuildingCells(gameState);
        adjacentCells.forEach(({ x, y }) => {
            const cellIndex = y * buildingGrid.children.length + x;
            const cellElement = buildingGrid.children[cellIndex];
            if (cellElement) {
                cellElement.classList.add('highlighted');
            }
        });
    }
};

// Initialize on import
buildingsMap.initialize();

// Add CSS for building interface
const buildingStyles = `
    .building-interface {
        background: #151530;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
    }
    
    .building-info {
        margin-bottom: 15px;
        padding: 10px;
        background: #2a2a5a;
        border-radius: 5px;
    }
    
    .building-layout {
        display: grid;
        gap: 2px;
        background: #1a1a2a;
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 15px;
        justify-content: center;
    }
    
    .building-cell {
        width: 40px;
        height: 40px;
        border: 1px solid #3a3a7a;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        transition: all 0.2s ease;
    }
    
    .building-cell.wall {
        background: #5a5a7a;
        border-color: #7a7a9a;
        cursor: not-allowed;
    }
    
    .building-cell.door {
        background: #8a5a2a;
        border-color: #aa7a4a;
    }
    
    .building-cell.floor {
        background: #3a3a5a;
    }
    
    .building-cell.explored {
        background: #4a4a6a;
    }
    
    .building-cell.player {
        background: #4a4aff;
        box-shadow: 0 0 5px #4a4aff;
    }
    
    .building-cell.enemy {
        background: #5a2a2a;
        border-color: #7a4a4a;
    }
    
    .building-cell.container {
        background: #2a5a2a;
        border-color: #4a7a4a;
    }
    
    .building-cell.accessible {
        border-color: #6a6aff;
        cursor: pointer;
    }
    
    .building-cell.accessible:hover {
        background: #5a5a8a;
        transform: scale(1.05);
    }
    
    .building-cell.highlighted {
        border: 2px solid #6aff6a;
        box-shadow: 0 0 8px #6aff6a;
    }
    
    .building-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 15px;
    }
    
    .building-log {
        background: #1a1a2a;
        padding: 15px;
        border-radius: 8px;
        max-height: 150px;
        overflow-y: auto;
    }
    
    .building-log h4 {
        color: #ff6a6a;
        margin-bottom: 10px;
    }
    
    .building-log .log-entries {
        font-size: 14px;
    }
    
    .building-log .log-entry {
        margin-bottom: 5px;
        padding: 5px;
        border-left: 3px solid #ff6a6a;
        padding-left: 10px;
    }
`;

// Inject styles
if (!document.querySelector('#building-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'building-styles';
    styleElement.textContent = buildingStyles;
    document.head.appendChild(styleElement);
}