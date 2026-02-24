import { Schema, model } from "mongoose";

export interface User {
  email: string;
  passwordHash: string;
  status: "ACTIVE" | "DISABLED";
}

const userSchema = new Schema(
  {
    email: { 
      type: String,
       required: true,
        unique: true
       },
    passwordHash: {
       type: String,
       required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "DISABLED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true, // ✅ THIS IS THE KEY
  }
);

export const UserModel = model<User>("User", userSchema);