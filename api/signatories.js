// Vercel API route for fetching all signatories
const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method === 'GET') {
    try {
      // Get all signatories from Vercel KV
      const signatories = await kv.get('signatories') || [];
      
      // Sort by date (newest first)
      signatories.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return res.status(200).json(signatories);
    } catch (error) {
      console.error('Error fetching signatories:', error);
      return res.status(500).json({ error: 'Could not fetch signatories' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}; 