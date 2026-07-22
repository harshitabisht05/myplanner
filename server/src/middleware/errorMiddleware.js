const errorHandler = (err, req, res, next) => {
  console.error('API Error Stack:', err.stack || err);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.statusCode || 500);
  const message = err.message || 'Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    errorDetails: err.name || 'Error',
    // Always include error detail message for easier debugging on Vercel
    details: err.message || String(err)
  });
};

module.exports = errorHandler;
