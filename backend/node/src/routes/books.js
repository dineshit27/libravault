"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const books_1 = require("../controllers/books");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/', books_1.getBooks);
router.get('/:id/reviews', books_1.getBookReviews);
router.get('/:id', books_1.getBookById);
// Admin only routes
router.post('/', auth_1.authenticateUser, auth_1.requireAdmin, books_1.createBook);
router.put('/:id', auth_1.authenticateUser, auth_1.requireAdmin, books_1.updateBook);
exports.default = router;
