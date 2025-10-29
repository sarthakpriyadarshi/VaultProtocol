# Smart Contracts Directory

This directory contains the Solidity smart contracts that implement the VAULT Protocol on the Quorum blockchain.

## Files

### `CertificateManager.sol`

**Purpose**: Main smart contract for managing certificates on the blockchain

**Version**: Solidity ^0.8.19

## Contract Structure

### Events

**CertificateIssued**

```solidity
event CertificateIssued(
    string indexed fid,
    string cid,
    string email,
    string fileName,
    uint256 fileSize,
    uint256 encryptedSize,
    address indexed issuer,
    uint256 issueDate
);
```

Emitted when a new certificate is issued

**CertificateVerified**

```solidity
event CertificateVerified(
    string indexed fid,
    bool isValid,
    bool emailMatch,
    bool isActive
);
```

Emitted when certificate verification occurs

**CertificateUpdated**

```solidity
event CertificateUpdated(
    string indexed fid,
    string newCid,
    uint256 newSize,
    uint256 updateDate
);
```

Emitted when a certificate is updated

**CertificateDeleted**

```solidity
event CertificateDeleted(
    string indexed fid,
    address indexed issuer,
    uint256 deletionDate
);
```

Emitted when a certificate is deleted

### Struct: Certificate

```solidity
struct Certificate {
    string fid;                    // File ID
    string cid;                    // Content ID (IPFS CID)
    string email;                  // Associated email
    string fileName;               // Original filename
    uint256 fileSize;              // Original file size
    uint256 encryptedSize;         // Encrypted file size
    address issuer;                // Issuer address
    uint256 issueDate;             // Issue timestamp
    uint256 lastModified;          // Last modification timestamp
    bool isActive;                 // Active status
}
```

### Storage

```solidity
mapping(string => Certificate) private certificates;  // fid => Certificate
```

### Functions

**storeCertificate(string memory fid, string memory cid, string memory email, string memory fileName, uint256 fileSize, uint256 encryptedSize)**

- Stores new certificate on blockchain
- Parameters: FID, CID, email, filename, sizes
- Emits: CertificateIssued
- Returns: bool

**getCertificate(string memory fid) public view returns (Certificate memory)**

- Retrieves certificate by FID
- Returns: Full Certificate struct
- Throws: If certificate doesn't exist

**verifyCertificate(string memory fid, string memory email) public returns (bool, bool, bool)**

- Verifies certificate authenticity
- Parameters: FID, email
- Returns: (isValid, emailMatch, isActive)
- Emits: CertificateVerified

**updateCertificate(string memory fid, string memory newCid, uint256 newSize)**

- Updates certificate with new CID
- Parameters: FID, new CID, new size
- Emits: CertificateUpdated
- Returns: bool

**deleteCertificate(string memory fid)**

- Marks certificate as deleted
- Parameters: FID
- Sets isActive to false
- Emits: CertificateDeleted
- Returns: bool

**doesCertificateExist(string memory fid) public view returns (bool)**

- Checks if certificate exists
- Returns: boolean

**getCertificateCount() public view returns (uint256)**

- Gets total number of certificates
- Returns: count

## Access Control

- Only contract owner can deploy
- Certificate operations callable by anyone
- No admin restrictions (decentralized)

## Gas Optimization

- Uses `string memory` for parameters
- Uses `memory` for returns to avoid storage
- Events for off-chain monitoring
- Minimal storage operations

## Testing

Contract tested with Hardhat:

```bash
npm test
```

Test file: `test/CertificateManager.test.js`

Tests cover:

- Certificate issuance
- Verification
- Updates
- Deletions
- Edge cases

## Deployment

### Deploy Contract

```bash
npm run compile
npm run deploy
```

### Deploy Script

Located in: `scripts/deploy.js`

Deployment steps:

1. Compile contracts
2. Connect to Quorum network
3. Deploy CertificateManager
4. Get deployed address
5. Save to .env

### Network Configuration

**Quorum Test Network**:

- RPC URL: http://127.0.0.1:8545
- Chain ID: 1337
- Network: localhost

**Deployment Accounts**:

- Account 1: Used for deployment
- Balance: Pre-funded in test network

## Contract Interaction

### Using Web3.js (via blockchainService)

```javascript
const contract = await new web3.eth.Contract(abi, address);

// Issue certificate
await contract.methods
  .storeCertificate(fid, cid, email, fileName, fileSize, encryptedSize)
  .send({ from: account });

// Get certificate
const cert = await contract.methods.getCertificate(fid).call();

// Verify certificate
const result = await contract.methods.verifyCertificate(fid, email).call();
```

### Using Contract ABI

The contract ABI is located in:

- `artifacts/contracts/CertificateManager.sol/CertificateManager.json`

ABI includes:

- All function definitions
- Event definitions
- Constructor parameters
- Bytecode for deployment

## Contract Analytics

### Storage Costs

- Certificate struct: ~3 KB storage per certificate
- Event emissions: ~200 bytes per event
- Gas costs: ~100k gas per certificate issuance

### Transaction Costs

- Issue: ~100,000 gas
- Update: ~80,000 gas
- Delete: ~70,000 gas
- Verify: ~30,000 gas (view function, no gas for caller)

## Security Considerations

1. **Input Validation**: Validate all string inputs
2. **Reentrancy**: No external calls in state-changing functions
3. **Integer Overflow**: Solidity 0.8.19 auto-checks
4. **Access Control**: Public functions with proper validation
5. **Event Logging**: Complete audit trail via events

## Development

### Compile Contract

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Deploy Locally

```bash
npx hardhat run scripts/deploy.js --network quorum
```

## Solidity Best Practices

- Uses latest Solidity version (^0.8.19)
- Follows Solidity style guide
- Includes NatSpec comments
- Proper error handling
- Gas-efficient patterns

## Upgradeability

Current implementation is:

- **Not upgradeable** (UUPS pattern)
- Contract is immutable after deployment

For production:

- Consider proxy pattern for upgradeability
- Include initialization logic
- Implement access controls

## Contract Address

Contract address stored in:

- `.env` file: `CERTIFICATE_CONTRACT_ADDRESS`
- Used by `blockchainService.js` for initialization

Update `.env` after deployment:

```bash
CERTIFICATE_CONTRACT_ADDRESS=0x...
```

## Future Enhancements

Potential improvements:

- [ ] Batch operations for multiple certificates
- [ ] Certificate expiration mechanism
- [ ] Role-based access control
- [ ] Certificate versioning
- [ ] Transferable certificates

## Contract Statistics

- **Lines of Code**: ~200
- **Functions**: 8
- **Events**: 4
- **Storage Variables**: 2
- **Gas Limit**: ~4,700,000 (block gas limit)

---

For more information, see the main [README.md](../README.md)
