# Services Directory

This directory contains the core business logic services that interact with external systems (blockchain, IPFS) and handle encryption/decryption.

## Files

### `blockchainService.js`

**Purpose**: Manages all interactions with the Quorum blockchain

**Class**: `BlockchainService`

**Constructor**:

- Loads contract ABI from artifacts
- Initializes Web3 connection
- Connects to Quorum RPC endpoint
- Sets up contract instance
- Configures account for signing

**Methods**:

- `async getContract()` - Get initialized contract instance
- `async storeCertificate(certificateData)` - Store certificate metadata on blockchain

  - Parameters: fid, cid, email, fileName, fileSize, encryptedSize
  - Returns: transaction hash
  - Emits event: CertificateIssued

- `async getCertificate(fid)` - Retrieve certificate from blockchain

  - Returns: certificate metadata
  - Includes: fid, cid, email, dates, status, issuer

- `async verifyCertificate(fid, email)` - Verify certificate authenticity

  - Checks certificate exists
  - Validates email match
  - Checks active status
  - Returns: {isValid, emailMatch, isActive}

- `async updateCertificate(fid, newCid, newSize)` - Update certificate CID

  - Validates certificate exists
  - Updates CID on blockchain
  - Records update timestamp
  - Emits event: CertificateUpdated

- `async deleteCertificate(fid)` - Mark certificate as deleted
  - Sets active flag to false
  - Records deletion timestamp
  - Emits event: CertificateDeleted
  - Returns: transaction hash

**Configuration**:

- `QUORUM_RPC_URL`: Quorum network endpoint (default: http://127.0.0.1:8545)
- `QUORUM_CHAIN_ID`: Network chain ID (default: 1337)
- `CERTIFICATE_CONTRACT_ADDRESS`: Deployed contract address
- `PRIVATE_KEY_1`: Account private key for signing

**Error Handling**:

- Connection failures
- Transaction failures
- Contract call errors
- Gas estimation errors

### `ipfsService.js`

**Purpose**: Handles IPFS file storage and retrieval

**Class**: `IPFSService`

**Constructor**:

- Initializes IPFS client
- Configures IPFS API endpoint
- Sets up file upload options
- Connects to IPFS daemon

**Methods**:

- `async uploadFile(buffer, fileName)` - Upload file to IPFS

  - Parameters: file buffer, filename
  - Returns: CID (Content ID)
  - Includes: original file metadata

- `async downloadFile(cid)` - Download file from IPFS

  - Parameters: CID
  - Returns: file buffer
  - Handles encrypted file retrieval

- `async getFileMetadata(cid)` - Get file information

  - Returns: size, type, metadata
  - Uses IPFS `stat` API

- `async verifyFileExists(cid)` - Check if file exists
  - Validates CID format
  - Queries IPFS for file
  - Returns: boolean

**Configuration**:

- `IPFS_API_URL`: IPFS API endpoint (default: http://127.0.0.1:5001)
- `IPFS_GATEWAY_URL`: HTTP gateway (default: http://127.0.0.1:8080)

**IPFS Integration**:

- Uses ipfs-http-client library
- Handles encrypted files transparently
- Supports all file types
- Immutable storage

### `encryptionService.js`

**Purpose**: Handles AES-256-GCM file encryption and decryption

**Class**: `EncryptionService`

**Constructor**:

- Loads encryption key from environment
- Initializes crypto module
- Configures algorithm (AES-256-GCM)
- Generates random IV

**Methods**:

- `async encryptFile(buffer, fileName)` - Encrypt file

  - Parameters: file buffer, filename (used as AAD)
  - Generates random 16-byte IV
  - Encrypts using AES-256-GCM
  - Returns: encrypted buffer with IV and tag prepended
  - Format: [IV (16 bytes)][Tag (16 bytes)][Encrypted Data]

- `async decryptFile(encryptedBuffer, fileName)` - Decrypt file

  - Parameters: encrypted buffer, filename (used as AAD)
  - Extracts IV and authentication tag
  - Decrypts using AES-256-GCM
  - Verifies authentication tag
  - Returns: decrypted buffer
  - Throws error if tag invalid (tampering detection)

- `generateRandomKey()` - Generate random 32-byte key

  - Used for testing
  - Returns: hex string

- `async testEncryption()` - Test encryption/decryption
  - Runs encryption test
  - Verifies decryption
  - Validates integrity

**Security Features**:

- **Algorithm**: AES-256-GCM
- **Key Size**: 32 bytes (256 bits)
- **IV Size**: 16 bytes (random for each file)
- **Tag Size**: 16 bytes (authentication tag)
- **AAD**: Filename used as Additional Authenticated Data
- **Integrity**: Authentication tag prevents tampering

**Encryption Process**:

```
Original File → Encrypt with AES-256-GCM → Add IV + Tag → Upload to IPFS
```

**Decryption Process**:

```
IPFS File → Extract IV + Tag → Decrypt with AES-256-GCM → Original File
```

**Configuration**:

- `FILE_ENCRYPTION_KEY`: 32-byte key (from .env)
- `FILE_ENCRYPTION_ALGORITHM`: "aes-256-gcm"

**Security Notes**:

- Each file gets unique IV
- IV is prepended to encrypted data
- Authentication tag is appended
- Filename is used as AAD for integrity
- Failed authentication throws error

## Service Integration

### Certificate Issuance Flow

```
1. encryptionService.encryptFile(buffer, fileName)
   → Encrypted buffer with IV + tag

2. ipfsService.uploadFile(encryptedBuffer, fileName)
   → CID from IPFS

3. blockchainService.storeCertificate({...metadata, cid})
   → Transaction hash on blockchain
```

### Certificate Retrieval Flow

```
1. blockchainService.getCertificate(fid)
   → Certificate metadata including CID

2. ipfsService.downloadFile(cid)
   → Encrypted file buffer

3. encryptionService.decryptFile(encryptedBuffer, fileName)
   → Original file buffer
```

## Error Handling

All services implement consistent error handling:

- Connection errors: External service unavailable
- Validation errors: Invalid input parameters
- Processing errors: Operation failures
- Security errors: Authentication failures

## Monitoring

Services log important events:

- Contract interactions
- IPFS uploads/downloads
- Encryption/decryption operations
- Error occurrences
- Performance metrics

## Testing

Test services independently:

```javascript
// Test encryption
const encryptionService = new EncryptionService();
const encrypted = await encryptionService.encryptFile(buffer, "test.pdf");
const decrypted = await encryptionService.decryptFile(encrypted, "test.pdf");

// Test IPFS
const ipfsService = new IPFSService();
const cid = await ipfsService.uploadFile(buffer, "test.pdf");
const file = await ipfsService.downloadFile(cid);

// Test blockchain
const blockchainService = new BlockchainService();
const txHash = await blockchainService.storeCertificate({...});
const cert = await blockchainService.getCertificate(fid);
```

## Configuration

All services configured via environment variables:

- `.env` file for local development
- Environment variables for production
- Default values for development

## Security Considerations

1. **Encryption Key**: Keep secure, never commit to repository
2. **Private Keys**: Use secure key management in production
3. **Network Security**: Use HTTPS for production
4. **Access Control**: Implement authentication/authorization
5. **Rate Limiting**: Prevent abuse of services
