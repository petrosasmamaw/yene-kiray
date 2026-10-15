import express from 'express';
import { submitPaymentProof, getMyPayments } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/submit', protect, submitPaymentProof);
router.post('/proof', protect, submitPaymentProof);
router.get('/my-payments', protect, getMyPayments);

export default router;
