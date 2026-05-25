import mongoose, { Schema, Document } from 'mongoose';
import { TaskPriority, RecurrenceType } from './Task';

export interface ITaskTemplate extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  category?: string;
  dueDateOffset?: number;
  tags: string[];
  estimatedMinutes?: number;
  recurrenceType: RecurrenceType;
  recurrenceInterval: number;
  createdAt: Date;
  updatedAt: Date;
}

const taskTemplateSchema = new Schema<ITaskTemplate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    category: { type: String, trim: true },
    dueDateOffset: { type: Number },
    tags: [{ type: String, trim: true }],
    estimatedMinutes: { type: Number },
    recurrenceType: { type: String, enum: ['none', 'daily', 'weekly', 'monthly', 'weekdays'], default: 'none' },
    recurrenceInterval: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
);

taskTemplateSchema.index({ userId: 1, name: 1 }, { unique: true });

export const TaskTemplate = mongoose.model<ITaskTemplate>('TaskTemplate', taskTemplateSchema);
