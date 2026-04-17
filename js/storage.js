// Save a player profile
function saveProfile(name) {
    let profiles = JSON.parse(localStorage.getItem('rummikub_profiles')) || [];
    if (!profiles.includes(name)) {
        profiles.push(name);
        localStorage.setItem('rummikub_profiles', JSON.stringify(profiles));
    }
    updateProfileDropdown();
}

// Update the dropdown list in HTML
function updateProfileDropdown() {
    const select = document.getElementById('user-profile');
    let profiles = JSON.parse(localStorage.getItem('rummikub_profiles')) || ['預設玩家'];
    
    select.innerHTML = ''; // Clear current
    profiles.forEach(name => {
        let opt = document.createElement('option');
        opt.value = name;
        opt.innerHTML = name;
        select.appendChild(opt);
    });
}

// Save the current game state
function saveGameProgress(gameState) {
    localStorage.setItem('current_save_game', JSON.stringify(gameState));
    alert(currentLang === 'zh-tw' ? "遊戲已儲存！" : "Game Saved!");
    location.reload(); // Go back to main menu
}

// Get high scores
function getRankings() {
    return JSON.parse(localStorage.getItem('rummikub_rankings')) || [];
}
