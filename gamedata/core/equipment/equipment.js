import './gameState.js';
import { selectors } from './selectors.js';
import { getItemName, updatePlayerStats } from './utility.js';
import { items } from '../db/items.js';

export const equipment = {
    // Initialize equipment UI and event listeners
    initializeEquipment() {
        this.renderEquipmentSlots();
        this.setupEquipmentEventListeners();
    },

    // Render all equipment slots using selectors
    renderEquipmentSlots() {
        const equipment = selectors.getEquipment(gameState);
        const slots = document.querySelectorAll('.equipment-slot');
        
        slots.forEach(slot => {
            const slotType = slot.getAttribute('data-slot');
            const item = equipment[slotType];
            
            this.renderEquipmentSlot(slot, slotType, item);
        });
    },

    // Render individual equipment slot
    renderEquipmentSlot(slotElement, slotType, item) {
        slotElement.classList.remove('filled');
        const contentElement = slotElement.querySelector('.slot-content');
        contentElement.textContent = '';
        
        if (item) {
            slotElement.classList.add('filled');
            const displayText = getItemName(item.id).substring(0, 3).toUpperCase();
            contentElement.textContent = displayText;
            slotElement.title = getItemName(item.id);
        } else {
            slotElement.title = `Empty ${slotType}`;
        }
    },

    // Set up event listeners for equipment slots
    setupEquipmentEventListeners() {
        const slots = document.querySelectorAll('.equipment-slot');
        
        slots.forEach(slot => {
            const newSlot = slot.cloneNode(true);
            slot.parentNode.replaceChild(newSlot, slot);
            this.setupSlotEventListeners(newSlot);
        });
    },

    setupSlotEventListeners(slot) {
        const slotType = slot.getAttribute('data-slot');
        
        slot.addEventListener('click', (e) => {
            if (e.button === 0) {
                this.openInventoryForSlot(slotType);
            }
        });
        
        slot.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.unequipItem(slotType);
        });
    },

    // Open inventory modal for slot selection
    openInventoryForSlot(slotType) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Select Item for ${this.formatSlotName(slotType)}</h3>
                <div class="inventory-items" id="equip-selector">
                    <!-- Inventory items will be populated here -->
                </div>
                <button class="modal-close">Close</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.populateEquipSelector(slotType, modal);
        this.setupEquipModalListeners(modal, slotType);
    },

    formatSlotName(slotType) {
        return slotType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    },

    // Populate selector using selectors
    populateEquipSelector(slotType, modal) {
        const container = modal.querySelector('#equip-selector');
        const storage = selectors.getStorageSlots(gameState);
        
        container.innerHTML = '';
        
        let hasCompatibleItems = false;
        
        storage.forEach((item, index) => {
            if (item && this.canItemGoInSlot(item.id, slotType)) {
                hasCompatibleItems = true;
                this.createEquipItemElement(container, item, index, slotType);
            }
        });
        
        if (!hasCompatibleItems) {
            container.innerHTML = '<div class="no-items">No compatible items in inventory</div>';
        }
    },

    createEquipItemElement(container, item, index, slotType) {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item-select';
        itemElement.innerHTML = `
            <div class="item-info">
                <div class="item-name">${getItemName(item.id)}</div>
                <div class="item-quantity">Quantity: ${item.quantity}</div>
            </div>
            <button class="equip-btn" data-slot="${slotType}" data-index="${index}">Equip</button>
        `;
        container.appendChild(itemElement);
    },

    setupEquipModalListeners(modal, slotType) {
        modal.querySelectorAll('.equip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-index'));
                this.equipItem(index, slotType);
                this.closeModal(modal);
            });
        });
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
    },

    closeModal(modal) {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    },

    // Check if item can be equipped in slot
    canItemGoInSlot(itemId, slotType) {
        const item = items.find(i => i.id === itemId);
        if (!item) return false;
        
        if (Array.isArray(item.type)) {
            return item.type.includes(slotType);
        }
        return item.type === slotType;
    },

    // Equip item from inventory to slot using selectors
    equipItem(inventoryIndex, slotType) {
        console.log('Starting equip process:', { inventoryIndex, slotType });

        const storage = selectors.getStorageSlots(gameState);
        const item = storage[inventoryIndex];
        
        console.log('Item to equip:', item);
        
        if (!item) {
            console.warn('No item at inventory index:', inventoryIndex);
            return;
        }
        
        if (!this.canItemGoInSlot(item.id, slotType)) {
            alert(`This item cannot be equipped in the ${this.formatSlotName(slotType)} slot!`);
            return;
        }
        
        // Check if slot is occupied using selector
        const currentEquipped = selectors.getEquipmentSlot(slotType)(gameState);
        if (currentEquipped) {
            if (!this.unequipItemToInventory(slotType)) {
                alert("Cannot unequip current item - no space in inventory!");
                return;
            }
        }
        console.log(gameState)
        
        // Remove from inventory
        this.removeItemFromInventory(inventoryIndex);
        
        // Apply item effects
        this.applyItemEffects(item.id);

        // Equip the new item
        gameState.update({
            [`equipment.${slotType}`]: [{id: item.id, quantity: 1}]
        });

        console.log(gameState)
        
        console.log(`Equipped ${getItemName(item.id)} in ${slotType}`);
    },

    // Unequip item to inventory using selectors
    unequipItemToInventory(slotType) {
        const equipment = selectors.getEquipment(gameState);
        const item = equipment[slotType];
        
        if (!item) return true;
        
        const storage = selectors.getStorageSlots(gameState);
        const emptySlotIndex = storage.findIndex(slot => slot === null);
        
        if (emptySlotIndex === -1) {
            return false;
        }
        
        this.removeItemEffects(item.id);
        
        
        gameState.update({
            [`equipment.${slotType}`]: [null]
        });

        this.addItemToInventory(item.id, 1, emptySlotIndex);
        
        return true;
    },

    // Unequip item (public method)
    unequipItem(slotType) {
        if (!this.unequipItemToInventory(slotType)) {
            alert("No space in inventory to unequip this item!");
        }
    },

    // Remove item from inventory at specific index
    removeItemFromInventory(index) {
        gameState.update({
            [`inventory.storage.${index}`]: [null]
        });
    },

    // Add item to inventory at specific index
    addItemToInventory(itemId, quantity, index) {
        gameState.update({
            [`inventory.storage.${index}`]: [{ id: itemId, quantity: quantity }]
        });
    },

    // Apply item effects to player stats using selectors
    applyItemEffects(itemId) {
        const item = items.find(i => i.id === itemId);
        if (!item) return;
        
        const updates = {};
        const currentPlayer = selectors.getPlayer(gameState);
        
        if (item.armor) {
            updates.armor = (currentPlayer.armor || 0) + item.armor;
        }
        
        if (item.weightReduction) {
            updates.weightReduction = (currentPlayer.weightReduction || 0) + item.weightReduction;
        }
        
        if (item.healthBonus) {
            updates.maxHealth = currentPlayer.maxHealth + item.healthBonus;
            updates.health = Math.min(
                currentPlayer.health + item.healthBonus,
                updates.maxHealth
            );
        }
        
        if (item.staminaBonus) {
            updates.maxStamina = currentPlayer.maxStamina + item.staminaBonus;
            updates.stamina = Math.min(
                currentPlayer.stamina + item.staminaBonus,
                updates.maxStamina
            );
        }
        
        const keys = Object.keys(updates);

        if (keys.length > 0) {
            console.log(updates)
            for (const key of keys) {
                gameState.update({
                    [`player.${key}`]: [updates[key]]
                })
            }
        }
    },

    // Remove item effects from player stats using selectors
    removeItemEffects(itemId) {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const updates = {};
        const currentPlayer = selectors.getPlayer(gameState);
        
        if (item.armor) {
            updates.armor = Math.max(0, (currentPlayer.armor || 0) - item.armor);
        }
        
        if (item.weightReduction) {
            updates.weightReduction = Math.max(0, (currentPlayer.weightReduction || 0) - item.weightReduction);
        }
        
        if (item.healthBonus) {
            updates.maxHealth = Math.max(100, currentPlayer.maxHealth - item.healthBonus);
            updates.health = Math.min(currentPlayer.health, updates.maxHealth);
        }
        
        if (item.staminaBonus) {
            updates.maxStamina = Math.max(80, currentPlayer.maxStamina - item.staminaBonus);
            updates.stamina = Math.min(currentPlayer.stamina, updates.maxStamina);
        }

        const keys = Object.keys(updates);

        if (keys.length > 0) {
            console.log(updates)
            for (const key of keys) {
                gameState.update({
                    [`player.${key}`]: [updates[key]]
                })
            }
        }
    },

    // Get total armor from all equipped items using selectors
    calculateTotalArmor() {
        const equipment = selectors.getEquipment(gameState);
        let totalArmor = 0;
        
        Object.values(equipment).forEach(item => {
            if (item) {
                const itemData = items.find(i => i.id === item.id);
                if (itemData?.armor) {
                    totalArmor += itemData.armor;
                }
            }
        });
        
        return totalArmor;
    },

    // Get total weight reduction from equipped items using selectors
    calculateTotalWeightReduction() {
        const equipment = selectors.getEquipment(gameState);
        let totalReduction = 0;
        
        Object.values(equipment).forEach(item => {
            if (item) {
                const itemData = items.find(i => i.id === item.id);
                if (itemData?.weightReduction) {
                    totalReduction += itemData.weightReduction;
                }
            }
        });
        
        return totalReduction;
    },

    // Update equipment UI using selectors
    updateEquipmentUI() {
        this.renderEquipmentSlots();
        
        const totalArmor = this.calculateTotalArmor();
        const armorElement = document.getElementById('armor-value');
        if (armorElement) {
            armorElement.textContent = totalArmor;
        }
    },

    // Get equipped item in specific slot using selector
    getEquippedItem(slotType) {
        return selectors.getEquipmentSlot(slotType)(gameState);
    },

    // Check if slot is occupied using selector
    isSlotOccupied(slotType) {
        return !!selectors.getEquipmentSlot(slotType)(gameState);
    },

    // Get all equipped items as array using selector
    getAllEquippedItems() {
        const equipment = selectors.getEquipment(gameState);
        return Object.entries(equipment)
            .filter(([_, item]) => item !== null)
            .map(([slot, item]) => ({ slot, ...item }));
    }
};

// Listen for specific slot changes
Object.keys(selectors.getEquipment(gameState)).forEach(slotType => {
    gameState.subscribe(`equipment.${slotType}`, (newItem) => {
        const slotElement = document.querySelector(`[data-slot="${slotType}"]`);
        if (slotElement) {
            equipment.renderEquipmentSlot(slotElement, slotType, newItem);
            equipment.updateEquipmentUI();
            updatePlayerStats();
        }
    });
});