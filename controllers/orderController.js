const { ObjectId } = require('mongodb');
let ordersCollection;

const setOrdersCollection = (collection) => {
  ordersCollection = collection;
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await ordersCollection.find().sort({ createdAt: -1 }).toArray();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const { email } = req.params;
    const orders = await ordersCollection.find({ email })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create order
const createOrder = async (req, res) => {
  try {
    const { productId, productName, category, buyerName, email, quantity, price, address, phone, date, additionalNotes } = req.body;

    // Validation
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID is required' });
    if (!ObjectId.isValid(productId)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
    if (!productName) return res.status(400).json({ success: false, message: 'Product name is required' });
    if (!buyerName) return res.status(400).json({ success: false, message: 'Buyer name is required' });
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    if (!quantity || quantity < 1) return res.status(400).json({ success: false, message: 'Valid quantity is required' });
    if (category === 'Pets' && quantity !== 1) {
      return res.status(400).json({ success: false, message: 'Pet adoption quantity must be 1' });
    }
    if (price === undefined || price < 0) return res.status(400).json({ success: false, message: 'Valid price is required' });
    if (!address) return res.status(400).json({ success: false, message: 'Address is required' });
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' });
    if (!date) return res.status(400).json({ success: false, message: 'Pickup date is required' });

    const order = {
      productId: new ObjectId(productId),
      productName: productName.trim(),
      category,
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
};

module.exports = {
  setOrdersCollection,
  getAllOrders,
  getUserOrders,
  createOrder
};