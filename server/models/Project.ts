import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  color?: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, default: '#6366f1' },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

projectSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Project = mongoose.model<IProject>('Project', projectSchema);
