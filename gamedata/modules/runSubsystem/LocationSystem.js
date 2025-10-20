import '../gameState.js';
import { selectors } from '../selectors.js';
import { locations } from '../../db/locations.js';

export class LocationSystem {
    // Get all available locations
    static getAvailableLocations() {
        return locations.filter(location => 
            location.requiredLevel <= selectors.getPlayerLevel(gameState)
        );
    }

    // Get location by ID
    static getLocation(locationId) {
        return locations.find(l => l.id === locationId);
    }

    // Check if player can access location
    static canAccessLocation(locationId) {
        const location = this.getLocation(locationId);
        const playerLevel = selectors.getPlayerLevel(gameState);
        return location && playerLevel >= location.requiredLevel;
    }

    // Start a run in a location
    static startRun(locationId) {
        const location = this.getLocation(locationId);
        if (!location) {
            throw new Error(`Location ${locationId} not found`);
        }

        if (!this.canAccessLocation(locationId)) {
            throw new Error(`Cannot access location ${locationId}`);
        }

        const runData = {
            location: locationId,
            status: 'in_progress',
            startTime: Date.now(),
            duration: 0,
            exploredAreas: [],
            currentArea: null,
            encounters: [],
            extractedItems: [],
            health: selectors.getPlayerHealth(gameState),
            stamina: selectors.getPlayerStamina(gameState),
            inventory: [],
            moves: 0,
            playerPosition: { x: 0, y: 0 }
        };

        gameState.update(state => ({
            currentRun: runData
        }));

        return runData;
    }

    // End current run
    static endRun(status, reason = '') {
        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun) return null;

        const completedRun = {
            ...currentRun,
            status,
            endTime: Date.now(),
            duration: Math.floor((Date.now() - currentRun.startTime) / 1000),
            reason
        };

        gameState.batch(() => {
            // Add to run history
            const runHistory = selectors.getRunHistory(gameState);
            gameState.update(state => ({
                runHistory: [...runHistory, completedRun],
                currentRun: null
            }));

            // Handle successful extraction
            if (status === 'extracted') {
                this.handleRunRewards(completedRun);
            }
        });

        return completedRun;
    }

    // Handle rewards for successful run
    static handleRunRewards(run) {
        // Add extracted items to permanent storage
        run.extractedItems.forEach(item => {
            // This would use your existing addItemToStash function
            console.log(`Reward: ${item.quantity}x ${item.id}`);
        });

        // Grant experience, currency, etc.
        // TODO: Implement reward system
    }

    // Get current run duration
    static getCurrentRunDuration() {
        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun) return 0;
        
        return Math.floor((Date.now() - currentRun.startTime) / 1000);
    }
}