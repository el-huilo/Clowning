export const creatures = {
    // Basic creatures
    goblin: {
        id: 'goblin',
        name: 'Goblin Scout',
        level: 1,
        baseStats: {
            health: 25,
            attack: 8,
            defense: 3,
            speed: 12,
            stamina: 15
        },
        rarity: 'common',
        traits: ['agile', 'cowardly'],
        icon: '👺',
        description: 'A small, cunning creature that attacks in packs.'
    },

    woodlandSpirit: {
        id: 'woodlandSpirit',
        name: 'Woodland Spirit',
        level: 3,
        baseStats: {
            health: 35,
            attack: 12,
            defense: 8,
            speed: 8,
            stamina: 25
        },
        rarity: 'uncommon',
        traits: ['nature', 'healing'],
        icon: '🌿',
        description: 'A mystical being of the forest with healing powers.'
    },

    stoneGolem: {
        id: 'stoneGolem',
        name: 'Stone Golem',
        level: 5,
        baseStats: {
            health: 60,
            attack: 15,
            defense: 20,
            speed: 3,
            stamina: 40
        },
        rarity: 'rare',
        traits: ['tank', 'resistant'],
        icon: '🗿',
        description: 'A massive construct of stone, nearly impervious to damage.'
    },

    wolf: {
        id: 'wolf',
        name: 'Alpha Wolf',
        level: 2,
        baseStats: {
            health: 30,
            attack: 10,
            defense: 5,
            speed: 15,
            stamina: 20
        },
        rarity: 'common',
        traits: ['pack', 'ferocious'],
        icon: '🐺',
        description: 'A fierce predator that hunts with its pack.'
    }
};

// Breeding recipes - which creatures can breed to produce what
export const breedingRecipes = [
    {
        parent1: 'goblin',
        parent2: 'wolf',
        offspring: 'goblinRider',
        chance: 0.4,
        requirements: {
            minLevel: 3
        }
    },
    {
        parent1: 'woodlandSpirit',
        parent2: 'stoneGolem',
        offspring: 'earthElemental',
        chance: 0.3,
        requirements: {
            minLevel: 5
        }
    },
    {
        parent1: 'goblin',
        parent2: 'woodlandSpirit',
        offspring: 'goblinShaman',
        chance: 0.5,
        requirements: {
            minLevel: 4
        }
    }
];

// Creature evolution paths
export const evolutionPaths = {
    goblin: {
        nextStage: 'goblinWarrior',
        requiredLevel: 10,
        requiredFusions: 5
    },
    wolf: {
        nextStage: 'direWolf',
        requiredLevel: 8,
        requiredFusions: 4
    }
};

// New creatures from breeding
export const hybridCreatures = {
    goblinRider: {
        id: 'goblinRider',
        name: 'Goblin Wolf Rider',
        level: 1,
        baseStats: {
            health: 45,
            attack: 18,
            defense: 8,
            speed: 16,
            stamina: 30
        },
        rarity: 'uncommon',
        traits: ['agile', 'ferocious', 'mounted'],
        icon: '🐺👺',
        description: 'A goblin mounted on a wolf, combining speed and ferocity.'
    },

    earthElemental: {
        id: 'earthElemental',
        name: 'Earth Elemental',
        level: 1,
        baseStats: {
            health: 80,
            attack: 20,
            defense: 25,
            speed: 4,
            stamina: 50
        },
        rarity: 'rare',
        traits: ['tank', 'nature', 'resistant'],
        icon: '🌿🗿',
        description: 'A fusion of stone and nature, immensely powerful and durable.'
    },

    goblinShaman: {
        id: 'goblinShaman',
        name: 'Goblin Shaman',
        level: 1,
        baseStats: {
            health: 40,
            attack: 14,
            defense: 6,
            speed: 10,
            stamina: 35
        },
        rarity: 'uncommon',
        traits: ['agile', 'nature', 'healing'],
        icon: '👺🌿',
        description: 'A goblin infused with nature magic, capable of healing allies.'
    }
};