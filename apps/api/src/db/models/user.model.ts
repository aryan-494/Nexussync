import { Schema, model, Types } from "mongoose";

export interface User {
  _id: Types.ObjectId; // ✅ important
  email: string;
  passwordHash: string;
  status: "ACTIVE" | "DISABLED";
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "DISABLED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<User>("User", userSchema);