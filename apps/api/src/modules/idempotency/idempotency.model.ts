import mongoose, { Schema, Document } from "mongoose";

export interface IdempotencyDocument extends Document {
  opId: string;
  userId: string;
  workspaceId: string;
  createdAt: Date;
}

const schema = new Schema<IdempotencyDocument>(
  {
    opId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    workspaceId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


schema.index({ opId: 1 }, { unique: true });

export const IdempotencyModel =
  mongoose.models.Idempotency ||
  mongoose.model<IdempotencyDocument>("Idempotency", schema);