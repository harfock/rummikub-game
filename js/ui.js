// Default Settings
let currentLang = 'zh-tw';
let translations = {};

// 1. Load the Language Files
async function loadLanguage(lang) {
    try {
        // In local environments, Chrome may block 'fetch' for local files. 
        // We use a fallback if the file isn't found.
        const response = await fetch(`./lang/${lang}.json`);
        if (!response.ok) throw new Error('File not found');
        translations = await response.json();
    } catch (error) {
        console.warn("Language file failed, using defaults");
        translations = {
            title: "魔力橋樂齡版",
            rules_title: "遊戲規則",
            rules_content: "請組合您的數字牌...",
            start_game: "開始遊戲",
            hint_btn: "提示",
            draw_btn: "抽牌",
            save_btn: "儲存"
        };
    }
    currentLang = lang;
    updateUI();
}

// 2. Update all text on the screen
function updateUI() {
    if(document.getElementById('game-title')) document.getElementById('game-title').innerText = translations.title;
    if(document.getElementById('rules-header')) document.getElementById('rules-header').innerText = translations.rules_title;
    if(document.getElementById('rules-content')) document.getElementById('rules-content').innerText = translations.rules_content;
    if(document.getElementById('start-btn')) document.getElementById('start-btn').innerText = translations.start_game;
    
    // Safety check for UI buttons
    const rankBtn = document.getElementById('rank-btn');
    if(rankBtn) rankBtn.innerText = translations.rank_btn || (currentLang === 'zh-tw' ? "排行榜" : "Rankings");
    
    document.documentElement.lang = currentLang;
}

function setLanguage(lang) {
    loadLanguage(lang);
    localStorage.setItem('preferredLang', lang);
}

// 4. Screen Switching Logic
function initGame() {
    const mainMenu = document.getElementById('main-menu');
    const gameScreen = document.getElementById('game-screen');

    if (mainMenu && gameScreen) {
        mainMenu.style.setProperty('display', 'none', 'important'); // Forces Chrome to respect the change
        gameScreen.style.setProperty('display', 'block', 'important');
    }
    
    // Start logic from game.js
    if (typeof setupNewGame === "function") {
        setupNewGame(); 
    } else {
        console.error("Game logic missing!");
    }
}

window.onload = () => {
    const savedLang = localStorage.getItem('preferredLang') || 'zh-tw';
    loadLanguage(savedLang);
    if (typeof updateProfileDropdown === "function") {
        updateProfileDropdown();
    }
};
