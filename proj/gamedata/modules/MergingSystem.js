import './gameState.js';
import { selectors } from './selectors.js';
import { creatures, breedingRecipes, evolutionPaths, hybridCreatures } from '../db/creatures.js';

export class MergingSystem {
    static getAvailableCreatures() {
        return Object.keys(gameState.creatures);
    }

    static calculateCreatureStats(creature) {
        const baseData = creatures[creature.species] || hybridCreatures[creature.species];
        if (!baseData) return creature.stats;

        const levelMultiplier = 1 + (creature.level - 1) * 0.1;
        const fusionMultiplier = 1 + creature.fusionCount * 0.05;

        return Object.fromEntries(
            Object.entries(baseData.baseStats).map(([stat, value]) => [
                stat,
                Math.floor(value * levelMultiplier * fusionMultiplier)
            ])
        );
    }

    static fuseCreatures(baseCreatureId, materialCreatureId) {
        const playerCreatures = selectors.getCreatures(gameState);
        const baseCreature = playerCreatures[baseCreatureId];
        const materialCreature = playerCreatures[materialCreatureId];

        if (!baseCreature || !materialCreature) throw new Error('Creatures not found');
        if (baseCreature.species !== materialCreature.species) throw new Error('Same species required');

        const baseData = creatures[baseCreature.species] || hybridCreatures[baseCreature.species];
        if (!baseData) throw new Error(`Species ${baseCreature.species} missing`);

        const xpGained = materialCreature.level * 10;
        const newLevel = this.calculateNewLevel(baseCreature.level, baseCreature.xp + xpGained);
        const newStats = this.calculateCreatureStats({
            ...baseCreature,
            level: newLevel,
            fusionCount: baseCreature.fusionCount + 1
        });

        const updatedCreature = {
            ...baseCreature,
            level: newLevel,
            xp: baseCreature.xp + xpGained,
            fusionCount: baseCreature.fusionCount + 1,
            stats: newStats
        };

        gameState.update({
            [`creatures.${baseCreatureId}`]: [updatedCreature]
        });

        // Check evolution
        const evolution = evolutionPaths[baseCreature.species];
        if (evolution && updatedCreature.level >= evolution.requiredLevel && 
            updatedCreature.fusionCount >= evolution.requiredFusions) {
            return this.evolveCreature(updatedCreature, evolution.nextStage);
        }

        return {
            success: true,
            baseCreature: updatedCreature,
            materialCreature,
            xpGained,
            levelUp: newLevel > baseCreature.level,
            evolved: false
        };
    }

    static breedCreatures(parent1Id, parent2Id) {
        const playerCreatures = selectors.getCreatures(gameState);
        const parent1 = playerCreatures[parent1Id];
        const parent2 = playerCreatures[parent2Id];

        if (!parent1 || !parent2) throw new Error('Creatures not found');
        if (parent1.species === parent2.species) throw new Error('Different species required');

        const recipe = this.findBreedingRecipe(parent1.species, parent2.species);
        if (!recipe || !this.meetsBreedingRequirements(parent1, parent2, recipe)) {
            throw new Error('Cannot breed these creatures');
        }

        const successChance = this.calculateBreedingSuccess(parent1, parent2, recipe);
        const success = Math.random() < successChance;

        if (success) {
            const offspring = this.createOffspring(parent1, parent2, recipe.offspring);
            
            // Remove parents and add offspring
            const newCreatures = { ...gameState.creatures };
            delete newCreatures[parent1Id];
            delete newCreatures[parent2Id];
            newCreatures[offspring.id] = offspring;
            
            gameState.update({ creatures: [newCreatures] });

            return { success: true, offspring, parents: [parent1, parent2] };
        } else {
            const loseParents = Math.random() < 0.3;
            if (loseParents) {
                const newCreatures = { ...gameState.creatures };
                delete newCreatures[parent1Id];
                delete newCreatures[parent2Id];
                gameState.update({ creatures: [newCreatures] });
            }

            return { success: false, parentsLost: loseParents };
        }
    }

    static findBreedingRecipe(species1, species2) {
        return breedingRecipes.find(recipe => 
            (recipe.parent1 === species1 && recipe.parent2 === species2) ||
            (recipe.parent1 === species2 && recipe.parent2 === species1)
        );
    }

    static meetsBreedingRequirements(parent1, parent2, recipe) {
        const minLevel = recipe.requirements?.minLevel || 1;
        return parent1.level >= minLevel && parent2.level >= minLevel;
    }

    static calculateBreedingSuccess(parent1, parent2, recipe) {
        const baseChance = recipe.chance;
        const levelBonus = Math.min(0.3, ((parent1.level + parent2.level) / 2 - 1) * 0.05);
        const fusionBonus = (parent1.fusionCount + parent2.fusionCount) * 0.02;
        return Math.min(0.9, baseChance + levelBonus + fusionBonus);
    }

    static createOffspring(parent1, parent2, offspringSpecies) {
        const baseData = hybridCreatures[offspringSpecies];
        if (!baseData) throw new Error(`Species ${offspringSpecies} not found`);

        const inheritedTraits = [
            ...(parent1.traits || []).slice(0, 1),
            ...(parent2.traits || []).slice(0, 1)
        ].filter((trait, index, array) => array.indexOf(trait) === index);

        return {
            id: `creature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            species: offspringSpecies,
            name: baseData.name,
            level: 1,
            xp: 0,
            fusionCount: 0,
            stats: baseData.baseStats,
            traits: [...baseData.traits, ...inheritedTraits].slice(0, 3),
            parentSpecies: [parent1.species, parent2.species],
            createdAt: Date.now()
        };
    }

    static evolveCreature(creature, newSpecies) {
        const newBaseData = creatures[newSpecies] || hybridCreatures[newSpecies];
        if (!newBaseData) throw new Error(`Species ${newSpecies} not found`);

        const evolvedCreature = {
            ...creature,
            species: newSpecies,
            name: newBaseData.name,
            stats: this.calculateCreatureStats({ ...creature, species: newSpecies }),
            traits: [...newBaseData.traits, ...(creature.traits || [])].slice(0, 3),
            evolvedFrom: creature.species,
            evolutionCount: (creature.evolutionCount || 0) + 1
        };

        gameState.update({
            [`creatures.${creature.id}`]: [evolvedCreature]
        });

        return evolvedCreature;
    }

    static calculateNewLevel(currentLevel, xp) {
        const xpForNextLevel = currentLevel * 100;
        return xp >= xpForNextLevel 
            ? this.calculateNewLevel(currentLevel + 1, xp - xpForNextLevel)
            : currentLevel;
    }

    static canEvolve(creature) {
        const evolution = evolutionPaths[creature.species];
        return evolution && creature.level >= evolution.requiredLevel && 
               creature.fusionCount >= evolution.requiredFusions;
    }

    static getEvolutionInfo(creature) {
        const evolution = evolutionPaths[creature.species];
        return evolution ? {
            ...evolution,
            currentLevel: creature.level,
            currentFusions: creature.fusionCount
        } : null;
    }
}