# <img src="./assets/images/logo.svg" alt="VAULT Protocol" width="50" height="50" align="center" /> VAULT Protocol

<div align="center">

**A Blockchain-Based Protocol for Secure Data Access and Collaboration**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18+-blue.svg)](https://expressjs.com/)
[![Quorum](https://img.shields.io/badge/Quorum-Latest-yellow.svg)](https://consensys.net/quorum/)
[![IPFS](https://img.shields.io/badge/IPFS-v0.38+-orange.svg)](https://ipfs.io/)
[![License](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)

[Documentation](#-documentation) • [Quick Start](#-quick-start) • [API Reference](#-api-documentation) • [Architecture](#-architecture)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Development](#development)
- [Security](#security)
- [Contributing](#contributing)

---

## Overview

**VAULT Protocol** is an enterprise-grade blockchain-based certificate management system that combines the immutability of blockchain with the decentralized storage of IPFS, protected by AES-256-GCM encryption.

### What Makes It Special?

- **Enterprise Security**: AES-256-GCM encryption for all files before storage
- **Blockchain Immutability**: Certificate metadata stored on Quorum blockchain
- **Decentralized Storage**: Files encrypted and stored on IPFS
- **Custom URL Scheme**: `vault://` protocol for seamless certificate access
- **Production Ready**: Built with Express.js, comprehensive error handling, and monitoring
- **Developer Friendly**: Interactive demo interface and auto-reload development workflow

---

## Key Features

### Security Features

- **AES-256-GCM Encryption**: All files encrypted before IPFS upload
- **Random IV Generation**: Unique initialization vector for each file
- **Authentication Tags**: Integrity verification with GCM authentication
- **Secure Key Management**: Environment-based secret key configuration
- **Helmet.js Integration**: Comprehensive security headers
- **Rate Limiting**: API request throttling for DDoS protection
- **CORS Configuration**: Cross-origin resource sharing control
- **Input Validation**: Joi schema validation for all endpoints

### Blockchain Integration

- **Quorum Compatibility**: Hyperledger Besu private blockchain
- **Smart Contracts**: Solidity-based Certificate Manager
- **Private Transactions**: Tessera integration for privacy
- **Metadata Storage**: Immutable certificate records
- **Transaction Verification**: Automatic transaction receipt tracking

## IPFS Integration

- **Decentralized Storage**: Content-addressable file storage
- **Encrypted Files**: All files encrypted before IPFS upload
- **CID Management**: Content ID (CID) tracking for file versions
- **Gateway Access**: HTTP gateway for file retrieval
- **Automatic Decryption**: Seamless decryption on file download

### Vault URL Scheme

- **Custom Protocol**: `vault://fid/cid` for certificate access
- **Browser Integration**: HTTP header-based implementation
- **Transparent Decryption**: Automatic encryption/decryption
- **Cross-Platform**: Works with any HTTP client

---

## Quick Start

### Prerequisites

```bash
# Required Software
Node.js >= 18.0.0
npm >= 8.0.0
Docker >= 20.0.0
Hardhat >= 2.19.0
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/sarthakpriyadarshi/VaultProtocol.git
cd VaultProtocol

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your configuration

# 4. Build CSS (automatic on all commands)
npm run build:css

# 5. Start services
# Terminal 1: Start IPFS
ipfs daemon

# Terminal 2: Start Quorum Network
npm run setup-quorum && npm run start-quorum

# Terminal 3: Deploy contracts
npm run compile && npm run deploy

# 6. Start the application
npm run dev:encrypted
```

### Access Points

- **Demo Interface**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/api/health
- **IPFS Gateway**: http://localhost:8080
- **Quorum RPC**: http://localhost:8545

---

## Project Structure

```
VaultProtocol/
├── app/                              # Application core
│   ├── controllers/                 # Route controllers
│   │   ├── certificateController.js    # Certificate CRUD operations
│   │   ├── docsController.js           # API documentation generator
│   │   ├── healthController.js         # System health monitoring
│   │   └── vaultController.js          # Vault URL scheme handler
│   ├── middleware/                   # Express middleware
│   │   ├── errorHandler.js             # Global error handler
│   │   └── vaultSchemeHandler.js       # Custom URL scheme handler
│   ├── routes/                       # API route definitions
│   │   ├── certificateRoutes.js        # Certificate endpoints
│   │   ├── docsRoutes.js               # Documentation routes
│   │   ├── healthRoutes.js             # Health check routes
│   │   └── vaultRoutes.js              # Vault protocol routes
│   └── services/                     # Business logic services
│       ├── blockchainService.js        # Quorum blockchain integration
│       ├── encryptionService.js        # AES-256-GCM encryption
│       └── ipfsService.js              # IPFS file storage
│
├── assets/                           # Static assets
│   ├── demo-files/                   # Demo files for testing
│   └── images/                       # Images and logos
│       └── logo.svg                   # VAULT Protocol logo
│
├── config/                           # Configuration files
│   └── index.js                       # App configuration
│
├── contracts/                        # Smart contracts
│   └── CertificateManager.sol        # Main certificate contract
│
├── public/                           # Public static files
│   ├── css/                          # Compiled stylesheets
│   │   ├── tailwind.css               # Compiled Tailwind CSS
│   │   ├── tailwind-source.css        # Source Tailwind CSS
│   │   └── custom-styles.css           # Custom styles
│   └── js/                           # JavaScript files
│       └── demo.js                     # Demo interface logic
│
├── scripts/                          # Utility scripts
│   ├── deploy.js                      # Contract deployment
│   ├── check-status.js               # System health check
│   └── test-contracts.js             # Contract testing
│
├── test/                             # Test files
│   └── CertificateManager.test.js     # Smart contract tests
│
├── utils/                            # Utility functions
│   └── index.js                       # Helper utilities
│
├── views/                            # HTML templates
│   └── index.html                     # Main demo interface
│
├── app.js                            # Express app configuration
├── server.js                         # Server entry point
├── hardhat.config.js                 # Hardhat configuration
├── package.json                      # Dependencies & scripts
├── postcss.config.js                 # PostCSS configuration
└── README.md                         # This file
```

### Directory README Files

Each directory has its own detailed README:

- [app/controllers/README.md](./app/controllers/README.md)
- [app/services/README.md](./app/services/README.md)
- [app/routes/README.md](./app/routes/README.md)
- [app/middleware/README.md](./app/middleware/README.md)
- [contracts/README.md](./contracts/README.md)

---

## API Documentation

### Interactive API Docs

Visit **http://localhost:3001/api/docs** for interactive API documentation with:

- Complete endpoint reference
- Request/response examples
- Try-it-out functionality
- Authentication details

### Available Endpoints

#### Health & Status

| Method | Endpoint      | Description                   |
| ------ | ------------- | ----------------------------- |
| GET    | `/api/health` | System health check           |
| GET    | `/api/docs`   | Interactive API documentation |
| GET    | `/docs`       | Redirect to API docs          |

#### Certificate Management

| Method | Endpoint                               | Description               | Required Parameters |
| ------ | -------------------------------------- | ------------------------- | ------------------- |
| POST   | `/api/certificates/issue`              | Issue new certificate     | file, email         |
| POST   | `/api/certificates/verify`             | Verify certificate        | fid, email          |
| GET    | `/api/certificates/:fid`               | Get certificate details   | fid                 |
| PUT    | `/api/certificates/:fid`               | Update certificate        | fid, file           |
| DELETE | `/api/certificates/:fid`               | Delete certificate        | fid                 |
| GET    | `/api/certificates/:fid/download/:cid` | Download certificate file | fid, cid            |

#### Vault Protocol

| Method | Endpoint                     | Description                |
| ------ | ---------------------------- | -------------------------- |
| GET    | `/api/vault/:fid/:cid`       | Process vault:// URLs      |
| GET    | `/api/vault/info`            | Get protocol information   |
| GET    | `/api/vault/browser-support` | Browser compatibility info |

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Demo Interface │  │  API Clients   │  │  vault://    │ │
│  │   (Port 3001)   │  │    (REST)      │  │   Protocol   │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘ │
└───────────┼────────────────────┼──────────────────┼─────────┘
            │                    │                  │
            ▼                    ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express.js API Server                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Controllers → Services → Blockchain / IPFS          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • Certificate Management                             │   │
│  │  • File Encryption/Decryption (AES-256-GCM)         │   │
│  │  • Vault URL Scheme Handler                          │   │
│  │  • Health Monitoring                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
            │                    │
            ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│  Quorum          │  │  IPFS            │
│  Blockchain      │  │  Storage         │
│  (Port 8545)     │  │  (Port 5001)     │
│                  │  │                  │
│  • Certificate   │  │  • Encrypted     │
│    Metadata      │  │    Files (CID)   │
│  • FID Storage   │  │  • Decentralized │
│  • Immutable     │  │    Storage       │
│    Records       │  │  • Content       │
│                  │  │    Addressing    │
└──────────────────┘  └──────────────────┘
```

### Data Flow

#### Certificate Issuance

```
1. Client uploads file + email
   ↓
2. Server encrypts file (AES-256-GCM)
   ↓
3. Server uploads encrypted file to IPFS
   ↓
4. Server stores metadata on blockchain
   ↓
5. Server returns FID, CID, and transaction hash
```

#### Certificate Verification

```
1. Client provides FID + email
   ↓
2. Server queries blockchain for metadata
   ↓
3. Server checks blockchain certificate status
   ↓
4. Server validates email match
   ↓
5. Server returns verification result
```

#### Certificate Download

```
1. Client provides FID + CID
   ↓
2. Server queries blockchain for certificate
   ↓
3. Server verifies CID matches blockchain record
   ↓
4. Server retrieves encrypted file from IPFS
   ↓
5. Server decrypts file
   ↓
6. Server returns decrypted file
```

---

## Development

### Available Scripts

| Script                  | Description                                |
| ----------------------- | ------------------------------------------ |
| `npm start`             | Production mode (builds CSS automatically) |
| `npm run dev`           | Development with nodemon (builds CSS)      |
| `npm run dev:encrypted` | Development with encryption key pre-loaded |
| `npm run build`         | Build CSS + compile contracts              |
| `npm run build:css`     | Build CSS only                             |
| `npm run watch:css`     | Watch CSS for changes                      |
| `npm run compile`       | Compile smart contracts                    |
| `npm run deploy`        | Deploy contracts to Quorum                 |
| `npm test`              | Run smart contract tests                   |
| `npm run check-status`  | System health check                        |
| `npm run setup-quorum`  | Generate Quorum test network               |
| `npm run start-quorum`  | Start Quorum network                       |
| `npm run stop-quorum`   | Stop Quorum network                        |

### Development Workflow

```bash
# 1. Start development environment
npm run dev:encrypted

# 2. CSS automatically builds on file changes

# 3. Make changes to JavaScript files
# → Nodemon auto-reloads server

# 4. Make changes to CSS
# → Watch mode auto-compiles

# 5. Test changes at http://localhost:3001
```

### Code Style

- ES6+ JavaScript
- JSDoc comments for all functions
- Meaningful variable names
- Comprehensive error handling
- Security best practices

---

## Security

### Encryption

- **Algorithm**: AES-256-GCM
- **Key Size**: 32 bytes (256 bits)
- **Mode**: Galois/Counter Mode (GCM)
- **AAD**: Filename used as Additional Authenticated Data
- **IV**: Unique Initialization Vector per file
- **Tag**: 128-bit authentication tag

### Security Headers (Helmet.js)

- `X-DNS-Prefetch-Control`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Strict-Transport-Security`
- `X-XSS-Protection`
- Content Security Policy (CSP)

### Input Validation

- Joi schema validation for all endpoints
- File type restrictions (PDF, PNG, JPEG, TXT, HTML, JSON)
- File size limits (10MB default)
- Email format validation
- UUID validation for FIDs

---

## Testing

### Smart Contract Tests

```bash
npm test
```

### Manual Testing

1. **Demo Interface**: http://localhost:3001
2. **API Documentation**: http://localhost:3001/api/docs
3. **Health Check**: http://localhost:3001/api/health

### Example API Calls

```bash
# Health check
curl http://localhost:3001/api/health

# Issue certificate
curl -X POST http://localhost:3001/api/certificates/issue \
  -F "file=@example.pdf" \
  -F "email=test@example.com"

# Verify certificate
curl -X POST http://localhost:3001/api/certificates/verify \
  -H "Content-Type: application/json" \
  -d '{"fid":"cert_xxx","email":"test@example.com"}'
```

---

## Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add JSDoc comments for new functions
- Update README files as needed
- Ensure all tests pass
- Security review for sensitive changes

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Sarthak Priyadarshi**

- GitHub: [@sarthakpriyadarshi](https://github.com/sarthakpriyadarshi)
- Repository: [VaultProtocol](https://github.com/sarthakpriyadarshi/VaultProtocol)

---

## Acknowledgments

- [Quorum](https://consensys.net/quorum/) - Enterprise Ethereum blockchain
- [IPFS](https://ipfs.io/) - Distributed file system
- [Express.js](https://expressjs.com/) - Web framework
- [Hardhat](https://hardhat.org/) - Ethereum development environment

---

<div align="center">

**VAULT Protocol** - Secure | Blockchain | Decentralized

Made with ❤️ by Sarthak Priyadarshi

</div>
