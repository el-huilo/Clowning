// Items database - clothes, weapons, and equipment
export const items = [
  // Headwear
  {
    id: "helmet",
    name: "Combat Helmet",
    type: "headwear",
    armor: 15,
    weight: 2.5,
    value: 120
  },
  {
    id: "beanie",
    name: "Wool Beanie",
    type: "headwear",
    armor: 2,
    weight: 0.3,
    warmth: 5,
    value: 15
  },
  
  // Masks
  {
    id: "gasMask",
    name: "Gas Mask",
    type: "mask",
    armor: 5,
    weight: 1.2,
    chemicalResistance: 10,
    value: 85
  },
  
  // Shirts
  {
    id: "tShirt",
    name: "Cotton T-Shirt",
    type: "shirt",
    armor: 1,
    weight: 0.4,
    value: 10
  },
  {
    id: "tacticalShirt",
    name: "Tactical Shirt",
    type: "shirt",
    armor: 8,
    weight: 1.2,
    value: 65
  },
  
  // Jackets
  {
    id: "leatherJacket",
    name: "Leather Jacket",
    type: "jacket",
    armor: 12,
    weight: 3.5,
    value: 150
  },
  {
    id: "tacticalVest",
    name: "Tactical Vest",
    type: "jacket",
    armor: 25,
    weight: 3.5,
    value: 200
  },
  
  // Backpacks
  {
    id: "smallBackpack",
    name: "Small Backpack",
    type: "backpack",
    slots: 10,
    weightReduction: 0.1,
    weight: 1.2,
    value: 45
  },
  {
    id: "largeBackpack",
    name: "Large Backpack",
    type: "backpack",
    slots: 20,
    weightReduction: 0.15,
    weight: 2.5,
    value: 120
  },

  // Boots
  {
    id: "combatBoots",
    name: "Combat Boots",
    type: "shoes",
    armor: 8,
    weight: 1.2,
    value: 80
  },
  
  // Weapons
  {
    id: "knife",
    name: "Combat Knife",
    type: ["primaryHand", "secondaryHand", "melee"],
    damage: 15,
    weight: 0.8,
    value: 60
  },
  {
    id: "pistol",
    name: "9mm Pistol",
    type: ["primaryHand", "secondaryHand", "firearm"],
    damage: 25,
    weight: 1.2,
    ammoType: "9mm",
    value: 150
  },
  {
    id: "rifle",
    name: "Assault Rifle",
    type: ["primaryHand", "secondaryHand", "backWeapon", "firearm"],
    damage: 35,
    weight: 3.5,
    ammoType: "5.56mm",
    value: 350
  },

  // Tools
  {
    id: "captureTool",
    name: "Capture Tool",
    type: "tool",
    description: "Used to capture creatures during encounters",
    weight: 0.5,
    value: 50
  },
  {
    id: "crowbar",
    name: "Crowbar",
    type: "tool",
    description: "Used to open locked crates",
    weight: 2.0,
    value: 50
  },
  {
    id: "lockpick",
    name: "Lockpick",
    type: "tool",
    description: "Used to open locks",
    weight: 0.02,
    value: 10
  }
];