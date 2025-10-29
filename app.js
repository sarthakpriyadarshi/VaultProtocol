const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import routes
const certificateRoutes = require("./app/routes/certificateRoutes");
const vaultRoutes = require("./app/routes/vaultRoutes");
const healthRoutes = require("./app/routes/healthRoutes");
const docsRoutes = require("./app/routes/docsRoutes");

// Import middleware
const errorHandler = require("./app/middleware/errorHandler");
const vaultSchemeHandler = require("./app/middleware/vaultSchemeHandler");

class VaultApp {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware with relaxed CSP for demo
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
              "'self'",
              "'unsafe-inline'",
              "'unsafe-hashes'",
              "https://cdn.tailwindcss.com",
            ],
            "script-src-attr": ["'unsafe-inline'"],
            styleSrc: [
              "'self'",
              "'unsafe-inline'",
              "https://fonts.googleapis.com",
              "https://cdn.tailwindcss.com",
            ],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"],
            fontSrc: ["'self'", "https:", "data:", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
      })
    );

    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Vault-Scheme"],
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.API_RATE_LIMIT || 100,
      message: "Too many requests from this IP, please try again later.",
    });
    this.app.use(limiter);

    // Logging
    this.app.use(morgan("combined"));

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Static files
    this.app.use(express.static("public"));
    this.app.use("/assets", express.static("assets"));

    // Vault scheme middleware
    this.app.use(vaultSchemeHandler);
  }

  setupRoutes() {
    // API routes
    this.app.use("/api/certificates", certificateRoutes);
    this.app.use("/api/vault", vaultRoutes);
    this.app.use("/api/health", healthRoutes);
    this.app.use("/api/docs", docsRoutes);

    // Serve demo page
    this.app.get("/", (req, res) => {
      res.sendFile(__dirname + "/views/index.html");
    });

    // API documentation
    this.app.get("/api", (req, res) => {
      res.json({
        name: "VAULT Protocol API",
        version: "1.0.0",
        description: "Blockchain-based Certificate Management System",
        endpoints: {
          certificates: "/api/certificates",
          vault: "/api/vault",
          health: "/api/health",
          docs: "/api/docs",
        },
        documentation: "/api/docs",
      });
    });

    // API Docs with UI
    this.app.get("/docs", (req, res) => {
      res.redirect("/api/docs");
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl,
      });
    });

    // Error handling middleware
    this.app.use(errorHandler);
  }

  start(port = process.env.PORT || 3000) {
    this.app.listen(port, () => {
      console.log(`========VAULT PROTOCOL API SERVER STARTED========`);
      console.log(`VAULT Protocol API server running on port ${port}`);
      console.log(`API Documentation: http://localhost:${port}/api/docs`);
      console.log(`API Docs UI: http://localhost:${port}/docs`);
      console.log(`Health Check: http://localhost:${port}/api/health`);
      console.log(`Demo Interface: http://localhost:${port}/`);
    });
  }
}

module.exports = VaultApp;
