import { Schema , model , Types } from "mongoose" ;
export type WorkspaceStatus = "ACTIVE" | "ARCHIVED";

export interface Workspace  {
    _id: Types.ObjectId,
    name: string,
    slug:string,
    status:WorkspaceStatus,
    createdBy: Types.ObjectId,
    createdAt:Date,
    updatedAt:Date,

}

const workspaceSchema = new Schema<Workspace>(

   {
    name:{
        type:String,
        required:true,
        trim:true,
    },
    slug:{
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
     status: {
      type: String,
      enum: ["ACTIVE", "ARCHIVED"],
      default: "ACTIVE",
      required: true,
    },

   createdBy: {
  type: Types.ObjectId,
  required: true,
  ref: "User",
}
   },
     {
    timestamps: true,
    versionKey: false,
  }
);


// 🔒 Explicit unique index (do NOT rely on implicit)
workspaceSchema.index({ slug: 1 }, { unique: true });


export const WorkspaceModel = model<Workspace>(
  "Workspace",
  workspaceSchema
);
