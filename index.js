require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require('./config/database');
const listingRoutes = require('./routes/listings');
const orderRoutes = require('./routes/orders');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/listings', listingRoutes);
app.use('/api/orders', orderRoutes);

// Basic Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'PawMart Server is Running!',
    database: 'Connected to MongoDB Atlas',
    status: 'Active',
    api: {
      listings: {
        getAll: 'GET /api/listings',
        getRecent: 'GET /api/listings/recent',
        getByCategory: 'GET /api/listings/category/:category',
        getByUser: 'GET /api/listings/user/:email',
        search: 'GET /api/listings/search/:query',
        getSingle: 'GET /api/listings/:id',
        create: 'POST /api/listings',
        update: 'PUT /api/listings/:id',
        delete: 'DELETE /api/listings/:id'
      },
      orders: {
        getAll: 'GET /api/orders',
        getByUser: 'GET /api/orders/user/:email',
        create: 'POST /api/orders'
      }
    }
  });
});

app.get('/health', async (req, res) => {
  try {
    const { client } = require('./config/database');
    await client.db("admin").command({ ping: 1 });
    res.json({ status: 'OK', database: 'Connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'Error', database: 'Disconnected', timestamp: new Date().toISOString() });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});