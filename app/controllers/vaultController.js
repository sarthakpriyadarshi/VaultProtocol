class VaultController {
  constructor(ipfsService, blockchainService) {
    this.ipfsService = ipfsService;
    this.blockchainService = blockchainService;
  }

  async handleVaultRequest(req, res) {
    try {
      const { fid, cid } = req.params;

      // Validate vault:// URL format
      if (!fid || !cid) {
        return res.status(400).json({
          success: false,
          message: "Invalid vault:// URL format",
          error: "Missing FID or CID parameter",
        });
      }

      // Set vault-specific headers
      res.set({
        "X-Vault-Scheme": `vault://${fid}/${cid}`,
        "X-Vault-FID": fid,
        "X-Vault-CID": cid,
        "X-Vault-Protocol-Version": "1.0",
        "X-Vault-Timestamp": new Date().toISOString(),
        "Content-Type": "application/json",
      });

      // Get certificate details
      const certificate = await this.blockchainService.getCertificate(fid);

      if (!certificate.isActive) {
        return res.status(404).json({
          success: false,
          message: "Certificate not found or inactive",
        });
      }

      // Verify CID matches
      if (certificate.cid !== cid) {
        return res.status(400).json({
          success: false,
          message: "CID does not match certificate",
        });
      }

      // Retrieve and decrypt the file from IPFS
      console.log(
        `🔓 Retrieving and decrypting file for vault://${fid}/${cid}`
      );
      const decryptedFile = await this.ipfsService.retrieveFile(cid);

      // Set appropriate content type based on file extension
      const contentType = this.getContentType(decryptedFile.fileName);
      res.set({
        "X-Vault-Scheme": `vault://${fid}/${cid}`,
        "X-Vault-FID": fid,
        "X-Vault-CID": cid,
        "X-Vault-Protocol-Version": "1.0",
        "X-Vault-Timestamp": new Date().toISOString(),
        "X-Vault-File-Name": decryptedFile.fileName,
        "X-Vault-Original-Size": decryptedFile.originalSize.toString(),
        "X-Vault-Encrypted-Size": decryptedFile.encryptedSize.toString(),
        "X-Vault-Algorithm": decryptedFile.algorithm,
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${decryptedFile.fileName}"`,
      });

      // Return the decrypted file data
      res.json({
        success: true,
        message: "Vault file retrieved successfully",
        data: {
          fid: fid,
          cid: cid,
          fileName: decryptedFile.fileName,
          fileSize: decryptedFile.content.length,
          originalSize: decryptedFile.originalSize,
          encryptedSize: decryptedFile.encryptedSize,
          contentType: contentType,
          algorithm: decryptedFile.algorithm,
          timestamp: decryptedFile.timestamp,
          vaultUrl: `vault://${fid}/${cid}`,
          gatewayUrl: this.ipfsService.getGatewayUrl(cid),
          certificate: {
            email: certificate.email,
            issueDate: new Date(certificate.issueDate * 1000).toISOString(),
            issuer: certificate.issuer,
          },
        },
      });
    } catch (error) {
      console.error("Error handling vault request:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process vault URL",
        error: error.message,
      });
    }
  }

  getVaultInfo(req, res) {
    res.json({
      success: true,
      protocol: "VAULT",
      version: "1.0",
      scheme: "vault://",
      description: "VAULT Protocol URL Scheme Handler",
      features: [
        "Certificate management",
        "IPFS integration",
        "Blockchain verification",
        "Browser compatibility headers",
        "RESTful API endpoints",
      ],
      urlFormat: "vault://{fid}/{cid}",
      headers: {
        "X-Vault-Scheme": "Contains the full vault:// URL",
        "X-Vault-FID": "File ID (persistent identifier)",
        "X-Vault-CID": "Content ID (IPFS hash)",
        "X-Vault-Protocol-Version": "Protocol version",
        "X-Vault-Timestamp": "Request timestamp",
      },
      endpoints: {
        certificate: "/api/certificates/{fid}",
        file: "/api/files/{cid}",
        vault: "/api/vault/{fid}/{cid}",
        health: "/api/health",
      },
    });
  }

  getBrowserSupport(req, res) {
    res.json({
      success: true,
      message: "Browser compatibility information for vault:// scheme",
      compatibility: {
        chrome: {
          supported: false,
          workaround: "Use X-Vault-Scheme header",
          note: "Custom schemes require protocol handler registration",
        },
        firefox: {
          supported: false,
          workaround: "Use X-Vault-Scheme header",
          note: "Custom schemes require protocol handler registration",
        },
        safari: {
          supported: false,
          workaround: "Use X-Vault-Scheme header",
          note: "Custom schemes require protocol handler registration",
        },
        edge: {
          supported: false,
          workaround: "Use X-Vault-Scheme header",
          note: "Custom schemes require protocol handler registration",
        },
      },
      recommendations: [
        "Use HTTP headers for browser compatibility",
        "Implement protocol handler for native apps",
        "Provide fallback URLs for web browsers",
        "Use API endpoints for programmatic access",
      ],
      implementation: {
        header: "X-Vault-Scheme: vault://{fid}/{cid}",
        fallback: `${
          process.env.API_BASE_URL || "http://localhost:3000"
        }/api/vault/{fid}/{cid}`,
        api: `${
          process.env.API_BASE_URL || "http://localhost:3000"
        }/api/certificates/{fid}`,
      },
    });
  }

  /**
   * Get content type based on file extension
   * @param {string} fileName - File name
   * @returns {string} Content type
   */
  getContentType(fileName) {
    const ext = fileName.toLowerCase().split(".").pop();
    const contentTypes = {
      pdf: "application/pdf",
      txt: "text/plain",
      html: "text/html",
      htm: "text/html",
      json: "application/json",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      svg: "image/svg+xml",
      mp4: "video/mp4",
      mp3: "audio/mpeg",
      zip: "application/zip",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };

    return contentTypes[ext] || "application/octet-stream";
  }
}

module.exports = VaultController;
