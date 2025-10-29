const crypto = require("crypto");

/**
 * File Encryption Service
 * Handles encryption and decryption of files before IPFS storage
 */
class EncryptionService {
  constructor() {
    this.algorithm = process.env.FILE_ENCRYPTION_ALGORITHM || "aes-256-gcm";
    this.secretKey = this.getSecretKey();
  }

  /**
   * Get or generate secret key
   * @returns {Buffer} Secret key for encryption
   */
  getSecretKey() {
    let key = process.env.FILE_ENCRYPTION_KEY;

    if (!key) {
      console.warn(
        "⚠️ FILE_ENCRYPTION_KEY not found in environment. Generating a new key..."
      );
      key = crypto.randomBytes(32).toString("hex");
      console.log(`🔑 Generated encryption key: ${key}`);
      console.log("📝 Add this to your .env file: FILE_ENCRYPTION_KEY=" + key);
    }

    // Convert hex string to buffer if needed
    if (typeof key === "string" && key.length === 64) {
      return Buffer.from(key, "hex");
    } else if (typeof key === "string") {
      // If it's not hex, use it as is and hash it to 32 bytes
      return crypto.createHash("sha256").update(key).digest();
    }

    return Buffer.from(key);
  }

  /**
   * Encrypt file data
   * @param {Buffer} fileData - File data to encrypt
   * @param {string} fileName - Original file name
   * @returns {Object} Encrypted data with metadata
   */
  encryptFile(fileData, fileName) {
    try {
      console.log(`🔐 Encrypting file: ${fileName}`);

      // Generate random IV for each file
      const iv = crypto.randomBytes(16);

      // Create cipher with IV
      const cipher = crypto.createCipheriv("aes-256-gcm", this.secretKey, iv);
      cipher.setAAD(Buffer.from(fileName, "utf8")); // Use filename as additional authenticated data

      // Encrypt the file data
      let encrypted = cipher.update(fileData);
      encrypted = Buffer.concat([encrypted, cipher.final()]);

      // Get authentication tag
      const authTag = cipher.getAuthTag();

      // Create metadata object
      const encryptedData = {
        encryptedContent: encrypted,
        iv: iv,
        authTag: authTag,
        algorithm: this.algorithm,
        fileName: fileName,
        originalSize: fileData.length,
        encryptedSize: encrypted.length,
        timestamp: Date.now(),
      };

      console.log(`✅ File encrypted successfully`);
      console.log(`   Original size: ${fileData.length} bytes`);
      console.log(`   Encrypted size: ${encrypted.length} bytes`);
      console.log(`   Algorithm: ${this.algorithm}`);

      return encryptedData;
    } catch (error) {
      console.error("❌ Error encrypting file:", error);
      throw new Error(`Failed to encrypt file: ${error.message}`);
    }
  }

  /**
   * Decrypt file data
   * @param {Object} encryptedData - Encrypted data object
   * @returns {Buffer} Decrypted file data
   */
  decryptFile(encryptedData) {
    try {
      console.log(`🔓 Decrypting file: ${encryptedData.fileName}`);

      // Create decipher
      const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        this.secretKey,
        encryptedData.iv
      );
      decipher.setAAD(Buffer.from(encryptedData.fileName, "utf8")); // Use filename as AAD
      decipher.setAuthTag(encryptedData.authTag);

      // Decrypt the file data
      let decrypted = decipher.update(encryptedData.encryptedContent);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      console.log(`✅ File decrypted successfully`);
      console.log(`   Decrypted size: ${decrypted.length} bytes`);
      console.log(`   Original size: ${encryptedData.originalSize} bytes`);

      return decrypted;
    } catch (error) {
      console.error("❌ Error decrypting file:", error);
      throw new Error(`Failed to decrypt file: ${error.message}`);
    }
  }

  /**
   * Encrypt file and prepare for IPFS upload
   * @param {Buffer} fileData - File data to encrypt
   * @param {string} fileName - Original file name
   * @returns {Buffer} Encrypted data ready for IPFS
   */
  encryptForIPFS(fileData, fileName) {
    const encryptedData = this.encryptFile(fileData, fileName);

    // Convert Buffer objects to base64 strings for JSON serialization
    const serializableData = {
      encryptedContent: encryptedData.encryptedContent.toString("base64"),
      iv: encryptedData.iv.toString("base64"),
      authTag: encryptedData.authTag.toString("base64"),
      algorithm: encryptedData.algorithm,
      fileName: encryptedData.fileName,
      originalSize: encryptedData.originalSize,
      encryptedSize: encryptedData.encryptedSize,
      timestamp: encryptedData.timestamp,
    };

    // Serialize encrypted data to JSON and convert to buffer
    const serializedData = JSON.stringify(serializableData);
    return Buffer.from(serializedData, "utf8");
  }

  /**
   * Decrypt file retrieved from IPFS
   * @param {Buffer} encryptedBuffer - Encrypted data from IPFS
   * @returns {Object} Decrypted file data and metadata
   */
  decryptFromIPFS(encryptedBuffer) {
    try {
      // Parse the encrypted data
      const serializableData = JSON.parse(encryptedBuffer.toString("utf8"));

      // Convert base64 strings back to Buffer objects
      const encryptedData = {
        encryptedContent: Buffer.from(
          serializableData.encryptedContent,
          "base64"
        ),
        iv: Buffer.from(serializableData.iv, "base64"),
        authTag: Buffer.from(serializableData.authTag, "base64"),
        algorithm: serializableData.algorithm,
        fileName: serializableData.fileName,
        originalSize: serializableData.originalSize,
        encryptedSize: serializableData.encryptedSize,
        timestamp: serializableData.timestamp,
      };

      // Decrypt the file content
      const decryptedContent = this.decryptFile(encryptedData);

      return {
        content: decryptedContent,
        fileName: encryptedData.fileName,
        originalSize: encryptedData.originalSize,
        encryptedSize: encryptedData.encryptedSize,
        algorithm: encryptedData.algorithm,
        timestamp: encryptedData.timestamp,
      };
    } catch (error) {
      console.error("❌ Error decrypting from IPFS:", error);
      throw new Error(`Failed to decrypt file from IPFS: ${error.message}`);
    }
  }

  /**
   * Test encryption/decryption functionality
   * @returns {boolean} Whether encryption is working correctly
   */
  testEncryption() {
    try {
      console.log("🧪 Testing encryption/decryption...");

      const testData = Buffer.from(
        "This is a test file for encryption",
        "utf8"
      );
      const testFileName = "test.txt";

      // Encrypt
      const encryptedData = this.encryptFile(testData, testFileName);

      // Decrypt
      const decryptedData = this.decryptFile(encryptedData);

      // Verify
      const isCorrect = testData.equals(decryptedData);

      if (isCorrect) {
        console.log("✅ Encryption test passed");
        return true;
      } else {
        console.log("❌ Encryption test failed");
        return false;
      }
    } catch (error) {
      console.error("❌ Encryption test error:", error);
      return false;
    }
  }

  /**
   * Get encryption information
   * @returns {Object} Encryption configuration info
   */
  getEncryptionInfo() {
    return {
      algorithm: this.algorithm,
      keyLength: this.secretKey.length,
      keyType: "AES-256-GCM",
      hasKey: !!process.env.FILE_ENCRYPTION_KEY,
      keySource: process.env.FILE_ENCRYPTION_KEY ? "environment" : "generated",
    };
  }
}

module.exports = EncryptionService;
