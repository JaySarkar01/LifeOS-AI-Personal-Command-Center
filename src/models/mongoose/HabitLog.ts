import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHabitLogDocument extends Document {
  userId: mongoose.Types.ObjectId;
  habitId: mongoose.Types.ObjectId;
  date: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HabitLogSchema = new Schema<IHabitLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    habitId: { type: Schema.Types.ObjectId, ref: "Habit", required: true, index: true },
    date: { type: Date, required: true },
    completed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

HabitLogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

export const HabitLogModel: Model<IHabitLogDocument> =
  mongoose.models.HabitLog || mongoose.model<IHabitLogDocument>("HabitLog", HabitLogSchema);
