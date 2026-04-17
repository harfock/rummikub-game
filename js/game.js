// Game State Constants
const COLORS = ['red', 'blue', 'orange', 'black'];
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

let deck = [];
let playerHand = [];
let aiHands = [[], [], []]; // 3 AI Players
let tableSets = []; // Tiles currently on the table

// 1. Initialize the Deck (2 sets of each card + 2 jokers)
function createDeck() {
    deck = [];
    COLORS.forEach(color => {
        NUMBERS.forEach(num => {
            deck.push({ color, num });
            deck.push({ color, num }); // Double sets
        });
    });
    deck.push({ color: 'joker', num: 0 }, { color: 'joker', num: 0 });
    shuffle(deck);
}

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

// 2. Start Game Logic
function initGame() {
    createDeck();
    
    // Deal 14 tiles to each player
    playerHand = deck.splice(0, 14);
    for (let i = 0; i < 3; i++) {
        aiHands[i] = deck.splice(0, 14);
    }

    renderPlayerHand();
    showFeedback("遊戲開始！祝您好運！", "Good luck! Let's play!");
}

// 3. Display Tiles for Elderly (Large and Clear)
let selectedTileIndex = null;

// Updated display function with "Selection" visual
function renderPlayerHand() {
    const container = document.getElementById('player-tiles');
    container.innerHTML = ''; 

    playerHand.forEach((tile, index) => {
        const tileDiv = document.createElement('div');
        // If this tile is picked, give it a 'selected' border
        tileDiv.className = `tile ${tile.color} ${selectedTileIndex === index ? 'selected' : ''}`;
        tileDiv.innerText = tile.color === 'joker' ? '☺' : tile.num;
        
        // When clicked, run the selection logic
        tileDiv.onclick = () => selectTile(index);
        container.appendChild(tileDiv);
    });
}

function selectTile(index) {
    // If clicking the same tile, deselect it
    if (selectedTileIndex === index) {
        selectedTileIndex = null;
    } else {
        selectedTileIndex = index;
        showFeedback("您選中了牌，現在請按『完成出牌』或移動它。", "Tile selected! Now move it or finish.");
    }
    renderPlayerHand(); // Refresh the look to show the border
}

// Function to actually "play" the tile (Simplified for now)
function submitMove() {
    if (selectedTileIndex !== null) {
        const tileToPlay = playerHand.splice(selectedTileIndex, 1)[0];
        
        // For now, let's just put it in the "Common Area" on the table
        const tableArea = document.getElementById('common-area');
        const tileDiv = document.createElement('div');
        tileDiv.className = `tile ${tileToPlay.color}`;
        tileDiv.innerText = tileToPlay.color === 'joker' ? '☺' : tileToPlay.num;
        tableArea.appendChild(tileDiv);

        selectedTileIndex = null;
        renderPlayerHand();
        showFeedback("打得好！繼續組合吧。", "Well played! Keep going.");
    } else {
        showFeedback("請先點選一張您想出的牌。", "Please select a tile first.");
    }
}

// 4. Hint System
function showHint() {
    // Simple logic: look for pairs or sequences in player's hand
    let message = currentLang === 'zh-tw' 
        ? "試著找尋相同數字但不同顏色的牌！" 
        : "Try looking for the same numbers with different colors!";
    
    alert(message);
    // In a full version, we could highlight the tiles here.
}

// 5. Draw Tile Logic
function playerDrawTile() {
    if (deck.length > 0) {
        const newTile = deck.pop();
        playerHand.push(newTile);
        renderPlayerHand();
        showFeedback("抽了一張牌，看能不能組合它！", "Drew a tile! Can you use it?");
        
        // End turn automatically after drawing
        setTimeout(aiTurns, 1000);
    }
}

// 6. Feedback System (Appreciation & Encouragement)
function showFeedback(zh, en) {
    const msgArea = document.getElementById('feedback-msg');
    msgArea.innerText = currentLang === 'zh-tw' ? zh : en;
}

// 7. Simplified AI Logic (1 vs 3)
function aiTurns() {
    showFeedback("電腦正在思考中...", "Computers are thinking...");
    
    // Simulate AI playing for 3 players
    setTimeout(() => {
        for(let i=0; i<3; i++) {
            // Simple AI logic: AI always draws a tile for now 
            // (To be expanded with real logic later)
            aiHands[i].push(deck.pop());
        }
        showFeedback("輪到您了！慢慢來，不著急。", "Your turn! Take your time.");
    }, 1500);
}
// 8. Checking for a Win
function checkWin(playerHand, isHuman) {
    if (playerHand.length === 0) {
        if (isHuman) {
            // Big win message!
            showEndGame(translations.encourage_win, "gold");
            updateRanking(currentProfile, 100); // Add score
        } else {
            // Human lost, but we still encourage them
            showEndGame(translations.encourage_lose, "silver");
        }
        return true;
    }
    return false;
}

// 9. End Game Screen (Elderly-Friendly Overlay)
function showEndGame(message, color) {
    const overlay = document.createElement('div');
    overlay.id = "game-over-overlay";
    overlay.style.backgroundColor = color === "gold" ? "#fff3cd" : "#e2e3e5";
    
    overlay.innerHTML = `
        <div class="overlay-content">
            <h1 style="font-size: 3rem;">${message}</h1>
            <button class="btn-large" onclick="location.reload()">再玩一次 (Play Again)</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// 10. Automatic Saving
// We call this every time a turn ends so they never lose progress
function autoSave() {
    const gameState = {
        playerHand: playerHand,
        aiHands: aiHands,
        deck: deck,
        currentLang: currentLang
    };
    localStorage.setItem('saved_rummikub_game', JSON.stringify(gameState));
}
