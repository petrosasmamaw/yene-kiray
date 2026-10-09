import pool from '../config/db.js';

// @desc    Get or create conversation for a listing
// @route   POST /api/chat/conversations
// @access  Private
export const getOrCreateConversation = async (req, res) => {
  try {
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ success: false, message: 'Listing ID is required' });
    }

    // Get listing to identify owner
    const listingRes = await pool.query('SELECT id, user_id, title FROM listings WHERE id = $1', [listing_id]);
    if (listingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const listing = listingRes.rows[0];
    const ownerId = listing.user_id;
    const renterId = req.user.id;

    if (ownerId === renterId) {
      return res.status(400).json({ success: false, message: 'You cannot initiate a chat on your own listing' });
    }

    // Check if conversation already exists
    let convRes = await pool.query(
      `SELECT c.*, 
        u_renter.name AS renter_name, u_renter.avatar_url AS renter_avatar,
        u_owner.name AS owner_name, u_owner.avatar_url AS owner_avatar,
        l.title AS listing_title, l.rental_price, l.price_period
       FROM conversations c
       JOIN users u_renter ON c.renter_id = u_renter.id
       JOIN users u_owner ON c.owner_id = u_owner.id
       JOIN listings l ON c.listing_id = l.id
       WHERE c.listing_id = $1 AND c.renter_id = $2 AND c.owner_id = $3`,
      [listing_id, renterId, ownerId]
    );

    if (convRes.rows.length === 0) {
      const insertRes = await pool.query(
        `INSERT INTO conversations (listing_id, renter_id, owner_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [listing_id, renterId, ownerId]
      );

      convRes = await pool.query(
        `SELECT c.*, 
          u_renter.name AS renter_name, u_renter.avatar_url AS renter_avatar,
          u_owner.name AS owner_name, u_owner.avatar_url AS owner_avatar,
          l.title AS listing_title, l.rental_price, l.price_period
         FROM conversations c
         JOIN users u_renter ON c.renter_id = u_renter.id
         JOIN users u_owner ON c.owner_id = u_owner.id
         JOIN listings l ON c.listing_id = l.id
         WHERE c.id = $1`,
        [insertRes.rows[0].id]
      );
    }

    return res.json({ success: true, conversation: convRes.rows[0] });
  } catch (error) {
    console.error('getOrCreateConversation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's conversations
// @route   GET /api/chat/conversations
// @access  Private
export const getMyConversations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*,
        u_renter.name AS renter_name, u_renter.avatar_url AS renter_avatar,
        u_owner.name AS owner_name, u_owner.avatar_url AS owner_avatar,
        l.title AS listing_title, l.rental_price, l.price_period,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != $1 AND m.is_read = false) AS unread_count
       FROM conversations c
       JOIN users u_renter ON c.renter_id = u_renter.id
       JOIN users u_owner ON c.owner_id = u_owner.id
       JOIN listings l ON c.listing_id = l.id
       WHERE c.renter_id = $1 OR c.owner_id = $1
       ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC`,
      [req.user.id]
    );

    return res.json({ success: true, conversations: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;

    // Check user is participant
    const convRes = await pool.query(
      'SELECT id, renter_id, owner_id FROM conversations WHERE id = $1',
      [id]
    );

    if (convRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const conv = convRes.rows[0];
    if (conv.renter_id !== req.user.id && conv.owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this chat' });
    }

    // Mark messages as read
    await pool.query(
      'UPDATE messages SET is_read = true WHERE conversation_id = $1 AND sender_id != $2',
      [id, req.user.id]
    );

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`conversation_${id}`).emit('messages_read', { conversationId: id, readerId: req.user.id });
      if (conv.renter_id && conv.owner_id) {
        io.to(`user_${conv.renter_id}`).emit('messages_read', { conversationId: id, readerId: req.user.id });
        io.to(`user_${conv.owner_id}`).emit('messages_read', { conversationId: id, readerId: req.user.id });
      }
    }

    const messagesRes = await pool.query(
      `SELECT m.*, u.name AS sender_name, u.avatar_url AS sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [id]
    );

    return res.json({ success: true, messages: messagesRes.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all messages in conversation as read
// @route   PUT /api/chat/conversations/:id/read
// @access  Private
export const markConversationRead = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE messages SET is_read = true WHERE conversation_id = $1 AND sender_id != $2',
      [id, req.user.id]
    );

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`conversation_${id}`).emit('messages_read', { conversationId: id, readerId: req.user.id });
      const convRes = await pool.query('SELECT renter_id, owner_id FROM conversations WHERE id = $1', [id]);
      if (convRes.rows.length > 0) {
        const { renter_id, owner_id } = convRes.rows[0];
        io.to(`user_${renter_id}`).emit('messages_read', { conversationId: id, readerId: req.user.id });
        io.to(`user_${owner_id}`).emit('messages_read', { conversationId: id, readerId: req.user.id });
      }
    }

    return res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message via HTTP endpoint (also triggers Socket broadcast)
// @route   POST /api/chat/conversations/:id/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    // Check participation
    const convRes = await pool.query(
      'SELECT id, renter_id, owner_id FROM conversations WHERE id = $1',
      [id]
    );

    if (convRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const conv = convRes.rows[0];
    if (conv.renter_id !== req.user.id && conv.owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to send message in this chat' });
    }

    // Insert message
    const msgRes = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, req.user.id, content.trim()]
    );

    // Update conversation last message timestamp & snippet
    await pool.query(
      'UPDATE conversations SET last_message = $1, last_message_at = CURRENT_TIMESTAMP WHERE id = $2',
      [content.trim().substring(0, 100), id]
    );

    const fullMsg = {
      ...msgRes.rows[0],
      sender_name: req.user.name,
      sender_avatar: req.user.avatar_url
    };

    // Emit socket event if io is attached
    if (req.app.get('io')) {
      const io = req.app.get('io');
      // Emit to active conversation room
      io.to(`conversation_${id}`).emit('new_message', fullMsg);

      // Emit to recipient's private user room so badge & notification work across ANY page
      const recipientId = conv.renter_id === req.user.id ? conv.owner_id : conv.renter_id;
      if (recipientId) {
        io.to(`user_${recipientId}`).emit('new_message', fullMsg);
      }
    }

    return res.status(201).json({ success: true, message: fullMsg });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
