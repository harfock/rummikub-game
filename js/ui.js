// Default Settings
let currentLang = 'zh-tw';
let translations = {};

// 1. Load the Language Files
async function loadLanguage(lang) {
    try {
        const response = await fetch(`./lang/${lang}.json`);
        translations = await response.json();
        currentLang = lang;
        updateUI();
    } catch (error) {
        console.error("Error loading language:", error);
    }
}

// 2. Update all text on the screen
function updateUI() {
    document.getElementById('game-title').innerText = translations.title;
    document.getElementById('rules-header').innerText = translations.rules_title;
    document.getElementById('rules-content').innerText = translations.rules_content;
    document.getElementById('start-btn').innerText = translations.start_game;
    document.getElementById('rank-btn').innerText = translations.rank_btn || (currentLang === 'zh-tw' ? "排行榜" : "Rankings");
    
    // Game screen buttons
    document.getElementById('hint-btn').innerText = translations.hint_btn;
    document.getElementById('draw-btn').innerText = translations.draw_btn;
    document.getElementById('save-btn').innerText = translations.save_btn;
    
    // Set HTML lang attribute for accessibility
    document.documentElement.lang = currentLang;
}

// 3. Switch Language Function
function setLanguage(lang) {
    loadLanguage(lang);
    // Save preference to the browser so it remembers next time
    localStorage.setItem('preferredLang', lang);
}

// 4. Screen Switching Logic
// This function handles the visual transition and triggers the game logic
function initGame() {
    // 1. Hide the Menu, Show the Game Screen
    const mainMenu = document.getElementById('main-menu');
    const gameScreen = document.getElementById('game-screen');

    if (mainMenu && gameScreen) {
        mainMenu.style.display = 'none';
        gameScreen.style.display = 'block';
    }
    
    // 2. Start the actual Rummikub logic from game.js
    // We use the renamed function 'setupNewGame' to avoid naming conflicts
    if (typeof setupNewGame === "function") {
        setupNewGame(); 
    } else {
        console.error("Game logic (setupNewGame) not loaded yet!");
    }
}

// Initialize on page load
window.onload = () => {
    const savedLang = localStorage.getItem('preferredLang') || 'zh-tw';
    loadLanguage(savedLang);
    
    // Ensure the profile dropdown is populated if storage.js is loaded
    if (typeof updateProfileDropdown === "function") {
        updateProfileDropdown();
    }
};
