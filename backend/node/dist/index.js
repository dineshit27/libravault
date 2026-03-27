"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
// Load environment variables
dotenv_1.default.config();
// Vercel serverless: export the Express app as the handler.
// Local/dev: start the HTTP server + Socket.IO.
exports.default = app_1.default;
const isVercel = Boolean(process.env.VERCEL);
if (!isVercel) {
    const httpServer = (0, http_1.createServer)(app_1.default);
    // Socket.IO configuration
    const io = new socket_io_1.Server(httpServer, {
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
    app_1.default.set('io', io);
    const PORT = process.env.PORT || 4000;
    httpServer.listen(PORT, () => {
        console.log(`🚀 Node.js Backend Server running on port ${PORT}`);
    });
}
