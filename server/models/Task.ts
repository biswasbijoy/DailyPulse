import mongoose, { Schema, Document } from 'mongoose';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'weekdays';

export interface ITaskHistory {
  action: 'created' | 'updated' | 'completed' | 'postponed' | 'cancelled' | 'in_progress' | 'reverted';
  fromDate?: string;
  toDate?: string;
  timestamp: Date;
}

export interface IRecurrence {
  type: RecurrenceType;
  interval: number;
  endDate?: string;
  daysOfWeek?: number[];
}

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  taskDate: string;
  currentDate: string;
  dueDate?: string;
  completedAt?: Date;
  postponedCount: number;
  tags: string[];
  estimatedMinutes?: number;
  actualMinutes?: number;
  history: ITaskHistory[];
  isDeleted: boolean;
  recurrence: IRecurrence;
  parentRecurrenceId?: mongoose.Types.ObjectId;
  isRecurrenceInstance: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taskHistorySchema = new Schema<ITaskHistory>(
  {
    action: {
      type: String,
      enum: ['created', 'updated', 'completed', 'postponed', 'cancelled', 'in_progress', 'reverted'],
      required: true,
    },
    fromDate: { type: String },
    toDate: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const recurrenceSchema = new Schema<IRecurrence>(
  {
    type: { type: String, enum: ['none', 'daily', 'weekly', 'monthly', 'weekdays'], default: 'none' },
    interval: { type: Number, default: 1, min: 1 },
    endDate: { type: String },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }],
  },
  { _id: false }
);

const taskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'postponed', 'cancelled'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    category: { type: String, trim: true },
    taskDate: { type: String, required: true },
    currentDate: { type: String, required: true },
    dueDate: { type: String },
    completedAt: { type: Date },
    postponedCount: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
    estimatedMinutes: { type: Number },
    actualMinutes: { type: Number },
    history: [taskHistorySchema],
    isDeleted: { type: Boolean, default: false },
    recurrence: { type: recurrenceSchema, default: () => ({ type: 'none', interval: 1, daysOfWeek: [] }) },
    parentRecurrenceId: { type: Schema.Types.ObjectId, ref: 'Task' },
    isRecurrenceInstance: { type: Boolean, default: false },
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, currentDate: 1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, 'recurrence.type': 1 });
taskSchema.index({ userId: 1, parentRecurrenceId: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
