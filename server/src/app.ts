import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import type { ApiResponse } from './types/index.js';

// Route imports
import { authRoutes } from './routes/authRoutes.js';
import { profileRoutes } from './routes/profileRoutes.js';
import { attendanceRoutes } from './routes/attendanceRoutes.js';
import { leaveRoutes } from './routes/leaveRoutes.js';
import { payrollRoutes } from './routes/payrollRoutes.js';
import { dashboardRoutes } from './routes/dashboardRoutes.js';
import { notificationRoutes } from './routes/notificationRoutes.js';
import { reportRoutes } from './routes/reportRoutes.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(config.uploadDir)));

// Health check
app.get('/api/health', (_req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'Dayflow API is running',
    data: {
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Error handler (must be last)
app.use(errorHandler);

export { app };
