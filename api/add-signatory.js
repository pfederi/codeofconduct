// Vercel API route for adding a new signatory
const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method === 'POST') {
    try {
      const { name, location } = req.body;
      
      // Basic validation
      if (!name || !location) {
        return res.status(400).json({ error: 'Name and location are required' });
      }
      
      // Get current signatories
      let signatories = await kv.get('signatories') || [];
      
      // Check if this signatory already exists to avoid duplicates
      const existingSignatory = signatories.find(s => 
        s.name === name && s.location === location
      );
      
      if (existingSignatory) {
        return res.status(409).json({ error: 'This signatory already exists' });
      }
      
      // Add new signatory with timestamp
      const newSignatory = {
        id: Date.now().toString(), // Simple unique ID
        name,
        location,
        date: new Date().toISOString()
      };
      
      // Add to array and save back to KV
      signatories.push(newSignatory);
      await kv.set('signatories', signatories);
      
      return res.status(201).json(newSignatory);
    } catch (error) {
      console.error('Error adding signatory:', error);
      return res.status(500).json({ error: 'Could not add signatory' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}; 