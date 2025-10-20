import { buildingTypes } from '../../db/buildings.js';
import { materials } from '../../db/materials.js';

export class MapGenerator {
    // Generate a map for a location
    static generateMap(width, height, location) {
        const map = this.createEmptyMap(width, height);
        this.generatePointsOfInterest(map, location);
        return map;
    }

    // Create empty map grid
    static createEmptyMap(width, height) {
        const map = [];
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                row.push({
                    x,
                    y,
                    type: 'unexplored',
                    explored: false,
                    content: null
                });
            }
            map.push(row);
        }
        return map;
    }

    // Generate points of interest on the map
    static generatePointsOfInterest(map, location) {
        const width = map[0].length;
        const height = map.length;
        const startX = Math.floor(width / 2);
        const startY = Math.floor(height / 2);

        // Set starting position
        map[startY][startX].type = 'start';
        map[startY][startX].explored = true;

        // Define point types and their distribution
        const pointTypes = [
            { type: 'resource', count: 3, weight: 30 },
            { type: 'encounter', count: 3, weight: 25 },
            { type: 'building', count: 2, weight: 20 },
            { type: 'safe', count: 1, weight: 10 },
            { type: 'special', count: 1, weight: 5 },
            { type: 'extraction', count: 2, weight: 10 }
        ];

        // Place points of interest
        pointTypes.forEach(pointType => {
            for (let i = 0; i < pointType.count; i++) {
                this.placePointOfInterest(map, pointType.type, location, startX, startY);
            }
        });
    }

    // Place a single point of interest
    static placePointOfInterest(map, type, location, startX, startY) {
        const width = map[0].length;
        const height = map.length;
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 50) {
            attempts++;
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);

            // Don't place on start or too close
            const distanceToStart = Math.abs(x - startX) + Math.abs(y - startY);
            if (distanceToStart < 2) continue;

            // Don't place on already assigned tiles
            if (map[y][x].type !== 'unexplored') continue;

            // Place the point
            map[y][x].type = type;
            map[y][x].content = this.generateTileContent(type, location);

            placed = true;
        }
    }

    // Generate content for a tile based on its type
    static generateTileContent(type, location) {
        switch (type) {
            case 'resource':
                return this.generateResources(location, 1, 3);
            case 'encounter':
                const monsterId = location.monsters[Math.floor(Math.random() * location.monsters.length)];
                return {
                    monster: monsterId,
                    resolved: false
                };
            case 'building':
                const buildingType = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
                return {
                    type: buildingType.id,
                    explored: false
                };
            case 'safe':
                return {
                    staminaRestore: 30,
                    healthRestore: 10
                };
            case 'extraction':
                return { available: true };
            case 'special':
                return { event: this.generateSpecialEvent() };
            default:
                return null;
        }
    }

    // Generate random resources
    static generateResources(location, min, max) {
        const count = Math.floor(Math.random() * (max - min + 1)) + min;
        const resources = [];

        for (let i = 0; i < count; i++) {
            const resourceId = location.resources[Math.floor(Math.random() * location.resources.length)];
            const material = materials.find(m => m.id === resourceId);
            
            if (material) {
                let quantity = 1;
                if (material.rarity === 'common') quantity = Math.floor(Math.random() * 3) + 1;
                if (material.rarity === 'uncommon') quantity = Math.floor(Math.random() * 2) + 1;

                resources.push({
                    id: resourceId,
                    quantity: quantity
                });
            }
        }

        return resources;
    }

    // Generate special event
    static generateSpecialEvent() {
        const events = ['treasure', 'trap', 'shrine'];
        return events[Math.floor(Math.random() * events.length)];
    }
}