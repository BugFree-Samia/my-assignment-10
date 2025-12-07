const { ObjectId } = require('mongodb');
const { getListingsCollection } = require('../config/database');

// GET all listings
exports.getAllListings = async (req, res) => {
  try {
    const listingsCollection = getListingsCollection();
    const listings = await listingsCollection.find().sort({ createdAt: -1 }).toArray();
    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET recent 6 listings
exports.getRecentListings = async (req, res) => {
  try {
    const listingsCollection = getListingsCollection();
    const listings = await listingsCollection.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();
    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET listings by category
exports.getListingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const listingsCollection = getListingsCollection();
    const listings = await listingsCollection.find({ category })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET user's listings
exports.getUserListings = async (req, res) => {
  try {
    const { email } = req.params;
    const listingsCollection = getListingsCollection();
    const listings = await listingsCollection.find({ email })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search listings
exports.searchListings = async (req, res) => {
  try {
    const { query } = req.params;
    const listingsCollection = getListingsCollection();
    const listings = await listingsCollection.find({
      name: { $regex: query, $options: 'i' }
    }).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single listing
exports.getSingleListing = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid listing ID' });
    }
    
    const listingsCollection = getListingsCollection();
    const listing = await listingsCollection.findOne({ _id: new ObjectId(id) });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    
    res.json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST create listing
exports.createListing = async (req, res) => {
  try {
    const { name, category, price, location, description, image, email, date } = req.body;

    // Validation
    if (!name) return res.status(400).json({ success: false, message: 'Product/Pet name is required' });
    if (!category || !['Pets', 'Food', 'Accessories', 'Care Products'].includes(category)) {
      return res.status(400).json({ success: false, message: 'Valid category is required' });
    }
    if (price === undefined || price < 0) {
      return res.status(400).json({ success: false, message: 'Valid price is required' });
    }
    if (category === 'Pets' && price !== 0) {
      return res.status(400).json({ success: false, message: 'Pets must be free for adoption (price: 0)' });
    }
    if (!location) return res.status(400).json({ success: false, message: 'Location is required' });
    if (!description) return res.status(400).json({ success: false, message: 'Description is required' });
    if (!image) return res.status(400).json({ success: false, message: 'Image URL is required' });
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    if (!date) return res.status(400).json({ success: false, message: 'Pickup date is required' });

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

    const listingsCollection = getListingsCollection();
    const result = await listingsCollection.insertOne(listing);
    res.status(201).json({ 
      success: true, 
      data: { _id: result.insertedId, ...listing },
      message: 'Listing created successfully' 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT update listing
exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid listing ID' });
    }
    
    const listingsCollection = getListingsCollection();
    const result = await listingsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    
    res.json({ success: true, message: 'Listing updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE listing
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid listing ID' });
    }
    
    const listingsCollection = getListingsCollection();
    const result = await listingsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    
    res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};