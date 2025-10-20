// Helper functions to extract specific data from state
export const selectors = {
    // Player selectors
    getPlayer: (state) => state.player,
    getPlayerHealth: (state) => state.player.health,
    getPlayerMaxHealth: (state) => state.player.maxHealth,
    getPlayerStamina: (state) => state.player.stamina,
    getPlayerMaxStamina: (state) => state.player.maxStamina,
    getPlayerWeight: (state) => state.player.currentWeight,
    getPlayerMaxWeight: (state) => state.player.carryWeight,
    getPlayerLevel: (state) => state.player.level,
    getPlayerStats: (state) => state.player.stats,
    // Player progression selectors
    getPlayerGold: (state) => state.player.gold || 0,
    getCreatureCount: (state) => state.creatures.length,

    // Inventory selectors
    getInventory: (state) => state.inventory,
    getStorageSlots: (state) => state.inventory.storage,
    getEquippedSlots: (state) => state.inventory.equipped,
    // Inventory status selectors
    getUsedStorageSlots: (state) => state.inventory.storage.filter(slot => slot !== null).length,
    getTotalStorageSlots: (state) => state.inventory.storage.length,

    // Equipment selectors
    getEquipment: (state) => state.equipment,
    getEquipmentSlot: (slot) => (state) => state.equipment[slot],

    // Run selectors
    getCurrentRun: (state) => state.currentRun,
    // Run status selectors  
    isInRun: (state) => !!state.currentRun,
    isInCombat: (state) => !!state.combatState?.inCombat,
    isInBuilding: (state) => !!state.currentBuilding,
    // Run history selectors
    getRunHistory: (state) => state.runHistory || [],
    getRunCount: (state) => (state.runHistory || []).length,

    // Combat selectors
    getCombatState: (state) => state.combatState,

    // Utility selectors
    hasItem: (itemId) => (state) => state.inventory.storage.some(slot => slot?.id === itemId),
    
    getItemQuantity: (itemId) => (state) => 
        state.inventory.storage
            .filter(slot => slot?.id === itemId)
            .reduce((total, slot) => total + slot.quantity, 0),

    canCarryMore: (weightToAdd = 0) => (state) => (state.player.currentWeight + weightToAdd) <= state.player.carryWeight,
    
    // Equipment status selectors
    getEquippedCount: (state) => Object.values(state.equipment).filter(item => item !== null).length,
    getTotalArmor: (state) => {
        // You might want to calculate this based on equipped items
        return state.player.armor || 0;
    },

    // Crafting-related selectors
    getCraftingMaterials: (state) => {
        const storage = state.inventory.storage;
        const materials = {};
        
        storage.forEach(slot => {
            if (slot) {
                materials[slot.id] = (materials[slot.id] || 0) + slot.quantity;
            }
        });
        
        return materials;
    },
    
    getMaterialQuantity: (materialId) => (state) => {
        const storage = state.inventory.storage;
        return storage
            .filter(slot => slot?.id === materialId)
            .reduce((total, slot) => total + slot.quantity, 0);
    },
    
    // Check if player can craft any items
    canCraftAnything: (state) => {
        // This would require access to crafts data, so it might be better
        // to keep this logic in the crafting module
        return false; // Placeholder
    },

    // Run system selectors
    getCurrentRun: (state) => state.currentRun,
    getRunHistory: (state) => state.runHistory || [],
    
    isInRun: (state) => !!state.currentRun,
    isRunInProgress: (state) => 
        state.currentRun?.status === 'in_progress',
    
    getRunLocation: (state) => 
        state.currentRun?.location,
    
    getRunStats: (state) => {
        const run = state.currentRun;
        if (!run) return null;
        
        return {
            health: run.health,
            stamina: run.stamina,
            moves: run.moves,
            inventorySize: run.inventory.length
        };
    },
    
    getCurrentTile: (state) => {
        const run = state.currentRun;
        if (!run || !run.map) return null;
        
        const { playerPosition, map } = run;
        return map[playerPosition.y]?.[playerPosition.x] || null;
    },
    
    canExtract: (state) => {
        const currentTile = getCurrentTile(state);
        return currentTile?.type === 'extraction' && currentTile.content?.available;
    },

    // Building system selectors
    isInBuilding: (state) => !!state.currentRun?.currentBuilding,
    getBuildingLayout: (state) => state.currentRun?.buildingLayout,
    getBuildingPosition: (state) => state.currentRun?.buildingPosition,
    getCurrentBuilding: (state) => state.currentRun?.currentBuilding,

    // Building cell selectors
    getCurrentBuildingCell: (state) => {
        const layout = state.currentRun?.buildingLayout;
        const position = state.currentRun?.buildingPosition;
        if (!layout || !position) return null;
        
        return layout[position.y]?.[position.x] || null;
    },

    getAdjacentBuildingCells: (state) => {
        const layout = state.currentRun?.buildingLayout;
        const position = state.currentRun?.buildingPosition;
        if (!layout || !position) return [];

        const directions = [
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 }
        ];

        return directions
            .map(({ dx, dy }) => ({
                x: position.x + dx,
                y: position.y + dy,
                cell: layout[position.y + dy]?.[position.x + dx]
            }))
            .filter(({ cell }) => cell && cell.type !== 'wall');
    },

    // Creature selectors
    getCreatures: (state) => state.creatures || [],
    getCompanion: (state) => state.companion,
    
    getCreatureById: (id) => (state) => 
        state.creatures.find(c => c.id === id),
    
    getCreaturesBySpecies: (species) => (state) => 
        state.creatures.filter(c => c.species === species),
    
    canFuseCreatures: (creature1Id, creature2Id) => (state) => {
        const creature1 = state.creatures.find(c => c.id === creature1Id);
        const creature2 = state.creatures.find(c => c.id === creature2Id);
        
        return creature1 && creature2 && creature1.species === creature2.species;
    },
    
    getTotalCreatures: (state) => state.creatures.length,
    getUniqueSpecies: (state) => 
        [...new Set(state.creatures.map(c => c.species))],
    
    // Companion selectors
    hasCompanion: (state) => !!state.companion,
    getCompanionStats: (state) => 
        state.companion ? state.companion.stats : null,
    // Perk selectors
    getPlayerPerks: (state) => state.player.perks || {},
    getPlayerPerk: (perkId) => (state) => state.player.perks?.[perkId],
    
    getPerkLevel: (perkId) => (state) => 
        state.player.perks?.[perkId]?.level || 1,
    
    getTotalPerkLevels: (state) => 
        Object.values(state.player.perks || {}).reduce((sum, perk) => sum + perk.level, 0),
    
    // Player stats with perk bonuses
    getPlayerStatsWithPerks: (state) => {
        const player = state.player;
        const perks = state.player.perks || {};
        
        // This would calculate the actual stats including perk bonuses
        // For now, return base stats - PerkSystem handles the actual application
        return {
            maxHealth: player.maxHealth || player.baseMaxHealth,
            maxStamina: player.maxStamina || player.baseMaxStamina,
            carryWeight: player.carryWeight || player.baseCarryWeight
        };
    }
};