"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fines_1 = require("../controllers/fines");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateUser);
router.get('/mine', fines_1.getMyFines);
router.put('/:id/pay', fines_1.payFine);
router.get('/', auth_1.requireAdmin, fines_1.getAllFines);
router.put('/:id/waive', auth_1.requireAdmin, fines_1.waiveFine);
exports.default = router;
