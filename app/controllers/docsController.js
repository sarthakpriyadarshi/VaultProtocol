const path = require("path");

class DocsController {
  constructor() {
    this.apiEndpoints = this.getAPIEndpoints();
  }

  /**
   * Get comprehensive API documentation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDocumentation(req, res) {
    try {
      const html = this.generateDocumentationHTML();
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (error) {
      console.error("Error generating documentation:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate documentation",
        error: error.message,
      });
    }
  }

  /**
   * Get OpenAPI specification
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOpenAPISpec(req, res) {
    try {
      const openAPISpec = this.generateOpenAPISpec();
      res.json(openAPISpec);
    } catch (error) {
      console.error("Error generating OpenAPI spec:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate OpenAPI specification",
        error: error.message,
      });
    }
  }

  /**
   * Generate HTML documentation
   * @returns {string} HTML documentation
   */
  generateDocumentationHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VAULT Protocol API Documentation</title>
    <link rel="icon" type="image/svg+xml" href="/assets/images/vaultLogo.ico" />
    <link rel="alternate icon" type="image/svg+xml" href="/assets/images/vaultLogo.png" />
    <link rel="apple-touch-icon" href="/assets/images/vaultLogo.png" />
    <link rel="shortcut icon" href="/assets/images/vaultLogo.png" />
    <link rel="stylesheet" href="/css/tailwind.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Header -->
    <div class="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 flex items-center justify-center shadow-lg">
                    <img src="/assets/images/logo.svg" alt="VAULT Protocol" class="w-10 h-10" />
                </div>
                <h1 class="text-xl font-bold">
                    VAULT Protocol
                </h1>
            </div>
            <div class="text-sm font-medium text-slate-600">API v1.0.0</div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Hero Section -->
        <div class="mb-16">
            <h2 class="text-4xl md:text-5xl font-bold text-slate-900 mb-4">API Documentation</h2>
            <p class="text-lg text-slate-600 max-w-2xl">
                Blockchain-based Certificate Management System with Enterprise-Grade Encryption
            </p>
        </div>

        <!-- Features Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            <div class="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-3">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>
                <h3 class="font-semibold text-slate-900 mb-2">AES-256-GCM Encryption</h3>
                <p class="text-sm text-slate-600">Enterprise-grade encryption for all stored files</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-3">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                    </svg>
                </div>
                <h3 class="font-semibold text-slate-900 mb-2">IPFS Storage</h3>
                <p class="text-sm text-slate-600">Decentralized file storage with content addressing</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-3">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                </div>
                <h3 class="font-semibold text-slate-900 mb-2">Blockchain Verified</h3>
                <p class="text-sm text-slate-600">Immutable certificate records on Quorum blockchain</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-3">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                </div>
                <h3 class="font-semibold text-slate-900 mb-2">RESTful API</h3>
                <p class="text-sm text-slate-600">Simple and powerful HTTP endpoints</p>
            </div>
        </div>

        <!-- Endpoints -->
        <div class="bg-white border border-slate-200 rounded-xl p-8 shadow-lg">
            ${this.generateEndpointsHTML()}
        </div>

        <!-- Footer -->
        <div class="mt-16 pt-8 border-t border-slate-200 text-center text-slate-600">
            <p class="text-sm">Built with Express.js, IPFS, and Quorum Blockchain</p>
        </div>
    </div>

    <script>
      // Interactive functionality
      document.addEventListener('DOMContentLoaded', function() {
        // Toggle endpoint details
        document.querySelectorAll('.endpoint-header').forEach(header => {
          header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const chevron = this.querySelector('.chevron');
            
            if (content.style.display === 'none' || content.style.display === '') {
              content.style.display = 'block';
              chevron.classList.add('open');
            } else {
              content.style.display = 'none';
              chevron.classList.remove('open');
            }
          });
        });
        
        // Copy to clipboard functionality
        document.querySelectorAll('.copy-btn').forEach(btn => {
          btn.addEventListener('click', async function() {
            const code = this.parentElement.querySelector('code').textContent;
            try {
              await navigator.clipboard.writeText(code);
              this.innerHTML = '✓';
              setTimeout(() => {
                this.innerHTML = '📋';
              }, 2000);
            } catch (err) {
              console.error('Failed to copy: ', err);
            }
          });
        });
      });
    </script>
</body>
</html>
    `;
  }

  /**
   * Generate endpoints HTML
   * @returns {string} HTML for endpoints
   */
  generateEndpointsHTML() {
    return `
    <div class="space-y-8">
      ${this.apiEndpoints
        .map(
          (section) => `
          <div class="space-y-4">
            <!-- Section Title with Icon -->
            <div class="flex items-center gap-3 mb-6">
              <div class="h-8 w-1 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                  ${this.getSectionIcon(section.title)}
                </div>
                <h2 class="text-2xl font-bold text-slate-900">${
                  section.title
                }</h2>
              </div>
            </div>

            <!-- Endpoints Grid -->
            <div class="space-y-3">
              ${section.endpoints
                .map(
                  (endpoint) => `
                  <div class="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors">
                    <!-- Header -->
                    <button class="endpoint-header w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div class="flex items-center gap-4 flex-1 min-w-0">
                        <!-- Method Badge -->
                        <div class="method-badge ${endpoint.method.toLowerCase()}">
                          ${endpoint.method}
                        </div>

                        <!-- Path -->
                        <code class="font-mono text-sm text-slate-900 truncate">${
                          endpoint.path
                        }</code>
                      </div>

                      <!-- Chevron -->
                      <svg class="chevron w-5 h-5 text-slate-400 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>

                    <!-- Expanded Content -->
                    <div class="endpoint-content border-t border-slate-200 bg-slate-50 px-6 py-4 space-y-6" style="display: none;">
                      <!-- Description -->
                      <div>
                        <p class="text-slate-700 leading-relaxed">${
                          endpoint.description
                        }</p>
                      </div>

                      <!-- Parameters -->
                      ${
                        endpoint.parameters && endpoint.parameters.length > 0
                          ? `
                      <div>
                        <h4 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                          <span class="w-1 h-1 bg-blue-600 rounded-full"></span>
                          Parameters
                        </h4>
                        <div class="space-y-2">
                          ${endpoint.parameters
                            .map(
                              (param) => `
                            <div class="bg-white border border-slate-200 rounded-lg p-3 text-sm">
                              <div class="flex items-center gap-2 mb-1">
                                <code class="font-mono font-semibold text-blue-600">${
                                  param.name
                                }</code>
                                <span class="text-xs font-mono text-slate-500">${
                                  param.type
                                }</span>
                                ${
                                  param.required
                                    ? '<span class="text-xs font-semibold text-rose-600">required</span>'
                                    : ""
                                }
                              </div>
                              <p class="text-slate-600">${param.description}</p>
                            </div>
                          `
                            )
                            .join("")}
                        </div>
                      </div>
                      `
                          : ""
                      }

                      <!-- Responses -->
                      <div>
                        <h4 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                          <span class="w-1 h-1 bg-emerald-600 rounded-full"></span>
                          Responses
                        </h4>
                        <div class="space-y-2">
                          ${endpoint.responses
                            .map(
                              (response) => `
                            <div class="border rounded-lg p-3 text-sm ${
                              response.code >= 200 && response.code < 300
                                ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                                : "bg-rose-500/10 text-rose-700 border-rose-200"
                            }">
                              <div class="flex items-center gap-2">
                                <code class="font-mono font-semibold">${
                                  response.code
                                }</code>
                                <span>${response.description}</span>
                              </div>
                            </div>
                          `
                            )
                            .join("")}
                        </div>
                      </div>

                      <!-- cURL Example -->
                      <div>
                        <h4 class="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                          <span class="w-1 h-1 bg-indigo-600 rounded-full"></span>
                          Example
                        </h4>
                        <div class="code-container relative bg-slate-900 rounded-lg overflow-hidden">
                          <pre class="p-4 text-sm text-slate-300 font-mono overflow-x-auto">
                            <code>curl -X ${
                              endpoint.method
                            } http://localhost:3001${endpoint.path} \\
  -H "Content-Type: application/json"</code>
                          </pre>
                          <button class="copy-btn" title="Copy to clipboard">📋</button>
                        </div>
                      </div>
                    </div>
                  </div>
                `
                )
                .join("")}
            </div>
          </div>
        `
        )
        .join("")}
    </div>
    `;
  }

  /**
   * Get section icon based on title
   * @param {string} title - Section title
   * @returns {string} SVG icon HTML
   */
  getSectionIcon(title) {
    const icons = {
      "Health & Status": `<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>`,
      "Certificate Management": `<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>`,
      "Vault Protocol": `<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
      </svg>`,
    };

    return (
      icons[title] ||
      `<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg>`
    );
  }

  /**
   * Generate OpenAPI specification
   * @returns {Object} OpenAPI specification
   */
  generateOpenAPISpec() {
    return {
      openapi: "3.0.0",
      info: {
        title: "VAULT Protocol API",
        version: "1.0.0",
        description:
          "Blockchain-based Certificate Management System with Enterprise-Grade Encryption",
        contact: {
          name: "VAULT Protocol Team",
        },
      },
      servers: [
        {
          url: "http://localhost:3001",
          description: "Development server",
        },
      ],
      paths: this.generateOpenAPIPaths(),
      components: {
        schemas: this.generateOpenAPISchemas(),
      },
    };
  }

  /**
   * Generate OpenAPI paths
   * @returns {Object} OpenAPI paths
   */
  generateOpenAPIPaths() {
    const paths = {};

    this.apiEndpoints.forEach((section) => {
      section.endpoints.forEach((endpoint) => {
        const pathKey = endpoint.path.replace(/\{([^}]+)\}/g, "{$1}");
        if (!paths[pathKey]) {
          paths[pathKey] = {};
        }

        paths[pathKey][endpoint.method.toLowerCase()] = {
          summary: endpoint.description.split("\n")[0],
          description: endpoint.description,
          parameters: endpoint.parameters
            ? endpoint.parameters.map((param) => ({
                name: param.name,
                in: param.in || "path",
                required: param.required !== false,
                schema: { type: param.type },
                description: param.description,
              }))
            : [],
          responses: endpoint.responses.reduce((acc, response) => {
            acc[response.code] = {
              description: response.description,
              content: response.content
                ? {
                    [response.content.type]: {
                      schema: response.content.schema,
                    },
                  }
                : undefined,
            };
            return acc;
          }, {}),
        };
      });
    });

    return paths;
  }

  /**
   * Generate OpenAPI schemas
   * @returns {Object} OpenAPI schemas
   */
  generateOpenAPISchemas() {
    return {
      Certificate: {
        type: "object",
        properties: {
          fid: { type: "string", description: "File ID" },
          cid: { type: "string", description: "Content ID" },
          email: { type: "string", format: "email" },
          issueDate: { type: "integer" },
          lastModified: { type: "integer" },
          issuer: { type: "string" },
          isActive: { type: "boolean" },
        },
      },
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          error: { type: "string" },
        },
      },
    };
  }

  /**
   * Get API endpoints configuration
   * @returns {Array} API endpoints
   */
  getAPIEndpoints() {
    return [
      {
        title: "Health & Status",
        endpoints: [
          {
            method: "GET",
            path: "/api/health",
            description:
              "Check the health status of the VAULT Protocol system including IPFS and blockchain connections.",
            responses: [
              { code: 200, description: "System health status" },
              { code: 500, description: "System health check failed" },
            ],
          },
        ],
      },
      {
        title: "Certificate Management",
        endpoints: [
          {
            method: "POST",
            path: "/api/certificates/issue",
            description:
              "Upload a file and create a new certificate with AES-256-GCM encryption. The file is encrypted before being stored on IPFS, and certificate metadata is stored on the blockchain.",
            parameters: [
              {
                name: "file",
                type: "file",
                description:
                  "Certificate file to upload (PNG, JPEG, PDF, TXT, HTML, JSON)",
                required: true,
              },
              {
                name: "email",
                type: "string",
                description: "Email address associated with the certificate",
                required: true,
              },
              {
                name: "isPrivate",
                type: "boolean",
                description: "Whether the certificate should be private",
                required: false,
              },
            ],
            responses: [
              { code: 200, description: "Certificate issued successfully" },
              {
                code: 400,
                description: "Invalid file type or missing parameters",
              },
              { code: 500, description: "Failed to issue certificate" },
            ],
          },
          {
            method: "POST",
            path: "/api/certificates/verify",
            description:
              "Verify the authenticity of a certificate by checking the blockchain record and validating the associated email address.",
            parameters: [
              {
                name: "fid",
                type: "string",
                description: "File ID of the certificate to verify",
                required: true,
              },
              {
                name: "email",
                type: "string",
                description: "Email address to verify against",
                required: true,
              },
            ],
            responses: [
              { code: 200, description: "Certificate verification successful" },
              { code: 400, description: "Invalid parameters" },
              { code: 404, description: "Certificate not found" },
              { code: 500, description: "Verification failed" },
            ],
          },
          {
            method: "GET",
            path: "/api/certificates/{fid}",
            description:
              "Retrieve comprehensive certificate details by FID from the blockchain.",
            parameters: [
              {
                name: "fid",
                type: "string",
                description: "File ID of the certificate",
                required: true,
              },
            ],
            responses: [
              {
                code: 200,
                description: "Certificate details retrieved successfully",
              },
              { code: 404, description: "Certificate not found" },
              { code: 500, description: "Failed to retrieve certificate" },
            ],
          },
          {
            method: "GET",
            path: "/api/certificates/{fid}/download/{cid}",
            description:
              "Download the decrypted certificate file directly using FID and CID. The file is automatically decrypted from IPFS before being returned.",
            parameters: [
              {
                name: "fid",
                type: "string",
                description: "File ID of the certificate",
                required: true,
              },
              {
                name: "cid",
                type: "string",
                description: "Content ID of the file version",
                required: true,
              },
            ],
            responses: [
              {
                code: 200,
                description: "File downloaded successfully",
                content: { type: "application/octet-stream" },
              },
              { code: 400, description: "CID does not match certificate" },
              { code: 404, description: "Certificate not found or inactive" },
              { code: 500, description: "Failed to download certificate" },
            ],
          },
          {
            method: "PUT",
            path: "/api/certificates/{fid}",
            description:
              "Update an existing certificate with a new file. The new file is encrypted and stored on IPFS, and the blockchain record is updated with the new CID.",
            parameters: [
              {
                name: "fid",
                type: "string",
                description: "File ID of the certificate to update",
                required: true,
              },
              {
                name: "file",
                type: "file",
                description: "New certificate file",
                required: true,
              },
              {
                name: "email",
                type: "string",
                description: "Email address",
                required: true,
              },
            ],
            responses: [
              { code: 200, description: "Certificate updated successfully" },
              {
                code: 400,
                description: "Invalid file type or missing parameters",
              },
              { code: 404, description: "Certificate not found" },
              { code: 500, description: "Failed to update certificate" },
            ],
          },
          {
            method: "DELETE",
            path: "/api/certificates/{fid}",
            description:
              "Delete a certificate from both IPFS and blockchain, removing the encrypted file and marking the certificate as inactive.",
            parameters: [
              {
                name: "fid",
                type: "string",
                description: "File ID of the certificate to delete",
                required: true,
              },
            ],
            responses: [
              { code: 200, description: "Certificate deleted successfully" },
              { code: 404, description: "Certificate not found" },
              { code: 500, description: "Failed to delete certificate" },
            ],
          },
        ],
      },
      {
        title: "Vault Protocol",
        endpoints: [
          {
            method: "GET",
            path: "/api/vault/{fid}/{cid}",
            description:
              "Process vault:// URLs and return the decrypted file content. This endpoint handles the custom vault:// URL scheme and automatically decrypts files from IPFS.",
            parameters: [
              {
                name: "fid",
                type: "string",
                description: "File ID",
                required: true,
              },
              {
                name: "cid",
                type: "string",
                description: "Content ID",
                required: true,
              },
            ],
            responses: [
              {
                code: 200,
                description:
                  "File content retrieved and decrypted successfully",
                content: { type: "application/octet-stream" },
              },
              { code: 404, description: "File not found" },
              { code: 500, description: "Failed to retrieve file" },
            ],
          },
          {
            method: "GET",
            path: "/api/vault/info",
            description:
              "Get information about the VAULT Protocol implementation.",
            responses: [{ code: 200, description: "Protocol information" }],
          },
          {
            method: "GET",
            path: "/api/vault/browser-support",
            description:
              "Get browser compatibility information for the vault:// URL scheme.",
            responses: [
              { code: 200, description: "Browser support information" },
            ],
          },
        ],
      },
    ];
  }
}

module.exports = DocsController;
