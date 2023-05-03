import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { User } from '../models/user';
import { Product } from '../models/product';
import { CustomRequest } from '../interfaces';
import { CartItem } from '../interfaces';
import { ObjectId } from 'bson';

exports.getCart = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    res.status(200).json({ success: true, cart: user.cart });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.productId;
    const quantity = Number(req.body.quantity) || 1;

    const product = await Product.findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const user = await User.findById(req.user._id);

    const cartItemIndex = user.cart.findIndex((item) => item.productId.toString() === productId);

    if (cartItemIndex > -1) {
      user.cart[cartItemIndex].quantity += quantity;
    } else {
      user.cart.push({
        productId: product._id,
        product: product.toObject(),
        quantity: quantity,
      });
    }

    await user.save();

    res.status(200).json({ success: true, message: 'Product added to cart' });
  } catch (error) {
    next(error);
  }
};


exports.updateCartItem = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.productId;
    const quantity = Number(req.body.quantity) || 1;
    const user = await User.findById(req.user._id);

    const cartItemIndex = user.cart.findIndex((item) => item.product._id.toString() === productId);

    if (cartItemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in cart' });
    }

    if (quantity <= 0) {
      user.cart.splice(cartItemIndex, 1);
    } else {
      user.cart[cartItemIndex].quantity = quantity;
    }

    await user.save();

    res.status(200).json({ success: true, message: 'Cart item updated' });
  } catch (error) {
    next(error);
  }
};

exports.removeFromCart = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user._id);
    const cartItemIndex = user.cart.findIndex((item) => item.product._id.toString() === productId);

    if (cartItemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in cart' });
    }

    user.cart.splice(cartItemIndex, 1);
    await user.save();

    res.status(200).json({ success: true, message: 'Product removed from cart' });

  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.status(200).json({ success: true, message: 'Cart cleared' });

  } catch (error) {
    next(error);
  }
};