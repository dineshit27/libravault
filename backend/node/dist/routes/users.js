"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_1 = require("../controllers/users");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Protected user routes
router.use(auth_1.authenticateUser);
router.get('/profile', users_1.getProfile);
router.put('/profile', users_1.updateProfile);
// Admin only routes
router.get('/', auth_1.requireAdmin, users_1.getAllUsers);
router.get('/:id', auth_1.requireAdmin, users_1.getUserById);
router.put('/:id/role', auth_1.requireAdmin, users_1.updateUserRole);
router.put('/:id/toggle-active', auth_1.requireAdmin, users_1.toggleUserActive);
exports.default = router;
