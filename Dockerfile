# Use Node.js LTS version
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install required system dependencies
RUN apk add --no-cache git python3 make g++ bash

# Copy package files
COPY package*.json ./

# Install production dependencies only (excludes devDependencies)
RUN npm ci --only=production

# Install minimal required packages from devDependencies:
# - Tailwind CSS plugins needed for build:css (runs in npm start)
# - Hardhat packages needed for npm run deploy (only on first startup)
RUN npm install --no-save \
    postcss-cli@^11.0.1 \
    tailwindcss@^4.1.16 \
    @tailwindcss/postcss@^4.1.16 \
    hardhat@^2.19.0 \
    ethers@^6.15.0 \
    @nomicfoundation/hardhat-ethers@^3.1.0 \
    @nomicfoundation/hardhat-toolbox@^4.0.0

# Copy application files
COPY . .

# Expose port 3001
EXPOSE 3001

# Set environment variable for port
ENV PORT=3001

# Run deployment on first startup, then start the application
# The logic checks for .deployed flag file and runs deploy only if it doesn't exist
# Also ensures FILE_ENCRYPTION_KEY is set: if missing, load from .env or generate
# Exits with error if deployment fails - container will stop
# Using JSON array form for proper signal handling (SIGTERM, SIGINT, etc.)
CMD ["sh", "-c", "\
  if [ -z \"$FILE_ENCRYPTION_KEY\" ]; then \
    if [ -f .env ] && grep -q '^FILE_ENCRYPTION_KEY=' .env; then \
      export FILE_ENCRYPTION_KEY=\"$(grep '^FILE_ENCRYPTION_KEY=' .env | tail -n1 | cut -d'=' -f2-)\"; \
      echo 'Using FILE_ENCRYPTION_KEY from .env'; \
    else \
      echo 'FILE_ENCRYPTION_KEY not found. Generating a new random key...'; \
      KEY=$(node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"); \
      export FILE_ENCRYPTION_KEY=\"$KEY\"; \
      echo \"FILE_ENCRYPTION_KEY=$KEY\" >> .env; \
      echo 'New FILE_ENCRYPTION_KEY saved to .env'; \
    fi; \
  fi; \
  if [ ! -f /app/.deployed ]; then \
    echo '═══════════════════════════════════════════════════════════' && \
    echo 'First run detected. Running npm run deploy...' && \
    echo '═══════════════════════════════════════════════════════════' && \
    if ! npm run deploy; then \
      echo '❌ Deployment failed! Container will exit.'; \
      exit 1; \
    fi && \
    touch /app/.deployed && \
    echo '✅ Deployment completed successfully. Flag file created.' && \
    echo '═══════════════════════════════════════════════════════════'; \
  else \
    echo 'Deployment flag found. Skipping npm run deploy...'; \
  fi && \
  npm start"]
