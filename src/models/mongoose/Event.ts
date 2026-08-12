import mongoose, { Schema, Document, Model } from "mongoose";
import { EventType } from "@/types";

export interface IEventDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: EventType;
  location?: string;
  isAllDay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEventDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    type: {
      type: String,
      enum: ["focus_session", "meeting", "reminder", "personal"],
      default: "personal",
    },
    location: { type: String },
    isAllDay: { type: Boolean, default: false },
  },
  { timestamps: true }
);

EventSchema.index({ userId: 1, startTime: 1 });

export const EventModel: Model<IEventDocument> =
  mongoose.models.Event || mongoose.model<IEventDocument>("Event", EventSchema);
