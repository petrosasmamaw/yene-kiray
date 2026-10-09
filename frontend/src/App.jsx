import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PostListingPage from './pages/PostListingPage';
import SavedPage from './pages/SavedPage';
import MyListingsPage from './pages/MyListingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ListingDetailModal from './components/ListingDetailModal';
import AuthModal from './components/AuthModal';
import ChatDrawer from './components/ChatDrawer';
import BottomNav from './components/BottomNav';

import socketService from './services/socket';
import { 
  fetchConversations, 
  receiveSocketMessage, 
  markMessagesReadLocally, 
  setTypingState 
} from './store/slices/chatSlice';
import api from './services/api';

export default function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { activeConversation, isOpen, conversations } = useSelector((state) => state.chat);

  const [currentView, setCurrentView] = useState('home'); // 'home', 'post', 'saved', 'my-listings', 'admin'
  const [selectedListing, setSelectedListing] = useState(null);
  const [authModalConfig, setAuthModalConfig] = useState(null); // { mode: 'login' | 'register' }

  // Load authenticated session on startup
  useEffect(() => {
    if (localStorage.getItem('yene_kiray_token')) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  // Use refs to track current active chat state without triggering socket listener re-mounts
  const activeConversationRef = useRef(activeConversation);
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Global socket connection: initialized ONCE per session, no infinite fetching loops
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const socket = socketService.connect(user.id);
      socketService.joinUser(user.id);

      // Fetch conversations ONCE upon initial login/page load
      dispatch(fetchConversations());

      const handleNewMessage = (msg) => {
        // If drawer is open and currently on this chat, mark read immediately
        if (isOpenRef.current && activeConversationRef.current?.id === msg.conversation_id && msg.sender_id !== user.id) {
          socketService.emitMarkRead(msg.conversation_id, user.id);
          api.put(`/chat/conversations/${msg.conversation_id}/read`).catch(() => {});
        }

        // Fast in-memory append & badge increment — no network refetching!
        dispatch(receiveSocketMessage({ message: msg, currentUserId: user.id }));
      };

      const handleMessagesRead = ({ conversationId, readerId }) => {
        // Fast in-memory status update (✓ -> ✓✓) — no network refetching!
        dispatch(markMessagesReadLocally({ conversationId, readerId, currentUserId: user.id }));
      };

      const handleUserTyping = ({ userName, isTyping }) => {
        dispatch(setTypingState({ userName, isTyping }));
      };

      socket.on('new_message', handleNewMessage);
      socket.on('messages_read', handleMessagesRead);
      socket.on('user_typing', handleUserTyping);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('messages_read', handleMessagesRead);
        socket.off('user_typing', handleUserTyping);
      };
    } else {
      socketService.disconnect();
    }
  }, [isAuthenticated, user?.id, dispatch]);

  // Handle protected page redirection if logged out
  useEffect(() => {
    if (!isAuthenticated && ['post', 'saved', 'my-listings', 'admin'].includes(currentView)) {
      setCurrentView('home');
    }
  }, [isAuthenticated, currentView]);

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[#f3f4f6] font-sans selection:bg-amber-500 selection:text-black relative">
      
      {/* Sticky Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          setSelectedListing(null);
          setAuthModalConfig(null);
          setCurrentView(view);
        }}
        onOpenAuth={(mode) => {
          setSelectedListing(null);
          setAuthModalConfig({ mode });
        }}
      />

      {/* Main View Router */}
      <main className="flex-1 relative z-10 pb-20 md:pb-0">
        {currentView === 'home' && (
          <HomePage
            onSelectListing={(listing) => setSelectedListing(listing)}
            onOpenAuth={(mode) => setAuthModalConfig({ mode })}
          />
        )}

        {currentView === 'post' && (
          <PostListingPage
            onListingSuccess={() => setCurrentView('my-listings')}
            onGoHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'saved' && (
          <SavedPage
            onSelectListing={(listing) => setSelectedListing(listing)}
            onOpenAuth={(mode) => setAuthModalConfig({ mode })}
            onGoHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'my-listings' && (
          <MyListingsPage
            onNavigatePost={() => setCurrentView('post')}
            onSelectListing={(listing) => setSelectedListing(listing)}
            onGoHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'admin' && user?.role === 'admin' && (
          <AdminDashboardPage
            onGoHome={() => setCurrentView('home')}
            onSelectListing={(listing) => setSelectedListing(listing)}
          />
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <BottomNav
        currentView={currentView}
        setCurrentView={(view) => {
          setSelectedListing(null);
          setAuthModalConfig(null);
          setCurrentView(view);
        }}
        onOpenAuth={(mode) => {
          setSelectedListing(null);
          setAuthModalConfig({ mode });
        }}
      />

      {/* Persistent Footer */}
      <Footer 
        onCategorySelect={() => setCurrentView('home')}
      />

      {/* Modals & Slide-overs */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => {
            setSelectedListing(null);
            setCurrentView('home');
          }}
          onOpenAuth={(mode) => setAuthModalConfig({ mode })}
        />
      )}

      {authModalConfig && (
        <AuthModal
          initialMode={authModalConfig.mode}
          onClose={() => {
            setAuthModalConfig(null);
            setCurrentView('home');
          }}
        />
      )}

      {/* Real-time Socket.io Chat Slide-over Drawer */}
      <ChatDrawer />

    </div>
  );
}
