import { crafts } from '../db/crafts.js';
import { generateInventorySlots, getItemName, addItemToStash, getMaterialName } from './utility.js'
import './gameState.js';
import { selectors } from './selectors.js';

export const crafting = {
    currentFilter: 'all',
    initialized: false,

    // Initialize crafting system
    initializeCrafting() {
        if (this.initialized) return;
        
        this.renderCraftingRecipes();
        this.setupCraftingEventListeners();
        this.initialized = true;
    },

    // Set up crafting event listeners
    setupCraftingEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleFilterChange(e.target);
            });
        });

        // Listen for inventory changes to update craftability
        gameState.subscribe('inventory.storage', () => {
            if (this.initialized) {
                this.renderCraftingRecipes();
            }
        });
    },

    // Handle filter changes
    handleFilterChange(button) {
        const filter = button.getAttribute('data-filter');
        
        // Update active button
        document.querySelectorAll('.filter-button').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // Filter recipes
        this.currentFilter = filter;
        this.filterCraftingRecipes(filter);
    },

    // Filter crafting recipes by category
    filterCraftingRecipes(filter) {
        const recipes = document.querySelectorAll('.crafting-item');
        
        recipes.forEach(recipe => {
            const category = recipe.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                recipe.style.display = 'flex';
            } else {
                recipe.style.display = 'none';
            }
        });
    },

    // Render all crafting recipes
    renderCraftingRecipes() {
        const container = document.getElementById('crafting-recipes');
        if (!container) {
            console.warn('Crafting recipes container not found');
            return;
        }

        container.innerHTML = '';
        
        crafts.forEach(craft => {
            const recipeElement = this.createRecipeElement(craft);
            container.appendChild(recipeElement);
        });

        // Apply current filter
        this.filterCraftingRecipes(this.currentFilter);
    },

    // Create individual recipe element
    createRecipeElement(craft) {
        const recipeElement = document.createElement('div');
        recipeElement.className = 'crafting-item';
        recipeElement.setAttribute('data-category', craft.category || 'other');
        
        const canCraft = this.canCraftItem(craft);
        
        recipeElement.innerHTML = `
            <div class="recipe-info">
                <strong class="recipe-name">${craft.name}</strong>
                <p class="recipe-description">${craft.description}</p>
                <div class="crafting-materials">
                    ${this.renderRecipeIngredients(craft)}
                </div>
            </div>
            <button class="craft-button" ${canCraft ? '' : 'disabled'}>
                ${canCraft ? 'Craft' : 'Insufficient materials'}
            </button>
        `;

        // Add craft event listener if craftable
        const craftButton = recipeElement.querySelector('.craft-button');
        if (canCraft) {
            craftButton.addEventListener('click', () => {
                this.craftItem(craft);
            });
        }

        return recipeElement;
    },

    // Render recipe ingredients with availability status
    renderRecipeIngredients(craft) {
        return craft.ingredients.map(ingredient => {
            const hasEnough = this.hasEnoughMaterial(ingredient.material, ingredient.quantity);
            const materialName = getMaterialName(ingredient.material);
            
            return `
                <span class="material ${hasEnough ? 'has-enough' : 'not-enough'}">
                    ${ingredient.quantity}x ${materialName}
                </span>
            `;
        }).join('');
    },

    // Check if player can craft an item
    canCraftItem(craft) {
        return craft.ingredients.every(ingredient => 
            this.hasEnoughMaterial(ingredient.material, ingredient.quantity)
        );
    },

    // Check if player has enough of a specific material
    hasEnoughMaterial(materialId, requiredQuantity) {
        const storage = selectors.getStorageSlots(gameState);
        let totalQuantity = 0;

        for (const slot of storage) {
            if (slot && slot.id === materialId) {
                totalQuantity += slot.quantity;
                if (totalQuantity >= requiredQuantity) {
                    return true;
                }
            }
        }

        return false;
    },

    // Craft an item
    craftItem(craft) {
        if (!this.canCraftItem(craft)) {
            this.showCraftingMessage('Not enough materials!', 'error');
            return;
        }

        // Deduct all required materials
        craft.ingredients.forEach(ingredient => {
            this.deductMaterial(ingredient.material, ingredient.quantity);
        });

        // Add crafted item to inventory
        const addedCount = addItemToStash(craft.result.item, craft.result.quantity);
        console.log("addedCount = ", addedCount)
        if (addedCount > 0) {
            this.showCraftingMessage(
                `Successfully crafted ${craft.result.quantity}x ${getItemName(craft.result.item)}!`,
                'success'
            );
            
            // Re-render recipes to update craftability
            this.renderCraftingRecipes();
        } else {
            this.showCraftingMessage('Failed to craft item - inventory might be full!', 'error');
            // Refund materials if crafting failed
            craft.ingredients.forEach(ingredient => {
                addItemToStash(ingredient.material, ingredient.quantity);
            });
        }

        // Track perk XP
        import('./PerkSystem.js').then(({ PerkActionTracker }) => {
            const complexity = craft.ingredients.length; // Simple complexity measure
            PerkActionTracker.trackCrafting(complexity, true);
        });
    },

    // Deduct materials from inventory
    deductMaterial(materialId, quantity) {
        console.log(materialId, "   ", quantity)
        let remaining = quantity
        // Deduct from existing stacks
        for (let i = 0; i < gameState.inventory.storage.length && remaining > 0; i++) {
            const slot = gameState.inventory.storage[i];
            console.log(slot);
            if (slot && slot.id === materialId) {
                console.log(1);
                if (slot.quantity > remaining) {
                    console.log(2);
                    // Take from this stack
                    gameState.update({
                        [`inventory.storage.${i}`]: [{ id: slot.id, quantity: slot.quantity - remaining }]
                    });
                    remaining = 0;
                } else {
                    console.log(3);
                    // Take entire stack and continue
                    remaining -= slot.quantity;
                    gameState.update({
                        [`inventory.storage.${i}`]: [null]
                    });
                }
            }
        }
        
        if (remaining > 0) {
            console.warn(`Could not deduct all ${materialId}. Remaining: ${remaining}`);
        }
    },

    // Show crafting message to user
    showCraftingMessage(message, type = 'info') {
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `crafting-message crafting-message-${type}`;
        messageElement.textContent = message;
        
        // Add to crafting interface
        const craftingContainer = document.getElementById('crafting-recipes');
        if (craftingContainer) {
            craftingContainer.parentNode.insertBefore(messageElement, craftingContainer);
            
            // Remove after delay
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 3000);
        } else {
            // Fallback to alert
            alert(message);
        }
    },

    // Get all available crafts for a specific category
    getCraftsByCategory(category) {
        return crafts.filter(craft => craft.category === category);
    },

    // Get crafts that player can currently afford
    getAffordableCrafts() {
        return crafts.filter(craft => this.canCraftItem(craft));
    },

    // Get crafts that require a specific material
    getCraftsRequiringMaterial(materialId) {
        return crafts.filter(craft => 
            craft.ingredients.some(ing => ing.material === materialId)
        );
    },

    // Check if player can craft any items in a category
    canCraftAnyInCategory(category) {
        const categoryCrafts = this.getCraftsByCategory(category);
        return categoryCrafts.some(craft => this.canCraftItem(craft));
    },

    // Bulk craft multiple items if possible
    bulkCraftItem(craft, count = 1) {
        if (count < 1) return 0;

        let craftedCount = 0;
        
        for (let i = 0; i < count; i++) {
            if (this.canCraftItem(craft)) {
                this.craftItem(craft);
                craftedCount++;
            } else {
                break;
            }
        }
        
        return craftedCount;
    },

    // Calculate total materials needed for multiple crafts
    calculateMaterialsForBulkCraft(craft, count) {
        const materials = {};
        
        craft.ingredients.forEach(ingredient => {
            materials[ingredient.material] = ingredient.quantity * count;
        });
        
        return materials;
    },

    // Check if player has enough materials for bulk craft
    canBulkCraftItem(craft, count) {
        const requiredMaterials = this.calculateMaterialsForBulkCraft(craft, count);
        
        return Object.entries(requiredMaterials).every(([materialId, quantity]) => 
            this.hasEnoughMaterial(materialId, quantity)
        );
    },

    // Update crafting UI (called when inventory changes)
    updateCraftingUI() {
        if (this.initialized) {
            this.renderCraftingRecipes();
        }
    }
};

// Add CSS for crafting messages if not already present
const craftingStyles = `
    .crafting-message {
        padding: 10px;
        margin: 10px 0;
        border-radius: 5px;
        text-align: center;
        font-weight: bold;
    }
    
    .crafting-message-success {
        background: #2a5a2a;
        color: #a0ffa0;
        border: 1px solid #4a7a4a;
    }
    
    .crafting-message-error {
        background: #5a2a2a;
        color: #ffa0a0;
        border: 1px solid #7a4a4a;
    }
    
    .crafting-message-info {
        background: #2a2a5a;
        color: #a0a0ff;
        border: 1px solid #4a4a7a;
    }
    
    .recipe-info {
        flex: 1;
    }
    
    .recipe-name {
        color: #ff6a6a;
        display: block;
        margin-bottom: 5px;
    }
    
    .recipe-description {
        color: #a0a0ff;
        font-size: 12px;
        margin-bottom: 8px;
    }
`;

// Inject styles
if (!document.querySelector('#crafting-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'crafting-styles';
    styleElement.textContent = craftingStyles;
    document.head.appendChild(styleElement);
}