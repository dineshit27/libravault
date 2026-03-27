"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const announcements_1 = require("../controllers/announcements");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/active', announcements_1.getActiveAnnouncements);
router.use(auth_1.authenticateUser);
router.get('/', announcements_1.getAllAnnouncements);
router.post('/', auth_1.requireAdmin, announcements_1.createAnnouncement);
router.put('/:id', auth_1.requireAdmin, announcements_1.updateAnnouncement);
router.delete('/:id', auth_1.requireAdmin, announcements_1.deleteAnnouncement);
exports.default = router;
