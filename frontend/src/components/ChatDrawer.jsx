import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  X, 
  Send, 
  MessageSquare, 
  User, 
  ChevronLeft, 
  Clock, 
  Check, 
  CheckCheck,
  Building
} from 'lucide-react';
import { 
  closeChat, 
  fetchConversations, 
  fetchMessages, 
  sendChatMessage, 
  setActiveConversation,
  markConversationReadLocally,
  receiveSocketMessage,
  markMessagesReadLocally,
  setTypingState
} from '../store/slices/chatSlice';
import socketService from '../services/socket';
import api from '../services/api';

export default function ChatDrawer() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { 
    isOpen, 
    conversations, 
    activeConversation, 
    messages, 
    loading, 
    typingUser 
  } = useSelector((state) => state.chat);

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load conversations once when chat opens only if not already loaded
  useEffect(() => {
    if (isOpen && isAuthenticated && conversations.length === 0) {
      dispatch(fetchConversations());
    }
  }, [isOpen, isAuthenticated, conversations.length, dispatch]);

  // When active conversation changes, join socket room, mark read, and fetch history
  useEffect(() => {
    if (activeConversation?.id && user?.id) {
      socketService.joinConversation(activeConversation.id);
      dispatch(fetchMessages(activeConversation.id));
      socketService.emitMarkRead(activeConversation.id, user.id);
      dispatch(markConversationReadLocally(activeConversation.id));
      api.put(`/chat/conversations/${activeConversation.id}/read`).catch(() => {});

      return () => {
        socketService.leaveConversation(activeConversation.id);
      };
    }
  }, [activeConversation?.id, user?.id, dispatch]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation?.id) return;

    dispatch(sendChatMessage({
      conversationId: activeConversation.id,
      content: inputText.trim()
    }));

    // Clear typing state
    socketService.emitTyping(activeConversation.id, user.name, false);
    setInputText('');
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (activeConversation?.id) {
      socketService.emitTyping(activeConversation.id, user.name, true);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketService.emitTyping(activeConversation.id, user.name, false);
      }, 2000);
    }
  };

  return (
    <div 
      className="fixed inset-x-0 top-0 sm:top-[72px] bottom-[58px] sm:bottom-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex justify-end"
      onClick={() => dispatch(closeChat())}
    >
      <div 
        className="w-full sm:max-w-md bg-[#0D0D0D] sm:border-l border-neutral-800 h-full flex flex-col shadow-2xl transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-[#111111]">
          {activeConversation ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => dispatch(setActiveConversation(null))}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-sm font-bold text-white truncate max-w-[220px]">
                  {activeConversation.listing_title || 'Listing Chat'}
                </h3>
                <p className="text-[11px] text-amber-400 font-medium">
                  {user.id === activeConversation.renter_id ? activeConversation.owner_name : activeConversation.renter_name}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Real-time Rental Messages
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Live chat with owners & renters
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => dispatch(closeChat())}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        {activeConversation ? (
          /* Active Chat Thread */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Listing snippet bar */}
            <div className="px-4 py-2 bg-neutral-950/80 border-b border-neutral-850 flex items-center justify-between text-xs">
              <span className="text-neutral-400 truncate max-w-[200px]">
                {activeConversation.listing_title}
              </span>
              <span className="font-bold text-amber-400">
                {activeConversation.rental_price ? `${Number(activeConversation.rental_price).toLocaleString()} ETB` : ''}
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {loading ? (
                /* Shimmering Skeleton Loader while fetching messages */
                <div className="space-y-4 py-4 px-1 animate-pulse">
                  <div className="flex flex-col items-start gap-1.5">
                    <div className="w-56 h-12 rounded-2xl rounded-bl-none bg-neutral-800/70 border border-neutral-750" />
                    <div className="w-14 h-2.5 rounded bg-neutral-800/40 ml-1" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="w-64 h-14 rounded-2xl rounded-br-none bg-amber-500/20 border border-amber-500/20" />
                    <div className="w-16 h-2.5 rounded bg-neutral-800/40 mr-1" />
                  </div>
                  <div className="flex flex-col items-start gap-1.5">
                    <div className="w-44 h-10 rounded-2xl rounded-bl-none bg-neutral-800/70 border border-neutral-750" />
                    <div className="w-12 h-2.5 rounded bg-neutral-800/40 ml-1" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="w-48 h-11 rounded-2xl rounded-br-none bg-amber-500/20 border border-amber-500/20" />
                    <div className="w-14 h-2.5 rounded bg-neutral-800/40 mr-1" />
                  </div>
                </div>
              ) : (() => {
                const displayMessages = Array.from(new Map(messages.map((m) => [m.id, m])).values());
                if (displayMessages.length === 0) {
                  return (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
                      <MessageSquare className="w-10 h-10 text-neutral-700 mb-2" />
                      <p className="text-xs">No messages yet. Send a greeting to start negotiating!</p>
                    </div>
                  );
                }
                return displayMessages.map((msg) => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                          isMine
                            ? 'bg-amber-500 text-black font-medium rounded-br-none'
                            : 'bg-neutral-900 border border-neutral-800 text-white rounded-bl-none'
                        }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-1 px-1">
                        <span>
                          {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && (
                          <span className="inline-flex items-center" title={msg.is_read ? 'Seen' : 'Delivered'}>
                            {msg.is_read ? (
                              <span className="inline-flex items-center text-sky-400 font-bold tracking-tighter text-[11px]" title="Seen (✓✓)">
                                <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-neutral-500 text-[11px]" title="Sent (✓)">
                                <Check className="w-3.5 h-3.5 text-neutral-500" />
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
              {typingUser && (
                <div className="text-[11px] text-amber-400 italic">
                  {typingUser} is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#111111] border-t border-neutral-800 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold disabled:opacity-40 transition-colors shadow-gold-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Conversations List */
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {conversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
                <MessageSquare className="w-12 h-12 text-neutral-700 mb-3" />
                <h4 className="text-sm font-bold text-neutral-300">No Conversations Yet</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Browse rental listings and click "Start Live Chat" on any property or vehicle to message the owner directly.
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const partnerName = user?.id === conv.renter_id ? conv.owner_name : conv.renter_name;
                return (
                  <div
                    key={conv.id}
                    onClick={() => dispatch(setActiveConversation(conv))}
                    className="p-3.5 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 hover:border-amber-500/40 cursor-pointer transition-all flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-amber-400 text-sm shrink-0">
                      {partnerName ? partnerName.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-white truncate">
                          {partnerName || 'Rental Host'}
                        </h4>
                        <span className="text-[10px] text-neutral-500">
                          {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-amber-400/90 font-medium truncate">
                        {conv.listing_title}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                        {conv.last_message || 'Start conversation...'}
                      </p>
                    </div>

                    {conv.unread_count > 0 && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold text-[10px] flex items-center justify-center shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
