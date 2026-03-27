import express from 'express';
import { getProfile, updateProfile, getAllUsers, getUserById, updateUserRole, toggleUserActive } from '../controllers/users';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Protected user routes
router.use(authenticateUser);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Admin only routes
router.get('/', requireAdmin, getAllUsers);
router.get('/:id', requireAdmin, getUserById);
router.put('/:id/role', requireAdmin, updateUserRole);
router.put('/:id/toggle-active', requireAdmin, toggleUserActive);

export default router;
