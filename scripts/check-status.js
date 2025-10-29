const fs = require("fs");
const path = require("path");
const Web3 = require("web3");

// Load environment variables
require("dotenv").config();

/**
 * VAULT Protocol Status Checker
 * Verifies that the application is properly configured and connected
 */
class VaultStatusChecker {
  constructor() {
    this.status = {
      contracts: false,
      blockchain: false,
      ipfs: false,
      environment: false,
      deployment: false,
    };
  }

  async checkAll() {
    console.log("🔍 VAULT Protocol Status Check");
    console.log("==============================");

    await this.checkEnvironment();
    await this.checkContracts();
    await this.checkBlockchain();
    await this.checkIPFS();
    await this.checkDeployment();

    this.printSummary();
    return this.status;
  }

  checkEnvironment() {
    console.log("\n📋 Checking Environment Configuration...");

    const envPath = path.join(__dirname, "../.env");
    if (!fs.existsSync(envPath)) {
      console.log("❌ .env file not found");
      return;
    }

    const envContent = fs.readFileSync(envPath, "utf8");
    const hasContractAddress = envContent.includes(
      "CERTIFICATE_CONTRACT_ADDRESS="
    );

    if (hasContractAddress) {
      console.log("✅ Environment file configured");
      this.status.environment = true;
    } else {
      console.log("⚠️  Contract address not set in .env");
    }
  }

  checkContracts() {
    console.log("\n📄 Checking Smart Contracts...");

    const artifactsPath = path.join(
      __dirname,
      "../artifacts/contracts/CertificateManager.sol/CertificateManager.json"
    );

    if (!fs.existsSync(artifactsPath)) {
      console.log("❌ Contract artifacts not found");
      console.log("   Run: npm run compile");
      return;
    }

    try {
      const contractArtifact = JSON.parse(
        fs.readFileSync(artifactsPath, "utf8")
      );
      console.log("✅ Contract artifacts found");
      console.log(`   Contract: ${contractArtifact.contractName}`);

      // Try different ways to get Solidity version
      let solcVersion = "Unknown";

      // Check if there's a separate metadata file
      const metadataPath = artifactsPath.replace(".json", ".dbg.json");
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
          if (metadata.solcVersion) {
            solcVersion = metadata.solcVersion;
          }
        } catch (error) {
          // Ignore metadata parsing errors
        }
      }

      // Try to extract version from bytecode (last resort)
      if (solcVersion === "Unknown" && contractArtifact.bytecode) {
        // Solidity version is often embedded in bytecode metadata
        const bytecode = contractArtifact.bytecode;
        const versionMatch = bytecode.match(/v(\d+\.\d+\.\d+)/);
        if (versionMatch) {
          solcVersion = versionMatch[1];
        }
      }

      console.log(`   Solidity version: ${solcVersion}`);

      // Show additional contract info
      if (contractArtifact.abi) {
        console.log(`   ABI functions: ${contractArtifact.abi.length}`);
      }

      if (contractArtifact.bytecode) {
        console.log(
          `   Bytecode size: ${Math.round(
            contractArtifact.bytecode.length / 2
          )} bytes`
        );
      }

      this.status.contracts = true;
    } catch (error) {
      console.log("❌ Invalid contract artifacts");
      console.log(`   Error: ${error.message}`);
    }
  }

  async checkBlockchain() {
    console.log("\n⛓️  Checking Blockchain Connection...");

    try {
      const web3 = new Web3(
        process.env.QUORUM_RPC_URL || "http://127.0.0.1:8545"
      );
      const blockNumber = await web3.eth.getBlockNumber();
      const chainId = await web3.eth.getChainId();

      console.log("✅ Blockchain connected");
      console.log(`   Network: Quorum (Chain ID: ${chainId})`);
      console.log(`   Latest block: ${blockNumber}`);
      this.status.blockchain = true;
    } catch (error) {
      console.log("❌ Blockchain connection failed");
      console.log("   Make sure Quorum network is running");
      console.log("   Run: npm run start-quorum");
    }
  }

  async checkIPFS() {
    console.log("\n📁 Checking IPFS Connection...");

    try {
      // Try multiple IPFS connection methods
      const ipfsUrls = [
        process.env.IPFS_API_URL || "http://127.0.0.1:5001",
        "http://127.0.0.1:5001",
        "http://localhost:5001",
      ];

      let connected = false;
      for (const url of ipfsUrls) {
        try {
          console.log(`   Trying IPFS at: ${url}`);

          // Try different IPFS API endpoints
          const endpoints = [
            `${url}/api/v0/version`,
            `${url}/api/v1/version`,
            `${url}/version`,
            `${url}/api/version`,
          ];

          for (const endpoint of endpoints) {
            try {
              // Try POST method (IPFS API v0 uses POST)
              const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
              });

              if (response.ok) {
                const version = await response.json();
                console.log("✅ IPFS connected");
                console.log(`   URL: ${url}`);
                console.log(`   Endpoint: ${endpoint}`);
                console.log(
                  `   Version: ${
                    version.Version || version.version || "Unknown"
                  }`
                );
                this.status.ipfs = true;
                connected = true;
                break;
              }
            } catch (error) {
              // Try GET method
              try {
                const response = await fetch(endpoint, { method: "GET" });
                if (response.ok) {
                  const version = await response.json();
                  console.log("✅ IPFS connected");
                  console.log(`   URL: ${url}`);
                  console.log(`   Endpoint: ${endpoint}`);
                  console.log(
                    `   Version: ${
                      version.Version || version.version || "Unknown"
                    }`
                  );
                  this.status.ipfs = true;
                  connected = true;
                  break;
                }
              } catch (getError) {
                continue;
              }
            }
          }

          if (connected) break;
        } catch (error) {
          console.log(`   Failed to connect to ${url}`);
          continue;
        }
      }

      if (!connected) {
        // Check if IPFS is running on different port
        console.log("   Checking alternative IPFS ports...");
        const altPorts = [8080, 9090, 4001, 5002];

        for (const port of altPorts) {
          try {
            const response = await fetch(
              `http://127.0.0.1:${port}/api/v0/version`,
              {
                method: "POST",
              }
            );
            if (response.ok) {
              const version = await response.json();
              console.log("✅ IPFS connected");
              console.log(`   URL: http://127.0.0.1:${port}`);
              console.log(
                `   Version: ${version.Version || version.version || "Unknown"}`
              );
              this.status.ipfs = true;
              connected = true;
              break;
            }
          } catch (error) {
            continue;
          }
        }
      }

      if (!connected) {
        throw new Error("Could not connect to any IPFS node");
      }
    } catch (error) {
      console.log("❌ IPFS connection failed");
      console.log("   Make sure IPFS is running");
      console.log("   Run: ipfs daemon");
      console.log(`   Error: ${error.message}`);
      console.log(
        "   Note: IPFS might be running on a different port or with different API settings"
      );
    }
  }

  async checkDeployment() {
    console.log("\n🚀 Checking Contract Deployment...");

    if (!this.status.environment || !this.status.blockchain) {
      console.log("⚠️  Skipping deployment check (missing prerequisites)");
      return;
    }

    try {
      const contractAddress = process.env.CERTIFICATE_CONTRACT_ADDRESS;
      if (!contractAddress) {
        console.log("❌ Contract address not set");
        console.log("   Run: npm run deploy");
        return;
      }

      const web3 = new Web3(
        process.env.QUORUM_RPC_URL || "http://127.0.0.1:8545"
      );
      const code = await web3.eth.getCode(contractAddress);

      if (code === "0x") {
        console.log("❌ No contract found at address");
        console.log("   Run: npm run deploy");
        return;
      }

      console.log("✅ Contract deployed");
      console.log(`   Address: ${contractAddress}`);
      this.status.deployment = true;
    } catch (error) {
      console.log("❌ Deployment check failed");
    }
  }

  printSummary() {
    console.log("\n📊 Status Summary");
    console.log("=================");

    const checks = [
      { name: "Environment", status: this.status.environment },
      { name: "Smart Contracts", status: this.status.contracts },
      { name: "Blockchain", status: this.status.blockchain },
      { name: "IPFS", status: this.status.ipfs },
      { name: "Deployment", status: this.status.deployment },
    ];

    checks.forEach((check) => {
      const icon = check.status ? "✅" : "❌";
      console.log(`${icon} ${check.name}`);
    });

    const allReady = Object.values(this.status).every((status) => status);

    if (allReady) {
      console.log("\n🎉 VAULT Protocol is ready!");
      console.log("   Run: npm start");
    } else {
      console.log("\n⚠️  Some components need attention");
      console.log("   Run: npm run setup-vault");
    }
  }
}

// Run status check if called directly
if (require.main === module) {
  const checker = new VaultStatusChecker();
  checker.checkAll().catch(console.error);
}

module.exports = VaultStatusChecker;
