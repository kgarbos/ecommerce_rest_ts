import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserDocument, User } from '../models/user';
import { CustomRequest } from '../interfaces';
import ErrorResponse from '../utils/errorResponse';

const protect = async (req: CustomRequest, res: Response, next: NextFunction) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'No user found with this ID' });
    }

    (req as any).user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

export { protect };
