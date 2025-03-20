// Vercel API route for adding a new signatory
const { MongoClient } = require('mongodb');

let cachedDb = null;

// Connect to MongoDB
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  // Use the MongoDB connection string from environment variables
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable in Vercel');
  }
  
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  await client.connect();
  
  const db = client.db(process.env.MONGODB_DB || 'pumpfoiling');
  
  cachedDb = db;
  return db;
}

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
      
      const db = await connectToDatabase();
      const collection = db.collection('signatories');
      
      // Check if this signatory already exists to avoid duplicates
      const existingSignatory = await collection.findOne({ name, location });
      
      if (existingSignatory) {
        return res.status(409).json({ error: 'This signatory already exists' });
      }
      
      // Add new signatory with timestamp
      const newSignatory = {
        name,
        location,
        date: new Date().toISOString()
      };
      
      await collection.insertOne(newSignatory);
      
      return res.status(201).json(newSignatory);
    } catch (error) {
      console.error('Error adding signatory:', error);
      return res.status(500).json({ error: 'Could not add signatory' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}; 