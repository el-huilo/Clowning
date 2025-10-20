import '../gameState.js';
import { selectors } from '../selectors.js';
import { getMaterialName } from '../utility.js';

export class TileInteractionSystem {
    // Handle interaction with current tile
    static handleTileInteraction() {
        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun) return;

        const { playerPosition, map } = currentRun;
        const tile = map[playerPosition.y][playerPosition.x];

        if (!tile.explored) return;

        switch (tile.type) {
            case 'resource':
                this.collectResources(tile);
                break;
            case 'encounter':
                this.startEncounter(tile);
                break;
            case 'building':
                this.enterBuilding(tile);
                break;
            case 'safe':
                this.restInSafeArea(tile);
                break;
            case 'extraction':
                this.extractFromRun();
                break;
            case 'special':
                this.triggerSpecialEvent(tile);
                break;
        }
    }

    // Collect resources from tile
    static collectResources(tile) {
        if (!tile.content || tile.content.length === 0) {
            this.addLogEntry("No resources left to collect here.");
            return;
        }

        gameState.batch(() => {
            tile.content.forEach(resource => {
                this.addItemToRunInventory(resource.id, resource.quantity);
                this.addLogEntry(`Collected: ${resource.quantity}x ${getMaterialName(resource.id)}`);
            });

            // Clear resources
            this.updateTileContent(tile, []);
        });

        this.addLogEntry("You've collected all available resources.");
    }

    // Start encounter
    static startEncounter(tile) {
        if (tile.content.resolved) {
            this.addLogEntry("You've already resolved this encounter.");
            return;
        }

        this.addLogEntry("You've encountered something!");
        // This would trigger the combat system
        // For now, just mark as resolved
        this.updateTileContent(tile, { ...tile.content, resolved: true });
    }
    
    static enterBuilding(tile) {
        if (tile.content.explored) {
            this.addLogEntry("You've already explored this building.");
            return;
        }

        // Import and use BuildingSystem
        import('./BuildingSystem.js').then(({ BuildingSystem }) => {
            if (BuildingSystem.enterBuilding(tile)) {
                this.addLogEntry(`You enter the building.`);
            
                // Mark building as explored
                this.updateTileContent(tile, { ...tile.content, explored: true });
            
                // Show building interface using buildingsMap
                import('../modules/buildingsMap.js').then(({ buildingsMap }) => {
                    buildingsMap.showBuildingInterface(tile);
                });
            }
        });
    }

    // Rest in safe area
    static restInSafeArea(tile) {
        gameState.update(state => ({
            currentRun: {
                ...state.currentRun,
                health: Math.min(100, state.currentRun.health + (tile.content.healthRestore || 10)),
                stamina: Math.min(100, state.currentRun.stamina + (tile.content.staminaRestore || 20))
            }
        }));

        this.addLogEntry("You feel refreshed and recovered some health and stamina.");
    }

    // Extract from run
    static extractFromRun() {
        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun) return;

        // Import the LocationSystem to end the run
        import('./LocationSystem.js').then(({ LocationSystem }) => {
            LocationSystem.endRun('extracted', 'Successfully extracted');
            this.addLogEntry("Run completed successfully!");
        });
    }

    // Trigger special event
    static triggerSpecialEvent(tile) {
        const events = {
            treasure: () => {
                this.addLogEntry("You found a hidden treasure!");
                // Add rare items
            },
            trap: () => {
                const damage = Math.floor(Math.random() * 15) + 5;
                gameState.update(state => ({
                    currentRun: {
                        ...state.currentRun,
                        health: Math.max(0, state.currentRun.health - damage)
                    }
                }));
                this.addLogEntry(`You took ${damage} damage from a trap!`);
            },
            shrine: () => {
                this.addLogEntry("You found an ancient shrine. You feel empowered!");
                // Apply buffs
            }
        };

        const eventType = tile.content.event || 'treasure';
        if (events[eventType]) {
            events[eventType]();
        }
    }

    // Helper methods
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

    static updateTileContent(tile, newContent) {
        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun) return;

        gameState.update(state => {
            const newMap = [...state.currentRun.map];
            const newMapRow = [...newMap[tile.y]]

            newMapRow[tile.x] = {
                ...tile,
                content: newContent
            };

            newMap[tile.y] = newMapRow

            return {
                currentRun: {
                    ...state.currentRun,
                    map: newMap
                }
            };
        });
    }

    static addLogEntry(message) {
        // This would integrate with your existing log system
        console.log(`[RUN LOG]: ${message}`);
    }
}