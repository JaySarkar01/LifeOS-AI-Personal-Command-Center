import mongoose, { Schema, Document, Model } from "mongoose";
import { GoalStatus } from "@/types";

export interface IMilestoneSubDocument {
  id: string;
  title: string;
  completed: boolean;
  targetDate?: Date;
}

export interface IGoalDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  targetDate?: Date;
  status: GoalStatus;
  milestones: IMilestoneSubDocument[];
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestoneSubDocument>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  targetDate: { type: Date },
});

const GoalSchema = new Schema<IGoalDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    targetDate: { type: Date, index: true },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "achieved", "paused"],
      default: "in_progress",
      index: true,
    },
    milestones: [MilestoneSchema],
  },
  { timestamps: true }
);

GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ userId: 1, targetDate: 1 });

export const GoalModel: Model<IGoalDocument> =
  mongoose.models.Goal || mongoose.model<IGoalDocument>("Goal", GoalSchema);
