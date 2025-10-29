const Web3 = require("web3");
const Web3Quorum = require("web3js-quorum");
const fs = require("fs");
const path = require("path");

class BlockchainService {
  constructor() {
    this.web3 = new Web3(process.env.QUORUM_RPC_URL || "http://127.0.0.1:8545");
    this.web3quorum = new Web3Quorum(
      this.web3,
      parseInt(process.env.QUORUM_CHAIN_ID || "1337")
    );
    this.chainId = parseInt(process.env.QUORUM_CHAIN_ID || "1337");

    // Load contract ABI and address
    this.loadContract();

    // Tessera public keys for private transactions
    this.tesseraKeys = {
      member1:
        process.env.TESSERA_PUBLIC_KEY_1 ||
        "BULeR8JyUWhiuuCMU/HLA0Q5pzkYT+cHIX3RwcYoQ8k=",
      member2:
        process.env.TESSERA_PUBLIC_KEY_2 ||
        "QfeDAys9MPDs2XHExtc84jKGHxZg/aj52DTh0vtA3Xc=",
      member3:
        process.env.TESSERA_PUBLIC_KEY_3 ||
        "1iTZde/ndBHvzhcl7V68x44Vx7pl8nwx9LqnM/AfJUg=",
    };

    // Private keys (development only)
    this.privateKeys = {
      member1:
        process.env.PRIVATE_KEY_1 ||
        "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63",
      member2:
        process.env.PRIVATE_KEY_2 ||
        "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3",
      member3:
        process.env.PRIVATE_KEY_3 ||
        "0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f",
    };
  }

  /**
   * Load contract ABI and address
   */
  loadContract() {
    try {
      // Try to load from artifacts directory (after compilation)
      const artifactsPath = path.join(
        __dirname,
        "../../artifacts/contracts/CertificateManager.sol/CertificateManager.json"
      );

      if (fs.existsSync(artifactsPath)) {
        const contractArtifact = JSON.parse(
          fs.readFileSync(artifactsPath, "utf8")
        );
        this.contractABI = contractArtifact.abi;
        this.contractBytecode = contractArtifact.bytecode;
        console.log("✅ Loaded contract ABI from artifacts");
      } else {
        console.warn(
          "⚠️ Contract artifacts not found. Please run 'npm run compile' first."
        );
        throw new Error(
          "Contract artifacts not found. Please compile contracts first."
        );
      }

      // Load contract address from environment or .env file
      this.contractAddress = process.env.CERTIFICATE_CONTRACT_ADDRESS;

      if (!this.contractAddress) {
        console.warn("⚠️ Contract address not found in environment variables.");
        console.warn(
          "Please set CERTIFICATE_CONTRACT_ADDRESS in your .env file"
        );
        console.warn(
          "Run 'npm run deploy' to deploy the contract and get the address"
        );
        return;
      }

      // Initialize contract instance
      this.contract = new this.web3quorum.eth.Contract(
        this.contractABI,
        this.contractAddress
      );

      console.log(
        `✅ Contract initialized at address: ${this.contractAddress}`
      );
    } catch (error) {
      console.error("❌ Error loading contract:", error.message);
      this.contract = null;
    }
  }

  /**
   * Issue a certificate
   * @param {string} fid - File ID
   * @param {string} cid - Content ID (IPFS hash)
   * @param {string} email - Email address
   * @param {boolean} isPrivate - Whether to use private transaction
   * @returns {Promise<Object>} - Transaction result
   */
  async issueCertificate(fid, cid, email, isPrivate = false) {
    try {
      if (!this.contract) {
        throw new Error("Contract not deployed or loaded");
      }

      const fromPrivateKey = this.privateKeys.member1;
      const fromPublicKey = this.tesseraKeys.member1;
      const toPublicKey = this.tesseraKeys.member2;

      if (isPrivate) {
        // Private transaction
        const txOptions = {
          data: this.contract.methods
            .issueCertificate(fid, cid, email)
            .encodeABI(),
          privateKey: fromPrivateKey,
          privateFrom: fromPublicKey,
          privateFor: [toPublicKey],
        };

        const txHash = await this.web3quorum.priv.generateAndSendRawTransaction(
          txOptions
        );
        const receipt = await this.web3quorum.priv.waitForTransactionReceipt(
          txHash
        );

        return {
          transactionHash: txHash,
          receipt: receipt,
          isPrivate: true,
        };
      } else {
        // Public transaction
        const account =
          this.web3.eth.accounts.privateKeyToAccount(fromPrivateKey);
        this.web3.eth.accounts.wallet.add(account);

        const tx = {
          from: account.address,
          to: this.contractAddress,
          data: this.contract.methods
            .issueCertificate(fid, cid, email)
            .encodeABI(),
          gas: 1000000, // Increased gas limit
        };

        const signedTx = await this.web3.eth.accounts.signTransaction(
          tx,
          fromPrivateKey
        );
        const receipt = await this.web3.eth.sendSignedTransaction(
          signedTx.rawTransaction
        );

        return {
          transactionHash: receipt.transactionHash,
          receipt: receipt,
          isPrivate: false,
        };
      }
    } catch (error) {
      console.error("Error issuing certificate:", error);
      throw new Error(`Failed to issue certificate: ${error.message}`);
    }
  }

  /**
   * Update a certificate
   * @param {string} fid - File ID
   * @param {string} newCid - New Content ID (IPFS hash)
   * @param {boolean} isPrivate - Whether to use private transaction
   * @returns {Promise<Object>} - Transaction result
   */
  async updateCertificate(fid, newCid, isPrivate = false) {
    try {
      if (!this.contract) {
        throw new Error("Contract not deployed or loaded");
      }

      const fromPrivateKey = this.privateKeys.member1;
      const fromPublicKey = this.tesseraKeys.member1;
      const toPublicKey = this.tesseraKeys.member2;

      if (isPrivate) {
        // Private transaction
        const txOptions = {
          data: this.contract.methods
            .updateCertificate(fid, newCid)
            .encodeABI(),
          privateKey: fromPrivateKey,
          privateFrom: fromPublicKey,
          privateFor: [toPublicKey],
        };

        const txHash = await this.web3quorum.priv.generateAndSendRawTransaction(
          txOptions
        );
        const receipt = await this.web3quorum.priv.waitForTransactionReceipt(
          txHash
        );

        return {
          transactionHash: txHash,
          receipt: receipt,
          isPrivate: true,
        };
      } else {
        // Public transaction
        const account =
          this.web3.eth.accounts.privateKeyToAccount(fromPrivateKey);
        this.web3.eth.accounts.wallet.add(account);

        const tx = {
          from: account.address,
          to: this.contractAddress,
          data: this.contract.methods
            .updateCertificate(fid, newCid)
            .encodeABI(),
          gas: 1000000, // Increased gas limit
        };

        const signedTx = await this.web3.eth.accounts.signTransaction(
          tx,
          fromPrivateKey
        );
        const receipt = await this.web3.eth.sendSignedTransaction(
          signedTx.rawTransaction
        );

        return {
          transactionHash: receipt.transactionHash,
          receipt: receipt,
          isPrivate: false,
        };
      }
    } catch (error) {
      console.error("Error updating certificate:", error);
      throw new Error(`Failed to update certificate: ${error.message}`);
    }
  }

  /**
   * Verify a certificate
   * @param {string} fid - File ID
   * @param {string} email - Email address
   * @returns {Promise<boolean>} - Verification result
   */
  async verifyCertificate(fid, email) {
    try {
      if (!this.contract) {
        throw new Error("Contract not deployed or loaded");
      }

      const isValid = await this.contract.methods
        .verifyCertificate(fid, email)
        .call();
      return isValid;
    } catch (error) {
      console.error("Error verifying certificate:", error);
      throw new Error(`Failed to verify certificate: ${error.message}`);
    }
  }

  /**
   * Get certificate details
   * @param {string} fid - File ID
   * @returns {Promise<Object>} - Certificate details
   */
  async getCertificate(fid) {
    try {
      if (!this.contract) {
        throw new Error("Contract not deployed or loaded");
      }

      const certificate = await this.contract.methods
        .getCertificate(fid)
        .call();
      return {
        fid: certificate.fid,
        cid: certificate.cid,
        email: certificate.email,
        issueDate: parseInt(certificate.issueDate),
        lastModified: parseInt(certificate.lastModified),
        issuer: certificate.issuer,
        isActive: certificate.isActive,
        versionHistory: certificate.versionHistory,
      };
    } catch (error) {
      console.error("Error getting certificate:", error);
      throw new Error(`Failed to get certificate: ${error.message}`);
    }
  }

  /**
   * Delete a certificate
   * @param {string} fid - File ID
   * @param {boolean} isPrivate - Whether to use private transaction
   * @returns {Promise<Object>} - Transaction result
   */
  async deleteCertificate(fid, isPrivate = false) {
    try {
      if (!this.contract) {
        throw new Error("Contract not deployed or loaded");
      }

      const fromPrivateKey = this.privateKeys.member1;
      const fromPublicKey = this.tesseraKeys.member1;
      const toPublicKey = this.tesseraKeys.member2;

      if (isPrivate) {
        // Private transaction
        const txOptions = {
          data: this.contract.methods.deleteCertificate(fid).encodeABI(),
          privateKey: fromPrivateKey,
          privateFrom: fromPublicKey,
          privateFor: [toPublicKey],
        };

        const txHash = await this.web3quorum.priv.generateAndSendRawTransaction(
          txOptions
        );
        const receipt = await this.web3quorum.priv.waitForTransactionReceipt(
          txHash
        );

        return {
          transactionHash: txHash,
          receipt: receipt,
          isPrivate: true,
        };
      } else {
        // Public transaction
        const account =
          this.web3.eth.accounts.privateKeyToAccount(fromPrivateKey);
        this.web3.eth.accounts.wallet.add(account);

        const tx = {
          from: account.address,
          to: this.contractAddress,
          data: this.contract.methods.deleteCertificate(fid).encodeABI(),
          gas: 1000000, // Increased gas limit
        };

        const signedTx = await this.web3.eth.accounts.signTransaction(
          tx,
          fromPrivateKey
        );
        const receipt = await this.web3.eth.sendSignedTransaction(
          signedTx.rawTransaction
        );

        return {
          transactionHash: receipt.transactionHash,
          receipt: receipt,
          isPrivate: false,
        };
      }
    } catch (error) {
      console.error("Error deleting certificate:", error);
      throw new Error(`Failed to delete certificate: ${error.message}`);
    }
  }

  /**
   * Test blockchain connection
   * @returns {Promise<boolean>} - Whether connection is successful
   */
  async testConnection() {
    try {
      const blockNumber = await this.web3.eth.getBlockNumber();
      console.log(
        "Blockchain connection successful. Latest block:",
        blockNumber
      );
      return true;
    } catch (error) {
      console.error("Blockchain connection failed:", error);
      return false;
    }
  }

  /**
   * Get network info
   * @returns {Promise<Object>} - Network information
   */
  async getNetworkInfo() {
    try {
      const blockNumber = await this.web3.eth.getBlockNumber();
      const chainId = await this.web3.eth.getChainId();
      const isListening = await this.web3.eth.net.isListening();

      return {
        blockNumber,
        chainId,
        isListening,
        contractAddress: this.contractAddress,
        rpcUrl: process.env.QUORUM_RPC_URL || "http://127.0.0.1:8545",
      };
    } catch (error) {
      console.error("Error getting network info:", error);
      throw new Error(`Failed to get network info: ${error.message}`);
    }
  }
}

module.exports = BlockchainService;
