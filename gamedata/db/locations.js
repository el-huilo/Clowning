// Locations database for runs
export const locations = [
  {
    id: "forest",
    name: "Whispering Forest",
    difficulty: 1,
    description: "A dense forest with strange sounds coming from the trees",
    monsters: ["goblin", "wolf"],
    resources: ["herbs", "wood"],
    specialEvents: ["hiddenClearing", "abandonedCampsite"],
    extractionPoints: 2,
    requiredLevel: 1
  },
  {
    id: "ruins",
    name: "Ancient Ruins",
    difficulty: 2,
    description: "Crumbling stone structures from a forgotten civilization",
    monsters: ["goblin", "stoneGolem"],
    resources: ["metalScrap", "essence"],
    specialEvents: ["hiddenChamber", "ancientAltar"],
    extractionPoints: 1,
    requiredLevel: 1
  },
  {
    id: "swamp",
    name: "Murky Swamp",
    difficulty: 3,
    description: "A dangerous wetland filled with toxic fumes and strange creatures",
    monsters: ["woodlandSpirit", "wolf"],
    resources: ["herbs", "essence"],
    specialEvents: ["witchHut", "sunkenTemple"],
    extractionPoints: 2,
    requiredLevel: 1
  },
  {
    id: "mountains",
    name: "Forbidden Mountains",
    difficulty: 4,
    description: "High peaks with treacherous paths and rare resources",
    monsters: ["stoneGolem", "woodlandSpirit"],
    resources: ["metalScrap", "essence"],
    specialEvents: ["dragonLair", "skyTemple"],
    extractionPoints: 1
  }
];