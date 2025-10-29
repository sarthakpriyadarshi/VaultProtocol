# Middleware Directory

This directory contains custom Express.js middleware that handles cross-cutting concerns like error handling and vault:// URL scheme processing.

## Files

### `errorHandler.js`

**Purpose**: Global error handling middleware for all Express routes

**Function**: `errorHandler(error, req, res, next)`

**Error Types Handled**:

1. **Multer Errors**

   - `LIMIT_FILE_SIZE`: File exceeds maximum size limit
   - `LIMIT_UNEXPECTED_FILE`: Unexpected file field name
   - Response: 400 Bad Request

2. **Validation Errors**

   - Joi validation failures
   - Input validation errors
   - Response: 400 Bad Request

3. **General Errors**
   - Default error handler
   - Custom error messages
   - Response: 500 Internal Server Error (or custom status)

**Response Format**:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

**Environment-Based Error Details**:

- Development: Includes stack traces
- Production: Hides sensitive information

**Registration**:
Registered in `app.js` as the last middleware:

```javascript
app.use(errorHandler);
```

### `vaultSchemeHandler.js`

**Purpose**: Handles vault:// URL scheme processing via HTTP headers

**Function**: `handleVaultScheme(req, res, next)`

**How It Works**:

1. Checks for `X-Vault-Scheme` header
2. Parses vault:// URL format: `vault://{fid}/{cid}`
3. Extracts FID and CID
4. Attaches data to request object as `req.vaultData`
5. Calls next() to continue middleware chain

**Vault URL Format**:

```
vault://{file-id}/{content-id}
```

**Example**:

```
vault://cert_abc123/QmXxXxXx
```

**Headers Used**:

- `X-Vault-Scheme`: Full vault:// URL

**Request Object Enhancement**:

```javascript
req.vaultData = {
  fid: "cert_xxx",
  cid: "Qmxxx",
};
```

**Error Handling**:

- Returns 400 Bad Request for invalid URLs
- Parsing errors are caught and returned

**Usage in Controllers**:

```javascript
function getVaultFile(req, res) {
  const { fid, cid } = req.vaultData;
  // Use fid and cid to process request
}
```

**Registration**:
Optionally registered in vault routes:

```javascript
router.get("/vault/:fid/:cid", handleVaultScheme, vaultController.getVaultFile);
```

## Middleware Flow

```
Request → Helmet → CORS → Body Parser → Multer →
Validation → Controller → Service → Error Handler → Response
```

## Error Handling Chain

```
Route Error → Controller Error → Service Error →
Error Handler → Formatted Response
```

## Custom Error Format

All middleware errors follow this structure:

```json
{
  "success": false,
  "message": "Human-readable message",
  "error": "Technical error details"
}
```

## Security Considerations

1. **Error Information**

   - Development: Full stack traces
   - Production: Sanitized errors only

2. **Header Validation**

   - Validates vault:// URL format
   - Prevents injection attacks

3. **File Upload Security**
   - Size limits enforced
   - File type validation
   - Prevents malicious uploads

## Testing

### Test Error Handler

```javascript
// Create a test error
app.get("/test-error", (req, res, next) => {
  const error = new Error("Test error");
  error.status = 400;
  next(error);
});
```

### Test Vault Scheme

```bash
curl -H "X-Vault-Scheme: vault://fid/cid" \
  http://localhost:3001/api/vault/fid/cid
```

## Best Practices

1. **Error Handling**

   - Always use consistent error format
   - Include helpful error messages
   - Log errors for debugging

2. **Middleware Order**

   - Error handler must be last
   - Security middleware first
   - Parsing middleware before routes

3. **Error Responses**
   - Use appropriate HTTP status codes
   - Provide actionable error messages
   - Hide sensitive information in production

## Integration with Express App

Register in `app.js`:

```javascript
const errorHandler = require("./app/middleware/errorHandler");
const handleVaultScheme = require("./app/middleware/vaultSchemeHandler");

// Apply middleware
app.use(handleVaultScheme); // Applied to specific routes
app.use(errorHandler); // Applied globally (last)
```

## Common Error Codes

| Code                    | Description             | HTTP Status |
| ----------------------- | ----------------------- | ----------- |
| `LIMIT_FILE_SIZE`       | File too large          | 400         |
| `LIMIT_UNEXPECTED_FILE` | Invalid file field      | 400         |
| `ValidationError`       | Input validation failed | 400         |
| `ENOENT`                | File not found          | 404         |
| `ECONNREFUSED`          | Service unavailable     | 503         |
| Default                 | Internal server error   | 500         |

## Middleware Composition

The middleware directory supports:

- **Error handling**: Centralized error processing
- **Request enhancement**: Add data to request object
- **Validation**: Pre-controller validation
- **Security**: Header validation
- **Custom processing**: vault:// URL scheme

## Development Guidelines

1. **Keep It Simple**: Middleware should do one thing well
2. **Error Handling**: Always pass errors to next()
3. **Request Enhancement**: Add data to req object
4. **Async Support**: Use async/await in middleware
5. **Testing**: Test middleware independently
