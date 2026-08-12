import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProjectDocument extends Document {
  userId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Project", default: null, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

ProjectSchema.index({ userId: 1, parentId: 1 });

export const ProjectModel: Model<IProjectDocument> =
  mongoose.models.Project || mongoose.model<IProjectDocument>("Project", ProjectSchema);
