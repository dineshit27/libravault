import express from 'express';
import {
  deleteNotification,
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../controllers/notifications';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

router.use(authenticateUser);
router.get('/', getMyNotifications);
router.put('/read-all', markAllNotificationsRead);
router.put('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);

export default router;
