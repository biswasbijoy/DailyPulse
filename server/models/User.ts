import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSettings {
  theme: 'light' | 'dark' | 'system';
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  timezone: string;
  profilePicture?: string;
  settings: IUserSettings;
  createdAt: Date;
  updatedAt: Date;
}

const userSettingsSchema = new Schema<IUserSettings>(
  {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    timezone: { type: String, default: 'UTC' },
    profilePicture: { type: String },
    settings: { type: userSettingsSchema, default: () => ({ theme: 'system' }) },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
