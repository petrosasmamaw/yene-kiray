import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Home, 
  Bookmark, 
  PlusCircle, 
  MessageSquare, 
  Layers, 
  ShieldCheck, 
  User,
  LogOut
} from 'lucide-react';
import { openChat, closeChat, setActiveConversation } from '../store/slices/chatSlice';
import { logout } from '../store/slices/authSlice';
import { useLanguage } from '../context/LanguageContext';

export default function BottomNav({ currentView, setCurrentView, onOpenAuth }) {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { savedItems } = useSelector((state) => state.listings);
  const { conversations, isOpen, activeConversation } = useSelector((state) => state.chat);

  const unreadMessagesCount = conversations.reduce(
    (acc, c) => acc + (parseInt(c.unread_count, 10) || 0), 
    0
  );

  const handleNavClick = (view) => {
    dispatch(closeChat());
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMessagesClick = () => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    if (isOpen && activeConversation) {
      // If inside an active thread, return to the messages list
      dispatch(setActiveConversation(null));
    } else if (isOpen) {
      // If already on the list, keep it open
    } else {
      dispatch(openChat());
    }
  };

  // Dedicated Admin Bottom Navigation (Omit all normal user features: Saved, Post, Chat, My Listings)
  if (isAuthenticated && user?.role === 'admin') {
    return (
      <div className="md:hidden fixed bottom-0 inset-x-0 z-[60] bg-white/98 backdrop-blur-2xl border-t border-neutral-200 px-4 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] h-[58px]">
        <div className="flex items-center justify-around max-w-md mx-auto h-full">
          {/* 1. Explore / Home */}
          <button
            onClick={() => handleNavClick('home')}
            className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all ${
              currentView === 'home'
                ? 'text-amber-600 font-bold'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Home className={`w-5 h-5 ${currentView === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">{t('navExplore')}</span>
          </button>

          {/* 2. Admin Dashboard */}
          <button
            onClick={() => handleNavClick('admin')}
            className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all ${
              currentView === 'admin'
                ? 'text-amber-600 font-bold'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <ShieldCheck className={`w-5 h-5 ${currentView === 'admin' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">{t('navAdmin')}</span>
          </button>

          {/* 3. Logout */}
          <button
            onClick={() => {
              dispatch(logout());
            }}
            className="flex flex-col items-center justify-center py-1 px-4 rounded-xl text-rose-600 hover:text-rose-700 transition-all"
          >
            <LogOut className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-0.5 tracking-tight">{t('navLogout')}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-[60] bg-white/98 backdrop-blur-2xl border-t border-neutral-200 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] h-[58px]">
      <div className="flex items-center justify-around max-w-lg mx-auto h-full">
        
        {/* 1. Explore / Home */}
        <button
          onClick={() => handleNavClick('home')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            currentView === 'home' && !isOpen
              ? 'text-amber-600 font-bold'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Home className={`w-5 h-5 ${currentView === 'home' && !isOpen ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">{t('navExplore')}</span>
        </button>

        {/* 2. Saved Listings */}
        <button
          onClick={() => {
            if (!isAuthenticated) onOpenAuth('login');
            else handleNavClick('saved');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            currentView === 'saved' && !isOpen
              ? 'text-amber-600 font-bold'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <div className="relative">
            <Bookmark className={`w-5 h-5 ${currentView === 'saved' && !isOpen ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {savedItems.length > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-0.5 text-[9px] font-black rounded-full bg-amber-500 text-black flex items-center justify-center">
                {savedItems.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">{t('navSaved')}</span>
        </button>

        {/* 3. Center Highlight: Post Rental Action */}
        <button
          onClick={() => {
            if (!isAuthenticated) onOpenAuth('login');
            else handleNavClick('post');
          }}
          className="flex flex-col items-center justify-center -mt-4 group"
          title={t('navPostRent')}
        >
          <div className="w-12 h-12 rounded-full bg-amber-500 group-hover:bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-500/30 transition-transform active:scale-95 border-2 border-white">
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-amber-700 mt-0.5">{t('navPostRent')}</span>
        </button>

        {/* 4. Real-time Messages (Always highlighted when Chat is Open) */}
        <button
          onClick={handleMessagesClick}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            isOpen
              ? 'text-amber-600 font-bold'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <div className="relative">
            <MessageSquare className={`w-5 h-5 ${isOpen ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 text-[9px] font-bold rounded-full bg-amber-500 text-black flex items-center justify-center animate-pulse border border-white">
                {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">{t('navMessages')}</span>
        </button>

        {/* 5. User Profile / Admin Console / My Listings */}
        {isAuthenticated ? (
          user?.role === 'admin' ? (
            <button
              onClick={() => handleNavClick('admin')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                currentView === 'admin' && !isOpen
                  ? 'text-amber-600 font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
              <span className="text-[10px] mt-0.5 tracking-tight">{t('navAdmin')}</span>
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('my-listings')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                currentView === 'my-listings' && !isOpen
                  ? 'text-amber-600 font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Layers className="w-5 h-5 stroke-[1.8]" />
              <span className="text-[10px] mt-0.5 tracking-tight">{t('navMyListings')}</span>
            </button>
          )
        ) : (
          <button
            onClick={() => onOpenAuth('login')}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-neutral-500 hover:text-neutral-900 transition-all"
          >
            <User className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-0.5 tracking-tight">{t('navSignIn')}</span>
          </button>
        )}

      </div>
    </div>
  );
}
