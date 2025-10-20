import '../gameState.js';
import { selectors } from '../selectors.js';
import { buildingTypes } from '../../db/buildings.js';
import { containerTypes } from '../../db/buildingContainers.js';
import { monsters } from '../../db/monsters.js';
import { getMaterialName } from '../utility.js';

export class BuildingSystem {
    // Enter a building
    static enterBuilding(tile) {
        const buildingType = buildingTypes.find(b => b.id === tile.content.type);
        if (!buildingType) return false;

        // Generate building layout if not already generated
        if (!tile.content.layout) {
            tile.content.layout = this.generateBuildingLayout(buildingType);
            tile.content.enemies = this.generateBuildingEnemies(buildingType);
        }

        gameState.update(state => ({
            currentRun: {
                ...state.currentRun,
                currentBuilding: tile,
                buildingLayout: tile.content.layout,
                buildingPosition: { 
                    x: Math.floor(buildingType.size.width / 2), 
                    y: 0 
                }
            }
        }));

        return true;
    }

    // Exit building
    static exitBuilding() {
        gameState.update(state => ({
            currentRun: {
                ...state.currentRun,
                currentBuilding: null,
                buildingLayout: null,
                buildingPosition: null
            }
        }));
    }

    // Generate building layout
    static generateBuildingLayout(buildingType) {
        const { width, height } = buildingType.size;
        const layout = [];

        // Create empty building grid
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                const isWall = x === 0 || y === 0 || x === width - 1 || y === height - 1;
                
                row.push({
                    x,
                    y,
                    type: isWall ? 'wall' : 'floor',
                    explored: false,
                    container: null,
                    enemy: null
                });
            }
            layout.push(row);
        }

        // Add entrance
        const entranceX = Math.floor(width / 2);
        layout[0][entranceX].type = 'door';

        // Add containers
        this.placeContainers(layout, buildingType);

        return layout;
    }

    // Place containers in building
    static placeContainers(layout, buildingType) {
        const containerCount = Math.floor(Math.random() * 5) + 3;
        
        for (let i = 0; i < containerCount; i++) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 20) {
                attempts++;
                const x = Math.floor(Math.random() * (buildingType.size.width - 2)) + 1;
                const y = Math.floor(Math.random() * (buildingType.size.height - 2)) + 1;

                if (layout[y][x].type !== 'floor' || layout[y][x].container) continue;

                const containerType = containerTypes[Math.floor(Math.random() * containerTypes.length)];
                layout[y][x].container = {
                    type: containerType.id,
                    name: containerType.name,
                    icon: containerType.icon,
                    looted: false,
                    contents: this.generateContainerContents(buildingType)
                };

                placed = true;
            }
        }
    }

    // Generate building enemies
    static generateBuildingEnemies(buildingType) {
        const enemies = [];
        const enemyCount = Math.random() < buildingType.enemyChance ? 
            Math.floor(Math.random() * 3) + 1 : 0;

        for (let i = 0; i < enemyCount; i++) {
            const monsterId = buildingType.resources[Math.floor(Math.random() * buildingType.resources.length)];
            const monster = monsters.find(m => m.id === monsterId);
            if (monster) {
                enemies.push({
                    ...monster,
                    position: null
                });
            }
        }

        return enemies;
    }

    // Generate container contents
    static generateContainerContents(buildingType) {
        const resourceCount = Math.floor(Math.random() * 3) + 1;
        const resources = [];

        for (let i = 0; i < resourceCount; i++) {
            const resourceId = buildingType.resources[Math.floor(Math.random() * buildingType.resources.length)];
            const quantity = Math.floor(Math.random() * 2) + 1;

            resources.push({
                id: resourceId,
                quantity: quantity
            });
        }

        return resources;
    }

    // Move within building
    static moveInBuilding(x, y) {
        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun || !currentRun.buildingLayout) return false;

        const cell = currentRun.buildingLayout[y][x];
        
        // Validate move
        if (cell.type === 'wall' || !this.isCellAdjacentToPlayer(x, y, currentRun.buildingPosition)) {
            return false;
        }

        // Update position
        gameState.update(state => ({
            currentRun: {
                ...state.currentRun,
                buildingPosition: { x, y },
                moves: state.currentRun.moves + 1,
                stamina: Math.max(0, state.currentRun.stamina - 2)
            }
        }));

        // Explore cell
        this.exploreBuildingCell(x, y);

        return true;
    }

    // Check if cell is adjacent to player
    static isCellAdjacentToPlayer(x, y, playerPos) {
        return (Math.abs(x - playerPos.x) + Math.abs(y - playerPos.y)) === 1;
    }

    // Explore building cell
    static exploreBuildingCell(x, y) {
        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun || !currentRun.buildingLayout) return;

        const cell = currentRun.buildingLayout[y][x];
        if (cell.explored) return;

        gameState.update(state => {
            const newLayout = [...state.currentRun.buildingLayout];
            newLayout[y][x] = {
                ...cell,
                explored: true
            };

            return {
                currentRun: {
                    ...state.currentRun,
                    buildingLayout: newLayout
                }
            };
        });
    }

    // Loot container in building
    static lootContainer(x, y) {
        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun || !currentRun.buildingLayout) return;

        const cell = currentRun.buildingLayout[y][x];
        if (!cell.container || cell.container.looted) return;

        // Add contents to run inventory
        cell.container.contents.forEach(item => {
            this.addItemToRunInventory(item.id, item.quantity);
        });

        // Mark as looted
        gameState.update(state => {
            const newLayout = [...state.currentRun.buildingLayout];
            newLayout[y][x] = {
                ...cell,
                container: {
                    ...cell.container,
                    looted: true
                }
            };

            return {
                currentRun: {
                    ...state.currentRun,
                    buildingLayout: newLayout
                }
            };
        });

        return true;
    }

    // Helper method to add items to run inventory
    static addItemToRunInventory(itemId, quantity) {
        gameState.update(state => ({
            currentRun: {
                ...state.currentRun,
                inventory: [
                    ...state.currentRun.inventory,
                    { id: itemId, quantity }
                ]
            }
        }));
    }
}