import { getItemName, updatePlayerStats } from './utility.js';
export const equipmentUI = {

    // Primary UI handling submodule

    // Initialize equipment UI and state listeners
    initializeUI() {
        this.renderSubpage();
        this.renderEquipmentSlots();
        this.setupSlotStateListeners();
    },

    renderSubpage() {
        const subpage = document.getElementById('equipment-subpage');

        // header
        const content = `
            <h3 class="subpage-title">Character Equipment</h3>
            <p>Manage your equipped items and gear</p>

            <div class="character-equipment">
        `;

        // rows of slots
        const equipmentSlots = [
            ['headwear', 'mask'],
            ['shirt', 'jacket', 'backpack'],
            ['shoulders', 'armwraps', 'hands'],
            ['belt', 'pants'],
            ['primaryHand', 'secondaryHand', 'backWeapon'],
            ['socks', 'shoes']
        ]

        for (const row of equipmentSlots) {
            content += `
                    <div class="equipment-row">
            `;

            for (const slot of row)
                content += `
                            <div class="equipment-slot" data-slot="${slot}">
                                    <div class="slot-label">${slot}</div>
                                    <div class="slot-content"></div>
                            </div>
                `;
            
            content += `
                    </div>
            `;
        }

        content += `
            </div>
            <!-- Moved equipped items grid here -->
            <div class="equipped-items-section">
                <h4>Equipped Items</h4>
                <div class="inventory-grid" id="equipped-grid">
                    <!-- Equipped items will be generated here -->
                </div>
            </div>
        `;
        subpage.innerHTML = content;
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

    // Update equipment UI using selectors
    updateEquipmentUI() {
        this.renderEquipmentSlots();
        
        const armorElement = document.getElementById('armor-value');
        if (armorElement) {
            armorElement.textContent = this.calculateTotalArmor();
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

    setupSlotStateListeners() {
        // Listen for specific slot changes
        Object.keys(selectors.getEquipment(gameState)).forEach(slotType => {
            gameState.subscribe(`equipment.${slotType}`, (newItem) => {
                const slotElement = document.querySelector(`[data-slot="${slotType}"]`);
                if (slotElement) {
                    this.renderEquipmentSlot(slotElement, slotType, newItem);
                    this.updateEquipmentUI();
                    updatePlayerStats();
                }
                else console.warn(`State listener failed - source EquipmentUI - slotType ${slotType}`)
            });
        });
    }
}