// Monsters database
export const monsters = [
  {
    id: "goblin",
    name: "Goblin Scout",
    level: 2,
    health: 25,
    attack: 8,
    defense: 3,
    speed: 6,
    exp: 15,
    loot: [
      { item: "cloth", chance: 0.5 },
      { item: "metalScrap", chance: 0.3 }
    ],
    captureDifficulty: 3
  },
  {
    id: "woodlandSpirit",
    name: "Woodland Spirit",
    level: 3,
    health: 35,
    attack: 12,
    defense: 5,
    speed: 7,
    exp: 25,
    loot: [
      { item: "herbs", chance: 0.7 },
      { item: "essence", chance: 0.4 }
    ],
    captureDifficulty: 5
  },
  {
    id: "stoneGolem",
    name: "Stone Golem",
    level: 5,
    health: 60,
    attack: 15,
    defense: 12,
    speed: 3,
    exp: 40,
    loot: [
      { item: "metalScrap", chance: 0.8 },
      { item: "essence", chance: 0.6 }
    ],
    captureDifficulty: 7
  },
  {
    id: "wolf",
    name: "Timber Wolf",
    level: 4,
    health: 40,
    attack: 14,
    defense: 6,
    speed: 8,
    exp: 30,
    loot: [
      { item: "leather", chance: 0.6 },
      { item: "cloth", chance: 0.2 }
    ],
    captureDifficulty: 6
  },
  {
    id: "wolfpup",
    name: "Timber Wolf Pup",
    level: 2,
    health: 15,
    attack: 6,
    defense: 3,
    speed: 10,
    exp: 15,
    loot: [
      { item: "leather", chance: 0.4 },
      { item: "cloth", chance: 0.2 },
      { item: "fur", chance: 0.3 }
    ],
    captureDifficulty: 3
  },
  {
    id: "wolfalpha",
    name: "Timber Alpha Wolf",
    level: 8,
    health: 70,
    attack: 21,
    defense: 11,
    speed: 12,
    exp: 60,
    loot: [
      { item: "leather", chance: 0.8 },
      { item: "cloth", chance: 0.4 },
      { item: "fur", chance: 0.9 }
    ],
    captureDifficulty: 12
  }
];