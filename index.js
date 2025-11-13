require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri = process.env.MONGODB_URI;

// Create a MongoClient
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Database and Collections
let listingsCollection, ordersCollection;

async function run() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log("MongoDB Connected Successfully!");

        // Initialize collections
        const database = client.db("pawmart");
        listingsCollection = database.collection("listings");
        ordersCollection = database.collection("orders");

        console.log("PawMart Database Collections Ready!");

    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
}
run().catch(console.dir);

// LISTINGS API ROUTES

// GET all listings
app.get('/api/listings', async (req, res) => {
    try {
        const listings = await listingsCollection.find().sort({ createdAt: -1 }).toArray();
        res.json({ success: true, data: listings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET recent 6 listings
app.get('/api/listings/recent', async (req, res) => {
    try {
        const listings = await listingsCollection.find()
            .sort({ createdAt: -1 })
            .limit(6)
            .toArray();
        res.json({ success: true, data: listings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET listings by category
app.get('/api/listings/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const listings = await listingsCollection.find({ category })
            .sort({ createdAt: -1 })
            .toArray();
        res.json({ success: true, data: listings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single listing by ID
app.get('/api/listings/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid listing ID' });
        }

        const listing = await listingsCollection.findOne({ _id: new ObjectId(id) });

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        res.json({ success: true, data: listing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST create new listing
app.post('/api/listings', async (req, res) => {
    try {
        const { name, category, price, location, description, image, email, date } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json({ success: false, message: 'Product/Pet name is required' });
        }
        if (!category || !['Pets', 'Food', 'Accessories', 'Care Products'].includes(category)) {
            return res.status(400).json({ success: false, message: 'Valid category is required' });
        }
        if (price === undefined || price < 0) {
            return res.status(400).json({ success: false, message: 'Valid price is required' });
        }
        if (!location) {
            return res.status(400).json({ success: false, message: 'Location is required' });
        }
        if (!description) {
            return res.status(400).json({ success: false, message: 'Description is required' });
        }
        if (!image) {
            return res.status(400).json({ success: false, message: 'Image URL is required' });
        }
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        if (!date) {
            return res.status(400).json({ success: false, message: 'Pickup date is required' });
        }

        const listing = {
            name: name.trim(),
            category,
            price: Number(price),
            location: location.trim(),
            description,
            image,
            email,
            date: new Date(date),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await listingsCollection.insertOne(listing);

        res.status(201).json({
            success: true,
            data: { _id: result.insertedId, ...listing },
            message: 'Listing created successfully'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// PUT update listing
app.put('/api/listings/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid listing ID' });
        }

        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const result = await listingsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        res.json({ success: true, message: 'Listing updated successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// DELETE listing
app.delete('/api/listings/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid listing ID' });
        }

        const result = await listingsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        res.json({ success: true, message: 'Listing deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

//ORDERS API ROUTES

// GET all orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await ordersCollection.find().sort({ createdAt: -1 }).toArray();
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET orders by user email
app.get('/api/orders/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const orders = await ordersCollection.find({ email })
            .sort({ createdAt: -1 })
            .toArray();
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST create new order
app.post('/api/orders', async (req, res) => {
    try {
        const { productId, productName, buyerName, email, quantity, price, address, phone, date, additionalNotes } = req.body;

        // Validation
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }
        if (!ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }
        if (!productName) {
            return res.status(400).json({ success: false, message: 'Product name is required' });
        }
        if (!buyerName) {
            return res.status(400).json({ success: false, message: 'Buyer name is required' });
        }
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Valid quantity is required' });
        }
        if (price === undefined || price < 0) {
            return res.status(400).json({ success: false, message: 'Valid price is required' });
        }
        if (!address) {
            return res.status(400).json({ success: false, message: 'Address is required' });
        }
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }
        if (!date) {
            return res.status(400).json({ success: false, message: 'Pickup date is required' });
        }

        const order = {
            productId: new ObjectId(productId),
            productName: productName.trim(),
            buyerName: buyerName.trim(),
            email,
            quantity: Number(quantity),
            price: Number(price),
            address: address.trim(),
            phone,
            date: new Date(date),
            additionalNotes: additionalNotes || '',
            createdAt: new Date()
        };

        const result = await ordersCollection.insertOne(order);

        res.status(201).json({
            success: true,
            data: { _id: result.insertedId, ...order },
            message: 'Order placed successfully'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// BASIC ROUTES
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

// Health check
app.get('/health', async (req, res) => {
    try {
        await client.db("admin").command({ ping: 1 });
        res.json({
            status: 'OK',
            database: 'Connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'Error',
            database: 'Disconnected',
            timestamp: new Date().toISOString()
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});