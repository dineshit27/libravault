"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_1 = require("../controllers/admin");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateUser);
router.use(auth_1.requireAdmin);
router.get('/dashboard-stats', admin_1.getDashboardStats);
router.get('/settings', admin_1.getSettings);
router.put('/settings', admin_1.updateSettings);
router.get('/reports/:type', admin_1.exportReport);
exports.default = router;
