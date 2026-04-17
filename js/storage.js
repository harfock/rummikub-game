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
// Add or Update Ranking
function updateRanking(playerName, score) {
    let rankings = JSON.parse(localStorage.getItem('rummikub_rankings')) || [];
    
    // Find if player already exists
    let playerEntry = rankings.find(r => r.name === playerName);
    if (playerEntry) {
        playerEntry.score += score;
    } else {
        rankings.push({ name: playerName, score: score });
    }

    // Sort: Highest score first
    rankings.sort((a, b) => b.score - a.score);
    
    // Keep only top 10
    rankings = rankings.slice(0, 10);
    
    localStorage.setItem('rummikub_rankings', JSON.stringify(rankings));
}

// Function to display ranking in a simple table
function viewRanking() {
    let rankings = JSON.parse(localStorage.getItem('rummikub_rankings')) || [];
    let rankHtml = "<h3>排行榜 (Rankings)</h3><table style='width:100%; font-size:1.5rem;'>";
    
    rankings.forEach((r, index) => {
        rankHtml += `<tr><td>${index + 1}. ${r.name}</td><td>${r.score} pts</td></tr>`;
    });
    
    rankHtml += "</table><button class='btn-large' onclick='location.reload()'>返回 (Back)</button>";
    
    document.getElementById('main-menu').innerHTML = rankHtml;
}
