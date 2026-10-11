import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchConversations = createAsyncThunk('chat/fetchConversations', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/chat/conversations');
    return res.data.conversations;
  } catch (err) {
    return rejectWithValue(err.userMessage || err.response?.data?.message || 'Failed to load conversations');
  }
});

export const startConversation = createAsyncThunk('chat/startConversation', async (listingId, { rejectWithValue }) => {
  try {
    const res = await api.post('/chat/conversations', { listing_id: listingId });
    return res.data.conversation;
  } catch (err) {
    return rejectWithValue(err.userMessage || err.response?.data?.message || 'Failed to start chat');
  }
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (conversationId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/chat/conversations/${conversationId}/messages`);
    return { conversationId, messages: res.data.messages };
  } catch (err) {
    return rejectWithValue(err.userMessage || err.response?.data?.message || 'Failed to load messages');
  }
});

export const sendChatMessage = createAsyncThunk('chat/sendMessage', async ({ conversationId, content }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/chat/conversations/${conversationId}/messages`, { content });
    return res.data.message;
  } catch (err) {
    return rejectWithValue(err.userMessage || err.response?.data?.message || 'Failed to send message');
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    activeConversation: null,
    messages: [],
    isOpen: false,
    loading: false,
    typingUser: null
  },
  reducers: {
    openChat: (state, action) => {
      state.isOpen = true;
      if (action.payload) {
        state.activeConversation = action.payload;
        const conv = state.conversations.find(c => c.id === action.payload.id);
        if (conv) conv.unread_count = 0;
      }
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      if (action.payload) {
        const conv = state.conversations.find(c => c.id === action.payload.id);
        if (conv) conv.unread_count = 0;
        state.messages = [];
        state.loading = true;
      }
    },
    markConversationReadLocally: (state, action) => {
      const convId = action.payload;
      const conv = state.conversations.find(c => c.id === convId);
      if (conv) conv.unread_count = 0;
    },
    receiveSocketMessage: (state, action) => {
      const msg = action.payload.message || action.payload;
      const currentUserId = action.payload.currentUserId;

      const isViewingChat = state.isOpen && state.activeConversation?.id === msg.conversation_id;

      if (isViewingChat) {
        const alreadyExists = state.messages.some(m => m.id === msg.id);
        if (!alreadyExists) {
          state.messages.push(msg);
        }
      }

      // Update in conversation list
      const convIndex = state.conversations.findIndex(c => c.id === msg.conversation_id);
      if (convIndex !== -1) {
        const conv = state.conversations[convIndex];
        conv.last_message = msg.content;
        conv.last_message_at = msg.created_at;

        if (isViewingChat) {
          conv.unread_count = 0;
        } else if (!currentUserId || msg.sender_id !== currentUserId) {
          conv.unread_count = (parseInt(conv.unread_count, 10) || 0) + 1;
        }

        // Reorder: bring conversation to top
        state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conv);
      } else {
        // Prepend new conversation purely in-memory — zero network lag!
        state.conversations.unshift({
          id: msg.conversation_id,
          listing_title: msg.listing_title || 'Rental Listing',
          renter_name: msg.sender_name || 'User',
          owner_name: msg.sender_name || 'User',
          renter_id: msg.sender_id,
          owner_id: currentUserId,
          last_message: msg.content,
          last_message_at: msg.created_at,
          unread_count: isViewingChat ? 0 : 1
        });
      }
    },
    markMessagesReadLocally: (state, action) => {
      const { conversationId, readerId, currentUserId } = action.payload;
      if (state.activeConversation && state.activeConversation.id === conversationId) {
        state.messages.forEach(m => {
          if (m.sender_id !== readerId) {
            m.is_read = true;
          }
        });
      }
      if (readerId === currentUserId) {
        const conv = state.conversations.find(c => c.id === conversationId);
        if (conv) conv.unread_count = 0;
      }
    },
    setTypingState: (state, action) => {
      const { userName, isTyping } = action.payload;
      state.typingUser = isTyping ? userName : null;
    }
  },
  extraReducers: (builder) => {
    // Conversations
    builder.addCase(fetchConversations.fulfilled, (state, action) => {
      state.conversations = action.payload;
    });

    // Start Conversation
    builder.addCase(startConversation.fulfilled, (state, action) => {
      state.activeConversation = action.payload;
      state.isOpen = true;
      const exists = state.conversations.some(c => c.id === action.payload.id);
      if (!exists) {
        state.conversations.unshift(action.payload);
      }
      const conv = state.conversations.find(c => c.id === action.payload.id);
      if (conv) conv.unread_count = 0;
    });

    // Messages
    builder.addCase(fetchMessages.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.messages = action.payload.messages;
      state.loading = false;
      const conv = state.conversations.find(c => c.id === action.payload.conversationId);
      if (conv) conv.unread_count = 0;
    });
    builder.addCase(fetchMessages.rejected, (state) => {
      state.loading = false;
    });

    // Send Message
    builder.addCase(sendChatMessage.fulfilled, (state, action) => {
      const alreadyExists = state.messages.some(m => m.id === action.payload.id);
      if (!alreadyExists) {
        state.messages.push(action.payload);
      }
      if (state.activeConversation) {
        state.activeConversation.last_message = action.payload.content;
      }
      const conv = state.conversations.find(c => c.id === action.payload.conversation_id);
      if (conv) {
        conv.last_message = action.payload.content;
        conv.last_message_at = action.payload.created_at;
      }
    });
  }
});

export const {
  openChat,
  closeChat,
  setActiveConversation,
  markConversationReadLocally,
  receiveSocketMessage,
  markMessagesReadLocally,
  setTypingState
} = chatSlice.actions;

export default chatSlice.reducer;
