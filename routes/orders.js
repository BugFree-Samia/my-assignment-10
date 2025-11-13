const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getUserOrders,
  createOrder
} = require('../controllers/orderController');

// Define routes
router.get('/', getAllOrders);
router.get('/user/:email', getUserOrders);
router.post('/', createOrder);

module.exports=router;