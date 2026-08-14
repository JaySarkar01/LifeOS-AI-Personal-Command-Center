import mongoose, { Schema, Document, Model } from "mongoose";
import { HabitFrequency } from "@/types";

export interface IHabitDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  frequency: HabitFrequency;
  targetDaysPerWeek: number;
  color?: string;
  archived?: boolean;
  streak: number;
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema = new Schema<IHabitDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    frequency: { type: String, enum: ["daily", "weekly", "custom"], default: "daily" },
    targetDaysPerWeek: { type: Number, default: 7 },
    color: { type: String, default: "#0284c7" },
    archived: { type: Boolean, default: false },
    streak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const HabitModel: Model<IHabitDocument> =
  mongoose.models.Habit || mongoose.model<IHabitDocument>("Habit", HabitSchema);
