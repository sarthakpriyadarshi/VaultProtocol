const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateManager", function () {
  let certificateManager;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const CertificateManager = await ethers.getContractFactory(
      "CertificateManager"
    );
    certificateManager = await CertificateManager.deploy();
    await certificateManager.waitForDeployment();
  });

  describe("Certificate Issuance", function () {
    it("Should issue a certificate successfully", async function () {
      const fid = "test-fid-001";
      const cid = "QmTestCID123";
      const email = "test@example.com";

      await expect(certificateManager.issueCertificate(fid, cid, email))
        .to.emit(certificateManager, "CertificateIssued")
        .withArgs(fid, cid, email, await getCurrentTimestamp(), owner.address);

      const certificate = await certificateManager.getCertificate(fid);
      expect(certificate.fid).to.equal(fid);
      expect(certificate.cid).to.equal(cid);
      expect(certificate.email).to.equal(email);
      expect(certificate.isActive).to.be.true;
    });

    it("Should not allow duplicate FID", async function () {
      const fid = "duplicate-fid";
      const cid1 = "QmCID1";
      const cid2 = "QmCID2";
      const email = "test@example.com";

      await certificateManager.issueCertificate(fid, cid1, email);

      await expect(
        certificateManager.issueCertificate(fid, cid2, email)
      ).to.be.revertedWith("Certificate with this FID already exists");
    });

    it("Should not allow empty parameters", async function () {
      await expect(
        certificateManager.issueCertificate("", "QmCID", "test@example.com")
      ).to.be.revertedWith("FID cannot be empty");

      await expect(
        certificateManager.issueCertificate("fid", "", "test@example.com")
      ).to.be.revertedWith("CID cannot be empty");

      await expect(
        certificateManager.issueCertificate("fid", "QmCID", "")
      ).to.be.revertedWith("Email cannot be empty");
    });
  });

  describe("Certificate Verification", function () {
    beforeEach(async function () {
      const fid = "verify-fid";
      const cid = "QmVerifyCID";
      const email = "verify@example.com";

      await certificateManager.issueCertificate(fid, cid, email);
    });

    it("Should verify certificate with correct email", async function () {
      const fid = "verify-fid";
      const email = "verify@example.com";

      const isValid = await certificateManager.verifyCertificate(fid, email);
      expect(isValid).to.be.true;
    });

    it("Should reject verification with incorrect email", async function () {
      const fid = "verify-fid";
      const email = "wrong@example.com";

      const isValid = await certificateManager.verifyCertificate(fid, email);
      expect(isValid).to.be.false;
    });

    it("Should not verify non-existent certificate", async function () {
      await expect(
        certificateManager.verifyCertificate("non-existent", "test@example.com")
      ).to.be.revertedWith("Certificate does not exist");
    });
  });

  describe("Certificate Update", function () {
    beforeEach(async function () {
      const fid = "update-fid";
      const cid = "QmUpdateCID1";
      const email = "update@example.com";

      await certificateManager.issueCertificate(fid, cid, email);
    });

    it("Should update certificate successfully", async function () {
      const fid = "update-fid";
      const newCid = "QmUpdateCID2";

      await expect(certificateManager.updateCertificate(fid, newCid))
        .to.emit(certificateManager, "CertificateUpdated")
        .withArgs(fid, newCid, await getCurrentTimestamp(), owner.address);

      const certificate = await certificateManager.getCertificate(fid);
      expect(certificate.cid).to.equal(newCid);
      expect(certificate.versionHistory.length).to.equal(2);
    });

    it("Should not allow non-issuer to update", async function () {
      const fid = "update-fid";
      const newCid = "QmUpdateCID2";

      await expect(
        certificateManager.connect(addr1).updateCertificate(fid, newCid)
      ).to.be.revertedWith("Only issuer can modify certificate");
    });
  });

  describe("Certificate Deletion", function () {
    beforeEach(async function () {
      const fid = "delete-fid";
      const cid = "QmDeleteCID";
      const email = "delete@example.com";

      await certificateManager.issueCertificate(fid, cid, email);
    });

    it("Should delete certificate successfully", async function () {
      const fid = "delete-fid";

      await expect(certificateManager.deleteCertificate(fid))
        .to.emit(certificateManager, "CertificateDeleted")
        .withArgs(fid, owner.address);

      const certificate = await certificateManager.getCertificate(fid);
      expect(certificate.isActive).to.be.false;
    });

    it("Should not allow non-issuer to delete", async function () {
      const fid = "delete-fid";

      await expect(
        certificateManager.connect(addr1).deleteCertificate(fid)
      ).to.be.revertedWith("Only issuer can modify certificate");
    });
  });

  describe("Certificate Retrieval", function () {
    beforeEach(async function () {
      const fid = "retrieve-fid";
      const cid = "QmRetrieveCID";
      const email = "retrieve@example.com";

      await certificateManager.issueCertificate(fid, cid, email);
    });

    it("Should get certificate by FID", async function () {
      const fid = "retrieve-fid";
      const certificate = await certificateManager.getCertificate(fid);

      expect(certificate.fid).to.equal(fid);
      expect(certificate.email).to.equal("retrieve@example.com");
    });

    it("Should get certificates by email", async function () {
      const email = "retrieve@example.com";
      const fids = await certificateManager.getCertificatesByEmail(email);

      expect(fids.length).to.equal(1);
      expect(fids[0]).to.equal("retrieve-fid");
    });

    it("Should get version history", async function () {
      const fid = "retrieve-fid";
      const history = await certificateManager.getCertificateVersionHistory(
        fid
      );

      expect(history.length).to.equal(1);
      expect(history[0]).to.equal("QmRetrieveCID");
    });
  });

  // Helper function to get current timestamp
  async function getCurrentTimestamp() {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
  }
});

