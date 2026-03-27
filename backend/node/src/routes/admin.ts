import express from 'express';
import {
  getDashboardStats,
  getSettings,
  updateSettings,
  exportReport,
} from '../controllers/admin';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(authenticateUser);
router.use(requireAdmin);

router.get('/dashboard-stats', getDashboardStats);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/reports/:type', exportReport);

export default router;
