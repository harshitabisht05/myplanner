const app = require('../server/src/app');

module.exports = async (req, res) => {
  try {
    return app(req, res);
  } catch (error) {
    console.error('Vercel Serverless Handler Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Serverless function execution failure',
      error: String(error)
    });
  }
};
