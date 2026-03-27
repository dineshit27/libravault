import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';

// Load environment variables
dotenv.config();

// Vercel serverless: export the Express app as the handler.
// Local/dev: start the HTTP server + Socket.IO.
export default app;

const isVercel = Boolean(process.env.VERCEL);

if (!isVercel) {
  const httpServer = createServer(app);

  // Socket.IO configuration
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join user to their specific room based on auth token (to be implemented)
    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their personal room`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  // Make io instance available to routes
  app.set('io', io);

  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Node.js Backend Server running on port ${PORT}`);
  });
}
