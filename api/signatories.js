// Vercel API route for fetching all signatories
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
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method === 'GET') {
    try {
      const db = await connectToDatabase();
      const collection = db.collection('signatories');
      
      // Get all signatories, sort by date (newest first)
      const signatories = await collection.find({})
        .sort({ date: -1 })
        .limit(100) // Limit to 100 most recent signatories
        .toArray();
      
      return res.status(200).json(signatories);
    } catch (error) {
      console.error('Error fetching signatories:', error);
      return res.status(500).json({ error: 'Could not fetch signatories' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}; 