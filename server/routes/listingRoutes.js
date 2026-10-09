import express from 'express';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  toggleSaveListing,
  getSavedListings
} from '../controllers/listingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getListings);
router.get('/my-listings', protect, getMyListings);
router.get('/saved', protect, getSavedListings);
router.get('/:id', getListingById);
router.post('/', protect, createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);
router.post('/:id/save', protect, toggleSaveListing);

export default router;
