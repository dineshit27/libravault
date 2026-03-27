import express from 'express';
import { getUserBorrowals, getAllBorrowals, borrowBook, approveBorrowRequest, rejectBorrowRequest, returnBorrowedBook, renewBorrowal } from '../controllers/borrowals';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All borrowal routes require authentication
router.use(authenticateUser);

router.get('/me', getUserBorrowals);
router.post('/', borrowBook);
router.post('/request', borrowBook); // Alias for POST /
router.put('/:id/renew', renewBorrowal);
router.put('/:id/return', returnBorrowedBook);

// Admin routes - must come after other routes to avoid route conflicts
router.get('/', requireAdmin, getAllBorrowals);
router.put('/:id/approve', requireAdmin, approveBorrowRequest);
router.put('/:id/reject', requireAdmin, rejectBorrowRequest);

export default router;
