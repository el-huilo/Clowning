// Perks database - passive skills that level up through specific actions
export const perks = {
    // Physical perks
    endurance: {
        id: "endurance",
        name: "Endurance",
        description: "Increases maximum stamina and reduces stamina consumption",
        category: "physical",
        maxLevel: 10,
        baseEffect: { stamina: 0 },
        effects: [
            { level: 1, stamina: 5, staminaConsumption: -0.05 },
            { level: 2, stamina: 10, staminaConsumption: -0.08 },
            { level: 3, stamina: 15, staminaConsumption: -0.11 },
            { level: 4, stamina: 20, staminaConsumption: -0.14 },
            { level: 5, stamina: 25, staminaConsumption: -0.17 },
            { level: 6, stamina: 30, staminaConsumption: -0.20 },
            { level: 7, stamina: 35, staminaConsumption: -0.23 },
            { level: 8, stamina: 40, staminaConsumption: -0.26 },
            { level: 9, stamina: 45, staminaConsumption: -0.29 },
            { level: 10, stamina: 50, staminaConsumption: -0.32 }
        ],
        // How this perk levels up
        leveling: {
            action: "movement", // Type of action that grants XP
            xpPerAction: 0.5,   // XP gained per action
            actions: ["walk", "run", "sprint"], // Specific actions
            requirements: {
                minStaminaCost: 5 // Minimum stamina cost to count
            }
        }
    },

    vitality: {
        id: "vitality",
        name: "Vitality", 
        description: "Increases maximum health and improves natural regeneration",
        category: "physical",
        maxLevel: 10,
        baseEffect: { health: 0 },
        effects: [
            { level: 1, health: 5, healthRegen: 0.1 },
            { level: 2, health: 10, healthRegen: 0.2 },
            { level: 3, health: 15, healthRegen: 0.3 },
            { level: 4, health: 20, healthRegen: 0.4 },
            { level: 5, health: 25, healthRegen: 0.5 },
            { level: 6, health: 30, healthRegen: 0.6 },
            { level: 7, health: 35, healthRegen: 0.7 },
            { level: 8, health: 40, healthRegen: 0.8 },
            { level: 9, health: 45, healthRegen: 0.9 },
            { level: 10, health: 50, healthRegen: 1.0 }
        ],
        leveling: {
            action: "damage_taken",
            xpPerAction: 2, // XP per point of damage taken
            actions: ["physical_damage", "bleeding", "poison"],
            requirements: {
                minDamage: 1
            }
        }
    },

    strength: {
        id: "strength",
        name: "Strength",
        description: "Increases melee damage and carry weight",
        category: "physical", 
        maxLevel: 10,
        baseEffect: { meleeDamage: 0, carryWeight: 0 },
        effects: [
            { level: 1, meleeDamage: 2, carryWeight: 5 },
            { level: 2, meleeDamage: 4, carryWeight: 10 },
            { level: 3, meleeDamage: 6, carryWeight: 15 },
            { level: 4, meleeDamage: 8, carryWeight: 20 },
            { level: 5, meleeDamage: 10, carryWeight: 25 },
            { level: 6, meleeDamage: 12, carryWeight: 30 },
            { level: 7, meleeDamage: 14, carryWeight: 35 },
            { level: 8, meleeDamage: 16, carryWeight: 40 },
            { level: 9, meleeDamage: 18, carryWeight: 45 },
            { level: 10, meleeDamage: 20, carryWeight: 50 }
        ],
        leveling: {
            action: "melee_attack",
            xpPerAction: 3,
            actions: ["melee_hit", "melee_kill"],
            requirements: {
                minDamage: 1
            }
        }
    },

    // Survival perks
    firstAid: {
        id: "firstAid",
        name: "First Aid",
        description: "Improves healing efficiency and reduces bleeding",
        category: "survival",
        maxLevel: 10,
        baseEffect: { healingEfficiency: 0, bleedReduction: 0 },
        effects: [
            { level: 1, healingEfficiency: 0.05, bleedReduction: 0.05 },
            { level: 2, healingEfficiency: 0.10, bleedReduction: 0.10 },
            { level: 3, healingEfficiency: 0.15, bleedReduction: 0.15 },
            { level: 4, healingEfficiency: 0.20, bleedReduction: 0.20 },
            { level: 5, healingEfficiency: 0.25, bleedReduction: 0.25 },
            { level: 6, healingEfficiency: 0.30, bleedReduction: 0.30 },
            { level: 7, healingEfficiency: 0.35, bleedReduction: 0.35 },
            { level: 8, healingEfficiency: 0.40, bleedReduction: 0.40 },
            { level: 9, healingEfficiency: 0.45, bleedReduction: 0.45 },
            { level: 10, healingEfficiency: 0.50, bleedReduction: 0.50 }
        ],
        leveling: {
            action: "healing",
            xpPerAction: 4,
            actions: ["use_medkit", "use_bandage", "natural_healing"],
            requirements: {
                minHealing: 5
            }
        }
    },

    stealth: {
        id: "stealth",
        name: "Stealth",
        description: "Reduces noise and improves sneaking",
        category: "survival",
        maxLevel: 10,
        baseEffect: { noiseReduction: 0, detectionReduction: 0 },
        effects: [
            { level: 1, noiseReduction: 0.05, detectionReduction: 0.05 },
            { level: 2, noiseReduction: 0.10, detectionReduction: 0.10 },
            { level: 3, noiseReduction: 0.15, detectionReduction: 0.15 },
            { level: 4, noiseReduction: 0.20, detectionReduction: 0.20 },
            { level: 5, noiseReduction: 0.25, detectionReduction: 0.25 },
            { level: 6, noiseReduction: 0.30, detectionReduction: 0.30 },
            { level: 7, noiseReduction: 0.35, detectionReduction: 0.35 },
            { level: 8, noiseReduction: 0.40, detectionReduction: 0.40 },
            { level: 9, noiseReduction: 0.45, detectionReduction: 0.45 },
            { level: 10, noiseReduction: 0.50, detectionReduction: 0.50 }
        ],
        leveling: {
            action: "sneaking",
            xpPerAction: 0.3,
            actions: ["sneak_move", "avoid_detection"],
            requirements: {
                minDistance: 10 // Minimum distance sneaked
            }
        }
    },

    // Combat perks
    marksmanship: {
        id: "marksmanship",
        name: "Marksmanship",
        description: "Improves ranged weapon accuracy and handling",
        category: "combat",
        maxLevel: 10,
        baseEffect: { accuracy: 0, stability: 0 },
        effects: [
            { level: 1, accuracy: 0.03, stability: 0.02 },
            { level: 2, accuracy: 0.06, stability: 0.04 },
            { level: 3, accuracy: 0.09, stability: 0.06 },
            { level: 4, accuracy: 0.12, stability: 0.08 },
            { level: 5, accuracy: 0.15, stability: 0.10 },
            { level: 6, accuracy: 0.18, stability: 0.12 },
            { level: 7, accuracy: 0.21, stability: 0.14 },
            { level: 8, accuracy: 0.24, stability: 0.16 },
            { level: 9, accuracy: 0.27, stability: 0.18 },
            { level: 10, accuracy: 0.30, stability: 0.20 }
        ],
        leveling: {
            action: "ranged_attack",
            xpPerAction: 2,
            actions: ["ranged_hit", "ranged_kill", "headshot"],
            requirements: {
                minDamage: 1
            }
        }
    },

    // Crafting perks
    crafting: {
        id: "crafting",
        name: "Crafting",
        description: "Reduces crafting time and material costs",
        category: "crafting",
        maxLevel: 10,
        baseEffect: { craftTime: 0, materialCost: 0 },
        effects: [
            { level: 1, craftTime: -0.02, materialCost: -0.01 },
            { level: 2, craftTime: -0.04, materialCost: -0.02 },
            { level: 3, craftTime: -0.06, materialCost: -0.03 },
            { level: 4, craftTime: -0.08, materialCost: -0.04 },
            { level: 5, craftTime: -0.10, materialCost: -0.05 },
            { level: 6, craftTime: -0.12, materialCost: -0.06 },
            { level: 7, craftTime: -0.14, materialCost: -0.07 },
            { level: 8, craftTime: -0.16, materialCost: -0.08 },
            { level: 9, craftTime: -0.18, materialCost: -0.09 },
            { level: 10, craftTime: -0.20, materialCost: -0.10 }
        ],
        leveling: {
            action: "crafting",
            xpPerAction: 5,
            actions: ["craft_item", "disassemble"],
            requirements: {
                minComplexity: 1 // Minimum recipe complexity
            }
        }
    }
};

// XP requirements for each level (scaling like Tarkov)
export const perkLevelRequirements = [
    0,      // Level 1 (starting)
    100,    // Level 2
    250,    // Level 3
    500,    // Level 4
    850,    // Level 5
    1300,   // Level 6
    1850,   // Level 7
    2500,   // Level 8
    3250,   // Level 9
    4100    // Level 10
];

// Action types that grant perk XP
export const perkActions = {
    movement: {
        name: "Movement",
        perks: ["endurance"],
        description: "Moving around the world"
    },
    damage_taken: {
        name: "Damage Taken", 
        perks: ["vitality"],
        description: "Receiving damage from enemies"
    },
    melee_attack: {
        name: "Melee Attacks",
        perks: ["strength"],
        description: "Attacking with melee weapons"
    },
    healing: {
        name: "Healing",
        perks: ["firstAid"],
        description: "Using medical items or natural healing"
    },
    sneaking: {
        name: "Sneaking", 
        perks: ["stealth"],
        description: "Moving while undetected"
    },
    ranged_attack: {
        name: "Ranged Attacks",
        perks: ["marksmanship"],
        description: "Attacking with ranged weapons"
    },
    crafting: {
        name: "Crafting",
        perks: ["crafting"],
        description: "Crafting items at workstations"
    }
};