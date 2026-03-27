"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviews_1 = require("../controllers/reviews");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateUser);
router.get('/me', reviews_1.getMyReviews);
router.post('/', reviews_1.createReview);
router.put('/:id', reviews_1.updateReview);
router.delete('/:id', reviews_1.deleteReview);
exports.default = router;
