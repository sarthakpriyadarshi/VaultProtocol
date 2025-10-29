class HealthController {
  constructor(ipfsService, blockchainService) {
    this.ipfsService = ipfsService;
    this.blockchainService = blockchainService;
  }

  async checkHealth(req, res) {
    try {
      const ipfsStatus = await this.ipfsService.testConnection();
      const blockchainStatus = await this.blockchainService.testConnection();

      res.json({
        success: true,
        status: ipfsStatus && blockchainStatus ? "healthy" : "degraded",
        services: {
          ipfs: ipfsStatus ? "connected" : "disconnected",
          blockchain: blockchainStatus ? "connected" : "disconnected",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        status: "unhealthy",
        error: error.message,
      });
    }
  }

  async getDetailedHealth(req, res) {
    try {
      const ipfsStatus = await this.ipfsService.testConnection();
      const blockchainStatus = await this.blockchainService.testConnection();
      const networkInfo = await this.blockchainService.getNetworkInfo();

      res.json({
        success: true,
        status: ipfsStatus && blockchainStatus ? "healthy" : "degraded",
        services: {
          ipfs: {
            status: ipfsStatus ? "connected" : "disconnected",
            url: process.env.IPFS_API_URL || "http://127.0.0.1:5001",
          },
          blockchain: {
            status: blockchainStatus ? "connected" : "disconnected",
            network: networkInfo,
            url: process.env.QUORUM_RPC_URL || "http://127.0.0.1:8545",
          },
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.version,
          platform: process.platform,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        status: "unhealthy",
        error: error.message,
      });
    }
  }
}

module.exports = HealthController;

