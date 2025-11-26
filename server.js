// index.js
 
 

const express = require('express');
const path = require('path');
// Import the createApp function from the logic file
const { createApp } = require('./backend/index.js');

// Use the PORT from environment variables or a default value
const PORT = process.env.PORT || 5001;

// Create the main Express application instance
const app = express();

// --- Backend API ---
// Create and mount the application logic as a sub-app (router)
const apiApp = createApp();
app.use('/', apiApp);
// -------------------

// --- Frontend Static Files (If you have a frontend build) ---
//Assuming 'client/out' is where your static files are located
app.use(express.static(path.join(__dirname, 'Newzeland-Project', 'dist')));

// SPA route fallback (Uncomment if serving a single-page application)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Newzeland-Project', 'dist', 'index.html'));
});
 

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});