// ============================================================
// ProjectHub Global Error & Exception Handling
// ============================================================

/**
 * Catch-all for routes that don't exist
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Central error handler — sends consistent JSON error responses
 */
const errorHandler = (err, _req, res, _next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    error: err.name || "SERVER_ERROR",
    message: err.message || "An unexpected error occurred",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
