import mongoose, { Schema, Document, Model } from "mongoose";
import { HabitFrequency } from "@/types";

export interface IHabitDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  frequency: HabitFrequency;
  targetDaysPerWeek: number;
  streak: number;
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema = new Schema<IHabitDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    frequency: { type: String, enum: ["daily", "weekly", "custom"], default: "daily" },
    targetDaysPerWeek: { type: Number, default: 7 },
    streak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

HabitSchema.index({ userId: 1 });

export const HabitModel: Model<IHabitDocument> =
  mongoose.models.Habit || mongoose.model<IHabitDocument>("Habit", HabitSchema);
