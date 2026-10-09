import express from 'express';
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  markConversationRead
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/conversations', protect, getOrCreateConversation);
router.get('/conversations', protect, getMyConversations);
router.get('/conversations/:id/messages', protect, getMessages);
router.post('/conversations/:id/messages', protect, sendMessage);
router.put('/conversations/:id/read', protect, markConversationRead);

export default router;
