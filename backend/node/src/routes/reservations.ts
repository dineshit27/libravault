import express from 'express';
import {
  getReservations,
  getMyReservations,
  createReservation,
  cancelReservation,
  fulfillReservation,
  expireReservation,
} from '../controllers/reservations';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(authenticateUser);

router.get('/mine', getMyReservations);
router.post('/', createReservation);
router.delete('/:id', cancelReservation);

router.get('/', requireAdmin, getReservations);
router.put('/:id/fulfill', requireAdmin, fulfillReservation);
router.put('/:id/expire', requireAdmin, expireReservation);

export default router;
