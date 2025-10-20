import { materials } from '../db/materials.js';
import { items } from '../db/items.js';
import { getItemName, addItemToStash } from './utility.js'
import './gameState.js';
import { selectors } from './selectors.js';

export const debug = {
    // Initialize debug menu with event listeners
    initializeDebugMenu() {
        this.setupDebugEventListeners();
        this.populateDebugItemSelect();
    },

    // Set up all debug menu event listeners
    setupDebugEventListeners() {
        const debugToggle = document.getElementById('debug-toggle');
        const debugPanel = document.getElementById('debug-panel');
        const debugClose = document.getElementById('debug-close');
        const debugAddItem = document.getElementById('debug-add-item');
        
        if (!debugToggle || !debugPanel) {
            console.warn('Debug menu elements not found');
            return;
        }

        // Toggle debug panel visibility
        debugToggle.addEventListener('click', () => {
            const isVisible = debugPanel.style.display === 'block';
            debugPanel.style.display = isVisible ? 'none' : 'block';
        });

        // Close debug panel
        if (debugClose) {
            debugClose.addEventListener('click', () => {
                debugPanel.style.display = 'none';
            });
        }

        // Add item to stash
        if (debugAddItem) {
            debugAddItem.addEventListener('click', () => {
                this.handleAddItem();
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && debugPanel.style.display === 'block') {
                debugPanel.style.display = 'none';
            }
        });
    },

    // Handle adding items via debug menu
    handleAddItem() {
        const itemSelect = document.getElementById('debug-item-select');
        const quantityInput = document.getElementById('debug-item-quantity');
        
        if (!itemSelect || !quantityInput) {
            console.error('Debug item select elements not found');
            return;
        }

        const itemId = itemSelect.value;
        const quantity = parseInt(quantityInput.value) || 1;

        if (!itemId) {
            alert('Please select an item to add');
            return;
        }

        if (quantity <= 0) {
            alert('Quantity must be positive');
            return;
        }

        // Use the utility function which now uses the state system
        const addedCount = addItemToStash(itemId, quantity);
        
        if (addedCount > 0) {
            alert(`Added ${addedCount} ${getItemName(itemId)} to stash`);
            
            // Reset quantity input
            quantityInput.value = '1';
        } else {
            alert('Failed to add item - inventory might be full');
        }
    },

    // Populate the debug item select dropdown
    populateDebugItemSelect() {
        const select = document.getElementById('debug-item-select');
        if (!select) {
            console.error('Debug item select element not found');
            return;
        }

        select.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select an item...';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        // Add category groups
        this.addItemCategory(select, 'Materials', materials);
        this.addItemCategory(select, 'Items', items);
    },

    // Add items for a specific category
    addItemCategory(select, categoryName, itemArray) {
        if (itemArray.length === 0) return;

        // Add category optgroup
        const optgroup = document.createElement('optgroup');
        optgroup.label = categoryName;
        
        itemArray.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name} (${categoryName.slice(0, -1)})`;
            optgroup.appendChild(option);
        });
        
        select.appendChild(optgroup);
    },

    // Debug function to add multiple random items
    addRandomItems(count = 5) {
        const allItems = [...materials, ...items];
        let addedTotal = 0;

        for (let i = 0; i < count; i++) {
            const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
            const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
            
            const added = addItemToStash(randomItem.id, quantity);
            addedTotal += added;
            
            console.log(`Debug: Added ${added} ${randomItem.name}`);
        }

        return addedTotal;
    },

    // Debug function to clear inventory
    clearInventory() {
        gameState.update({
            'inventory.storage': [Array(40).fill(null)],
            'inventory.equipped': [Array(8).fill(null)]
        });
        
        console.log('Debug: Inventory cleared');
        return true;
    },

    // Debug function to fill inventory with useful items
    fillInventoryWithUsefulItems() {
        const usefulItems = [
            { id: 'medkit', quantity: 3 },
            { id: 'staminaPotion', quantity: 2 },
            { id: 'bandage', quantity: 5 },
            { id: 'water', quantity: 3 },
            { id: 'food', quantity: 2 }
        ];

        let addedTotal = 0;

        usefulItems.forEach(item => {
            const added = addItemToStash(item.id, item.quantity);
            addedTotal += added;
        });

        console.log(`Debug: Added ${addedTotal} useful items`);
        return addedTotal;
    },

    // Debug function to max out player stats
    maxPlayerStats() {
        gameState.update({
            'player': [{
                health: 999,
                maxHealth: 999,
                stamina: 999,
                maxStamina: 999,
                carryWeight: 999,
                currentWeight: 0,
                level: 99,
                stats: {
                    endurance: { value: 999, grade: 'S' },
                    vitality: { value: 999, grade: 'S' },
                    firstAid: { value: 999, grade: 'S' },
                    strength: { value: 999, grade: 'S' }
                }
            }]
        });

        console.log('Debug: Player stats maxed out');
        return true;
    },

    // Debug function to reset player to default
    resetPlayer() {
        const defaultState = gameState.getDefaultState();
        gameState.updatePlayer(() => defaultState.player);
        
        console.log('Debug: Player reset to default');
        return true;
    },

    // Debug function to complete a run with rewards
    completeRun(locationId = 'forest') {
        if (selectors.isInRun(gameState)) {
            alert('Cannot complete run while already in a run!');
            return false;
        }

        const runRewards = [
            { id: 'scrapMetal', quantity: 10 },
            { id: 'cloth', quantity: 8 },
            { id: 'electronics', quantity: 5 },
            { id: 'medkit', quantity: 2 }
        ];

        // Add run to history
        const currentHistory = selectors.getRunHistory(gameState) || [];
        gameState.update({
            'runHistory': [{
                    location: locationId,
                    status: 'extracted',
                    duration: 1200, // 20 minutes
                    moves: 45,
                    extractedItems: runRewards
                }]
        });

        // Add rewards to inventory
        runRewards.forEach(item => {
            addItemToStash(item.id, item.quantity);
        });

        console.log(`Debug: Completed run in ${locationId} with rewards`);
        return true;
    },

    // Debug function to get current game state info
    getGameStateInfo() {
        const state = gameState.state;
        return {
            playerLevel: selectors.getPlayerLevel(gameState),
            playerHealth: selectors.getPlayerHealth(gameState),
            inventorySlots: selectors.getStorageSlots(gameState).filter(slot => slot !== null).length,
            totalRuns: (selectors.getRunHistory(gameState) || []).length,
            currentRun: selectors.isInRun(gameState),
            inCombat: selectors.isInCombat(gameState),
            inBuilding: selectors.isInBuilding(gameState)
        };
    },

    // Export game state for debugging
    exportGameState() {
        const state = gameState.state;
        const stateString = JSON.stringify(state, null, 2);
        
        // Create download link
        const blob = new Blob([stateString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `game-state-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('Debug: Game state exported');
        return true;
    },

    // Import game state from JSON
    importGameState(jsonString) {
        try {
            const newState = JSON.parse(jsonString);
            gameState.update(() => newState);
            console.log('Debug: Game state imported successfully');
            return true;
        } catch (error) {
            console.error('Debug: Failed to import game state:', error);
            return false;
        }
    }
};

// Add debug functions to window for console access (development only)
window.debug = {
    addRandomItems: (count) => debug.addRandomItems(count),
    clearInventory: () => debug.clearInventory(),
    fillUsefulItems: () => debug.fillInventoryWithUsefulItems(),
    maxStats: () => debug.maxPlayerStats(),
    resetPlayer: () => debug.resetPlayer(),
    completeRun: (location) => debug.completeRun(location),
    getStateInfo: () => debug.getGameStateInfo(),
    exportState: () => debug.exportGameState(),
    importState: (json) => debug.importGameState(json)
};