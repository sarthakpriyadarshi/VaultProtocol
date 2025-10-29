const fs = require("fs");
const path = require("path");

/**
 * Configuration management
 */
class Config {
  constructor() {
    this.loadEnvironment();
  }

  loadEnvironment() {
    // Load environment variables
    require("dotenv").config();

    // Default configuration
    this.config = {
      server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || "localhost",
        env: process.env.NODE_ENV || "development",
      },
      blockchain: {
        rpcUrl: process.env.QUORUM_RPC_URL || "http://127.0.0.1:8545",
        chainId: parseInt(process.env.QUORUM_CHAIN_ID || "1337"),
        contractAddress: process.env.CERTIFICATE_CONTRACT_ADDRESS,
      },
      ipfs: {
        apiUrl: process.env.IPFS_API_URL || "http://127.0.0.1:5001",
        gatewayUrl: process.env.IPFS_GATEWAY_URL || "http://127.0.0.1:8080",
      },
      security: {
        corsOrigin: process.env.CORS_ORIGIN || "*",
        rateLimit: parseInt(process.env.API_RATE_LIMIT || "100"),
        jwtSecret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
      },
      upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
        allowedTypes: (
          process.env.ALLOWED_FILE_TYPES ||
          "image/png,image/jpeg,application/pdf"
        ).split(","),
      },
      vault: {
        schemePrefix: process.env.VAULT_SCHEME_PREFIX || "vault://",
        headerName: process.env.VAULT_HEADER_NAME || "X-Vault-Scheme",
      },
    };
  }

  get(key) {
    return key ? this.config[key] : this.config;
  }

  set(key, value) {
    this.config[key] = value;
  }

  isDevelopment() {
    return this.config.server.env === "development";
  }

  isProduction() {
    return this.config.server.env === "production";
  }
}

module.exports = new Config();

