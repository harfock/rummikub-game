let currentLang = localStorage.getItem('preferredLang') || 'zh-tw';

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


function selectTile(index) {
    console.log("Tile clicked:", index); // This helps us debug
    
    // Toggle selection
    if (selectedTileIndex === index) {
        selectedTileIndex = null;
    } else {
        selectedTileIndex = index;
    }
    
    // This is the most important part: tell the UI to refresh
    renderPlayerHand(); 
    
    if (selectedTileIndex !== null) {
        showFeedback("您選中了牌，現在請按『完成出牌』。", "Selected! Now click Finish.");
    }
}

function renderPlayerHand() {
    const container = document.getElementById('player-tiles');
    if (!container) return;
    container.innerHTML = ''; 

    playerHand.forEach((tile, index) => {
        const tileDiv = document.createElement('div');
        
        // Notice we add 'selected' here if the index matches
        let classes = `tile ${tile.color}`;
        if (selectedTileIndex === index) {
            classes += " selected";
        }
        
        tileDiv.className = classes;
        tileDiv.innerText = tile.color === 'joker' ? '☺' : tile.num;
        
        tileDiv.onclick = () => selectTile(index);
        container.appendChild(tileDiv);
    });
}

// Function to actually "play" the tile
function submitMove() {
    if (selectedTileIndex !== null) {
        const tileToPlay = playerHand.splice(selectedTileIndex, 1)[0];
        
        // Put it in the "Common Area" on the table
        addTileToTable(tileToPlay);

        selectedTileIndex = null;
        renderPlayerHand();
        
        // Check if Human won immediately after playing
        if (playerHand.length === 0) {
            showFeedback("太厲害了！您贏了！您是今天的冠軍！", "Amazing! You won! You are the champion today!");
            alert("恭喜獲勝！🏆");
            return; 
        }

        showFeedback("打得好！繼續組合吧。", "Well played! Keep going.");
        
        // After human finishes, it is AI turn
        aiTurns();
    } else {
        showFeedback("請先點選一張您想出的牌。", "Please select a tile first.");
    }
} // <--- Make sure this bracket is here!

// 4. Hint System
function showHint() {
    // Find if the player has any two cards of the same number
    const counts = {};
    playerHand.forEach(t => counts[t.num] = (counts[t.num] || 0) + 1);
    
    const pairNum = Object.keys(counts).find(num => counts[num] >= 2);
    
    if (pairNum) {
        showFeedback(`提示：您有一對數字 ${pairNum}，試著組合它們！`, `Hint: You have a pair of ${pairNum}s!`);
    } else {
        showFeedback("暫時沒有明顯組合，抽一張牌試試看？", "No obvious moves, try drawing a tile!");
    }
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
async function aiTurns() {
    // We loop through 3 AI players
    for (let i = 0; i < 3; i++) {
        showFeedback(`電腦 ${i + 1} 正在思考...`, `Computer ${i + 1} is thinking...`);
        
        // Wait 2 seconds so the user doesn't feel rushed
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simple AI: 50% chance to "play" a random card if they have many, 
        // otherwise they draw.
        if (aiHands[i].length > 5 && Math.random() > 0.5) {
            const playedTile = aiHands[i].splice(0, 1)[0];
            addTileToTable(playedTile);
            showFeedback(`電腦 ${i + 1} 出了一張牌！`, `Computer ${i + 1} played a tile!`);
        } else {
            if (deck.length > 0) {
                aiHands[i].push(deck.pop());
                showFeedback(`電腦 ${i + 1} 抽了一張牌。`, `Computer ${i + 1} drew a tile.`);
            }
        }
        
        // Brief pause between AI turns
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    showFeedback("輪到您了！加油！", "It's your turn! You can do it!");
}

function addTileToTable(tile) {
    const tableArea = document.getElementById('common-area');
    const tileDiv = document.createElement('div');
    tileDiv.className = `tile ${tile.color}`;
    tileDiv.innerText = tile.color === 'joker' ? '☺' : tile.num;
    tableArea.appendChild(tileDiv);
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
function isValidSet(tiles) {
    if (tiles.length < 3) return false;

    // Check if it's a "Group" (Same number, different colors)
    const allSameNum = tiles.every(t => t.num === tiles[0].num || t.color === 'joker');
    const colors = new Set(tiles.filter(t => t.color !== 'joker').map(t => t.color));
    if (allSameNum && colors.size === tiles.filter(t => t.color !== 'joker').length) return true;

    // Check if it's a "Run" (Same color, consecutive numbers)
    const color = tiles.find(t => t.color !== 'joker').color;
    const allSameColor = tiles.every(t => t.color === color || t.color === 'joker');
    if (allSameColor) {
        const nums = tiles.map(t => t.num).sort((a, b) => a - b);
        // Simplified consecutive check (ignores Joker for now for simplicity)
        for (let i = 0; i < nums.length - 1; i++) {
            if (nums[i + 1] !== nums[i] + 1) return false;
        }
        return true;
    }

    return false;
}
