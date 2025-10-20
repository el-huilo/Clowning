import { materials } from '../db/materials.js';
import { items } from '../db/items.js';
import './gameState.js';
// Generally frequently used functions across other modules

// Generate inventory slots
export function generateInventorySlots(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    console.log(gameState.inventory.storage)
    gameState.inventory.storage.forEach((item, index) => {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot' + (item ? ' filled' : '');
        if (item) {
            const itemElement = document.createElement('div');
            itemElement.className = 'item';
            itemElement.textContent = item.id.substring(0, 3).toUpperCase();
            slot.appendChild(itemElement);
        }
        
        container.appendChild(slot);
    });
}

export function getItemName(itemId) {
    // Check if it's a material
    const material = materials.find(m => m.id === itemId);
    if (material) return material.name;
    
    // Check if it's an item
    const item = items.find(i => i.id === itemId);
    if (item) return item.name;
    
    return 'Unknown';
}

// Update player stats in UI
export function updatePlayerStats() {
    document.getElementById('hp-value').textContent = 
        `${gameState.player.health}/${gameState.player.maxHealth}`;
    document.getElementById('stamina-value').textContent = 
        `${gameState.player.stamina}/${gameState.player.maxStamina}`;
    document.getElementById('weight-value').textContent = 
        `${gameState.player.currentWeight}/${gameState.player.carryWeight}`;
    document.getElementById('level-value').textContent = gameState.player.level;
    
    const armorElement = document.getElementById('armor-value');
    if (armorElement) {
        armorElement.textContent = gameState.player.armor || 0;
    }
}

export function addItemToStash(itemId, quantity) {
    let actuallyAdded = 0;
    
    // Try to stack with existing items first
    for (let i = 0; i < gameState.inventory.storage.length && quantity > 0; i++) {
        const slot = gameState.inventory.storage[i];
        if (slot?.id === itemId) {
            const spaceAvailable = 99 - slot.quantity;
            const toAdd = Math.min(quantity, spaceAvailable);

            gameState.update({
                [`inventory.storage.${i}`]: [{ id: itemId, quantity: slot.quantity + toAdd }]
            })
            quantity -= toAdd;
            actuallyAdded += toAdd;
        }
    }
    
    // Then use empty slots
    for (let i = 0; i < gameState.inventory.storage.length && quantity > 0; i++) {
        if (gameState.inventory.storage[i] === null) {
            const toAdd = Math.min(quantity, 99);
            gameState.update({
                [`inventory.storage.${i}`]: [{ id: itemId, quantity: toAdd }]
            })
            quantity -= toAdd;
            actuallyAdded += toAdd;
        }
    }
    
    return actuallyAdded;
}

export function showSection(section) {
    // Map old section names to new page structure
    const pageMap = {
        'storage': { page: 'safehouse', subpage: 'storage' },
        'crafting': { page: 'safehouse', subpage: 'crafting' },
        'merging': { page: 'safehouse', subpage: 'merging' },
        'character': { page: 'character', subpage: 'equipment' },
        'skills': { page: 'character', subpage: 'skills' },
        'stats': { page: 'character', subpage: 'stats' }
    };
    
    if (pageMap[section]) {
        const { page, subpage } = pageMap[section];
        showPage(page);
        showSubpage(subpage);
        
        // Update active subsection button
        document.querySelectorAll('.subsection-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-subsection') === subpage) {
                btn.classList.add('active');
            }
        });
    }
}

export function addLogEntry(message) {
    const logEntries = document.querySelector('.log-entries');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = message;
    logEntries.appendChild(entry);
    
    // Auto-scroll to bottom
    logEntries.scrollTop = logEntries.scrollHeight;
}

export function getMaterialName(materialId) {
    const material = materials.find(m => m.id === materialId);
    return material ? material.name : 'Unknown';
}