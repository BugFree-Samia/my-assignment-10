const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');

// GET all listings
router.get('/', listingController.getAllListings);

// GET recent 6 listings
router.get('/recent', listingController.getRecentListings);

// GET listings by category
router.get('/category/:category', listingController.getListingsByCategory);

// GET user's listings
router.get('/user/:email', listingController.getUserListings);

// Search listings
router.get('/search/:query', listingController.searchListings);

// GET single listing
router.get('/:id', listingController.getSingleListing);

// POST create listing
router.post('/', listingController.createListing);

// PUT update listing
router.put('/:id', listingController.updateListing);

// DELETE listing
router.delete('/:id', listingController.deleteListing);

module.exports = router;