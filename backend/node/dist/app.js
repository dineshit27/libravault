"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const books_1 = __importDefault(require("./routes/books"));
const users_1 = __importDefault(require("./routes/users"));
const borrowals_1 = __importDefault(require("./routes/borrowals"));
const auth_1 = __importDefault(require("./routes/auth"));
const reservations_1 = __importDefault(require("./routes/reservations"));
const fines_1 = __importDefault(require("./routes/fines"));
const announcements_1 = __importDefault(require("./routes/announcements"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const admin_1 = __importDefault(require("./routes/admin"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Basic health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'lms-node-backend' });
});
// API Routes
app.use('/api/node/books', books_1.default);
app.use('/api/node/users', users_1.default);
app.use('/api/node/members', users_1.default); // Alias
app.use('/api/node/borrowals', borrowals_1.default);
app.use('/api/node/auth', auth_1.default);
app.use('/api/node/reservations', reservations_1.default);
app.use('/api/node/fines', fines_1.default);
app.use('/api/node/announcements', announcements_1.default);
app.use('/api/node/notifications', notifications_1.default);
app.use('/api/node/admin', admin_1.default);
app.use('/api/node/reviews', reviews_1.default);
app.get('/api/node/health', (_req, res) => {
    res.status(200).json({ ok: true });
});
// Return JSON for unknown API routes to avoid HTML/non-JSON parse failures on the client.
app.use('/api/node', (req, res) => {
    res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
});
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});
exports.default = app;
