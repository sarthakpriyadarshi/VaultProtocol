const express = require("express");
const path = require("path");
const DocsController = require("../controllers/docsController");

const router = express.Router();

// Initialize controller
const docsController = new DocsController();

// Routes
router.get("/", docsController.getDocumentation.bind(docsController));
router.get("/openapi.json", docsController.getOpenAPISpec.bind(docsController));

module.exports = router;
