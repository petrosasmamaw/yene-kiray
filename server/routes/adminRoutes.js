import express from 'express';
import {
  getFinancialDashboard,
  getAllPayments,
  updatePaymentStatus,
  getAllUsers,
  updateUserByAdmin,
  updateSettings,
  getPublicSettings
} from '../controllers/adminController.js';
import {
  getAllListingsAdmin,
  updateListingStatusAdmin,
  deleteListing
} from '../controllers/listingController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public setting check
router.get('/settings/public', getPublicSettings);

// Protected Admin-only endpoints
router.get('/financial-dashboard', protect, requireAdmin, getFinancialDashboard);
router.get('/payments', protect, requireAdmin, getAllPayments);
router.put('/payments/:id/status', protect, requireAdmin, updatePaymentStatus);
router.get('/users', protect, requireAdmin, getAllUsers);
router.put('/users/:id', protect, requireAdmin, updateUserByAdmin);
router.get('/listings', protect, requireAdmin, getAllListingsAdmin);
router.put('/listings/:id/status', protect, requireAdmin, updateListingStatusAdmin);
router.delete('/listings/:id', protect, requireAdmin, deleteListing);
router.put('/settings', protect, requireAdmin, updateSettings);

export default router;
