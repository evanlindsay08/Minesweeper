const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const TOTAL_CELLS = 100000;
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

// Global game state
const gameState = {
    winningCell: Math.floor(Math.random() * TOTAL_CELLS),
    userClicks: new Map(),
    revealedCells: new Set(),
};

// Custom cooldown middleware instead of rate-limit
const checkCooldown = (req, res, next) => {
    const ip = req.ip;
    const lastClick = gameState.userClicks.get(ip) || 0;
    const now = Date.now();
    const timeElapsed = now - lastClick;

    if (lastClick && timeElapsed < COOLDOWN_MS) {
        const remainingTime = COOLDOWN_MS - timeElapsed;
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        return res.status(429).json({
            error: `Please wait ${minutes}m ${seconds}s before clicking again`,
            remainingTime
        });
    }
    next();
};

function setupRoutes(app) {
    // Get game status and revealed cells
    app.get('/api/status', (req, res) => {
        const ip = req.ip;
        const lastClick = gameState.userClicks.get(ip) || 0;
        const now = Date.now();
        const timeElapsed = now - lastClick;
        const canClick = !lastClick || timeElapsed >= COOLDOWN_MS;
        
        res.json({
            lastClickTime: lastClick,
            canClick,
            remainingTime: canClick ? 0 : COOLDOWN_MS - timeElapsed,
            revealedCells: Array.from(gameState.revealedCells)
        });
    });

    // Handle cell clicks
    app.post('/api/click', checkCooldown, (req, res) => {
        const ip = req.ip;
        const { cellIndex } = req.body;

        if (cellIndex === undefined || cellIndex < 0 || cellIndex >= TOTAL_CELLS) {
            return res.status(400).json({ error: 'Invalid cell index' });
        }

        gameState.userClicks.set(ip, Date.now());
        const isWinner = cellIndex === gameState.winningCell;
        
        gameState.revealedCells.add({
            index: cellIndex,
            isWinner
        });

        logger.info(`Click from ${ip} on cell ${cellIndex}. Winner: ${isWinner}`);

        res.json({
            success: true,
            isWinner,
            privateKey: isWinner ? process.env.PRIVATE_KEY : null
        });
    });
}

module.exports = { setupRoutes };
