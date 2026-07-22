const errorHandler = (err, req, res, next) => {
  console.error('API Error Stack:', err.stack || err);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const message = err.message || 'Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
