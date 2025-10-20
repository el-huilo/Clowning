// Crafting recipes database
export const crafts = [
  {
    id: "medkit",
    name: "Medkit",
    description: "Restores 40 health points",
    category: "consumables",
    ingredients: [
      { material: "cloth", quantity: 3 },
      { material: "herbs", quantity: 2 }
    ],
    result: { item: "medkit", quantity: 1 },
    time: 30, // seconds
    skillRequired: { firstAid: 1 }
  },
  {
    id: "staminaPotion",
    name: "Stamina Potion",
    description: "Restores 50 stamina points",
    category: "consumables",
    ingredients: [
      { material: "herbs", quantity: 2 },
      { material: "essence", quantity: 1 }
    ],
    result: { item: "staminaPotion", quantity: 1 },
    time: 45,
    skillRequired: { firstAid: 2 }
  },
  {
    id: "backpackUpgrade",
    name: "Backpack Upgrade",
    description: "Increases carrying capacity by 20",
    category: "backpack",
    ingredients: [
      { material: "leather", quantity: 5 },
      { material: "thread", quantity: 3 }
    ],
    result: { item: "backpackUpgrade", quantity: 1 },
    time: 120,
    skillRequired: { crafting: 3 }
  },
  {
    id: "knife",
    name: "Combat Knife",
    description: "A basic melee weapon",
    category: "melee",
    ingredients: [
      { material: "metalScrap", quantity: 2 },
      { material: "wood", quantity: 1 }
    ],
    result: { item: "knife", quantity: 1 },
    time: 60,
    skillRequired: { crafting: 2 }
  }
];