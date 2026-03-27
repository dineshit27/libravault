import express from 'express';
import {
  createReview,
  deleteReview,
  getMyReviews,
  updateReview,
} from '../controllers/reviews';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

router.use(authenticateUser);

router.get('/me', getMyReviews);
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

export default router;
