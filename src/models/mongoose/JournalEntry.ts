import mongoose, { Schema, Document, Model } from "mongoose";
import { JournalMood } from "@/types";

export interface IJournalEntryDocument extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD format for unique per-day entries
  mood: JournalMood;
  content: string;
  highlights: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const JournalEntrySchema = new Schema<IJournalEntryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    mood: {
      type: String,
      enum: ["great", "good", "neutral", "low", "bad"],
      default: "neutral",
    },
    content: { type: String, default: "" },
    highlights: [{ type: String }],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Ensure one entry per user per day
JournalEntrySchema.index({ userId: 1, date: -1 }, { unique: true });

export const JournalEntryModel: Model<IJournalEntryDocument> =
  mongoose.models.JournalEntry ||
  mongoose.model<IJournalEntryDocument>("JournalEntry", JournalEntrySchema);
