const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// GET all orders
router.get('/', orderController.getAllOrders);

// GET user's orders
router.get('/user/:email', orderController.getUserOrders);

// POST create order
router.post('/', orderController.createOrder);

module.exports = router;