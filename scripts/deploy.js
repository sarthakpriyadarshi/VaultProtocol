const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying CertificateManager contract...");

  // Get the contract factory
  const CertificateManager = await ethers.getContractFactory(
    "CertificateManager"
  );

  // Deploy the contract
  const certificateManager = await CertificateManager.deploy();

  // Wait for deployment to complete
  await certificateManager.waitForDeployment();

  const contractAddress = await certificateManager.getAddress();

  console.log("CertificateManager deployed to:", contractAddress);

  // Save contract address to .env file
  const fs = require("fs");
  const path = require("path");

  const envPath = path.join(__dirname, "..", ".env");

  try {
    let envContent = "";

    // Read existing .env file if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }

    // Check if CERTIFICATE_CONTRACT_ADDRESS already exists and remove duplicates
    const lines = envContent.split("\n");
    const filteredLines = [];
    let found = false;

    for (const line of lines) {
      if (line.startsWith("CERTIFICATE_CONTRACT_ADDRESS=")) {
        if (!found) {
          filteredLines.push(`CERTIFICATE_CONTRACT_ADDRESS=${contractAddress}`);
          found = true;
        }
        // Skip duplicate entries
      } else if (line.trim() !== "") {
        filteredLines.push(line);
      }
    }

    // If not found, add it
    if (!found) {
      filteredLines.push(`CERTIFICATE_CONTRACT_ADDRESS=${contractAddress}`);
    }

    envContent = filteredLines.join("\n") + "\n";

    // Write back to .env file
    fs.writeFileSync(envPath, envContent);
    console.log("✅ Contract address saved to .env file");
    console.log(`   CERTIFICATE_CONTRACT_ADDRESS=${contractAddress}`);
  } catch (error) {
    console.log("❌ Could not write to .env file:", error.message);
    console.log("Please manually add the following to your .env file:");
    console.log(`CERTIFICATE_CONTRACT_ADDRESS=${contractAddress}`);
  }

  return contractAddress;
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
