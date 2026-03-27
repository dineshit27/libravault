import express from 'express';
import { getMyRole, registerAdmin } from '../controllers/auth';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

router.post('/admin-register', registerAdmin);
router.get('/me-role', authenticateUser, getMyRole);

export default router;
