const fs = require("fs");
const path = require("path");
const EncryptionService = require("./encryptionService");

class IPFSService {
  constructor(apiUrl = process.env.IPFS_API_URL || "http://127.0.0.1:5001") {
    this.apiUrl = apiUrl;
    this.gatewayUrl = process.env.IPFS_GATEWAY_URL || "http://127.0.0.1:8080";
    this.encryptionService = new EncryptionService();
  }

  /**
   * Upload a file to IPFS (with encryption)
   * @param {Buffer|string} fileData - File data to upload
   * @param {string} fileName - Name of the file
   * @returns {Promise<string>} - IPFS CID (Content ID)
   */
  async uploadFile(fileData, fileName) {
    try {
      console.log(`📤 Uploading file to IPFS: ${fileName}`);

      // Convert to Buffer if needed
      const bufferData = Buffer.isBuffer(fileData)
        ? fileData
        : Buffer.from(fileData);

      // Encrypt the file before uploading
      console.log(`🔐 Encrypting file before IPFS upload...`);
      const encryptedData = this.encryptionService.encryptForIPFS(
        bufferData,
        fileName
      );

      // Use a simpler approach with fetch and FormData (browser-compatible)
      const formData = new FormData();
      const blob = new Blob([encryptedData], {
        type: "application/octet-stream",
      });
      formData.append("file", blob, `encrypted_${fileName}`);

      // Upload to IPFS using HTTP API
      const response = await fetch(`${this.apiUrl}/api/v0/add?pin=true`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `IPFS upload failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.text();

      // Parse the result (IPFS returns newline-separated JSON)
      const lines = result.trim().split("\n");
      const lastLine = lines[lines.length - 1];
      const ipfsResult = JSON.parse(lastLine);

      console.log(`✅ File uploaded successfully. CID: ${ipfsResult.Hash}`);
      console.log(`   Original size: ${bufferData.length} bytes`);
      console.log(`   Encrypted size: ${encryptedData.length} bytes`);
      console.log(
        `   Encryption ratio: ${(
          (encryptedData.length / bufferData.length) *
          100
        ).toFixed(1)}%`
      );

      return ipfsResult.Hash;
    } catch (error) {
      console.error("Error uploading file to IPFS:", error);
      throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
  }

  /**
   * Upload a file from file path
   * @param {string} filePath - Path to the file
   * @returns {Promise<string>} - IPFS CID (Content ID)
   */
  async uploadFileFromPath(filePath) {
    try {
      const fileName = path.basename(filePath);
      const fileData = fs.readFileSync(filePath);
      return await this.uploadFile(fileData, fileName);
    } catch (error) {
      console.error("Error uploading file from path:", error);
      throw new Error(`Failed to upload file from path: ${error.message}`);
    }
  }

  /**
   * Retrieve a file from IPFS (with decryption)
   * @param {string} cid - IPFS CID (Content ID)
   * @returns {Promise<Object>} - Decrypted file data and metadata
   */
  async retrieveFile(cid) {
    try {
      console.log(`📥 Retrieving file from IPFS: ${cid}`);

      // Use IPFS HTTP API to get file
      const response = await fetch(`${this.apiUrl}/api/v0/cat?arg=${cid}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          `IPFS retrieval failed: ${response.status} ${response.statusText}`
        );
      }

      const encryptedBuffer = Buffer.from(await response.arrayBuffer());
      console.log(
        `📦 Retrieved encrypted data: ${encryptedBuffer.length} bytes`
      );

      // Decrypt the file
      console.log(`🔓 Decrypting file from IPFS...`);
      const decryptedData =
        this.encryptionService.decryptFromIPFS(encryptedBuffer);

      console.log(`✅ File retrieved and decrypted successfully`);
      console.log(`   Decrypted size: ${decryptedData.content.length} bytes`);
      console.log(`   Original size: ${decryptedData.originalSize} bytes`);
      console.log(`   File name: ${decryptedData.fileName}`);

      return decryptedData;
    } catch (error) {
      console.error("Error retrieving file from IPFS:", error);
      throw new Error(`Failed to retrieve file from IPFS: ${error.message}`);
    }
  }

  /**
   * Get file info from IPFS
   * @param {string} cid - IPFS CID (Content ID)
   * @returns {Promise<Object>} - File information
   */
  async getFileInfo(cid) {
    try {
      const response = await fetch(`${this.apiUrl}/api/v0/stat?arg=${cid}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          `IPFS stat failed: ${response.status} ${response.statusText}`
        );
      }

      const stats = await response.json();
      return {
        cid: cid,
        size: stats.Size,
        type: stats.Type,
        blocks: stats.Blocks,
        cumulativeSize: stats.CumulativeSize,
      };
    } catch (error) {
      console.error("Error getting file info from IPFS:", error);
      throw new Error(`Failed to get file info from IPFS: ${error.message}`);
    }
  }

  /**
   * Check if a file exists in IPFS
   * @param {string} cid - IPFS CID (Content ID)
   * @returns {Promise<boolean>} - Whether file exists
   */
  async fileExists(cid) {
    try {
      await this.getFileInfo(cid);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove a file from IPFS (unpin)
   * @param {string} cid - IPFS CID (Content ID)
   * @returns {Promise<boolean>} - Whether removal was successful
   */
  async removeFile(cid) {
    try {
      console.log(`Removing file from IPFS: ${cid}`);

      // Unpin the file using IPFS HTTP API
      const response = await fetch(`${this.apiUrl}/api/v0/pin/rm?arg=${cid}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          `IPFS unpin failed: ${response.status} ${response.statusText}`
        );
      }

      console.log(`File unpinned successfully: ${cid}`);
      return true;
    } catch (error) {
      console.error("Error removing file from IPFS:", error);
      throw new Error(`Failed to remove file from IPFS: ${error.message}`);
    }
  }

  /**
   * Get the gateway URL for a file
   * @param {string} cid - IPFS CID (Content ID)
   * @returns {string} - Gateway URL
   */
  getGatewayUrl(cid) {
    return `${this.gatewayUrl}/ipfs/${cid}`;
  }

  /**
   * Get the vault:// URL for a file
   * @param {string} fid - File ID
   * @param {string} cid - IPFS CID (Content ID)
   * @returns {string} - Vault URL
   */
  getVaultUrl(fid, cid) {
    return `vault://${fid}/${cid}`;
  }

  /**
   * Parse vault:// URL to extract FID and CID
   * @param {string} vaultUrl - Vault URL
   * @returns {Object} - Object containing FID and CID
   */
  parseVaultUrl(vaultUrl) {
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
   * Test IPFS connection
   * @returns {Promise<boolean>} - Whether connection is successful
   */
  async testConnection() {
    try {
      // Try multiple connection methods
      const urls = [
        this.apiUrl,
        "http://127.0.0.1:5001",
        "http://localhost:5001",
      ];

      for (const url of urls) {
        try {
          console.log(`Testing IPFS connection at: ${url}`);

          // Use fetch for more reliable connection testing
          const response = await fetch(`${url}/api/v0/version`, {
            method: "POST",
          });

          if (response.ok) {
            const version = await response.json();
            console.log(
              "IPFS connection successful. Version:",
              version.Version || version.version
            );
            return true;
          }
        } catch (error) {
          console.log(`Failed to connect to ${url}:`, error.message);
          continue;
        }
      }

      throw new Error("Could not connect to any IPFS node");
    } catch (error) {
      console.error("IPFS connection failed:", error);
      return false;
    }
  }
}

module.exports = IPFSService;
