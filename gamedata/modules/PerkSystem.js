import './gameState.js';
import { selectors } from './selectors.js';
import { perks, perkLevelRequirements } from '../db/perks.js';

export class PerkSystem {
    static initializePlayerPerks() {
        const currentPerks = selectors.getPlayerPerks(gameState);
        
        if (!currentPerks || Object.keys(currentPerks).length === 0) {
            const initialPerks = Object.keys(perks).reduce((acc, perkId) => {
                acc[perkId] = { level: 1, currentXP: 0, totalXP: 0 };
                return acc;
            }, {});

            gameState.update({ 'player.perks': [initialPerks] });
        }
        
        this.applyAllPerkEffects();
    }

    static addPerkXP(perkId, actionType, amount = 1, context = {}) {
        const perkData = perks[perkId];
        if (!perkData || perkData.leveling.action !== actionType) return;

        if (!this.meetsActionRequirements(perkData, context)) return;

        const currentPerk = selectors.getPlayerPerk(perkId)(gameState);
        if (!currentPerk || currentPerk.level >= perkData.maxLevel) return;

        const xpGained = perkData.leveling.xpPerAction * amount;
        const newXP = currentPerk.currentXP + xpGained;
        const xpForNextLevel = this.getXPForNextLevel(currentPerk.level);

        let newLevel = currentPerk.level;
        let leveledUp = false;

        if (newXP >= xpForNextLevel && newLevel < perkData.maxLevel) {
            newLevel++;
            leveledUp = true;
        }

        gameState.update({
            [`player.perks.${perkId}`]: [{
                level: newLevel,
                currentXP: leveledUp ? newXP - xpForNextLevel : newXP,
                totalXP: currentPerk.totalXP + xpGained
            }]
        });

        if (leveledUp) {
            this.onPerkLevelUp(perkId, newLevel);
        }

        return { perkId, xpGained, newLevel, leveledUp };
    }

    static meetsActionRequirements(perkData, context) {
        const requirements = perkData.leveling.requirements || {};
        return Object.entries(requirements).every(([req, minValue]) => 
            (context[req] || 0) >= minValue
        );
    }

    static getXPForNextLevel(currentLevel) {
        return perkLevelRequirements[currentLevel] || Infinity;
    }

    static onPerkLevelUp(perkId, newLevel) {
        const perkData = perks[perkId];
        const effect = perkData.effects.find(e => e.level === newLevel);
        
        if (effect) {
            this.showLevelUpMessage(perkId, newLevel, effect);
        }

        this.applyAllPerkEffects();
    }

    static applyAllPerkEffects() {
        const playerPerks = selectors.getPlayerPerks(gameState);
        const totalEffects = {};

        Object.entries(playerPerks).forEach(([perkId, perk]) => {
            const perkData = perks[perkId];
            if (!perkData) return;

            // Sum effects for all achieved levels
            for (let level = 1; level <= perk.level; level++) {
                const effect = perkData.effects.find(e => e.level === level);
                if (effect) {
                    Object.entries(effect).forEach(([stat, value]) => {
                        if (stat !== 'level' && typeof value === 'number') {
                            totalEffects[stat] = (totalEffects[stat] || 0) + value;
                        }
                    });
                }
            }
        });

        // Apply stat bonuses
        Object.entries(totalEffects).forEach(([stat, value]) => {
            const baseStats = {
                stamina: 'baseMaxStamina',
                health: 'baseMaxHealth', 
                carryWeight: 'baseCarryWeight'
            };

            if (baseStats[stat]) {
                const baseValue = gameState.player[baseStats[stat]] || 80;
                gameState.update({ 
                    [`player.max${stat.charAt(0).toUpperCase() + stat.slice(1)}`]: [baseValue + value] 
                });
            }
            // Other stats are applied in their respective systems
        });
    }

    static showLevelUpMessage(perkId, level, effect) {
        const perkData = perks[perkId];
        const effectDesc = this.getEffectDescription(effect);
        const message = `🎉 ${perkData.name} Level ${level}! ${effectDesc}`;
        
        console.log(message);
        if (window.showGameNotification) {
            window.showGameNotification(message, 'success');
        }
    }

    static getEffectDescription(effect) {
        return Object.entries(effect)
            .filter(([stat]) => stat !== 'level')
            .map(([stat, value]) => {
                const descriptions = {
                    stamina: `+${value} max stamina`,
                    health: `+${value} max health`,
                    carryWeight: `+${value} carry weight`,
                    staminaConsumption: `${(value * 100)}% less stamina use`,
                    healthRegen: `+${value} health regen`,
                    healingEfficiency: `+${(value * 100)}% healing`,
                    bleedReduction: `+${(value * 100)}% bleed reduction`,
                    noiseReduction: `+${(value * 100)}% quieter`,
                    detectionReduction: `+${(value * 100)}% harder to detect`,
                    accuracy: `+${(value * 100)}% accuracy`,
                    stability: `+${(value * 100)}% stability`,
                    craftTime: `${(value * 100)}% faster crafting`,
                    materialCost: `${(value * 100)}% less materials`
                };
                return descriptions[stat] || `${stat}: ${value}`;
            })
            .join(', ');
    }

    static getPerkProgress(perkId) {
        const perk = selectors.getPlayerPerk(perkId)(gameState);
        const perkData = perks[perkId];
        if (!perk || !perkData) return null;

        const xpForNextLevel = this.getXPForNextLevel(perk.level);
        const progressPercent = (perk.currentXP / xpForNextLevel) * 100;

        return {
            ...perk,
            perkData,
            xpForNextLevel,
            progressPercent,
            nextLevelEffect: perkData.effects.find(e => e.level === perk.level + 1),
            isMaxLevel: perk.level >= perkData.maxLevel
        };
    }

    static getAllPerksProgress() {
        return Object.keys(perks).reduce((acc, perkId) => {
            acc[perkId] = this.getPerkProgress(perkId);
            return acc;
        }, {});
    }
}

// Simplified action tracker
export const PerkActions = {
    trackMovement(distance, staminaCost, type = 'walk') {
        if (staminaCost >= 5) {
            PerkSystem.addPerkXP('endurance', 'movement', distance / 10, { minStaminaCost: staminaCost });
        }
        if (type === 'sneak') {
            PerkSystem.addPerkXP('stealth', 'sneaking', distance / 5, { minDistance: distance });
        }
    },

    trackDamageTaken(damage, type = 'physical') {
        PerkSystem.addPerkXP('vitality', 'damage_taken', damage, { minDamage: damage });
    },

    trackMeleeAttack(damage, killed = false) {
        PerkSystem.addPerkXP('strength', 'melee_attack', damage * (killed ? 2 : 1), { minDamage: damage });
    },

    trackHealing(amount, type = 'medkit') {
        PerkSystem.addPerkXP('firstAid', 'healing', amount / 5, { minHealing: amount });
    },

    trackRangedAttack(damage, killed = false, headshot = false) {
        let multiplier = 1;
        if (killed) multiplier *= 2;
        if (headshot) multiplier *= 1.5;
        PerkSystem.addPerkXP('marksmanship', 'ranged_attack', damage * multiplier, { minDamage: damage });
    },

    trackCrafting(complexity, success = true) {
        if (success) {
            PerkSystem.addPerkXP('crafting', 'crafting', complexity, { minComplexity: complexity });
        }
    }
};