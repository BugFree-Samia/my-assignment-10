const express = require('express');
const router = express.Router();
const {
  getAllListings,
  getRecentListings,
  getListingsByCategory,
  getUserListings,
  getListingById,
  searchListings,
  createListing,
  updateListing,
  deleteListing
} = require('../controllers/listingController');

// Define routes
router.get('/', getAllListings);
router.get('/recent', getRecentListings);
router.get('/category/:category', getListingsByCategory);
router.get('/user/:email', getUserListings);
router.get('/search/:query', searchListings);
router.get('/:id', getListingById);
router.post('/', createListing);
router.put('/:id', updateListing);
router.delete('/:id', deleteListing);

module.exports = router;