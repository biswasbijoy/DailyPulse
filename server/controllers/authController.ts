import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import type { AuthRequest } from '../middleware/auth';

function generateToken(userId: string): string {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn as any });
}

function setTokenCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'strict' : 'lax',
    signed: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function clearTokenCookie(res: Response) {
  res.clearCookie('token', { path: '/' });
}

function sanitizeUser(user: any) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    timezone: user.timezone,
    settings: user.settings,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({ name, email, passwordHash });

  const token = generateToken(user._id.toString());
  setTokenCookie(res, token);

  return sendSuccess(res, {
    user: sanitizeUser(user),
  }, 'Registration successful', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user._id.toString());
  setTokenCookie(res, token);

  return sendSuccess(res, {
    user: sanitizeUser(user),
  }, 'Login successful');
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearTokenCookie(res);
  return sendSuccess(res, null, 'Logout successful');
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return sendSuccess(res, { user: sanitizeUser(user) });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) throw new AppError('User not found', 404);

  if (req.body.name) user.name = req.body.name;
  if (req.body.timezone) user.timezone = req.body.timezone;
  await user.save();

  return sendSuccess(res, { user: sanitizeUser(user) }, 'Profile updated');
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await bcrypt.compare(req.body.currentPassword, user.passwordHash);
  if (!isMatch) throw new AppError('Current password is incorrect', 401);

  user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
  await user.save();

  return sendSuccess(res, null, 'Password changed');
});

export const updateSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) throw new AppError('User not found', 404);

  if (!user.settings) user.settings = { theme: 'system' };
  if (req.body.theme) user.settings.theme = req.body.theme;
  await user.save();

  return sendSuccess(res, { settings: user.settings }, 'Settings updated');
});
