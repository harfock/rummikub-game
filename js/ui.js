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
    document.getElementById('rank-btn').innerText = translations.rank_btn;
    
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
function initGame() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    // We will call the actual game logic from game.js here later
    console.log("Game started!");
}

// Initialize on page load
window.onload = () => {
    const savedLang = localStorage.getItem('preferredLang') || 'zh-tw';
    loadLanguage(savedLang);
};
