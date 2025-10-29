/**
 * Error handling middleware
 */
function errorHandler(error, req, res, next) {
  console.error("Unhandled error:", error);

  // Multer errors
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large",
      error: "File size exceeds maximum allowed size",
    });
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Unexpected file field",
      error: "Invalid file field name",
    });
  }

  // Validation errors
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: error.message,
    });
  }

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? error.stack
        : "Something went wrong",
  });
}

module.exports = errorHandler;

