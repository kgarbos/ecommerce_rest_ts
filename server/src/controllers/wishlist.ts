import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { User } from '../models/user';
import { Product } from '../models/product';
import { CustomRequest } from '../interfaces';
import ErrorResponse from '../utils/errorResponse';
import { ObjectId } from 'bson';

export const createWishlist = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const user = await User.findById(req.user._id);

    if (user.wishlist.some((wishlist) => wishlist.name === name)) {
      return res.status(400).json({ success: false, message: 'Wishlist with this name already exists' });
    }

    user.wishlist.push({ name, products: [] });
    await user.save();

    res.status(201).json({ success: true, message: 'Wishlist created', wishlist: { name, products: [] } });
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};

exports.addToWishlist = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.productId;
    const wishlistName = decodeURIComponent(req.params.wishlistName);

    const product = await Product.findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const user = await User.findById(req.user._id);
    const wishlist = user.wishlist.find((wl) => wl.name === wishlistName);

    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    if (wishlist.products.some((item) => item.productId.toString() === productId)) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    wishlist.products.push({ productId, product });
    await user.save();

    res.status(200).json({ success: true, message: 'Product added to wishlist' });
  } catch (error) {
    next(error);
  }
};



export const removeFromWishlist = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const productId = new ObjectId(req.params.productId);
    const wishlistName = decodeURIComponent(req.params.wishlistName); // Decode the wishlist name from URL
    const user = await User.findById(req.user._id);

    // Find the wishlist with the given name
    const wishlist = user.wishlist.find((wl) => wl.name === wishlistName);

    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter((item) => item.product._id.toString() !== productId.toString());

    await user.save();

    res.status(200).json({ success: true, message: 'Product removed from wishlist' });
  } catch (error) {
    next(error);
  }
};


export const clearWishlist = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const wishlistName = decodeURIComponent(req.params.wishlistName); // Decode the wishlist name from URL
    const user = await User.findById(req.user._id);

    // Find the wishlist with the given name
    const wishlistIndex = user.wishlist.findIndex((wl) => wl.name === wishlistName);

    if (wishlistIndex === -1) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    user.wishlist[wishlistIndex].products = [];

    await user.save();

    res.status(200).json({ success: true, message: 'Wishlist cleared' });
  } catch (error) {
    next(error);
  }
};

export const updateWishlistName = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const oldWishlistName = req.params.wishlistName;
    const newWishlistName = req.body.name;

    if (!newWishlistName) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const user = await User.findById(req.user._id);

    const wishlistIndex = user.wishlist.findIndex((wishlist) => wishlist.name === oldWishlistName);

    if (wishlistIndex === -1) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    user.wishlist[wishlistIndex].name = newWishlistName;
    await user.save();

    res.status(200).json({ success: true, message: 'Wishlist name updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteWishlist = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const wishlistName = req.params.wishlistName;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const wishlistIndex = user.wishlist.findIndex((wishlist) => wishlist.name === wishlistName);

    if (wishlistIndex === -1) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    user.wishlist.splice(wishlistIndex, 1);
    await user.save();

    res.status(200).json({ success: true, message: 'Wishlist deleted' });
  } catch (error) {
    next(error);
  }
};
