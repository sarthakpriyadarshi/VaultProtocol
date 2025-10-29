# Routes Directory

This directory contains Express.js route definitions that map HTTP endpoints to controller functions.

## Files

### `certificateRoutes.js`

**Purpose**: Defines certificate management API routes

**Base Path**: `/api/certificates`

**Routes**:

- `POST /issue` - Issue new certificate

  - Controller: `certificateController.issueCertificate`
  - Middleware: Multer file upload, Joi validation
  - Body: file (form-data), email, isPrivate (optional)
  - Returns: Certificate data (fid, cid, txHash)

- `POST /verify` - Verify certificate

  - Controller: `certificateController.verifyCertificate`
  - Middleware: Joi validation
  - Body: {fid, email}
  - Returns: Verification result

- `GET /:fid` - Get certificate details

  - Controller: `certificateController.getCertificate`
  - Params: fid
  - Returns: Full certificate metadata

- `GET /:fid/download/:cid` - Download certificate file

  - Controller: `certificateController.downloadCertificate`
  - Params: fid, cid
  - Returns: Decrypted file
  - Headers: Content-Type, Content-Disposition

- `PUT /:fid` - Update certificate

  - Controller: `certificateController.updateCertificate`
  - Middleware: Multer file upload, Joi validation
  - Params: fid
  - Body: file (form-data), email
  - Returns: Updated certificate data

- `DELETE /:fid` - Delete certificate
  - Controller: `certificateController.deleteCertificate`
  - Middleware: Joi validation
  - Params: fid
  - Returns: Deletion confirmation

**Validation Schemas**:

- `issueCertificateSchema`: file (required), email (required), isPrivate (optional)
- `verifyCertificateSchema`: fid (required), email (required)
- `updateCertificateSchema`: file (required), email (required)
- `deleteCertificateSchema`: fid (required)

### `vaultRoutes.js`

**Purpose**: Handles vault:// URL scheme endpoints

**Base Path**: `/api/vault`

**Routes**:

- `GET /:fid/:cid` - Process vault URL

  - Controller: `vaultController.getVaultFile`
  - Params: fid, cid
  - Query: vault-scheme header
  - Returns: Decrypted file with vault headers
  - Headers: X-Vault-FID, X-Vault-CID, Content-Type

- `GET /info` - Get protocol information

  - Controller: `vaultController.getVaultInfo`
  - Returns: Protocol version and features

- `GET /browser-support` - Browser compatibility
  - Controller: `vaultController.getBrowserSupport`
  - Returns: Supported browsers and implementation

**Vault URL Format**:

```
vault://{fid}/{cid}
```

### `healthRoutes.js`

**Purpose**: System health monitoring endpoints

**Base Path**: `/api/health`

**Routes**:

- `GET /` - Basic health check

  - Controller: `healthController.checkHealth`
  - Returns: {status, timestamp}

- `GET /detailed` - Detailed system status
  - Controller: `healthController.getDetailedHealth`
  - Returns: Full health report including services

### `docsRoutes.js`

**Purpose**: API documentation endpoints

**Base Path**: `/api/docs`

**Routes**:

- `GET /` - Interactive API documentation

  - Controller: `docsController.getDocumentation`
  - Returns: HTML documentation page

- `GET /openapi` - OpenAPI specification
  - Controller: `docsController.getOpenAPISpec`
  - Returns: OpenAPI 3.0 JSON spec

## Route Registration

Routes are registered in `app.js`:

```javascript
app.use("/api/certificates", certificateRoutes);
app.use("/api/vault", vaultRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/docs", docsRoutes);
```

## Middleware Chain

Each route uses appropriate middleware:

```
Request → Middleware → Validation → Controller → Service → Response
```

**Common Middleware**:

1. **Helmet**: Security headers
2. **CORS**: Cross-origin handling
3. **Rate Limiting**: Request throttling
4. **Body Parser**: JSON/form parsing
5. **Multer**: File upload handling
6. **Error Handler**: Global error catching

**Route-Specific Middleware**:

- **Joi Validation**: Input validation schemas
- **Multer**: File upload configuration
- **Vault Scheme**: Custom URL handling

## Request Flow Example

### Issue Certificate Flow

```
POST /api/certificates/issue
  ↓
Multer (file upload)
  ↓
Joi Validation (email, file type)
  ↓
certificateController.issueCertificate
  ↓
encryptionService.encryptFile
  ↓
ipfsService.uploadFile
  ↓
blockchainService.storeCertificate
  ↓
Response with FID, CID, txHash
```

## Testing Routes

### Using curl

```bash
# Health check
curl http://localhost:3001/api/health

# Issue certificate
curl -X POST http://localhost:3001/api/certificates/issue \
  -F "file=@test.pdf" \
  -F "email=test@example.com"

# Verify certificate
curl -X POST http://localhost:3001/api/certificates/verify \
  -H "Content-Type: application/json" \
  -d '{"fid":"cert_xxx","email":"test@example.com"}'

# Get certificate
curl http://localhost:3001/api/certificates/cert_xxx

# Vault URL
curl -H "X-Vault-Scheme: vault://fid/cid" \
  http://localhost:3001/api/vault/fid/cid
```

### Using Demo Interface

Visit http://localhost:3001 for interactive testing

### Using API Documentation

Visit http://localhost:3001/api/docs for interactive API docs

## Response Formats

### Success Response

```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": {...}
}
```

## Security Features

- **Input Validation**: All inputs validated with Joi
- **File Type Restriction**: Only allowed file types accepted
- **File Size Limits**: Maximum 10MB per file
- **Rate Limiting**: 100 requests per 15 minutes
- **CORS**: Configured for specific origins
- **Helmet**: Security headers enabled

## Route Best Practices

1. **Consistent Naming**: RESTful conventions
2. **Error Handling**: Proper error responses
3. **Validation**: Input validation before processing
4. **Logging**: Request/response logging
5. **Documentation**: JSDoc comments for all routes

## API Endpoints Summary

| Method | Endpoint                               | Description        | Auth |
| ------ | -------------------------------------- | ------------------ | ---- |
| GET    | `/api/health`                          | Health check       | No   |
| GET    | `/api/docs`                            | API docs           | No   |
| POST   | `/api/certificates/issue`              | Issue certificate  | No   |
| POST   | `/api/certificates/verify`             | Verify certificate | No   |
| GET    | `/api/certificates/:fid`               | Get certificate    | No   |
| GET    | `/api/certificates/:fid/download/:cid` | Download file      | No   |
| PUT    | `/api/certificates/:fid`               | Update certificate | No   |
| DELETE | `/api/certificates/:fid`               | Delete certificate | No   |
| GET    | `/api/vault/:fid/:cid`                 | Vault URL          | No   |
| GET    | `/api/vault/info`                      | Protocol info      | No   |
