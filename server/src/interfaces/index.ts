import { Request } from 'express';
import { UserDocument } from '../models/user';
import { ProductDocument } from '../models/product';
import { Types } from 'mongoose';

export interface CustomRequest extends Request {
  user?: UserDocument;
  token?: string;
}

export interface CartItem {
  productId: Types.ObjectId;
  product: Types.ObjectId | ProductDocument;
  quantity: number;
}