import { tileMap } from "./tileMap.js";
import { getMaterialName, addLogEntry } from "./utility.js";
import './gameState.js';

export class fighting {
    static startFightScene(monster, encounterTile) {
        // Set combat state
        gameState.combatState = {
            player: {
                ...gameState.player,
                currentHealth: gameState.currentRun.health,
                currentStamina: gameState.currentRun.stamina,
                defending: false
            },
            enemy: {
                ...monster,
                currentHealth: monster.health,
                defending: false
            },
            turn: 'player',
            battleLog: ['Combat started!'],
            inCombat: true,
            encounterTile: encounterTile
        };
        
        // Hide run interface and show fight scene
        document.getElementById('run-interface').style.display = 'none';
        document.getElementById('fight-scene').style.display = 'block';
        
        // Update combat display
        fighting.updateCombatDisplay();
        
        // Add capture button if player has tools
        if (tileMap.hasCaptureTools()) {
            document.getElementById('capture-btn').style.display = 'block';
        }
    }
    
    // Update combat display
    static updateCombatDisplay() {
        // Update player stats
        document.getElementById('player-health-text').textContent = 
            `${combatState.player.currentHealth}/${combatState.player.maxHealth}`;
        document.getElementById('player-stamina-text').textContent = 
            `${combatState.player.currentStamina}/${combatState.player.maxStamina}`;
        
        // Update health bars
        const playerHealthPercent = (combatState.player.currentHealth / combatState.player.maxHealth) * 100;
        const playerStaminaPercent = (combatState.player.currentStamina / combatState.player.maxStamina) * 100;
        const enemyHealthPercent = (combatState.enemy.currentHealth / combatState.enemy.health) * 100;
        
        document.getElementById('player-health-bar').style.width = `${playerHealthPercent}%`;
        document.getElementById('player-stamina-bar').style.width = `${playerStaminaPercent}%`;
        document.getElementById('enemy-health-bar').style.width = `${enemyHealthPercent}%`;
        
        // Update enemy info
        document.getElementById('enemy-name').textContent = combatState.enemy.name;
        document.getElementById('enemy-health-text').textContent = 
            `${combatState.enemy.currentHealth}/${combatState.enemy.health}`;
        document.getElementById('enemy-level').textContent = combatState.enemy.level;
        
        // Update enemy sprite based on monster type
        const enemySprite = document.getElementById('enemy-sprite');
        switch(combatState.enemy.id) {
            case 'goblin':
                enemySprite.textContent = '👺';
                break;
            case 'woodlandSpirit':
                enemySprite.textContent = '🌿';
                break;
            case 'stoneGolem':
                enemySprite.textContent = '🗿';
                break;
            case 'wolf':
                enemySprite.textContent = '🐺';
                break;
            default:
                enemySprite.textContent = '👹';
        }
        
        // Update combat log
        const combatLog = document.getElementById('combat-log');
        combatLog.innerHTML = '';
        combatState.battleLog.forEach(entry => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.textContent = entry;
            combatLog.appendChild(logEntry);
        });
        combatLog.scrollTop = combatLog.scrollHeight;
        
        // Update action buttons based on turn
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            if (combatState.turn === 'enemy') {
                btn.disabled = true;
            } else {
                btn.disabled = false;
            }
        });
    }
    
    // Add damage popup animation
    static showDamagePopup(element, amount, isHealing = false) {
        const popup = document.createElement('div');
        popup.className = isHealing ? 'heal-popup' : 'damage-popup';
        popup.textContent = isHealing ? `+${amount}` : `-${amount}`;
        
        const rect = element.getBoundingClientRect();
        popup.style.left = `${rect.left + rect.width / 2}px`;
        popup.style.top = `${rect.top}px`;
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 1500);
    }
    
    // Player actions
    static setupCombatActions() {
        // Attack action
        document.querySelector('[data-action="attack"]').addEventListener('click', () => {
            if (combatState.turn !== 'player') return;
            
            fighting.playerAttack();
        });
        
        // Skill action
        document.querySelector('[data-action="skill"]').addEventListener('click', () => {
            if (combatState.turn !== 'player') return;
            
            fighting.showSkillSelection();
        });
        
        // Item action
        document.querySelector('[data-action="item"]').addEventListener('click', () => {
            if (combatState.turn !== 'player') return;
            
            fighting.showItemSelection();
        });
        
        // Flee action
        document.querySelector('[data-action="flee"]').addEventListener('click', () => {
            if (combatState.turn !== 'player') return;
            
            fighting.attemptFlee();
        });
        
        // Capture action
        document.getElementById('capture-btn').addEventListener('click', () => {
            if (combatState.turn !== 'player') return;
            
            fighting.attemptCapture();
        });
        
        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('combat-skills').style.display = 'none';
                document.getElementById('combat-items').style.display = 'none';
                document.getElementById('combat-actions').style.display = 'block';
            });
        });
    }
    
    // Player attack function
    static playerAttack() {
        const playerSprite = document.querySelector('.player-combatant .combatant-sprite');
        playerSprite.classList.add('combatant-attacking');
        
        // Calculate damage
        const baseDamage = 10 + (combatState.player.stats.strength.value / 10);
        const variance = Math.random() * 5;
        const damage = Math.max(1, Math.floor(baseDamage + variance));
        
        // Apply damage to enemy
        combatState.enemy.currentHealth = Math.max(0, combatState.enemy.currentHealth - damage);
        
        // Add to log
        combatState.battleLog.push(`You attack for ${damage} damage!`);
        
        // Show damage popup
        const enemySprite = document.querySelector('.enemy-combatant .combatant-sprite');
        fighting.showDamagePopup(enemySprite, damage);
        
        // Reset animation
        setTimeout(() => {
            playerSprite.classList.remove('combatant-attacking');
            fighting.updateCombatDisplay();
            fighting.checkCombatEnd();
            
            if (combatState.inCombat) {
                fighting.enemyTurn();
            }
        }, 1000);
    }
    
    // Skill selection
    static showSkillSelection() {
        document.getElementById('combat-actions').style.display = 'none';
        document.getElementById('combat-skills').style.display = 'block';
        
        const skillButtons = document.querySelector('.skill-buttons');
        skillButtons.innerHTML = '';
        
        combatSkills.forEach(skill => {
            const skillBtn = document.createElement('button');
            skillBtn.className = 'skill-btn';
            skillBtn.innerHTML = `
                <div>${skill.name}</div>
                <small>Cost: ${skill.cost} Stamina</small>
            `;
            skillBtn.addEventListener('click', () => {
                fighting.useSkill(skill);
            });
            
            // Disable if not enough stamina
            if (combatState.player.currentStamina < skill.cost) {
                skillBtn.disabled = true;
            }
            
            skillButtons.appendChild(skillBtn);
        });
    }
    
    // Use skill
    static useSkill(skill) {
        const playerSprite = document.querySelector('.player-combatant .combatant-sprite');
        playerSprite.classList.add('combatant-attacking');
        
        // Deduct stamina cost
        combatState.player.currentStamina -= skill.cost;
        
        switch(skill.id) {
            case 'heavy_attack':
                const heavyDamage = Math.floor((10 + combatState.player.stats.strength.value / 8) * skill.damageMultiplier);
                combatState.enemy.currentHealth = Math.max(0, combatState.enemy.currentHealth - heavyDamage);
                combatState.battleLog.push(`You use ${skill.name} for ${heavyDamage} damage!`);
                fighting.showDamagePopup(document.querySelector('.enemy-combatant .combatant-sprite'), heavyDamage);
                break;
                
            case 'quick_attack':
                const quickDamage = Math.floor((10 + combatState.player.stats.strength.value / 12) * skill.damageMultiplier);
                combatState.enemy.currentHealth = Math.max(0, combatState.enemy.currentHealth - quickDamage);
                combatState.battleLog.push(`You use ${skill.name} for ${quickDamage} damage!`);
                fighting.showDamagePopup(document.querySelector('.enemy-combatant .combatant-sprite'), quickDamage);
                break;
                
            case 'defend':
                combatState.player.defending = true;
                combatState.battleLog.push(`You prepare to defend against the next attack!`);
                playerSprite.classList.add('combatant-defending');
                break;
                
            case 'first_aid':
                const healAmount = skill.healAmount + (combatState.player.stats.firstAid.value / 4);
                combatState.player.currentHealth = Math.min(combatState.player.maxHealth, 
                    combatState.player.currentHealth + healAmount);
                combatState.battleLog.push(`You use ${skill.name} and recover ${healAmount} health!`);
                fighting.showDamagePopup(playerSprite, healAmount, true);
                break;
        }
        
        setTimeout(() => {
            playerSprite.classList.remove('combatant-attacking');
            document.getElementById('combat-skills').style.display = 'none';
            document.getElementById('combat-actions').style.display = 'block';
            fighting.updateCombatDisplay();
            fighting.checkCombatEnd();
            
            if (combatState.inCombat) {
                fighting.enemyTurn();
            }
        }, 1000);
    }
    
    // Item selection
    static showItemSelection() {
        document.getElementById('combat-actions').style.display = 'none';
        document.getElementById('combat-items').style.display = 'block';
        
        const itemButtons = document.querySelector('.item-buttons');
        itemButtons.innerHTML = '';
        
        // Get consumable items from inventory
        const consumables = gameState.currentRun.inventory.filter(item => 
            item.id === 'medkit' || item.id === 'staminaPotion'
        );
        
        if (consumables.length === 0) {
            const noItems = document.createElement('div');
            noItems.textContent = 'No usable items in inventory';
            noItems.style.gridColumn = '1 / -1';
            noItems.style.textAlign = 'center';
            noItems.style.padding = '20px';
            itemButtons.appendChild(noItems);
            return;
        }
        
        consumables.forEach(item => {
            const itemBtn = document.createElement('button');
            itemBtn.className = 'item-btn';
            
            if (item.id === 'medkit') {
                itemBtn.innerHTML = `
                    <div>Medkit</div>
                    <small>Restores 40 HP</small>
                `;
                itemBtn.addEventListener('click', () => {
                    fighting.useItem('medkit');
                });
            } else if (item.id === 'staminaPotion') {
                itemBtn.innerHTML = `
                    <div>Stamina Potion</div>
                    <small>Restores 50 Stamina</small>
                `;
                itemBtn.addEventListener('click', () => {
                    fighting.useItem('staminaPotion');
                });
            }
            
            itemButtons.appendChild(itemBtn);
        });
    }
    
    // Use item
    static useItem(itemId) {
        const playerSprite = document.querySelector('.player-combatant .combatant-sprite');
        
        switch(itemId) {
            case 'medkit':
                combatState.player.currentHealth = Math.min(combatState.player.maxHealth, 
                    combatState.player.currentHealth + 40);
                combatState.battleLog.push(`You use a Medkit and recover 40 health!`);
                fighting.showDamagePopup(playerSprite, 40, true);
                break;
                
            case 'staminaPotion':
                combatState.player.currentStamina = Math.min(combatState.player.maxStamina, 
                    combatState.player.currentStamina + 50);
                combatState.battleLog.push(`You use a Stamina Potion and recover 50 stamina!`);
                // You might want a different animation for stamina
                break;
        }
        
        // Remove item from inventory
        const itemIndex = gameState.currentRun.inventory.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            gameState.currentRun.inventory.splice(itemIndex, 1);
        }
        
        document.getElementById('combat-items').style.display = 'none';
        document.getElementById('combat-actions').style.display = 'block';
        fighting.updateCombatDisplay();
        
        fighting.enemyTurn();
    }
    
    // Flee attempt
    static attemptFlee() {
        const fleeChance = 0.7; // 70% base chance to flee
        
        if (Math.random() < fleeChance) {
            combatState.battleLog.push('You successfully fled from combat!');
            fighting.endCombat(false, 'fled');
        } else {
            combatState.battleLog.push('You failed to escape!');
            fighting.updateCombatDisplay();
            fighting.enemyTurn();
        }
    }
    
    // Capture attempt
    // In fighting.js - add to the attemptCapture method
    static attemptCapture() {
        const captureChance = 0.5 - (combatState.enemy.captureDifficulty * 0.05);
    
        if (Math.random() < captureChance) {
            combatState.battleLog.push(`You captured the ${combatState.enemy.name}!`);
        
            // Create creature from monster
            const capturedCreature = {
                id: `creature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                species: combatState.enemy.id,
                name: combatState.enemy.name,
                level: 1,
                xp: 0,
                fusionCount: 0,
                stats: combatState.enemy.stats || {
                    health: combatState.enemy.health,
                    attack: combatState.enemy.attack,
                    defense: combatState.enemy.defense || 5,
                    speed: combatState.enemy.speed || 10,
                    stamina: combatState.enemy.stamina || 20
                },
                traits: combatState.enemy.traits || [],
                capturedAt: Date.now()
            };
        
            // Add to creatures collection
            gameState.update(state => ({
                creatures: [...state.creatures, capturedCreature]
            }));
        
            fighting.endCombat(true, 'captured');
        } else {
            combatState.battleLog.push('Capture attempt failed!');
            fighting.updateCombatDisplay();
            fighting.enemyTurn();
        }
    }
    
    // Enemy turn
    static enemyTurn() {
        combatState.turn = 'enemy';
        fighting.updateCombatDisplay();
        
        setTimeout(() => {
            const enemySprite = document.querySelector('.enemy-combatant .combatant-sprite');
            enemySprite.classList.add('enemy-attacking');
            
            // Simple enemy AI
            let enemyAction = 'attack';
            if (combatState.enemy.currentHealth < combatState.enemy.health / 3 && Math.random() > 0.7) {
                enemyAction = 'defend';
            }
            
            switch(enemyAction) {
                case 'attack':
                    const baseDamage = combatState.enemy.attack / 2;
                    const variance = Math.random() * 3;
                    let damage = Math.max(1, Math.floor(baseDamage + variance));
                    
                    // Apply defense reduction if player is defending
                    if (combatState.player.defending) {
                        damage = Math.max(1, Math.floor(damage * 0.6));
                        combatState.battleLog.push(`The ${combatState.enemy.name} attacks, but you defend!`);
                        combatState.player.defending = false;
                        document.querySelector('.player-combatant .combatant-sprite').classList.remove('combatant-defending');
                    } else {
                        combatState.battleLog.push(`The ${combatState.enemy.name} attacks!`);
                    }
                    
                    combatState.player.currentHealth = Math.max(0, combatState.player.currentHealth - damage);
                    fighting.showDamagePopup(document.querySelector('.player-combatant .combatant-sprite'), damage);
                    break;
                    
                case 'defend':
                    combatState.enemy.defending = true;
                    combatState.battleLog.push(`The ${combatState.enemy.name} prepares to defend!`);
                    enemySprite.classList.add('combatant-defending');
                    break;
            }
            
            setTimeout(() => {
                enemySprite.classList.remove('enemy-attacking');
                combatState.turn = 'player';
                fighting.updateCombatDisplay();
                fighting.checkCombatEnd();
            }, 1000);
        }, 1500);
    }
    
    // Check if combat should end
    static checkCombatEnd() {
        if (combatState.player.currentHealth <= 0) {
            fighting.endCombat(false, 'defeated');
            return true;
        }
        
        if (combatState.enemy.currentHealth <= 0) {
            fighting.endCombat(true, 'defeated');
            return true;
        }
        
        return false;
    }
    
    // End combat
    static endCombat(victory, reason) {
        combatState.inCombat = false;
        
        // Update run health/stamina
        gameState.currentRun.health = combatState.player.currentHealth;
        gameState.currentRun.stamina = combatState.player.currentStamina;
        
        // Handle victory
        if (victory) {
            if (reason === 'defeated') {
                // Get loot
                combatState.enemy.loot.forEach(loot => {
                    if (Math.random() < loot.chance) {
                        gameState.currentRun.inventory.push({
                            id: loot.item,
                            quantity: 1
                        });
                        combatState.battleLog.push(`Got: ${getMaterialName(loot.item)} from ${combatState.enemy.name}`);
                    }
                });
                
                // Mark encounter as resolved
                if (combatState.encounterTile) {
                    combatState.encounterTile.content.resolved = true;
                }
            }
            
            setTimeout(() => {
                // Return to run interface
                document.getElementById('fight-scene').style.display = 'none';
                document.getElementById('run-interface').style.display = 'block';
                
                // Add combat results to run log
                combatState.battleLog.forEach(entry => {
                    addLogEntry(entry);
                });
                
                // Update run stats
                tileMap.updateRunStats();
                
                // Re-render map if we're in overworld
                if (!gameState.currentRun.currentBuilding) {
                    tileMap.renderMap();
                }
            }, 2000);
        } else {
            // Player defeated or fled
            if (reason === 'defeated') {
                tileMap.runFailed("You were defeated in combat");
            } else {
                // Just fled, return to run
                setTimeout(() => {
                    document.getElementById('fight-scene').style.display = 'none';
                    document.getElementById('run-interface').style.display = 'block';
                    
                    combatState.battleLog.forEach(entry => {
                        addLogEntry(entry);
                    });
                    
                    tileMap.updateRunStats();
                    
                    if (!gameState.currentRun.currentBuilding) {
                        tileMap.renderMap();
                    }
                }, 2000);
            }
        }
    }
}