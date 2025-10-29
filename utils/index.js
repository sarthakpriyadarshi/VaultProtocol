const fs = require("fs");
const path = require("path");

/**
 * Utility functions for the VAULT Protocol
 */
class Utils {
  /**
   * Generate a unique File ID (FID)
   * @param {string} prefix - Optional prefix for the FID
   * @returns {string} - Generated FID
   */
  static generateFID(prefix = "cert") {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - Whether email is valid
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate vault:// URL format
   * @param {string} vaultUrl - Vault URL to validate
   * @returns {boolean} - Whether URL is valid
   */
  static isValidVaultUrl(vaultUrl) {
    const vaultRegex = /^vault:\/\/([^\/]+)\/(.+)$/;
    return vaultRegex.test(vaultUrl);
  }

  /**
   * Parse vault:// URL to extract FID and CID
   * @param {string} vaultUrl - Vault URL to parse
   * @returns {Object} - Object containing FID and CID
   */
  static parseVaultUrl(vaultUrl) {
    const match = vaultUrl.match(/^vault:\/\/([^\/]+)\/(.+)$/);
    if (!match) {
      throw new Error("Invalid vault:// URL format");
    }
    return {
      fid: match[1],
      cid: match[2],
    };
  }

  /**
   * Format file size in human readable format
   * @param {number} bytes - Size in bytes
   * @returns {string} - Formatted size string
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Get file extension from filename
   * @param {string} filename - Filename
   * @returns {string} - File extension
   */
  static getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  }

  /**
   * Get MIME type from file extension
   * @param {string} extension - File extension
   * @returns {string} - MIME type
   */
  static getMimeType(extension) {
    const mimeTypes = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".json": "application/json",
    };
    return mimeTypes[extension] || "application/octet-stream";
  }

  /**
   * Create a standardized API response
   * @param {boolean} success - Whether the operation was successful
   * @param {string} message - Response message
   * @param {Object} data - Response data
   * @param {Object} error - Error details
   * @returns {Object} - Standardized response object
   */
  static createResponse(success, message, data = null, error = null) {
    const response = {
      success,
      message,
      timestamp: new Date().toISOString(),
    };

    if (data !== null) {
      response.data = data;
    }

    if (error !== null) {
      response.error = error;
    }

    return response;
  }

  /**
   * Log with timestamp
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
    };

    if (data) {
      logEntry.data = data;
    }

    console.log(JSON.stringify(logEntry));
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} - Promise that resolves after sleep
   */
  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry a function with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Promise} - Promise that resolves with function result
   */
  static async retry(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i === maxRetries) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, i);
        await this.sleep(delay);
      }
    }
  }
}

module.exports = Utils;

