const express = require("express");
const router = express.Router();

const VaultController = require("../controllers/vaultController");
const BlockchainService = require("../services/blockchainService");
const IPFSService = require("../services/ipfsService");

// Initialize services
const blockchainService = new BlockchainService();
const ipfsService = new IPFSService();
const vaultController = new VaultController(ipfsService, blockchainService);

// Routes
router.get("/:fid/:cid", vaultController.handleVaultRequest.bind(vaultController));
router.get("/info", vaultController.getVaultInfo.bind(vaultController));
router.get("/browser-support", vaultController.getBrowserSupport.bind(vaultController));

module.exports = router;

