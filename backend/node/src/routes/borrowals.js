"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const borrowals_1 = require("../controllers/borrowals");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All borrowal routes require authentication
router.use(auth_1.authenticateUser);
router.get('/me', borrowals_1.getUserBorrowals);
router.post('/', borrowals_1.borrowBook);
router.post('/request', borrowals_1.borrowBook); // Alias for POST /
router.put('/:id/renew', borrowals_1.renewBorrowal);
router.put('/:id/return', borrowals_1.returnBorrowedBook);
// Admin routes - must come after other routes to avoid route conflicts
router.get('/', auth_1.requireAdmin, borrowals_1.getAllBorrowals);
router.put('/:id/approve', auth_1.requireAdmin, borrowals_1.approveBorrowRequest);
router.put('/:id/reject', auth_1.requireAdmin, borrowals_1.rejectBorrowRequest);
exports.default = router;
