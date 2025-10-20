import './gamedata/modules/gameState.js';
import { selectors } from './gamedata/modules/selectors.js';
import { subsystems, gameData } from './gamedata/gamedata.js';

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupEventListeners();
    subsystems.updatePlayerStats();
    initPageNavigation();
});



// Initialize game state
function initializeGame() {
    // Load saved game
    if (!gameState.loadFromStorage()) {
        console.log('No saved game found, starting fresh');
    }
    console.log(selectors.getPlayer(gameState))
    setupStateListeners();
    subsystems.equipment.initializeEquipment();
    subsystems.crafting.initializeCrafting();
    subsystems.debug.initializeDebugMenu();
    subsystems.runSubsystem.initializeRunSystem();
    subsystems.fighting.setupCombatActions();
    subsystems.tileMap.initialize();
    subsystems.merging.initialize();
    subsystems.skills.initialize();
    // Generate inventory slots with current state
    subsystems.generateInventorySlots('storage-grid', selectors.getStorageSlots(gameState));
    subsystems.generateInventorySlots('equipped-grid', selectors.getEquippedSlots(gameState));
    
    // Update UI with current game state
    subsystems.updatePlayerStats();
    subsystems.equipment.updateEquipmentUI();

    gameState.subscribe('equipment', (newEquipment, oldEquipment) => {
        console.log('Equipment state changed:', { newEquipment, oldEquipment });
        subsystems.equipment.updateEquipmentUI();
    });
}

function setupStateListeners() {
    // Listen for player stat changes

    gameState.subscribe('player.health', (newHealth) => {
        document.getElementById('hp-value').textContent = 
            `${newHealth}/${gameState.player.maxHealth}`;
    });

    gameState.subscribe('player.stamina', (newStamina) => {
        document.getElementById('stamina-value').textContent = 
            `${newStamina}/${gameState.player.maxStamina}`;
    });

    gameState.subscribe('player.currentWeight', (newWeight) => {
        document.getElementById('weight-value').textContent = 
            `${newWeight}/${gameState.player.carryWeight}`;
    });

    gameState.subscribe('player.level', (newLevel) => {
        document.getElementById('level-value').textContent = newLevel;
    });

    // Listen for inventory changes
    gameState.subscribe('inventory.storage', () => {
        subsystems.generateInventorySlots('storage-grid');
    });

    // Listen for run state changes
    gameState.subscribe('currentRun', (newRun) => {
        if (newRun) {
            document.getElementById('run-location-name').textContent = 
                `Location: ${getLocationName(newRun.location)}`;
        }
    });
}

// Page Navigation System
function initPageNavigation() {
    // Navigation toggle
    document.getElementById('nav-toggle').addEventListener('click', toggleNavPanel);
    
    // Enter Safehouse button
    document.getElementById('enter-safehouse').addEventListener('click', () => {
        showPage('safehouse');
        showSubpage('storage');
    });
    
    // Major section navigation
    document.querySelectorAll('.nav-section[data-section]').forEach(section => {
        const sectionName = section.getAttribute('data-section');
        section.addEventListener('click', (e) => {
            if (e.target.classList.contains('subsection-btn')) return;
            showPage(sectionName);
        });
    });
    
    // Subsection navigation
    document.querySelectorAll('.subsection-btn').forEach(button => {
        button.addEventListener('click', function() {
            const section = this.closest('.nav-section').getAttribute('data-section');
            const subsection = this.getAttribute('data-subsection');
            
            showPage(section);
            showSubpage(subsection);
            
            // Update active button
            document.querySelectorAll('.subsection-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Action buttons
    document.getElementById('start-run').addEventListener('click', () => {
        showPage('run');
        subsystems.tileMap.renderLocationSelection();
    });
    
    // Initialize with landing page
    showPage('landing');
    updateLandingStats();
}

function toggleNavPanel() {
    const navPanel = document.getElementById('nav-panel');
    navPanel.classList.toggle('collapsed');
}

function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation state based on current page
    updateNavigationState(pageName);
}

function showSubpage(subpageName) {
    const currentPage = document.querySelector('.page.active');
    if (!currentPage) return;
    
    // Hide all subpages in current page
    currentPage.querySelectorAll('.subpage').forEach(subpage => {
        subpage.classList.remove('active');
    });
    
    // Show selected subpage
    const targetSubpage = document.getElementById(`${subpageName}-subpage`);
    if (targetSubpage) {
        targetSubpage.classList.add('active');
    }
}

function updateNavigationState(pageName) {
    // Update subsection buttons visibility based on current page
    document.querySelectorAll('.nav-section').forEach(section => {
        const sectionName = section.getAttribute('data-section');
        if (sectionName === pageName) {
            section.style.display = 'block';
        } else {
            section.style.display = 'block'; // Always show all sections for now
        }
    });
}

function updateLandingStats() {
    document.getElementById('landing-health').textContent = 
        `${selectors.getPlayerHealth(gameState)}/${selectors.getPlayerMaxHealth(gameState)}`;
    document.getElementById('landing-stamina').textContent = 
        `${selectors.getPlayerStamina(gameState)}/${selectors.getPlayerMaxStamina(gameState)}`;
    document.getElementById('landing-level').textContent = selectors.getPlayerLevel(gameState);
    
    // Update recent activity
    updateRecentActivity();
}

function updateRecentActivity() {
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';
    
    if (selectors.getRunHistory(gameState).length === 0) {
        activityList.innerHTML = '<div class="activity-item">No recent runs</div>';
        return;
    }
    
    // Show last 5 runs
    const recentRuns = selectors.getRunHistory(gameState).slice(-5).reverse();
    recentRuns.forEach(run => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const location = locations.find(l => l.id === run.location);
        const statusIcon = run.status === 'extracted' ? '✅' : '❌';
        
        activityItem.innerHTML = `
            ${statusIcon} ${location?.name || 'Unknown'} - 
            ${run.status === 'extracted' ? 'Extracted' : 'Failed'} - 
            ${run.moves || 0} moves
        `;
        
        activityList.appendChild(activityItem);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.nav-button[data-section]').forEach(button => {
        button.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            subsystems.showSection(section);
            
            // Update active button
            document.querySelectorAll('.nav-button[data-section]').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Action buttons
    document.getElementById('save-game').addEventListener('click', saveGame);
    document.getElementById('reset-game').addEventListener('click', resetGame);
    
    // Crafting buttons
    document.querySelectorAll('.craft-button').forEach(button => {
        button.addEventListener('click', function() {
            alert('Crafting functionality would be implemented here!');
        });
    });
    
    // Merge buttons
    document.querySelectorAll('.merge-button').forEach(button => {
        button.addEventListener('click', function() {
            alert('Merging functionality would be implemented here!');
        });
    });
}

function getLocationName(locationId) {
    // This would come from your locations database
    const locations = {
        'forest': 'Ancient Forest',
        'city': 'Ruined City',
        'factory': 'Abandoned Factory'
    };
    return gameData.locations[locationId] || 'Unknown';
}

// Save game state
function saveGame() {
    if (gameState.saveToStorage()) {
        console.log('Game saved successfully');
    } else {
        alert('Failed to save game');
    }
}

// Reset game
function resetGame() {
    if (confirm('Are you sure you want to reset your game? All progress will be lost!')) {
        gameState.reset();
        localStorage.removeItem('roguelikeRPG_save');
        window.location.reload();
    }
}