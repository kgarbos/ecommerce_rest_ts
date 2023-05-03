import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { User, UserDocument } from '../models/user';
import { Product } from '../models/product';
import crypto from 'crypto';
import { sendConfirmationEmail, sendCancellationEmail, sendResetPasswordEmail, sendPasswordChangeEmail } from '../utils/email';
import { CustomRequest } from '../interfaces';
import ErrorResponse from '../utils/errorResponse';

exports.register = async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;

  try {
    // Check if user with email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).send({ success: false, message: 'User with this email or username already exists.' });
    }

    const user = await User.create({
      username,
      email,
      password,
      isEmailConfirmed: false
    });

    const emailConfirmationToken = user.generateEmailConfirmationToken();
    await user.save();

    const confirmationUrl = `${req.protocol}://${req.get('host')}/api/user/confirm-email/${encodeURIComponent(emailConfirmationToken)}`;
    await sendConfirmationEmail(user.email, confirmationUrl);

    res.status(201).send({ success: true, message: 'User registered. Please check your email for confirmation link.' });

  } catch (e) {
    res.status(400).send(e);
  }
};

exports.confirmEmail = async (req: Request, res: Response) => {
  const confirmationToken = decodeURIComponent(req.params.token);

  try {
    const user = await User.findOne({
      emailConfirmationToken: confirmationToken,
      emailConfirmationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired confirmation token' });
    }

    user.isEmailConfirmed = true;
    user.emailConfirmationToken = undefined;
    user.emailConfirmationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email confirmed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if the user's email is confirmed
    if (!user.isEmailConfirmed) {
      return res.status(401).json({ success: false, message: 'Please confirm your email before logging in' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = await user.generateAuthToken();
    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.logout = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  const token = req.token;

  try {
    user.tokens = user.tokens.filter((tokenObj: { token: string }) => {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      return tokenObj.token !== hashedToken;
    });
    await user.save();
    res.clearCookie('token');

    res.status(200).json({ success: true, message: 'Logged out successfully' });
    // res.redirect('/');
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Forgot Password
exports.forgotpassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/api/user/resetpassword/${resetToken}`;

    try {
      await sendResetPasswordEmail(user.email, resetUrl);

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpires = undefined;
      await user.save();

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (error) {
    next(error);
  }
};

// Reset Password
exports.resetpassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resetPasswordToken = req.params.token;

    const hashedResetPasswordToken = crypto
      .createHash('sha256')
      .update(resetPasswordToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedResetPasswordToken,
      resetPasswordTokenExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Set the new password (assuming req.body.password contains the new password)
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;

    // Save the updated user
    await user.save();

    // Send password change email
    const email = user.email;
    sendPasswordChangeEmail(email);

    // Delete the token to log the user out
    res.clearCookie('token');

    // res.redirect('/');

    // Send a response
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteProfile = async (req: CustomRequest, res: Response) => {
  try {
    const user = req.user;
    await user.remove();
    const email = user.email;
    const username = user.username;
    await sendCancellationEmail(email, username);
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const { email, username } = req.body;
    const updates: { email?: string; username?: string } = { email, username };

    // Remove any undefined values from the updates object
    Object.keys(updates).forEach(key => updates[key as keyof typeof updates] === undefined && delete updates[key as keyof typeof updates]);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'At least one field is required for update' });
    }

    const user = (await User.findById(userId)) as UserDocument;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the email has been updated
    const emailUpdated = email && email !== user.email;

    // Update the user's fields
    for (const key in updates) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        (user as any)[key] = updates[key as keyof typeof updates];
      }
    }

    await user.save();

    // If the email was updated, send a confirmation email
    if (emailUpdated) {
      user.isEmailConfirmed = false;
      const emailConfirmationToken = user.generateEmailConfirmationToken();
      await user.save();

      const confirmationUrl = `${req.protocol}://${req.get('host')}/api/user/confirm-email/${encodeURIComponent(emailConfirmationToken)}`;
      await sendConfirmationEmail(user.email, confirmationUrl);
    }

    res.status(200).json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user._id).select('-tokens');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};