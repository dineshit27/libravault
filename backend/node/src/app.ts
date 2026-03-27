import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import bookRoutes from './routes/books';
import userRoutes from './routes/users';
import borrowalRoutes from './routes/borrowals';
import authRoutes from './routes/auth';
import reservationRoutes from './routes/reservations';
import fineRoutes from './routes/fines';
import announcementRoutes from './routes/announcements';
import notificationRoutes from './routes/notifications';
import adminRoutes from './routes/admin';
import reviewRoutes from './routes/reviews';

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Basic health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'lms-node-backend' });
});

// API Routes
app.use('/api/node/books', bookRoutes);
app.use('/api/node/users', userRoutes);
app.use('/api/node/members', userRoutes); // Alias
app.use('/api/node/borrowals', borrowalRoutes);
app.use('/api/node/auth', authRoutes);
app.use('/api/node/reservations', reservationRoutes);
app.use('/api/node/fines', fineRoutes);
app.use('/api/node/announcements', announcementRoutes);
app.use('/api/node/notifications', notificationRoutes);
app.use('/api/node/admin', adminRoutes);
app.use('/api/node/reviews', reviewRoutes);

app.get('/api/node/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

// Return JSON for unknown API routes to avoid HTML/non-JSON parse failures on the client.
app.use('/api/node', (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
});

app.use((err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

export default app;
