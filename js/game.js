
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
function setupNewGame() {
    createDeck(); // createDeck(); // Creates 106 tiles (2 sets of 1-13 in 4 colors + 2 Jokers)
    
    // Deal 14 tiles to each player
    playerHand = deck.splice(0, 14);
    for (let i = 0; i < 3; i++) {
        aiHands[i] = deck.splice(0, 14);
    }

    renderPlayerHand();
    updateStatusBar(); // Show initial 50 remaining tiles
    showFeedback("遊戲開始！祝您好運！您的回合，可以拖動牌到桌面。", "Good luck! Let's play! Your turn, drag tiles to the table.");
}
function updateStatusBar() {
    for (let i = 0; i < 3; i++) {
        const el = document.getElementById(`ai-${i+1}-count`);
        if (el) {
            // Adding "張" makes it easier for senior players to understand the value
            el.innerText = `電腦 ${i+1}: ${aiHands[i].length} 張`;
        }
    }
    
    const deckEl = document.getElementById('deck-count');
    if (deckEl) {
        deckEl.innerText = `池中剩餘: ${deck.length} 張`;
    }
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
    container.innerHTML = ''; 

    playerHand.forEach((tile, index) => {
        const tileDiv = document.createElement('div');
        tileDiv.className = `tile ${tile.color}`;
        tileDiv.innerText = tile.color === 'joker' ? '☺' : tile.num;
        tileDiv.draggable = true; // Enable dragging

        // Identify which tile is being moved
        tileDiv.ondragstart = (e) => {
            e.dataTransfer.setData("tileIndex", index);
            
        };

        container.appendChild(tileDiv);
    });
}

// Setup the Common Area to receive drops
const commonArea = document.getElementById('common-area');
commonArea.ondragover = (e) => e.preventDefault(); // Necessary to allow drop

commonArea.ondrop = (e) => {
    const index = e.dataTransfer.getData("tileIndex");
    

    if (index !== "") {
        const tile = playerHand.splice(index, 1)[0];
        addTileToTable(tile);
        renderPlayerHand();
    }
};

function endPlayerTurn() {
    showFeedback("結束回合，輪到電腦...", "Turn ended, AI playing...");
    aiTurns();
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
} 

// 4. Hint System
function showHint() {
    const counts = {};
    playerHand.forEach(t => counts[t.num] = (counts[t.num] || 0) + 1);
    
    const pairNum = Object.keys(counts).find(num => counts[num] >= 2);
    
    if (pairNum) {
        showFeedback(`提示：您有數字 ${pairNum} 的組合，快試試！`, `Hint: You have a set of ${pairNum}s!`);
        
        // Find the matching tiles and make them wiggle
        const allTiles = document.querySelectorAll('.tile');
        allTiles.forEach(div => {
            if (div.innerText == pairNum) {
                div.style.animation = "wiggle 0.5s ease infinite";
            }
        });
    } else {
        showFeedback("暫時沒看到組合，抽一張牌吧！", "No moves yet, try drawing!");
    }
}

// 5. Draw Tile Logic
function playerDrawTile() {
    if (deck.length > 0) {
        const newTile = deck.pop();
        playerHand.push(newTile);
        renderPlayerHand();
        updateStatusBar(); // Update the "Remaining Tiles" count
        showFeedback("您抽了一張牌，換電腦出牌。", "You drew a tile. Computer's turn.");
        
        // Drawing a tile ends the turn immediately
        setTimeout(aiTurns, 1500);
    }
}

// 6. Feedback System (Appreciation & Encouragement)
function showFeedback(zh, en) {
    const msgArea = document.getElementById('feedback-msg');
    msgArea.innerText = currentLang === 'zh-tw' ? zh : en;
}

// 7. Simplified AI Logic (1 vs 3)
// Fix AI Turns to properly show progress
// 4. Enhanced AI Turn Logic
async function aiTurns() {
    // Loop through each of the 3 AI opponents
    for (let i = 0; i < 3; i++) {
        // 1. Visual feedback for the senior player
        showFeedback(`電腦 ${i + 1} 正在思考...`, `Computer ${i + 1} is thinking...`);
        updateStatusBar(); // Ensure tile counts are visible
        
        // 2. Realistic "Thinking" pause
        await new Promise(r => setTimeout(r, 2000));

        let played = false;
        
        // 3. Simple AI Strategy: Look for "Groups" (Same Number, Different Colors)
        // Group tiles by number
        const hand = aiHands[i];
        const groups = {};
        hand.forEach(tile => {
            if (tile.color !== 'joker') {
                if (!groups[tile.num]) groups[tile.num] = [];
                groups[tile.num].push(tile);
            }
        });

        // Check if any number has 3 or more distinct colors
        for (const num in groups) {
            const potentialSet = groups[num];
            // Filter out duplicate colors in the same number group
            const uniqueColorSet = [];
            const seenColors = new Set();
            
            potentialSet.forEach(t => {
                if (!seenColors.has(t.color)) {
                    uniqueColorSet.push(t);
                    seenColors.add(t.color);
                }
            });

            if (uniqueColorSet.length >= 3) {
                // Play this valid set to the table
                uniqueColorSet.forEach(tile => {
                    const tileIndex = hand.findIndex(t => t.num === tile.num && t.color === tile.color);
                    const playedTile = hand.splice(tileIndex, 1)[0];
                    addTileToTable(playedTile);
                });
                
                showFeedback(`電腦 ${i + 1} 組合了牌組！`, `Computer ${i + 1} played a set!`);
                played = true;
                break; // AI plays one set per turn to keep it simple for the user
            }
        }

        // 4. If no valid play was found, the AI must draw a tile
        if (!played) {
            if (deck.length > 0) {
                const drawnTile = deck.pop();
                aiHands[i].push(drawnTile);
                showFeedback(`電腦 ${i + 1} 沒有可以出的牌，抽了一張。`, `Computer ${i + 1} drew a tile.`);
            } else {
                showFeedback(`電腦 ${i + 1} 跳過回合。`, `Computer ${i + 1} skipped turn.`);
            }
        }

        updateStatusBar(); // Refresh counts after the AI action
        await new Promise(r => setTimeout(r, 1000)); // Short pause before next AI
    }

    // 5. Final transition back to the human player
    showFeedback("輪到您了！請拖動牌或抽牌。", "Your turn! Drag a tile or draw.");
    autoSave(); // Save progress after AI finishes
}

function addTileToTable(tile) {
    const tableArea = document.getElementById('common-area');
    if (!tableArea) return;

    const tileDiv = document.createElement('div');
    // Ensure color class is applied for CSS visibility
    tileDiv.className = `tile ${tile.color} tile-placed`; 
    tileDiv.innerText = tile.color === 'joker' ? '☺' : tile.num;
    
    // Add to table area
    tableArea.appendChild(tileDiv);
    
    // Change background to light green to show it's an "active" board
    tableArea.style.backgroundColor = "#e8f5e9"; 
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
function renderAiStatus() {
    document.getElementById('ai-1-count').innerText = `電腦 1: ${aiHands[0].length} 張`;
    document.getElementById('ai-2-count').innerText = `電腦 2: ${aiHands[1].length} 張`;
    document.getElementById('ai-3-count').innerText = `電腦 3: ${aiHands[2].length} 張`;
    document.getElementById('deck-count').innerText = `剩餘牌數: ${deck.length}`;
}
// game.js

// New function to handle the End Turn logic
function endTurn() {
    // 1. Gather all tiles currently in the common area
    const currentTableTiles = Array.from(document.getElementById('common-area').children).map(div => {
        return {
            num: parseInt(div.dataset.num),
            color: div.dataset.color
        };
    });

    // 2. Logic Check: In a real game, every set on the board must be valid.
    // For now, we check if the tiles played this turn form at least one valid set.
    if (currentTableTiles.length > 0 && !isValidSet(currentTableTiles)) {
        showFeedback("組合不完全！請確保每組牌至少有3張且符合規則。", "Invalid combo! Ensure sets have 3+ tiles.");
        return; // Stop the player from passing
    }

    // 3. If valid, trigger AI turns
    showFeedback("組合正確！輪到電腦...", "Valid! Computer's turn...");
    aiTurns();
}

// Modify addTileToTable to store data attributes for easy validation
function addTileToTable(tile) {
    const tableArea = document.getElementById('common-area');
    const tileDiv = document.createElement('div');
    tileDiv.className = `tile ${tile.color} tile-placed`;
    tileDiv.innerText = tile.color === 'joker' ? '☺' : tile.num;
    
    // Store data so we can validate later
    tileDiv.dataset.num = tile.num;
    tileDiv.dataset.color = tile.color;
    
    tableArea.appendChild(tileDiv);
}
