require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { setupRoutes } = require('./src/routes/api');
const logger = require('./src/utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/public')));

// Setup routes
setupRoutes(app);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
