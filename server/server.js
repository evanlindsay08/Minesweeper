const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Game state
let gameState = {
    revealedCells: new Map(), // Stores revealed cell indices
    winningCell: Math.floor(Math.random() * 5000), // Random winning cell (for 100x50 grid)
    lastClickTimes: new Map() // Stores user click timestamps
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/public')));

// Get game status
app.get('/api/status', (req, res) => {
    const clientIP = req.ip;
    const lastClickTime = gameState.lastClickTimes.get(clientIP) || 0;
    
    res.json({
        lastClickTime,
        revealedCells: Array.from(gameState.revealedCells.entries()).map(([index, data]) => ({
            index: parseInt(index),
            isWinner: data.isWinner
        }))
    });
});

// Handle cell clicks
app.post('/api/click', (req, res) => {
    const clientIP = req.ip;
    const cellIndex = req.body.cellIndex;
    const now = Date.now();
    const lastClickTime = gameState.lastClickTimes.get(clientIP) || 0;
    const cooldownTime = 5 * 60 * 1000; // 5 minutes

    // Check cooldown
    if (lastClickTime && (now - lastClickTime) < cooldownTime) {
        return res.status(429).json({
            error: 'Please wait before clicking again'
        });
    }

    // Check if cell was already revealed
    if (gameState.revealedCells.has(cellIndex.toString())) {
        return res.status(400).json({
            error: 'Cell already revealed'
        });
    }

    // Update game state
    const isWinner = cellIndex === gameState.winningCell;
    gameState.revealedCells.set(cellIndex.toString(), {
        isWinner,
        revealedAt: now
    });
    gameState.lastClickTimes.set(clientIP, now);

    // Send response
    res.json({
        success: true,
        isWinner,
        privateKey: isWinner ? 'winner_private_key_here' : null
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});