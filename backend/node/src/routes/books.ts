import express from 'express';
import { getBooks, getBookById, createBook, updateBook, getBookReviews } from '../controllers/books';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getBooks);
router.get('/:id/reviews', getBookReviews);
router.get('/:id', getBookById);

// Admin only routes
router.post('/', authenticateUser, requireAdmin, createBook);
router.put('/:id', authenticateUser, requireAdmin, updateBook);


export default router;
