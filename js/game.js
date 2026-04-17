
// Game State Constants
const COLORS = ['red', 'blue', 'orange', 'black'];
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

let deck = [];
let playerHand = [];
let aiHands = [[], [], []]; // 3 AI Players
let tableSets = []; // Tiles currently on the table
// Global tracking for tiles moved to the table this turn
let tilesMovedThisTurn = [];
let tableTilesGlobal = [];
let selectedFromHand = null; // Stores index of selected tile in playerHand
let selectedFromBoard = null; // Stores {row, col} of tile on board
// Add these variables to the top of game.js
let initialMeldDone = false; // Tracks if the 30-point rule is met
let tilesPlayedThisTurn = []; // Track tiles moved from hand to table this turn
let selectedHandIndex = null;
let selectedBoardPos = null; // { row, col }
let boardState = Array(8).fill().map(() => Array(20).fill(null)); // 8x20 Grid Matrix
// Allow dragging tiles BACK to the hand
const playerHandArea = document.getElementById('player-tiles');
playerHandArea.ondragover = (e) => e.preventDefault();
playerHandArea.ondrop = (e) => {
    const tileData = JSON.parse(e.dataTransfer.getData("tile"));
    const source = e.dataTransfer.getData("source");

    if (source === "table") {
        // Find and remove from table
        const tableTiles = document.getElementById('common-area');
        const tileDiv = Array.from(tableTiles.children).find(div => 
            div.dataset.num == tileData.num && div.dataset.color == tileData.color
        );
        if (tileDiv) {
            tableTiles.removeChild(tileDiv);
            playerHand.push(tileData);
            // Remove from turn tracker
            tilesPlayedThisTurn = tilesPlayedThisTurn.filter(t => !(t.num == tileData.num && t.color == tileData.color));
            renderPlayerHand();
        }
    }
};

function handlePassTurn() {
    const tableArea = document.getElementById('common-area');
    
    // 1. Identify all "Sets" on the board
    // In a professional version, you would group tiles by proximity.
    // For this version, we will validate the ENTIRE table as groups of 3+.
    const allTableTiles = Array.from(tableArea.children).map(div => ({
        num: parseInt(div.dataset.num),
        color: div.dataset.color
    }));

    // 2. Validation Logic
    if (tilesPlayedThisTurn.length === 0) {
        showFeedback("您本回合沒有出牌，請抽牌或出牌。", "No tiles played. Draw or play.");
        return;
    }

    // Check 30-point rule for first move
    if (!initialMeldDone) {
        const points = tilesPlayedThisTurn.reduce((sum, t) => sum + (t.color === 'joker' ? 10 : t.num), 0);
        if (points < 30) {
            showFeedback("初次出牌需滿30分！目前：" + points, "Initial meld must be 30+ points!");
            return;
        }
        initialMeldDone = true;
    }

    // 3. Complete Board Check
    // We check if all tiles on the table form valid sets of 3+
    if (!validateEntireBoard(allTableTiles)) {
        showFeedback("桌面組合無效！請檢查顏色或數字順序。", "Invalid board! Check colors/runs.");
        return;
    }

    // 4. Success - Clear turn data and start AI
    tilesPlayedThisTurn = [];
    showFeedback("組合正確！輪到電腦...", "Valid! Computer's turn...");
    aiTurns();
}

function validateEntireBoard(tiles) {
    if (tiles.length === 0) return true;
    if (tiles.length < 3) return false;

    // Simplified logic: Check if the tiles provided form at least one valid Group or Run
    // To allow "different directions," a real engine splits tiles by distance.
    // Here, we check if the tiles on the table are mathematically valid as a whole.
    return isValidSet(tiles); 
}
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

// 1. Render Player Hand with Click-to-Select
function renderPlayerHand() {
    const container = document.getElementById('player-tiles');
    container.innerHTML = ''; 

    playerHand.forEach((tile, index) => {
        const tileDiv = createTileElement(tile);
        
        // Apply selection class if this index is selected
        if (selectedHandIndex === index) {
            tileDiv.classList.add('selected');
        }

        tileDiv.onclick = () => {
            if (selectedHandIndex === index) {
                selectedHandIndex = null; // Deselect if clicked again
            } else {
                selectedHandIndex = index;
                selectedBoardPos = null; // Clear board selection
            }
            renderPlayerHand();
            renderTable(); // Refresh table to clear board selections
        };
        container.appendChild(tileDiv);
    });
}

// Render the 8x20 Grid
function renderTable() {
    const tableArea = document.getElementById('common-area');
    tableArea.innerHTML = '';

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 20; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            
            const tile = boardState[r][c];
            if (tile) {
                const tileDiv = createTileElement(tile);
                if (selectedBoardPos && selectedBoardPos.r === r && selectedBoardPos.c === c) {
                    tileDiv.classList.add('selected');
                }
                
                tileDiv.onclick = (e) => {
                    e.stopPropagation();
                    handleTileOnBoardClick(r, c);
                };
                cell.appendChild(tileDiv);
            } else {
                cell.onclick = () => handleEmptyCellClick(r, c);
            }
            tableArea.appendChild(cell);
        }
    }
}
function handleEmptyCellClick(r, c) {
    // Case 1: Moving tile from Hand to Grid
    if (selectedHandIndex !== null) {
        const tile = playerHand.splice(selectedHandIndex, 1)[0];
        boardState[r][c] = tile;
        selectedHandIndex = null;
    } 
    // Case 2: Moving tile from one Grid spot to another
    else if (selectedBoardPos !== null) {
        boardState[r][c] = boardState[selectedBoardPos.r][selectedBoardPos.c];
        boardState[selectedBoardPos.r][selectedBoardPos.c] = null;
        selectedBoardPos = null;
    }
    renderPlayerHand();
    renderTable();
}

function handleTileOnBoardClick(r, c) {
    // Case 3: Insert Hand tile into an existing Combo (Shift existing tiles)
    if (selectedHandIndex !== null) {
        insertTileAt(r, c, playerHand.splice(selectedHandIndex, 1)[0]);
        selectedHandIndex = null;
    } 
    // Case 4: Select a tile on board to move it elsewhere
    else {
        selectedBoardPos = { r, c };
    }
    renderPlayerHand();
    renderTable();
}

// Logic to shift tiles to the right when inserting
function insertTileAt(r, col, newTile) {
    // Simple shift logic: move everything from col onwards to the right
    for (let i = 19; i > col; i--) {
        boardState[r][i] = boardState[r][i-1];
    }
    boardState[r][col] = newTile;
}

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
// 2. Initialize Common Area Grid
function initGrid() {
    const table = document.getElementById('common-area');
    table.innerHTML = '';
    
    // Create a 20x10 grid (expandable)
    for (let i = 0; i < 200; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.index = i;
        
        cell.onclick = (e) => handleGridClick(i);
        table.appendChild(cell);
    }
}

function handleGridClick(gridIndex) {
    const cell = document.querySelector(`.grid-cell[data-index='${gridIndex}']`);
    
    // IF user has a tile selected from hand
    if (selectedFromHand !== null) {
        const tile = playerHand.splice(selectedFromHand, 1)[0];
        placeTileOnGrid(tile, cell);
        selectedFromHand = null;
        renderPlayerHand();
    } 
    // IF user wants to move a tile already on board
    else if (cell.hasChildNodes() && selectedFromBoard === null) {
        selectedFromBoard = gridIndex;
        cell.firstChild.classList.add('selected');
    }
    // IF user is moving a board tile to a NEW cell
    else if (!cell.hasChildNodes() && selectedFromBoard !== null) {
        const oldCell = document.querySelector(`.grid-cell[data-index='${selectedFromBoard}']`);
        const tileDiv = oldCell.firstChild;
        cell.appendChild(tileDiv);
        selectedFromBoard = null;
    }
}

function placeTileOnGrid(tile, cell) {
    const tileDiv = createTileElement(tile);
    cell.appendChild(tileDiv);
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
    if (tilesPlayedThisTurn.length > 0) {
        showFeedback("您已經出牌，不能再抽牌！", "You already played tiles, cannot draw!");
        return;
    }

    if (deck.length > 0) {
        const newTile = deck.pop();
        playerHand.push(newTile);
        renderPlayerHand();
        updateStatusBar();
        showFeedback("您抽了一張牌。換電腦...", "Drawn. AI's turn...");
        setTimeout(aiTurns, 1500); // End turn automatically
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

// Modify addTileToTable to make table tiles draggable
function addTileToTable(tile) {
    const tableArea = document.getElementById('common-area');
    const tileDiv = document.createElement('div');
    tileDiv.className = `tile ${tile.color} tile-placed`;
    tileDiv.innerText = tile.color === 'joker' ? '☺' : tile.num;
    tileDiv.dataset.num = tile.num;
    tileDiv.dataset.color = tile.color;
    tileDiv.draggable = true;

    tileDiv.ondragstart = (e) => {
        e.dataTransfer.setData("tileData", JSON.stringify(tile));
        e.dataTransfer.setData("source", "table");
    };

    tableArea.appendChild(tileDiv);
    tilesMovedThisTurn.push(tile);
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
// Helper function to create a tile element with all necessary attributes
function createTileElement(tile) {
    const tileDiv = document.createElement('div');
    
    // Set classes for styling and color
    tileDiv.className = `tile ${tile.color}`;
    
    // Set display text (Handle Joker)
    tileDiv.innerText = tile.color === 'joker' ? '☺' : tile.num;
    
    // Critical: Store data attributes so the game logic can "read" the board
    tileDiv.dataset.num = tile.num;
    tileDiv.dataset.color = tile.color;
    
    return tileDiv;
}


// New function to handle the End Turn logic
function endTurn() {
    // 1. Capture the current state of the board
    const currentTableTiles = Array.from(document.getElementById('common-area').children).map(div => {
        return {
            num: parseInt(div.dataset.num),
            color: div.dataset.color
        };
    });

    // 2. Validation (The gatekeeper)
    if (currentTableTiles.length > 0 && !isValidSet(currentTableTiles)) {
        showFeedback("組合不完全！請確保每組牌至少有3張。", "Invalid combo!");
        return; 
    }

    // 3. SUCCESS: Save the tiles to the global state so they don't disappear
    tableTilesGlobal = currentTableTiles; 
    
    // 4. Trigger AI
    showFeedback("組合正確！輪到電腦...", "Valid! Computer's turn...");
    aiTurns();
}

// Modify addTileToTable to store data attributes for easy validation
function addTileToTable(tile) {
    const tableArea = document.getElementById('common-area');
    const tileDiv = document.createElement('div');
    tileDiv.className = `tile ${tile.color} tile-placed`;
    tileDiv.innerText = tile.color === 'joker' ? '☺' : tile.num;
    
    // These data attributes are what the validator "reads"
    tileDiv.dataset.num = tile.num;
    tileDiv.dataset.color = tile.color;
    
    tableArea.appendChild(tileDiv);
    
    // Add to the global tracking array immediately
    tableTilesGlobal.push(tile); 
}
function sortHand(criteria) {
    if (criteria === 'number') {
        // Sort primarily by number, then by color
        playerHand.sort((a, b) => {
            if (a.num !== b.num) return a.num - b.num;
            return a.color.localeCompare(b.color);
        });
    } else if (criteria === 'color') {
        // Sort primarily by color, then by number
        playerHand.sort((a, b) => {
            if (a.color !== b.color) return a.color.localeCompare(b.color);
            return a.num - b.num;
        });
    }
    renderPlayerHand();
    showFeedback("手牌已排序", "Hand sorted");
}
function sortHand(type) {
    playerHand.sort((a, b) => {
        if (type === 'num') return a.num - b.num || a.color.localeCompare(b.color);
        return a.color.localeCompare(b.color) || a.num - b.num;
    });
    renderPlayerHand();
}

function recallAllTiles() {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 20; c++) {
            if (boardState[r][c]) {
                playerHand.push(boardState[r][c]);
                boardState[r][c] = null;
            }
        }
    }
    renderPlayerHand();
    renderTable();
}
