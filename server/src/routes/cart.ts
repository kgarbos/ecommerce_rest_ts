import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth';

const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cart');

router.route("/").get(protect, getCart);
router.route("/clear").post(protect, clearCart);
router.route("/:productId").post(protect, addToCart).patch(protect, updateCartItem).delete(protect, removeFromCart);

module.exports = router;