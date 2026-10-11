import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './store/slices/authSlice';
import { fetchSavedListings } from './store/slices/listingSlice';
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

  const [viewHistory, setViewHistory] = useState(['home']);
  const currentView = viewHistory[viewHistory.length - 1] || 'home';

  const navigateTo = (view) => {
    setSelectedListing(null);
    setAuthModalConfig(null);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setViewHistory((prev) => {
      if (prev[prev.length - 1] === view) return prev;
      return [...prev, view];
    });
  };

  const goBack = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setViewHistory((prev) => {
      if (prev.length > 1) {
        return prev.slice(0, -1);
      }
      return ['home'];
    });
  };

  // Scroll to the very top whenever the active page/view changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 10);
    return () => clearTimeout(timer);
  }, [currentView]);

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

  // Global socket connection: initialized ONCE per session, only for normal users (not admin)
  useEffect(() => {
    if (isAuthenticated && user?.id && user?.role !== 'admin') {
      const socket = socketService.connect(user.id);
      socketService.joinUser(user.id);

      // Fetch conversations and saved listings ONCE upon initial login/page load
      dispatch(fetchConversations());
      dispatch(fetchSavedListings());

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
  }, [isAuthenticated, user?.id, user?.role, dispatch]);

  // Handle protected page redirection if logged out or if admin visits normal user routes
  useEffect(() => {
    if (!isAuthenticated && ['post', 'saved', 'my-listings', 'admin'].includes(currentView)) {
      setViewHistory(['home']);
    } else if (isAuthenticated && user?.role === 'admin' && ['post', 'saved', 'my-listings'].includes(currentView)) {
      setViewHistory(['admin']);
    }
  }, [isAuthenticated, user?.role, currentView]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f7] text-neutral-900 font-sans selection:bg-amber-500 selection:text-black relative">
      
      {/* Sticky Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          navigateTo(view);
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
            onListingSuccess={() => navigateTo('my-listings')}
            onGoBack={goBack}
            onGoHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'saved' && (
          <SavedPage
            onSelectListing={(listing) => setSelectedListing(listing)}
            onOpenAuth={(mode) => setAuthModalConfig({ mode })}
            onGoBack={goBack}
            onGoHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'my-listings' && (
          <MyListingsPage
            onNavigatePost={() => navigateTo('post')}
            onSelectListing={(listing) => setSelectedListing(listing)}
            onGoBack={goBack}
            onGoHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'admin' && user?.role === 'admin' && (
          <AdminDashboardPage
            onGoBack={goBack}
            onGoHome={() => navigateTo('home')}
            onSelectListing={(listing) => setSelectedListing(listing)}
          />
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <BottomNav
        currentView={currentView}
        setCurrentView={(view) => {
          navigateTo(view);
        }}
        onOpenAuth={(mode) => {
          setSelectedListing(null);
          setAuthModalConfig({ mode });
        }}
      />

      {/* Persistent Footer */}
      <Footer 
        onCategorySelect={() => navigateTo('home')}
      />

      {/* Modals & Slide-overs */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => {
            setSelectedListing(null);
          }}
          onOpenAuth={(mode) => setAuthModalConfig({ mode })}
        />
      )}

      {authModalConfig && (
        <AuthModal
          initialMode={authModalConfig.mode}
          onClose={() => {
            setAuthModalConfig(null);
          }}
        />
      )}

      {/* Real-time Socket.io Chat Slide-over Drawer (Only for normal users, not admin) */}
      {user?.role !== 'admin' && <ChatDrawer />}

    </div>
  );
}
