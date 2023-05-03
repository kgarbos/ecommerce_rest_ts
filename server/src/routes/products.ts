import express from 'express';
const router = express.Router();

const {
  getProducts,
  getProductById
} = require('../controllers/products');

router.route("/").get(getProducts);
router.route("/:productId").get(getProductById);

module.exports = router;