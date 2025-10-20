import { items } from './db/items.js';
import { perks } from './db/perks.js';
import { crafts } from './db/crafts.js';
import { materials } from './db/materials.js';
import { monsters } from './db/monsters.js';
import { locations } from './db/locations.js';
import { buildingTypes } from './db/buildings.js';
import { containerTypes } from './db/buildingContainers.js';

export const gameData = {
    items,
    perks,
    crafts,
    materials,
    monsters,
    locations,
    buildingTypes,
    containerTypes
};

import { generateInventorySlots, showSection, updatePlayerStats } from './modules/utility.js'
import { equipment } from './modules/equipment.js'
import { debug } from './modules/debugMenu.js'
import { runSubsystem } from './modules/runSubsystem.js'
import { crafting } from './modules/crafting.js'
import { fighting } from './modules/fighting.js';
import { tileMap } from './modules/tileMap.js';
import { merging } from './modules/Merging.js';
import { skills } from './modules/skills.js';

export const subsystems = {
    generateInventorySlots,
    updatePlayerStats,
    showSection,
    equipment,
    debug,
    runSubsystem,
    crafting,
    fighting,
    tileMap,
    merging,
    skills
}