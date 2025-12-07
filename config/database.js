const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;
let listingsCollection;
let ordersCollection;

async function connectDB() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("Successfully connected to MongoDB!");
    
    // Get database instance
    db = client.db("Pawmart"); 
    
    // Initialize collections
    listingsCollection = db.collection("listings");
    ordersCollection = db.collection("orders");
    
    console.log("Database collections initialized");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit if database connection fails
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

module.exports = {
  connectDB,
  client,
  getListingsCollection: () => listingsCollection,
  getOrdersCollection: () => ordersCollection
};