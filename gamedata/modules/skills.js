import './gameState.js';
import { PerkSystem } from './PerkSystem.js';
import { perks } from '../db/perks.js';

export const skills = {
    initialized: false,

    initialize() {
        if (this.initialized) return;

        PerkSystem.initializePlayerPerks();
        
        this.renderSkillsPage();
        this.setupEventListeners();
        gameState.subscribe('player.perks', () => this.renderSkillsPage());
        this.initialized = true;
    },

    renderSkillsPage() {
        const skillsPage = document.getElementById('skills-subpage');
        if (!skillsPage) return;

        const allPerks = PerkSystem.getAllPerksProgress();
        const categories = this.categorizePerks(allPerks);
        console.log('renderSkillsPage')

        skillsPage.innerHTML = `
            <h3 class="subpage-title">Skills & Perks</h3>
            <p>Improve your passive abilities through gameplay</p>
            
            <div class="skills-grid">
                ${Object.entries(categories).map(([categoryName, categoryPerks]) => `
                    <div class="skill-category">
                        <h4>${categoryName}</h4>
                        <div class="skill-list">
                            ${categoryPerks.map(perk => this.createPerkElement(perk)).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    categorizePerks(allPerks) {
        const categories = {
            'Physical': ['endurance', 'vitality', 'strength'],
            'Survival': ['firstAid', 'stealth', 'crafting', 'marksmanship']
        };

        return Object.entries(categories).reduce((acc, [category, perkIds]) => {
            acc[category] = perkIds.map(id => allPerks[id]).filter(Boolean);
            return acc;
        }, {});
    },

    createPerkElement(perk) {
        if (!perk) return '';
        
        const nextLevelText = perk.isMaxLevel ? 'MAX LEVEL' : 
            `Lvl ${perk.level} → ${perk.level + 1}`;

        return `
            <div class="skill-item ${perk.isMaxLevel ? 'max-level' : ''}">
                <div class="skill-header">
                    <span class="skill-icon">${perk.perkData.icon || '⚡'}</span>
                    <span class="skill-name">${perk.perkData.name}</span>
                    <span class="skill-level">${nextLevelText}</span>
                </div>
                
                <div class="skill-description">${perk.perkData.description}</div>
                
                ${!perk.isMaxLevel ? `
                    <div class="skill-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${perk.progressPercent}%"></div>
                        </div>
                        <span class="progress-text">
                            ${perk.currentXP}/${perk.xpForNextLevel} XP
                        </span>
                    </div>
                    
                    ${perk.nextLevelEffect ? `
                        <div class="next-level-effect">
                            Next: ${PerkSystem.getEffectDescription(perk.nextLevelEffect)}
                        </div>
                    ` : ''}
                ` : ''}
                
                <div class="skill-requirements">
                    ${perk.perkData.leveling.action.replace('_', ' ')} to level up
                </div>
            </div>
        `;
    },

    setupEventListeners() {
        // Add any skill-specific interactions here
    }
};