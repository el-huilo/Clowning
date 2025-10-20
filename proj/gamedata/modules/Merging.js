import './gameState.js';
import { selectors } from './selectors.js';
import { MergingSystem } from './MergingSystem.js';
import { creatures, hybridCreatures } from '../db/creatures.js';

export const merging = {
    selectedCreatures: [],
    currentMode: 'fusion',
    initialized: false,

    initialize() {
        if (this.initialized) return;
        
        this.renderMergingStation();
        this.setupEventListeners();
        gameState.subscribe('creatures', () => this.onCreaturesUpdate());
        gameState.subscribe('companion', () => this.renderCompanion());
        this.initialized = true;
    },

    renderMergingStation() {
        const mergingSubpage = document.getElementById('merging-subpage');
        if (!mergingSubpage) return;

        mergingSubpage.innerHTML = `
            <h3 class="subpage-title">Merging Station</h3>
            <p>Fuse creatures of the same species or breed different species for hybrids.</p>
            
            <div class="merging-interface">
                <div class="merging-controls">
                    <div class="mode-selector">
                        <button class="mode-btn active" data-mode="fusion">Fusion</button>
                        <button class="mode-btn" data-mode="breeding">Breeding</button>
                    </div>
                    
                    <div class="selected-display">
                        <h4>Selected Creatures</h4>
                        <div class="selected-list" id="selected-creatures-list"></div>
                    </div>
                    
                    <div class="action-buttons">
                        <button id="fuse-btn" class="action-btn" disabled>Fuse Creatures</button>
                        <button id="breed-btn" class="action-btn" disabled>Breed Creatures</button>
                        <button id="clear-selection" class="action-btn secondary">Clear</button>
                    </div>
                </div>
                
                <div class="creatures-grid" id="creatures-grid"></div>
                <div class="merging-info">
                    <h4>Merging Information</h4>
                    <div id="merging-details">Select creatures to see options.</div>
                </div>
            </div>
            
            <div class="companion-section">
                <h4>Current Companion</h4>
                <div id="companion-display"></div>
            </div>
        `;

        this.renderCreaturesGrid();
        this.renderCompanion();
    },

    setupEventListeners() {
        // Use event delegation on the creatures grid container
        document.getElementById('creatures-grid')?.addEventListener('click', (e) => {
            const card = e.target.closest('.creature-card');
            if (card) {
                this.toggleCreatureSelection(card.dataset.creatureId);
            }
        });

        // Other event listeners
        document.addEventListener('click', (e) => {
            if (e.target.matches('.mode-btn')) {
                this.switchMode(e.target.dataset.mode);
            } else if (e.target.matches('#fuse-btn')) {
                this.performFusion();
            } else if (e.target.matches('#breed-btn')) {
                this.performBreeding();
            } else if (e.target.matches('#clear-selection')) {
                this.clearSelection();
            } else if (e.target.matches('.remove-btn')) {
                this.toggleCreatureSelection(e.target.dataset.creatureId);
            } else if (e.target.matches('#dismiss-companion')) {
                this.dismissCompanion();
            }
        });
    },

    onCreaturesUpdate() {
        this.renderCreaturesGrid();
        this.renderCompanion();
        this.clearSelection();
    },

    switchMode(mode) {
        this.currentMode = mode;
        this.clearSelection();
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        const fuseBtn = document.getElementById('fuse-btn');
        const breedBtn = document.getElementById('breed-btn');
        if (fuseBtn && breedBtn) {
            fuseBtn.style.display = mode === 'fusion' ? 'block' : 'none';
            breedBtn.style.display = mode === 'breeding' ? 'block' : 'none';
        }
        
        this.updateMergingInfo();
    },

    renderCreaturesGrid() {
        const grid = document.getElementById('creatures-grid');
        if (!grid) return;

        const availableCreatures = MergingSystem.getAvailableCreatures();
        
        if (availableCreatures.length === 0) {
            grid.innerHTML = '<div class="no-creatures">No creatures available.</div>';
            return;
        }

        grid.innerHTML = availableCreatures.map(creatureId => this.createCreatureCard(creatureId)).join('');
    },

    createCreatureCard(creatureId) {
        const creature = gameState.creatures[creatureId];
        if (!creature) return '';
        
        const speciesData = creatures[creature.species];
        const isSelected = this.selectedCreatures.includes(creatureId);
        const canEvolve = MergingSystem.canEvolve(creature);

        return `
            <div class="creature-card ${isSelected ? 'selected' : ''}" data-creature-id="${creatureId}">
                <div class="creature-header">
                    <span class="creature-icon">${speciesData?.icon || '❓'}</span>
                    <span class="creature-name">${creature.name}</span>
                    <span class="creature-level">Lvl ${creature.level}</span>
                </div>
                <div class="creature-species">${creature.species}</div>
                <div class="creature-stats">
                    ${Object.entries(creature.stats).map(([stat, value]) => 
                        `<div class="stat"><span>${this.getStatIcon(stat)}</span> ${value}</div>`
                    ).join('')}
                </div>
                <div class="creature-meta">
                    <div class="fusion-count">Fusions: ${creature.fusionCount}</div>
                    ${canEvolve ? '<div class="can-evolve">★ Can Evolve</div>' : ''}
                </div>
            </div>
        `;
    },

    toggleCreatureSelection(creatureId) {
        const index = this.selectedCreatures.indexOf(creatureId);
        
        if (index === -1) {
            // Add to selection
            if (this.currentMode === 'breeding' && this.selectedCreatures.length >= 2) {
                this.selectedCreatures = [creatureId];
            } else {
                this.selectedCreatures.push(creatureId);
            }
        } else {
            // Remove from selection
            this.selectedCreatures.splice(index, 1);
        }

        this.updateSelectionDisplay();
        this.updateMergingInfo();
        this.updateActionButtons();
    },

    updateSelectionDisplay() {
        const selectedList = document.getElementById('selected-creatures-list');
        if (!selectedList) return;

        selectedList.innerHTML = this.selectedCreatures.map(creatureId => {
            const creature = gameState.creatures[creatureId];
            if (!creature) return '';
            
            const speciesData = creatures[creature.species];
            return `
                <div class="selected-creature">
                    <span class="creature-icon">${speciesData?.icon || '❓'}</span>
                    <span class="creature-name">${creature.name} (Lvl ${creature.level})</span>
                    <button class="remove-btn" data-creature-id="${creatureId}">×</button>
                </div>
            `;
        }).join('');

        // Update all creature cards to reflect selection state
        document.querySelectorAll('.creature-card').forEach(card => {
            const cardCreatureId = card.dataset.creatureId;
            card.classList.toggle('selected', this.selectedCreatures.includes(cardCreatureId));
        });
    },

    // ... rest of the methods remain the same (updateMergingInfo, showFusionInfo, etc.)
    updateMergingInfo() {
        const infoDiv = document.getElementById('merging-details');
        if (!infoDiv) return;

        if (this.selectedCreatures.length === 0) {
            infoDiv.innerHTML = 'Select creatures to see merging options.';
            return;
        }

        const selectedCreatures = this.selectedCreatures.map(id => gameState.creatures[id]).filter(Boolean);
        
        this.currentMode === 'fusion' 
            ? this.showFusionInfo(selectedCreatures, infoDiv)
            : this.showBreedingInfo(selectedCreatures, infoDiv);
    },

    showFusionInfo(creatures, infoDiv) {
        if (creatures.length < 2 || !creatures.every(c => c.species === creatures[0].species)) {
            infoDiv.innerHTML = 'Select 2+ creatures of the same species for fusion.';
            return;
        }

        const [baseCreature, ...materials] = creatures;
        const totalXPGain = materials.reduce((sum, c) => sum + c.level * 10, 0);
        const newLevel = MergingSystem.calculateNewLevel(baseCreature.level, baseCreature.xp + totalXPGain);
        const newStats = MergingSystem.calculateCreatureStats({
            ...baseCreature,
            level: newLevel,
            fusionCount: baseCreature.fusionCount + materials.length
        });

        const evolutionInfo = MergingSystem.getEvolutionInfo(baseCreature);

        infoDiv.innerHTML = `
            <div class="fusion-preview">
                <h5>Fusion Preview</h5>
                <div><strong>Base:</strong> ${baseCreature.name} (Lvl ${baseCreature.level})</div>
                <div><strong>Materials:</strong> ${materials.map(c => `${c.name} (Lvl ${c.level})`).join(', ')}</div>
                <div><strong>Result:</strong> ${baseCreature.name} (Lvl ${newLevel})</div>
                <div class="stat-changes"><strong>Stat Changes:</strong>
                    ${Object.keys(newStats).map(stat => 
                        `<div>${stat}: ${baseCreature.stats[stat]} → ${newStats[stat]} (+${newStats[stat] - baseCreature.stats[stat]})</div>`
                    ).join('')}
                </div>
                ${evolutionInfo ? `
                    <div class="evolution-info">
                        <strong>Evolution:</strong> Level ${evolutionInfo.currentLevel}/${evolutionInfo.requiredLevel}, 
                        Fusions ${evolutionInfo.currentFusions}/${evolutionInfo.requiredFusions}
                    </div>
                ` : ''}
            </div>
        `;
    },

    showBreedingInfo(creatures, infoDiv) {
        if (creatures.length !== 2 || creatures[0].species === creatures[1].species) {
            infoDiv.innerHTML = 'Select 2 different species for breeding.';
            return;
        }

        const [parent1, parent2] = creatures;
        const recipe = MergingSystem.findBreedingRecipe(parent1.species, parent2.species);
        
        if (!recipe) {
            infoDiv.innerHTML = 'These species cannot breed.';
            return;
        }

        const successChance = MergingSystem.calculateBreedingSuccess(parent1, parent2, recipe);
        const offspring = hybridCreatures[recipe.offspring];

        infoDiv.innerHTML = `
            <div class="breeding-preview">
                <h5>Breeding Preview</h5>
                <div><strong>Parents:</strong> ${parent1.name} + ${parent2.name}</div>
                <div><strong>Offspring:</strong> ${offspring.name}</div>
                <div><strong>Success:</strong> ${Math.round(successChance * 100)}%</div>
                <div class="breeding-warning"><em>Warning: Failure may lose parents!</em></div>
            </div>
        `;
    },

    updateActionButtons() {
        const fuseBtn = document.getElementById('fuse-btn');
        const breedBtn = document.getElementById('breed-btn');
        
        if (!fuseBtn || !breedBtn) return;

        const canFuse = this.currentMode === 'fusion' && 
            this.selectedCreatures.length >= 2 &&
            this.selectedCreatures.every(id => {
                const creature = gameState.creatures[id];
                return creature && creature.species === this.getFirstSelectedSpecies();
            });
        
        const canBreed = this.currentMode === 'breeding' && 
            this.selectedCreatures.length === 2 &&
            new Set(this.selectedCreatures.map(id => gameState.creatures[id]?.species)).size === 2;

        fuseBtn.disabled = !canFuse;
        breedBtn.disabled = !canBreed;
    },

    getFirstSelectedSpecies() {
        return this.selectedCreatures.length > 0 ? gameState.creatures[this.selectedCreatures[0]]?.species : null;
    },

    async performFusion() {
        if (this.selectedCreatures.length < 2) return;

        try {
            const baseId = this.selectedCreatures[0];
            for (const materialId of this.selectedCreatures.slice(1)) {
                const result = MergingSystem.fuseCreatures(baseId, materialId);
                this.showMessage(result.evolved 
                    ? `${result.baseCreature.name} evolved!`
                    : `${result.baseCreature.name} gained ${result.xpGained} XP`
                , result.evolved ? 'success' : 'info');
            }
            this.clearSelection();
        } catch (error) {
            this.showMessage(`Fusion failed: ${error.message}`, 'error');
        }
    },

    async performBreeding() {
        if (this.selectedCreatures.length !== 2) return;

        try {
            const result = MergingSystem.breedCreatures(this.selectedCreatures[0], this.selectedCreatures[1]);
            this.showMessage(result.success 
                ? `Breeding successful! Got ${result.offspring.name}!`
                : result.parentsLost 
                    ? 'Breeding failed! Parents lost.'
                    : 'Breeding failed, parents survived.'
            , result.success ? 'success' : result.parentsLost ? 'error' : 'warning');
            this.clearSelection();
        } catch (error) {
            this.showMessage(`Breeding failed: ${error.message}`, 'error');
        }
    },

    clearSelection() {
        this.selectedCreatures = [];
        this.updateSelectionDisplay();
        this.updateMergingInfo();
        this.updateActionButtons();
    },

    renderCompanion() {
        const companionDisplay = document.getElementById('companion-display');
        if (!companionDisplay) return;

        const companion = selectors.getCompanion(gameState);
        
        companionDisplay.innerHTML = companion 
            ? this.createCompanionCard(companion)
            : `
                <div class="no-companion">
                    <p>No active companion.</p>
                    <button id="assign-companion-btn" class="action-btn">Assign Companion</button>
                </div>
            `;
    },

    createCompanionCard(companion) {
        const stats = MergingSystem.calculateCreatureStats(companion);
        const speciesData = creatures[companion.species];
        return `
            <div class="companion-card">
                <div class="companion-header">
                    <span class="companion-icon">${speciesData?.icon || '❓'}</span>
                    <span class="companion-name">${companion.name}</span>
                    <span class="companion-level">Lvl ${companion.level}</span>
                </div>
                <div class="companion-stats">
                    ${Object.entries(stats).map(([stat, value]) => 
                        `<div class="stat"><span>${this.getStatIcon(stat)}</span> ${value}</div>`
                    ).join('')}
                </div>
                <button class="action-btn secondary" id="dismiss-companion">Dismiss</button>
            </div>
        `;
    },

    dismissCompanion() {
        gameState.update({ 'companion': [null] });
    },

    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `merging-message merging-message-${type}`;
        messageElement.textContent = message;
        
        const mergingInterface = document.querySelector('.merging-interface');
        if (mergingInterface) {
            mergingInterface.insertBefore(messageElement, mergingInterface.firstChild);
            setTimeout(() => messageElement.remove(), 5000);
        } else {
            alert(message);
        }
    },

    getStatIcon(stat) {
        const icons = { health: '❤️', attack: '⚔️', defense: '🛡️', speed: '⚡', stamina: '💪' };
        return icons[stat] || '❓';
    }
};