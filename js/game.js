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
function renderPlayerHand() {
    const container = document.getElementById('player-tiles');
    container.innerHTML = ''; // Clear old tiles

    playerHand.forEach((tile, index) => {
        const tileDiv = document.createElement('div');
        tileDiv.className = `tile ${tile.color}`;
        tileDiv.innerText = tile.color === 'joker' ? '☺' : tile.num;
        
        // Large click area for elderly
        tileDiv.onclick = () => selectTile(index);
        container.appendChild(tileDiv);
    });
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
