import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import topicRoutes from './routes/topics.routes.js';
import problemRoutes from './routes/problems.routes.js';
import progressRoutes from './routes/progress.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import profileRoutes from './routes/profile.routes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.disable('x-powered-by');
if (env.trustProxy) app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.frontendUrl.split(',').map((value) => value.trim()), credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(cookieParser());
if (env.nodeEnv !== 'test') app.use(morgan(env.logLevel));

app.get('/health', (_req, res) => res.status(200).json({ success: true, data: { status: 'ok', service: 'dsa-sheet-api', timestamp: new Date().toISOString() } }));
app.get(`${env.apiPrefix}/health`, (_req, res) => res.status(200).json({ success: true, data: { status: 'ok', service: 'dsa-sheet-api', timestamp: new Date().toISOString() } }));
app.use(`${env.apiPrefix}/auth`, authRoutes);
app.use(`${env.apiPrefix}/topics`, topicRoutes);
app.use(`${env.apiPrefix}/problems`, problemRoutes);
app.use(`${env.apiPrefix}/progress`, progressRoutes);
app.use(`${env.apiPrefix}/calendar`, calendarRoutes);
app.use(`${env.apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${env.apiPrefix}/profile`, profileRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
