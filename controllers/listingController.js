const { ObjectId } = require('mongodb');
let listingsCollection;

const setListingsCollection = (collection) => {
  listingsCollection = collection;
};

// Get all listings
const getAllListings = async (req, res) => {
  try {
    const listings = await listingsCollection.find().sort({ createdAt: -1 }).toArray();
    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get recent 6 listings
const getRecentListings = async (req, res) => {
  try {
    const listings = await listingsCollection.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();
    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get listings by category
const getListingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const listings = await listingsCollection.find({ category })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's listings
const getUserListings = async (req, res) => {
  try {
    const { email } = req.params;
    const listings = await listingsCollection.find({ email })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single listing
const getListingById = async (req, res) => {
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
};

// Search listings
const searchListings = async (req, res) => {
  try {
    const { query } = req.params;
    const listings = await listingsCollection.find({
      name: { $regex: query, $options: 'i' }
    }).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create listing
const createListing = async (req, res) => {
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

// Update listing
const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid listing ID' });
    }
    
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

// Delete listing
const deleteListing = async (req, res) => {
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
};

module.exports = {
  setListingsCollection,
  getAllListings,
  getRecentListings,
  getListingsByCategory,
  getUserListings,
  getListingById,
  searchListings,
  createListing,
  updateListing,
  deleteListing
};