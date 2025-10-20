export const buildingTypes = [
    {
        id: "house",
        name: "Abandoned House",
        description: "A residential building that might contain household supplies",
        size: { width: 5, height: 5 },
        lootChance: 0.7,
        enemyChance: 0.4,
        resources: ["cloth", "herbs", "wood"]
    },
    {
        id: "warehouse",
        name: "Warehouse",
        description: "Large storage facility with potential for valuable finds",
        size: { width: 7, height: 7 },
        lootChance: 0.8,
        enemyChance: 0.6,
        resources: ["metalScrap", "cloth", "leather"]
    },
    {
        id: "supermarket",
        name: "Supermarket",
        description: "Former grocery store with canned goods and supplies",
        size: { width: 6, height: 8 },
        lootChance: 0.9,
        enemyChance: 0.5,
        resources: ["herbs", "cloth", "essence"]
    },
    {
        id: "pharmacy",
        name: "Pharmacy",
        description: "Medical supplies might still be available",
        size: { width: 4, height: 4 },
        lootChance: 0.6,
        enemyChance: 0.3,
        resources: ["herbs", "essence"]
    }
];