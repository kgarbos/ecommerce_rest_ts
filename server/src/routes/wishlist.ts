import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth'; // Import the protect middleware

const {
  createWishlist,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
  updateWishlistName,
  deleteWishlist
} = require('../controllers/wishlist');

router.route('/').post(protect, createWishlist).get(protect, getWishlist);
router.route('/:wishlistName').patch(protect, updateWishlistName).delete(protect, deleteWishlist);
router.route('/:wishlistName/clear').post(protect, clearWishlist);
router.route('/:wishlistName/:productId').post(protect, addToWishlist).delete(protect, removeFromWishlist);

module.exports = router;