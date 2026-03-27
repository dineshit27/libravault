"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reservations_1 = require("../controllers/reservations");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateUser);
router.get('/mine', reservations_1.getMyReservations);
router.post('/', reservations_1.createReservation);
router.delete('/:id', reservations_1.cancelReservation);
router.get('/', auth_1.requireAdmin, reservations_1.getReservations);
router.put('/:id/fulfill', auth_1.requireAdmin, reservations_1.fulfillReservation);
router.put('/:id/expire', auth_1.requireAdmin, reservations_1.expireReservation);
exports.default = router;
