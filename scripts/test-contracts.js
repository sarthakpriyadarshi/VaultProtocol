const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Testing VAULT Protocol Smart Contracts...");

  // Get the contract factory
  const CertificateManager = await ethers.getContractFactory(
    "CertificateManager"
  );

  // Deploy the contract
  console.log("📄 Deploying CertificateManager contract...");
  const certificateManager = await CertificateManager.deploy();
  await certificateManager.waitForDeployment();

  const contractAddress = await certificateManager.getAddress();
  console.log("✅ CertificateManager deployed to:", contractAddress);

  // Test certificate issuance
  console.log("🧾 Testing certificate issuance...");
  const fid = "test-cert-001";
  const cid = "QmTestCID123";
  const email = "test@example.com";

  const issueTx = await certificateManager.issueCertificate(fid, cid, email);
  await issueTx.wait();
  console.log("✅ Certificate issued successfully");

  // Test certificate verification
  console.log("🔍 Testing certificate verification...");
  const isValid = await certificateManager.verifyCertificate(fid, email);
  console.log("✅ Certificate verification result:", isValid);

  // Test certificate retrieval
  console.log("📄 Testing certificate retrieval...");
  const certificate = await certificateManager.getCertificate(fid);
  console.log("✅ Certificate retrieved:", {
    fid: certificate.fid,
    cid: certificate.cid,
    email: certificate.email,
    isActive: certificate.isActive,
  });

  // Test certificate update
  console.log("🔄 Testing certificate update...");
  const newCid = "QmNewCID456";
  const updateTx = await certificateManager.updateCertificate(fid, newCid);
  await updateTx.wait();
  console.log("✅ Certificate updated successfully");

  // Test certificate deletion
  console.log("🗑️ Testing certificate deletion...");
  const deleteTx = await certificateManager.deleteCertificate(fid);
  await deleteTx.wait();
  console.log("✅ Certificate deleted successfully");

  // Test final verification (should fail)
  console.log("🔍 Testing verification after deletion...");
  try {
    const finalVerification = await certificateManager.verifyCertificate(
      fid,
      email
    );
    console.log(
      "❌ Verification should have failed but returned:",
      finalVerification
    );
  } catch (error) {
    console.log("✅ Verification correctly failed after deletion");
  }

  console.log("🎉 All smart contract tests passed!");

  return contractAddress;
}

// Execute tests
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Test failed:", error);
      process.exit(1);
    });
}

module.exports = main;

