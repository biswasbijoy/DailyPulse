import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import projectRoutes from './routes/projectRoutes';
import templateRoutes from './routes/templateRoutes';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: env.corsOrigin,
  credentials: true,
}));
app.use(cookieParser(env.cookieSecret));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/templates', templateRoutes);

app.use(errorHandler);

async function start() {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
