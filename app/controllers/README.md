# Controllers Directory

This directory contains the route controllers that handle HTTP requests and coordinate with services to implement business logic.

## Files

### `certificateController.js`

**Purpose**: Handles certificate CRUD operations (Create, Read, Update, Delete)

**Functions**:

- `issueCertificate(req, res)` - Create and issue a new certificate

  - Validates file upload and email
  - Encrypts file using encryptionService
  - Uploads to IPFS via ipfsService
  - Stores metadata on blockchain via blockchainService
  - Returns FID, CID, and transaction hash

- `verifyCertificate(req, res)` - Verify certificate authenticity

  - Queries blockchain for certificate metadata
  - Validates email match
  - Checks certificate active status
  - Returns verification result

- `getCertificate(req, res)` - Retrieve certificate details

  - Queries blockchain for certificate metadata
  - Returns full certificate information
  - Includes issuer, dates, and status

- `downloadCertificate(req, res)` - Download certificate file

  - Validates FID and CID match
  - Retrieves encrypted file from IPFS
  - Decrypts file using encryptionService
  - Returns decrypted file to client

- `updateCertificate(req, res)` - Update certificate with new file

  - Validates certificate exists
  - Encrypts new file
  - Uploads to IPFS
  - Updates blockchain with new CID
  - Returns updated certificate info

- `deleteCertificate(req, res)` - Delete certificate
  - Validates certificate exists
  - Marks certificate as inactive on blockchain
  - Returns deletion confirmation
  - Note: IPFS files are not deleted (immutable storage)

**Input Validation**:

- Uses Joi schemas for request validation
- Validates file types (PDF, PNG, JPEG, TXT, HTML, JSON)
- Validates file size (10MB limit)
- Validates email format

### `healthController.js`

**Purpose**: Provides system health monitoring endpoints

**Functions**:

- `checkHealth(req, res)` - Basic health check

  - Returns status: "healthy" or "unhealthy"
  - Includes timestamp
  - Response time measurement

- `getDetailedHealth(req, res)` - Detailed system status
  - Queries IPFS connection status
  - Queries blockchain connection status
  - Checks service availability
  - Returns comprehensive health report

**Service Checks**:

- IPFS API connectivity
- Blockchain RPC connectivity
- Contract deployment status
- File upload capability

### `docsController.js`

**Purpose**: Generates interactive API documentation

**Functions**:

- `getDocumentation(req, res)` - Serve HTML documentation

  - Generates interactive API docs
  - Includes endpoint details and examples
  - Styled with Tailwind CSS
  - Copy-to-clipboard functionality

- `getOpenAPISpec(req, res)` - Return OpenAPI specification
  - Generates OpenAPI 3.0 spec
  - Includes all endpoints
  - Can be imported to Postman/Swagger

**Generated Documentation Includes**:

- Endpoint descriptions
- HTTP methods and paths
- Request/response examples
- Parameter details
- Status code descriptions

### `vaultController.js`

**Purpose**: Handles vault:// URL scheme processing

**Functions**:

- `getVaultFile(req, res)` - Process vault:// URLs

  - Parses fid and cid from URL
  - Retrieves encrypted file from IPFS
  - Decrypts file automatically
  - Returns decrypted content
  - Sets appropriate headers

- `getVaultInfo(req, res)` - Return protocol information

  - Returns protocol version
  - Supported features
  - Browser compatibility info

- `getBrowserSupport(req, res)` - Browser compatibility info
  - Lists supported browsers
  - Implementation details
  - Usage instructions

**Vault URL Format**:

```
vault://{fid}/{cid}
```

**Headers Used**:

- `X-Vault-Scheme`: Full vault:// URL
- `X-Vault-FID`: File ID
- `X-Vault-CID`: Content ID
- `Content-Type`: Based on decrypted file type

## Request Flow

```
Client Request
     ↓
Route Handler (app/routes)
     ↓
Controller (app/controllers)
     ↓
Service Layer (app/services)
     ↓
External Services (Blockchain/IPFS)
     ↓
Response to Client
```

## Best Practices

1. **Error Handling**: All controllers use try-catch blocks
2. **Validation**: Input validation before processing
3. **Logging**: Important events logged to console
4. **Response Format**: Consistent JSON response structure
5. **Status Codes**: Appropriate HTTP status codes

## Common Patterns

### Success Response

```javascript
{
  success: true,
  data: { ... },
  message: "Operation successful"
}
```

### Error Response

```javascript
{
  success: false,
  error: "Error message",
  details: { ... }
}
```

## Dependencies

All controllers depend on:

- `app/services/blockchainService.js` - Blockchain operations
- `app/services/ipfsService.js` - IPFS operations
- `app/services/encryptionService.js` - Encryption operations

## Testing

Each controller function includes:

- Input validation
- Error handling
- Response formatting
- Logging

Test endpoints using:

- Demo interface at http://localhost:3001
- API documentation at http://localhost:3001/api/docs
- Direct HTTP requests with curl/Postman
