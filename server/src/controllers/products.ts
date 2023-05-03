import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/product';

exports.getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find();
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getProductById = async (req: Request, res: Response, next: NextFunction) => {
  const productId = req.params.productId;
  console.log('productId:', productId)

  try {
    const product = await Product.findOne({ _id: productId });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
