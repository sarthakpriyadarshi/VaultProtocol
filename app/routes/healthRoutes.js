const express = require("express");
const router = express.Router();

const HealthController = require("../controllers/healthController");
const IPFSService = require("../services/ipfsService");
const BlockchainService = require("../services/blockchainService");

// Initialize services
const ipfsService = new IPFSService();
const blockchainService = new BlockchainService();
const healthController = new HealthController(ipfsService, blockchainService);

// Routes
router.get("/", healthController.checkHealth.bind(healthController));
router.get("/detailed", healthController.getDetailedHealth.bind(healthController));

module.exports = router;

