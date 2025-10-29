const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");

const CertificateController = require("../controllers/certificateController");
const IPFSService = require("../services/ipfsService");
const BlockchainService = require("../services/blockchainService");

const router = express.Router();

// Initialize services
const ipfsService = new IPFSService();
const blockchainService = new BlockchainService();
const certificateController = new CertificateController(
  ipfsService,
  blockchainService
);

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (
      process.env.ALLOWED_FILE_TYPES ||
      "image/png,image/jpeg,application/pdf,text/plain,text/html,application/json"
    ).split(",");
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PNG, JPEG, PDF, TXT, HTML, and JSON files are allowed."
        )
      );
    }
  },
});

// Validation schemas
const issueCertificateSchema = Joi.object({
  email: Joi.string().email().required(),
  isPrivate: Joi.boolean().default(false),
});

const verifyCertificateSchema = Joi.object({
  fid: Joi.string().required(),
  email: Joi.string().email().required(),
});

// Routes
router.post(
  "/issue",
  upload.single("file"),
  certificateController.issueCertificate.bind(certificateController)
);
router.post(
  "/verify",
  certificateController.verifyCertificate.bind(certificateController)
);
router.put(
  "/:fid",
  upload.single("file"),
  certificateController.updateCertificate.bind(certificateController)
);
router.get(
  "/:fid/download/:cid",
  certificateController.downloadCertificate.bind(certificateController)
);
router.get(
  "/:fid",
  certificateController.getCertificate.bind(certificateController)
);
router.delete(
  "/:fid",
  certificateController.deleteCertificate.bind(certificateController)
);

module.exports = router;
