import mongoose, { Schema, Document, Model } from "mongoose";
import { NoteType } from "@/types";

export interface INoteDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  type: NoteType;
  tags: string[];
  archived?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INoteDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    type: { type: String, enum: ["quick", "document", "journal", "code"], default: "quick" },
    tags: [{ type: String }],
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NoteSchema.index({ userId: 1, updatedAt: -1 });

export const NoteModel: Model<INoteDocument> =
  mongoose.models.Note || mongoose.model<INoteDocument>("Note", NoteSchema);
