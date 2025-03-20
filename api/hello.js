// Vercel API health check endpoint
module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Pumpfoilers Code of Conduct API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
}; 