const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");

class CertificateController {
  constructor(ipfsService, blockchainService) {
    this.ipfsService = ipfsService;
    this.blockchainService = blockchainService;
  }

  async issueCertificate(req, res) {
    try {
      // Validate request
      const schema = Joi.object({
        email: Joi.string().email().required(),
        isPrivate: Joi.boolean().default(false),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          error: error.details[0].message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Generate FID
      const fid = `cert_${uuidv4()}`;

      // Upload file to IPFS
      const cid = await this.ipfsService.uploadFile(
        req.file.buffer,
        req.file.originalname
      );

      // Issue certificate on blockchain
      const txResult = await this.blockchainService.issueCertificate(
        fid,
        cid,
        value.email,
        value.isPrivate
      );

      // Generate vault URL
      const vaultUrl = this.ipfsService.getVaultUrl(fid, cid);

      res.json({
        success: true,
        message: "Certificate issued successfully",
        data: {
          fid,
          cid,
          email: value.email,
          transactionHash: txResult.transactionHash,
          vaultUrl,
          gatewayUrl: this.ipfsService.getGatewayUrl(cid),
          isPrivate: txResult.isPrivate,
        },
      });
    } catch (error) {
      console.error("Error issuing certificate:", error);
      res.status(500).json({
        success: false,
        message: "Failed to issue certificate",
        error: error.message,
      });
    }
  }

  async verifyCertificate(req, res) {
    try {
      // Validate request
      const schema = Joi.object({
        fid: Joi.string().required(),
        email: Joi.string().email().required(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          error: error.details[0].message,
        });
      }

      // Get certificate details from blockchain
      const certificate = await this.blockchainService.getCertificate(
        value.fid
      );

      if (!certificate.isActive) {
        return res.json({
          success: false,
          message: "Certificate verification failed",
          data: {
            fid: value.fid,
            email: value.email,
            isValid: false,
            reason: "Certificate is not active",
          },
        });
      }

      // Verify certificate
      const isValid = await this.blockchainService.verifyCertificate(
        value.fid,
        value.email
      );

      res.json({
        success: true,
        message: isValid
          ? "Certificate verification successful"
          : "Certificate verification failed",
        data: {
          fid: value.fid,
          email: value.email,
          isValid,
          certificate: isValid ? certificate : null,
        },
      });
    } catch (error) {
      console.error("Error verifying certificate:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify certificate",
        error: error.message,
      });
    }
  }

  async updateCertificate(req, res) {
    try {
      const { fid } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Get current certificate
      const currentCertificate = await this.blockchainService.getCertificate(
        fid
      );

      if (!currentCertificate.isActive) {
        return res.status(400).json({
          success: false,
          message: "Cannot update inactive certificate",
        });
      }

      // Upload new file to IPFS
      const newCid = await this.ipfsService.uploadFile(
        req.file.buffer,
        req.file.originalname
      );

      // Update certificate on blockchain
      const txResult = await this.blockchainService.updateCertificate(
        fid,
        newCid
      );

      // Generate new vault URL
      const vaultUrl = this.ipfsService.getVaultUrl(fid, newCid);

      res.json({
        success: true,
        message: "Certificate updated successfully",
        data: {
          fid,
          oldCid: currentCertificate.cid,
          newCid,
          transactionHash: txResult.transactionHash,
          vaultUrl,
          gatewayUrl: this.ipfsService.getGatewayUrl(newCid),
        },
      });
    } catch (error) {
      console.error("Error updating certificate:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update certificate",
        error: error.message,
      });
    }
  }

  async getCertificate(req, res) {
    try {
      const { fid } = req.params;

      const certificate = await this.blockchainService.getCertificate(fid);

      if (!certificate.isActive) {
        return res.status(404).json({
          success: false,
          message: "Certificate not found or inactive",
        });
      }

      res.json({
        success: true,
        message: "Certificate retrieved successfully",
        data: {
          fid: certificate.fid,
          cid: certificate.cid,
          email: certificate.email,
          issueDate: new Date(certificate.issueDate * 1000).toISOString(),
          lastModified: new Date(certificate.lastModified * 1000).toISOString(),
          issuer: certificate.issuer,
          isActive: certificate.isActive,
          versionHistory: certificate.versionHistory,
          vaultUrl: this.ipfsService.getVaultUrl(fid, certificate.cid),
          gatewayUrl: this.ipfsService.getGatewayUrl(certificate.cid),
        },
      });
    } catch (error) {
      console.error("Error getting certificate:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get certificate",
        error: error.message,
      });
    }
  }

  async deleteCertificate(req, res) {
    try {
      const { fid } = req.params;

      // Get certificate details
      const certificate = await this.blockchainService.getCertificate(fid);

      // Remove file from IPFS
      await this.ipfsService.removeFile(certificate.cid);

      // Delete certificate on blockchain
      const txResult = await this.blockchainService.deleteCertificate(fid);

      res.json({
        success: true,
        message: "Certificate deleted successfully",
        data: {
          fid,
          cid: certificate.cid,
          transactionHash: txResult.transactionHash,
        },
      });
    } catch (error) {
      console.error("Error deleting certificate:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete certificate",
        error: error.message,
      });
    }
  }

  async downloadCertificate(req, res) {
    try {
      const { fid, cid } = req.params;

      // Validate parameters
      if (!fid || !cid) {
        return res.status(400).json({
          success: false,
          message: "Missing required parameters: fid and cid",
        });
      }

      console.log(`📥 Download request for certificate: ${fid}, CID: ${cid}`);

      // Get certificate details from blockchain
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
      console.log(`🔓 Retrieving and decrypting file for download...`);
      const decryptedFile = await this.ipfsService.retrieveFile(cid);

      // Determine content type based on file extension
      const contentType = this.getContentType(decryptedFile.fileName);

      // Set appropriate headers for file download
      res.set({
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${decryptedFile.fileName}"`,
        "Content-Length": decryptedFile.content.length.toString(),
        "X-Vault-FID": fid,
        "X-Vault-CID": cid,
        "X-Vault-File-Name": decryptedFile.fileName,
        "X-Vault-Original-Size": decryptedFile.originalSize.toString(),
        "X-Vault-Encrypted-Size": decryptedFile.encryptedSize.toString(),
        "X-Vault-Algorithm": decryptedFile.algorithm,
        "X-Vault-Timestamp": decryptedFile.timestamp.toString(),
      });

      console.log(
        `✅ File ready for download: ${decryptedFile.fileName} (${decryptedFile.content.length} bytes)`
      );

      // Send the decrypted file content
      res.send(decryptedFile.content);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      res.status(500).json({
        success: false,
        message: "Failed to download certificate",
        error: error.message,
      });
    }
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

module.exports = CertificateController;
