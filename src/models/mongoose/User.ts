import mongoose, { Schema, Document, Model } from "mongoose";
import { UserPreferences } from "@/types";

export interface IUserDocument extends Document {
  email: string;
  name?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    preferences: {
      theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
      accentColor: { type: String, default: "#0284c7" },
      notificationsEnabled: { type: Boolean, default: true },
      dailyFocusTargetMinutes: { type: Number, default: 240 },
    },
  },
  { timestamps: true }
);

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
