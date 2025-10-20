// Game State
globalThis.gameState = {
    player: {
        level: 1,
        health: 100,
        maxHealth: 100,
        stamina: 80,
        maxStamina: 80,
        carryWeight: 120,
        currentWeight: 45,
        armor: 0,
        stats: {
            endurance: { value: 80, grade: 'A' },
            vitality: { value: 40, grade: 'C' },
            firstAid: { value: 60, grade: 'B' },
            strength: { value: 70, grade: 'B' }
        },
        baseMaxHealth: 100,  // Base without perks
        baseMaxStamina: 80,  // Base without perks  
        baseCarryWeight: 120, // Base without perks
        perks: {} // Will be initialized by PerkSystem
    },
    equipment: {
        headwear: null,
        mask: null,
        shirt: null,
        jacket: null,
        backpack: null,
        shoulders: null,
        armwraps: null,
        hands: null,
        pants: null,
        belt: null,
        socks: null,
        shoes: null,
        primaryHand: null,
        secondaryHand: null,
        backWeapon: null
    },
    inventory: {
        storage: Array(40).fill(null),
        equipped: Array(8).fill(null)
    },
    creatures: {
        creature_1: {
            species: 'goblin',
            name: 'Goblin Scout',
            level: 4,
            xp: 0,
            fusionCount: 0,
            stats: { health: 25, attack: 8, defense: 3, speed: 12, stamina: 15 },
            traits: ['agile'],
            capturedAt: Date.now()
        },
        creature_2: {
            species: 'woodlandSpirit',
            name: 'Woodland Spirit',
            level: 4,
            xp: 0,
            fusionCount: 0,
            stats: { health: 35, attack: 12, defense: 8, speed: 18, stamina: 25 },
            traits: ['nature', 'healing'],
            capturedAt: Date.now()
        },
        creature_3: {
            species: 'woodlandSpirit',
            name: 'Woodland Spirit',
            level: 3,
            xp: 0,
            fusionCount: 0,
            stats: { health: 35, attack: 12, defense: 8, speed: 18, stamina: 25 },
            traits: ['nature', 'healing'],
            capturedAt: Date.now()
        }
    },
    companion: null,
    currentRun: null,
    runHistory: [],
    combatState: null,
    currentBuilding: null,
    buildingLayout: null,
    buildingPosition: null,
    listeners: {},
    
    // Getting fields directly
    // But setting them via the update methods

    update: function(fieldsToUpdate) {
        if (typeof fieldsToUpdate !== 'object') {
            console.warn(fieldsToUpdate)
            throw new Error(`To update state use object containing pairs {'fieldName': [deltaValues]}`);
        }

        const keys = Object.keys(fieldsToUpdate);

        console.log(fieldsToUpdate);
        console.log(keys)
        console.log(keys[0])

        for (let i = 0; i < keys.length; i++) {
            let path = keys[i].split('.');
            const lastKey = path.pop();
            const targetObj = path.reduce((obj, key) => obj[key], this);
            for (const deltaValues of fieldsToUpdate[keys[i]]){
                console.log(deltaValues)
                console.log(typeof deltaValues)
                if (typeof deltaValues === 'object' && deltaValues !== null) {
                    if (!targetObj[lastKey])
                        targetObj[lastKey] = {}
                    Object.assign(targetObj[lastKey], deltaValues)
                } else {
                    console.log(targetObj[lastKey])
                    console.log(deltaValues)
                    targetObj[lastKey] = deltaValues;
                    console.log(targetObj[lastKey])
                }
                // else if (deltaValues === null) {
                //     targetObj[lastKey] += deltaValues;
                // }
            }
            
            // push last key if it isn't a number
            if (isNaN(lastKey))
                path.push(lastKey)

            this._notifyListeners(path.join('.'));
        }
    },

    pushNewEntity: function(parentField, entity) {
        if (typeof parentField === 'string' && typeof entity === 'object') {
            console.warn(parentField, entity)
            throw new Error('To push new entity into state, use string with field name and object');
        }
        this[parentField] += entity;

        this._notifyListeners(parentField);
    },

    deleteEntity: function(parentField, entityId) {
        if (typeof parentField === 'string' && typeof entityId === 'string') {
            console.warn(parentField, entityId)
            throw new Error('To delete entity from state, use string with field name and string with entity id');
        }
        delete this[parentField][entityId];

        this._notifyListeners(parentField);
    },

    // Subscribe to selective reactive UI update
    subscribe: function(key, callback) {
        // lets assume that exception handling there is a shit
        // check for duplicates in state before production
        if (!this.listeners[key])
            this.listeners[key] = [];

        this.listeners[key].push(callback);
    },

    _notifyListeners: function(key) {
        console.log(this)
        console.log(this.listeners)
        console.log(key)
        if (!this.listeners[key])
            return;

        for (const callback of this.listeners[key]) {
            try {
                callback();
            } catch (e) {
                console.error('Error in state listener:', error);
            }
        }
    },

    // Save/load state
    saveToStorage: function() {
        try {
            console.log("Save to localstorage")
            // localStorage.setItem('roguelikeRPG_save', JSON.stringify(this._state));
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);

            // add fallback to file save

            return false;
        }
    },

    loadFromStorage: function() {
        try {
            const saved = localStorage.getItem('roguelikeRPG_save');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.update(() => parsed);
                return true;
            }
        } catch (error) {
            console.error('Failed to load game:', error);
        }
        return false;
    }
}