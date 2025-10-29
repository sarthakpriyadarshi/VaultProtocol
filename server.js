const VaultApp = require("./app");

// Create and start the application
const app = new VaultApp();
const PORT = process.env.PORT || 3001; // Changed from 3000 to 3001
app.start(PORT);

