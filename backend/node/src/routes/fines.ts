import express from 'express';
import {
  getAllFines,
  getMyFines,
  payFine,
  waiveFine,
} from '../controllers/fines';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(authenticateUser);

router.get('/mine', getMyFines);
router.put('/:id/pay', payFine);

router.get('/', requireAdmin, getAllFines);
router.put('/:id/waive', requireAdmin, waiveFine);

export default router;
