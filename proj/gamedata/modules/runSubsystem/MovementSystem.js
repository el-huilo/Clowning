import '../gameState.js';
import { selectors } from '../selectors.js';

export class MovementSystem {
    // Move player in a direction
    static movePlayer(dx, dy) {
        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun || !currentRun.map) return false;

        const { playerPosition, map } = currentRun;
        const newX = playerPosition.x + dx;
        const newY = playerPosition.y + dy;

        // Validate move
        if (!this.isValidMove(newX, newY, map)) {
            return false;
        }

        // Update game state
        gameState.update(state => ({
            currentRun: {
                ...state.currentRun,
                playerPosition: { x: newX, y: newY },
                moves: state.currentRun.moves + 1,
                stamina: Math.max(0, state.currentRun.stamina - 5)
            }
        }));

        // Explore new tile
        this.exploreTile(newX, newY);

        // Track perk XP
        import('../PerkSystem.js').then(({ PerkActionTracker }) => {
            // change it later, it is dummy
            const staminaCost = 5;

            const movementType = this.getMovementType(staminaCost);
            PerkActionTracker.trackMovement(1, staminaCost, movementType);
        });

        return true;
    }

    static getMovementType(staminaCost) {
        if (staminaCost > 8) return 'sprint';
        if (staminaCost > 5) return 'run';
        return 'walk';
    }

    // Check if move is valid
    static isValidMove(x, y, map) {
        console.log("x = ", x, " y = ", y, " map = ", map)
        return x >= 0 && x < map[0].length && y >= 0 && y < map.length;
    }

    // Explore a tile
    static exploreTile(x, y) {
        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun) return;

        const tile = currentRun.map[y][x];
        if (tile.explored) return;

        gameState.update(state => {
            const newMap = [...state.currentRun.map];
            const newMapRow = [...newMap[y]]
            const tile = currentRun.map[y][x];
            console.log(newMapRow)
            newMapRow[x] = {
                ...tile,
                explored: true,
                type: tile.type === 'unexplored' ? 'explored' : tile.type
            };
            console.log(newMapRow)

            newMap[y] = newMapRow

            return {
                currentRun: {
                    ...state.currentRun,
                    map: newMap
                }
            };
        });
    }

    // Get accessible tiles from current position
    static getAccessibleTiles() {
        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun) return [];

        const { playerPosition, map } = currentRun;
        const directions = [
            { dx: 0, dy: -1, direction: 'up' },
            { dx: 0, dy: 1, direction: 'down' },
            { dx: -1, dy: 0, direction: 'left' },
            { dx: 1, dy: 0, direction: 'right' }
        ];

        return directions
            .map(({ dx, dy, direction }) => ({
                x: playerPosition.x + dx,
                y: playerPosition.y + dy,
                direction
            }))
            .filter(({ x, y }) => this.isValidMove(x, y, map));
    }

    // Wait turn (rest)
    static waitTurn() {
        const currentRun = selectors.getCurrentRun(gameState);
        if (!currentRun) return;

        gameState.update(state => ({
            currentRun: {
                ...state.currentRun,
                moves: state.currentRun.moves + 1,
                stamina: Math.min(100, state.currentRun.stamina + 10)
            }
        }));
    }

    // Check if player can move (has stamina)
    static canMove() {
        const currentRun = selectors.getCurrentRun(gameState);
        return currentRun && currentRun.stamina > 0;
    }
}