/**
 * Handle vault:// URL scheme with HTTP headers
 */
const IPFSService = require("../services/ipfsService");

const ipfsService = new IPFSService();

function handleVaultScheme(req, res, next) {
  const vaultHeader = req.headers["x-vault-scheme"];

  if (vaultHeader && vaultHeader.startsWith("vault://")) {
    try {
      const { fid, cid } = ipfsService.parseVaultUrl(vaultHeader);
      req.vaultData = { fid, cid };
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid vault:// URL format",
        error: error.message,
      });
    }
  }

  next();
}

module.exports = handleVaultScheme;

