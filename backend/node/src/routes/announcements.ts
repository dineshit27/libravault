import express from 'express';
import {
  getAllAnnouncements,
  getActiveAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcements';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/active', getActiveAnnouncements);

router.use(authenticateUser);

router.get('/', getAllAnnouncements);
router.post('/', requireAdmin, createAnnouncement);
router.put('/:id', requireAdmin, updateAnnouncement);
router.delete('/:id', requireAdmin, deleteAnnouncement);

export default router;
