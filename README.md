# VAULT Protocol - Blockchain-based Certificate Management System

A comprehensive implementation of the VAULT Protocol for secure certificate management using Quorum blockchain, IPFS, and Express.js with **enterprise-grade file encryption**.

## 🔐 **Key Features**

- **🔒 File Encryption**: AES-256-GCM encryption for all files before IPFS storage
- **⛓️ Blockchain Integration**: Quorum blockchain for certificate metadata
- **📁 Decentralized Storage**: IPFS for encrypted file storage
- **🔗 Custom URL Scheme**: `vault://` protocol for certificate references
- **🛡️ Security**: Comprehensive security headers, CORS, rate limiting
- **🔄 Auto-Reload**: Nodemon for development with instant updates
- **📊 Health Monitoring**: Real-time system health checks
- **🎮 Demo Interface**: Interactive web interface for testing

## 📋 **System Requirements**

### **Core Requirements**

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: Latest version
- **Docker**: v20.0.0 or higher
- **Docker Compose**: v2.0.0 or higher

### **Blockchain Requirements**

- **Quorum Dev Quickstart**: Latest version
- **Hyperledger Besu**: v23.1.0 or higher
- **Tessera**: v23.1.0 or higher (for private transactions)
- **Web3.js**: v1.10.0
- **Web3js-Quorum**: v22.0.0

### **Development Tools**

- **Hardhat**: v2.19.0 or higher
- **Nodemon**: v3.1.0 or higher (for development)
- **TypeScript**: v5.0.0 or higher (for Hardhat)
- **Solidity**: v0.8.19

### **External Services**

- **IPFS**: v0.38.1 or higher
- **IPFS Gateway**: Port 8080
- **IPFS API**: Port 5001

## 🏗️ **Project Structure**

```
VaultProtocol/
├── app/                          # Application logic
│   ├── controllers/              # Route controllers
│   │   ├── certificateController.js
│   │   ├── vaultController.js
│   │   └── healthController.js
│   ├── middleware/               # Custom middleware
│   │   ├── errorHandler.js
│   │   └── vaultSchemeHandler.js
│   ├── routes/                   # API routes
│   │   ├── certificateRoutes.js
│   │   ├── vaultRoutes.js
│   │   └── healthRoutes.js
│   └── services/                 # Business logic services
│       ├── encryptionService.js  # 🔐 File encryption/decryption
│       ├── ipfsService.js        # 📁 IPFS integration
│       └── blockchainService.js  # ⛓️ Blockchain integration
├── config/                       # Configuration files
│   └── index.js
├── contracts/                    # Smart contracts
│   └── CertificateManager.sol
├── public/                       # Static files
│   └── js/
│       └── demo.js
├── scripts/                      # Deployment & utility scripts
│   ├── deploy.js                 # 🔧 Smart contract deployment
│   └── check-status.js           # 📊 System health checker
├── test/                         # Test files
│   └── CertificateManager.test.js
├── utils/                        # Utility functions
│   └── index.js
├── views/                        # HTML templates
│   └── index.html
├── app.js                        # Main application file
├── server.js                     # Server entry point
├── hardhat.config.js             # Hardhat configuration
├── nodemon.json                  # 🔄 Nodemon configuration
├── package.json                  # Dependencies and scripts
├── env.example                   # Environment template
└── README.md                     # This file
```

## 🚀 **Quick Start Guide**

### **Step 1: Prerequisites Installation**

#### **Install Node.js and npm**

```bash
# Download from https://nodejs.org/
# Or use a version manager like nvm
nvm install 18
nvm use 18
```

#### **Install Docker and Docker Compose**

```bash
# Windows: Download Docker Desktop from https://www.docker.com/
# Linux:
sudo apt-get update
sudo apt-get install docker.io docker-compose

# macOS:
brew install docker docker-compose
```

#### **Install Quorum Dev Quickstart**

```bash
npx install quorum-dev-quickstart
```

### **Step 2: Project Setup**

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd VaultProtocol
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

### **Step 3: Blockchain Network Setup**

1. **Generate Quorum test network**

   ```bash
   quorum-dev-quickstart
   ```

2. **Start Quorum network**

   ```bash
   sudo ./run.sh (inside quorum-test-network)
   ```

3. **Verify network is running**
   ```bash
   curl http://127.0.0.1:8545 -X POST -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

### **Step 4: IPFS Setup**

1. **Install IPFS**

   ```bash
   # Download from https://ipfs.io/docs/install/
   # Or use package manager
   ```

2. **Initialize IPFS**

   ```bash
   ipfs init
   ```

3. **Start IPFS daemon**

   ```bash
   ipfs daemon
   ```

4. **Verify IPFS is running**
   ```bash
   curl http://127.0.0.1:5001/api/v0/version
   ```

### **Step 5: Smart Contract Deployment**

1. **Compile contracts**

   ```bash
   npm run compile
   ```

2. **Deploy contracts**

   ```bash
   npm run deploy
   ```

3. **Verify deployment**
   ```bash
   npm run check-status
   ```

### **Step 6: Start the Application**

#### **Development Mode (with auto-reload)**

```bash
npm run dev:encrypted
```

#### **Production Mode**

```bash
npm start
```

## 🔐 **Encryption System**

### **Encryption Features**

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Management**: 32-byte secret key from environment variables
- **Authentication**: Filename used as Additional Authenticated Data (AAD)
- **Integrity**: Authentication tags prevent tampering
- **Randomization**: Unique IV for each file

### **Encryption Process**

1. **Upload**: File → Encrypt → Serialize → Upload to IPFS
2. **Retrieval**: IPFS → Download → Deserialize → Decrypt → Return file

### **Security Benefits**

- **Privacy**: Files encrypted before IPFS storage
- **Security**: Even if IPFS compromised, files remain encrypted
- **Key Control**: You control the encryption key
- **Transparency**: Encryption metadata logged and available

## 📡 **API Endpoints**

### **Certificate Management**

| Method   | Endpoint                   | Description                             |
| -------- | -------------------------- | --------------------------------------- |
| `POST`   | `/api/certificates/issue`  | Issue new certificate (with encryption) |
| `POST`   | `/api/certificates/verify` | Verify certificate authenticity         |
| `PUT`    | `/api/certificates/:fid`   | Update certificate with new file        |
| `GET`    | `/api/certificates/:fid`   | Get certificate details                 |
| `DELETE` | `/api/certificates/:fid`   | Delete certificate                      |

### **Vault Protocol**

| Method | Endpoint                     | Description                            |
| ------ | ---------------------------- | -------------------------------------- |
| `GET`  | `/api/vault/:fid/:cid`       | Handle vault:// URLs (with decryption) |
| `GET`  | `/api/vault/info`            | Get vault protocol information         |
| `GET`  | `/api/vault/browser-support` | Browser compatibility info             |

### **Health & Monitoring**

| Method | Endpoint               | Description            |
| ------ | ---------------------- | ---------------------- |
| `GET`  | `/api/health`          | Basic health check     |
| `GET`  | `/api/health/detailed` | Detailed system health |

## 🔧 **Configuration**

### **Environment Variables**

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Quorum Network Configuration
QUORUM_RPC_URL=http://127.0.0.1:8545
QUORUM_CHAIN_ID=1337

# IPFS Configuration
IPFS_API_URL=http://127.0.0.1:5001
IPFS_GATEWAY_URL=http://127.0.0.1:8080

# File Encryption Configuration
FILE_ENCRYPTION_KEY=9c69b7c1996a8cbb37bd218fc147a0e275444aeb83dc30d8d2992a42321395f6
FILE_ENCRYPTION_ALGORITHM=aes-256-gcm

# Private Keys (Development Only - Use EthSigner in Production)
PRIVATE_KEY_1=0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63
PRIVATE_KEY_2=0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3
PRIVATE_KEY_3=0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f

# Tessera Public Keys (for private transactions)
TESSERA_PUBLIC_KEY_1=BULeR8JyUWhiuuCMU/HLA0Q5pzkYT+cHIX3RwcYoQ8k=
TESSERA_PUBLIC_KEY_2=QfeDAys9MPDs2XHExtc84jKGHxZg/aj52DTh0vtA3Xc=
TESSERA_PUBLIC_KEY_3=1iTZde/ndBHvzhcl7V68x44Vx7pl8nwx9LqnM/AfJUg=

# Certificate Contract Address (set after deployment)
CERTIFICATE_CONTRACT_ADDRESS=

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
API_RATE_LIMIT=100

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/png,image/jpeg,application/pdf,text/plain,text/html,application/json

# Vault URL Scheme Configuration
VAULT_SCHEME_PREFIX=vault://
VAULT_HEADER_NAME=X-Vault-Scheme
```

## 🎮 **Demo Interface**

Access the demo interface at `http://localhost:3001` to:

- **Issue certificates** with file encryption
- **Verify certificates** against blockchain
- **Test vault:// URL scheme** with decryption
- **Update and delete certificates**
- **Run complete end-to-end demo**

## 🧪 **Testing**

### **Smart Contract Tests**

```bash
npm test
```

### **System Health Check**

```bash
npm run check-status
```

### **Manual API Testing**

```bash
# Health check
curl http://localhost:3001/api/health

# Issue certificate
curl -X POST http://localhost:3001/api/certificates/issue \
  -F "file=@test.pdf" \
  -F "email=test@example.com" \
  -F "isPrivate=false"

# Verify certificate
curl -X POST http://localhost:3001/api/certificates/verify \
  -H "Content-Type: application/json" \
  -d '{"fid":"cert_xxx","email":"test@example.com"}'
```

## 🔄 **Development Workflow**

### **Available Scripts**

| Script                  | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `npm run dev`           | Development with nodemon (auto-reload)     |
| `npm run dev:encrypted` | Development with encryption key pre-loaded |
| `npm run start`         | Production mode                            |
| `npm run compile`       | Compile smart contracts                    |
| `npm run deploy`        | Deploy contracts & update .env             |
| `npm run test`          | Run smart contract tests                   |
| `npm run check-status`  | Verify system status                       |
| `npm run setup-quorum`  | Generate Quorum test network               |
| `npm run start-quorum`  | Start Quorum network                       |
| `npm run stop-quorum`   | Stop Quorum network                        |

### **Nodemon Configuration**

- **Auto-reload**: Changes to `.js`, `.json`, `.sol` files trigger restart
- **Watched paths**: `app/`, `server.js`, `app.js`, `config/`, `utils/`, `contracts/`, `scripts/`
- **Ignored paths**: `node_modules/`, `artifacts/`, `cache/`, `test/`, `coverage/`
- **Environment**: Pre-loaded with encryption key
- **Delay**: 1-second delay prevents rapid restarts

## 🔐 **Security Features**

- **🔒 File Encryption**: AES-256-GCM for all files
- **🛡️ Helmet.js**: Security headers
- **🌐 CORS**: Cross-origin resource sharing
- **⏱️ Rate Limiting**: API request throttling
- **✅ Input Validation**: Joi schema validation
- **📁 File Type Validation**: Restricted file uploads
- **🚨 Error Handling**: Comprehensive error management
- **🔑 Key Management**: Environment-based secret keys

## 🌐 **Vault:// URL Scheme**

The VAULT Protocol implements a custom URL scheme for certificate references:

```
vault://{fid}/{cid}
```

Where:

- `fid` = File ID (persistent identifier on blockchain)
- `cid` = Content ID (IPFS hash for encrypted file)

### **Browser Compatibility**

Since browsers don't natively support custom schemes, the protocol uses HTTP headers:

```
X-Vault-Scheme: vault://{fid}/{cid}
X-Vault-FID: {fid}
X-Vault-CID: {cid}
X-Vault-File-Name: {originalFileName}
X-Vault-Original-Size: {originalSize}
X-Vault-Encrypted-Size: {encryptedSize}
X-Vault-Algorithm: {encryptionAlgorithm}
```

## 📊 **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Express.js    │    │   Quorum        │    │      IPFS       │
│   API Server    │◄──►│   Blockchain    │◄──►│ Encrypted Files │
│   (Port 3001)   │    │   (Port 8545)   │    │   (Port 5001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Smart         │    │   Encryption     │    │   Gateway       │
│   Contracts     │    │   Service       │    │   (Port 8080)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ **Development Guidelines**

### **Adding New Features**

1. **Controllers**: Add business logic in `app/controllers/`
2. **Routes**: Define API endpoints in `app/routes/`
3. **Services**: Implement core functionality in `app/services/`
4. **Middleware**: Add custom middleware in `app/middleware/`

### **Code Style**

- Use ES6+ features
- Follow Express.js conventions
- Implement proper error handling
- Add JSDoc comments for functions
- Use meaningful variable names
- Follow encryption best practices

### **Security Best Practices**

- Never commit encryption keys to version control
- Use environment variables for sensitive data
- Validate all inputs
- Implement proper error handling
- Use HTTPS in production
- Regular security audits

## 📝 **Troubleshooting**

### **Common Issues**

1. **Port conflicts**: Change ports in `.env` file
2. **IPFS connection failed**: Ensure IPFS daemon is running
3. **Blockchain connection failed**: Verify Quorum network is active
4. **Encryption errors**: Check `FILE_ENCRYPTION_KEY` is set
5. **Contract not found**: Run `npm run deploy`

### **Debug Steps**

1. Check system status: `npm run check-status`
2. Verify services are running
3. Check environment variables
4. Review server logs
5. Test individual components

## 📞 **Support**

For issues and questions:

- **GitHub Issues**: Create an issue on GitHub
- **Documentation**: Check this README and inline comments
- **Demo Interface**: Test functionality at `http://localhost:3001`
- **Health Check**: Monitor system status at `/api/health`

## 📄 **License**

MIT License - see LICENSE file for details.

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

**VAULT Protocol** - Secure, scalable, blockchain-based certificate management with enterprise-grade encryption.

🔐 **Built with security in mind** | ⛓️ **Powered by blockchain** | 📁 **Decentralized storage**
