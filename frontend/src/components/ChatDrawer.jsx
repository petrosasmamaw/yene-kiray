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
import { useLanguage } from '../context/LanguageContext';

export default function ChatDrawer() {
  const dispatch = useDispatch();
  const { t } = useLanguage();
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
      className="fixed inset-x-0 top-0 sm:top-[72px] bottom-[58px] sm:bottom-0 z-50 overflow-hidden bg-neutral-900/60 backdrop-blur-sm flex justify-end"
      onClick={() => dispatch(closeChat())}
    >
      <div 
        className="w-full sm:max-w-md bg-white sm:border-l border-neutral-200 h-full flex flex-col shadow-2xl transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
          {activeConversation ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => dispatch(setActiveConversation(null))}
                className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-sm font-bold text-neutral-950 truncate max-w-[220px]">
                  {activeConversation.listing_title || 'Listing Chat'}
                </h3>
                <p className="text-[11px] text-amber-600 font-semibold">
                  {user.id === activeConversation.renter_id ? activeConversation.owner_name : activeConversation.renter_name}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-950 font-sans">
                  {t('chatTitle')}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  {t('chatSubtitle')}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => dispatch(closeChat())}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        {activeConversation ? (
          /* Active Chat Thread */
          <div className="flex-1 flex flex-col overflow-hidden bg-neutral-50/50">
            {/* Listing snippet bar */}
            <div className="px-4 py-2 bg-amber-50/70 border-b border-amber-200/80 flex items-center justify-between text-xs">
              <span className="text-neutral-700 font-medium truncate max-w-[200px]">
                {activeConversation.listing_title}
              </span>
              <span className="font-bold text-amber-700">
                {activeConversation.rental_price ? `${Number(activeConversation.rental_price).toLocaleString()} ETB` : ''}
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {loading ? (
                /* Shimmering Skeleton Loader while fetching messages */
                <div className="space-y-4 py-4 px-1 animate-pulse">
                  <div className="flex flex-col items-start gap-1.5">
                    <div className="w-56 h-12 rounded-2xl rounded-bl-none bg-neutral-200 border border-neutral-300" />
                    <div className="w-14 h-2.5 rounded bg-neutral-200 ml-1" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="w-64 h-14 rounded-2xl rounded-br-none bg-amber-100 border border-amber-300" />
                    <div className="w-16 h-2.5 rounded bg-neutral-200 mr-1" />
                  </div>
                  <div className="flex flex-col items-start gap-1.5">
                    <div className="w-44 h-10 rounded-2xl rounded-bl-none bg-neutral-200 border border-neutral-300" />
                    <div className="w-12 h-2.5 rounded bg-neutral-200 ml-1" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="w-48 h-11 rounded-2xl rounded-br-none bg-amber-100 border border-amber-300" />
                    <div className="w-14 h-2.5 rounded bg-neutral-200 mr-1" />
                  </div>
                </div>
              ) : (() => {
                const displayMessages = Array.from(new Map(messages.map((m) => [m.id, m])).values());
                if (displayMessages.length === 0) {
                  return (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                      <MessageSquare className="w-10 h-10 text-neutral-300 mb-2" />
                      <p className="text-xs">{t('chatNoMessages')}</p>
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
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isMine
                            ? 'bg-amber-500 text-neutral-950 font-medium rounded-br-none'
                            : 'bg-white border border-neutral-200 text-neutral-900 rounded-bl-none shadow-2xs'
                        }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-1 px-1">
                        <span>
                          {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && (
                          <span className="inline-flex items-center" title={msg.is_read ? 'Seen' : 'Delivered'}>
                            {msg.is_read ? (
                              <span className="inline-flex items-center text-sky-600 font-bold tracking-tighter text-[11px]" title="Seen (✓✓)">
                                <CheckCheck className="w-3.5 h-3.5 text-sky-600" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-neutral-400 text-[11px]" title="Sent (✓)">
                                <Check className="w-3.5 h-3.5 text-neutral-400" />
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
                <div className="text-[11px] text-amber-600 font-semibold italic">
                  {typingUser} is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder={t('chatInputPlaceholder')}
                className="flex-1 bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold disabled:opacity-40 transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Conversations List */
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-neutral-50/40">
            {conversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                <MessageSquare className="w-12 h-12 text-neutral-300 mb-3" />
                <h4 className="text-sm font-bold text-neutral-700">{t('chatNoConversations')}</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  {t('chatNoConversationsDesc')}
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const partnerName = user?.id === conv.renter_id ? conv.owner_name : conv.renter_name;
                return (
                  <div
                    key={conv.id}
                    onClick={() => dispatch(setActiveConversation(conv))}
                    className="p-3.5 rounded-2xl bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-amber-500/50 cursor-pointer transition-all flex items-center gap-3 shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-amber-700 text-sm shrink-0">
                      {partnerName ? partnerName.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-neutral-950 truncate">
                          {partnerName || t('chatRentalHost')}
                        </h4>
                        <span className="text-[10px] text-neutral-500">
                          {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-amber-700 font-semibold truncate">
                        {conv.listing_title}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                        {conv.last_message || 'Start conversation...'}
                      </p>
                    </div>

                    {conv.unread_count > 0 && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 font-bold text-[10px] flex items-center justify-center shrink-0">
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
