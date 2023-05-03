import { Document, model, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { CartItem } from "../interfaces";
import { ProductDocument } from "./product";

interface IUser {
  email: string;
  password: string;
  username: string;
  wishlist?: {
    name: string;
    products: {
      productId: string;
      product: ProductDocument;
    }[];
  }[];
  isEmailConfirmed: boolean;
  emailConfirmationToken: string;
  emailConfirmationTokenExpires: Date;
  resetPasswordToken: string;
  resetPasswordTokenExpires: Date;
  tokens: {
    token: string;
  }[];
  cart: {
    productId: string;
    product: ProductDocument;
    quantity: number;
  }[];
}

interface MatchPassword {
  matchPassword(password: string): Promise<boolean>;
}

interface GenerateAuthToken {
  generateAuthToken(): string;
}

interface GetResetPasswordToken {
  getResetPasswordToken(): string;
}

interface GenerateEmailConfirmationToken {
  generateEmailConfirmationToken(): string;
}

type UserDocument = IUser &
  Document &
  MatchPassword &
  GenerateAuthToken &
  GetResetPasswordToken &
  GenerateEmailConfirmationToken;

const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
    select: false,
  },
  // mfaMethod: {
  //   type: String,
  //   required: true
  // },
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  isEmailConfirmed: {
    type: Boolean,
    required: true,
    default: false,
  },
  emailConfirmationToken: {
    type: String,
  },
  emailConfirmationTokenExpires: {
    type: Date,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordTokenExpires: {
    type: Date,
  },
  wishlist: [
    {
      name: {
        type: String,
        required: true,
      },
      products: [
        {
          productId: {
            type: String,
            required: true,
          },
          product: {
            type: Schema.Types.Mixed,
            required: true,
          },
        },
      ],
    },
  ],
  cart: [
    {
      productId: {
        type: String,
        required: true,
      },
      product: {
        type: Schema.Types.Mixed,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ]
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const expiresIn = process.env.JWT_EXPIRE; // Use the value from the environment variable
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn });
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  user.tokens = user.tokens.concat({ token: hashedToken });
  await user.save();
  return token;
};

userSchema.methods.generateEmailConfirmationToken = function () {
  const confirmationToken = crypto.randomBytes(20).toString("hex");

  this.emailConfirmationToken = crypto
    .createHash("sha256")
    .update(confirmationToken)
    .digest("hex");

  this.emailConfirmationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

  return this.emailConfirmationToken; // Return the hashed token
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordTokenExpires = Date.now() + 10 * (60 * 1000);

  return resetToken;
};

export const User = model<UserDocument>("User", userSchema);
export { UserDocument, IUser };