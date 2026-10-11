import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Building2, 
  PlusCircle, 
  Bookmark, 
  MessageSquare, 
  ShieldCheck, 
  User, 
  LogOut, 
  Menu, 
  X,
  Layers,
  Sparkles,
  Globe
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { openChat } from '../store/slices/chatSlice';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ currentView, setCurrentView, onOpenAuth }) {
  const dispatch = useDispatch();
  const { language, toggleLanguage, t, isAmharic } = useLanguage();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { savedItems } = useSelector((state) => state.listings);
  const { conversations } = useSelector((state) => state.chat);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (parseInt(c.unread_count, 10) || 0), 0);

  const handleNavClick = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-neutral-200/90 transition-all duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-[72px]">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-250 p-1.5 flex items-center justify-center group-hover:border-amber-500/60 transition-all duration-200 shadow-xs">
              <img src="/logo-key.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-950 font-sans leading-none">
              የኔ <span className="text-amber-500 font-extrabold">ኪራይ</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                currentView === 'home' 
                  ? 'text-neutral-950 bg-neutral-100/90 border border-neutral-250 shadow-2xs font-bold' 
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70 border border-transparent'
              }`}
            >
              {t('navBrowse')}
            </button>

            {isAuthenticated && (
              <>
                <button
                  onClick={() => handleNavClick('saved')}
                  className={`relative px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                    currentView === 'saved' 
                      ? 'text-amber-800 bg-amber-50 border border-amber-300 shadow-2xs font-bold' 
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70 border border-transparent'
                  }`}
                >
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <span>{t('navSaved')}</span>
                  {savedItems.length > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-black">
                      {savedItems.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNavClick('my-listings')}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                    currentView === 'my-listings' 
                      ? 'text-amber-800 bg-amber-50 border border-amber-300 shadow-2xs font-bold' 
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70 border border-transparent'
                  }`}
                >
                  <Layers className="w-4 h-4 text-amber-500" />
                  <span>{t('navMyListings')}</span>
                </button>
              </>
            )}

            {/* Admin Portal Tab (Only visible to admin role) */}
            {user?.role === 'admin' && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                  currentView === 'admin'
                    ? 'text-black bg-amber-400 font-bold shadow-xs'
                    : 'text-amber-800 bg-amber-100/80 border border-amber-300 hover:bg-amber-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>{t('navAdmin')}</span>
              </button>
            )}
          </div>

          {/* Action CTAs: Language Switcher, Post Listing & User Session */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher Pill Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-300 hover:border-amber-500/60 text-neutral-800 hover:text-neutral-950 transition-all text-xs font-semibold cursor-pointer shadow-xs group"
              title={isAmharic ? "Switch to English" : "ወደ አማርኛ ቀይር"}
            >
              <Globe className="w-3.5 h-3.5 text-amber-600 group-hover:rotate-12 transition-transform duration-200" />
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${isAmharic ? 'bg-amber-400 text-black shadow-xs' : 'text-neutral-500'}`}>
                አማ
              </span>
              <span className="text-neutral-400 text-[10px]">/</span>
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${!isAmharic ? 'bg-amber-400 text-black shadow-xs' : 'text-neutral-500'}`}>
                EN
              </span>
            </button>

            {/* Post Listing Button */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  onOpenAuth('login');
                } else {
                  handleNavClick('post');
                }
              }}
              className="btn-gold text-xs py-2 px-4.5 font-bold tracking-wide shadow-xs hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('navPostRent')}</span>
            </button>

            {/* Real-time Chat Trigger */}
            {isAuthenticated && (
              <button
                onClick={() => dispatch(openChat())}
                title={t('navMessages')}
                className="relative p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-300 text-neutral-700 hover:text-amber-600 transition-all hover:border-amber-500/50 shadow-xs"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-bold rounded-full bg-amber-500 text-black shadow-md shadow-amber-500/40 animate-pulse border-2 border-white">
                    {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth State Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-neutral-100 border border-neutral-300 hover:border-amber-500/50 transition-colors shadow-xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-black font-bold flex items-center justify-center text-xs shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-neutral-900 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-neutral-200">
                      <p className="text-xs text-neutral-500">{t('signedInAs')}</p>
                      <p className="text-sm font-bold text-neutral-900 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-amber-100/80 text-amber-900 font-semibold uppercase">
                        Role: {user?.role}
                      </span>
                    </div>

                    <button
                      onClick={() => handleNavClick('my-listings')}
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 flex items-center gap-2.5"
                    >
                      <Layers className="w-4 h-4 text-amber-600" />
                      <span>{t('navMyListings')}</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('saved')}
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 flex items-center gap-2.5"
                    >
                      <Bookmark className="w-4 h-4 text-amber-600" />
                      <span>{t('navSaved')}</span>
                    </button>

                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full text-left px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 font-bold"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>{t('navAdmin')}</span>
                      </button>
                    )}

                    <div className="border-t border-neutral-200 my-1"></div>

                    <button
                      onClick={() => {
                        dispatch(logout());
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('navLogout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-sm font-semibold text-neutral-800 hover:text-amber-600 transition-colors"
                >
                  {t('navSignIn')}
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="btn-outline-gold text-sm py-2 px-4"
                >
                  {t('navRegister')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Actions (Language Toggle + Hamburger) */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-100 text-neutral-900 border border-neutral-300 text-xs font-bold hover:border-amber-500/60 shadow-xs"
              title={isAmharic ? "Switch to English" : "ወደ አማርኛ ቀይር"}
            >
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-amber-600 font-extrabold">{isAmharic ? 'አማ' : 'EN'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-neutral-100 text-neutral-800 hover:text-neutral-950 border border-neutral-300 shadow-xs"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-b border-neutral-200 px-4 pt-3 pb-6 space-y-3 shadow-xl">
          {/* Mobile Language Switcher inside Drawer */}
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <span className="text-xs text-neutral-600 font-medium flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              ቋንቋ / Language
            </span>
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold shadow-xs"
            >
              {isAmharic ? 'አማርኛ (ወደ English ቀይር)' : 'English (ወደ አማርኛ ቀይር)'}
            </button>
          </div>

          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-left py-2.5 text-sm font-semibold text-neutral-800 hover:text-amber-600"
          >
            {t('navBrowse')}
          </button>
          <button
            onClick={() => {
              if (!isAuthenticated) onOpenAuth('login');
              else handleNavClick('post');
            }}
            className="w-full btn-gold text-sm py-2.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('navPostRent')}</span>
          </button>

          {isAuthenticated ? (
            <>
              <button
                onClick={() => {
                  dispatch(openChat());
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 text-sm font-medium text-neutral-800 hover:text-amber-600 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>{t('navMessages')}</span>
                </div>
                {unreadMessagesCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-black shadow-sm">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('my-listings')}
                className="w-full text-left py-2.5 text-sm font-medium text-neutral-800 hover:text-amber-600 flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-amber-600" />
                <span>{t('navMyListings')}</span>
              </button>
              <button
                onClick={() => handleNavClick('saved')}
                className="w-full text-left py-2.5 text-sm font-medium text-neutral-800 hover:text-amber-600 flex items-center gap-2"
              >
                <Bookmark className="w-4 h-4 text-amber-600" />
                <span>{t('navSaved')} ({savedItems.length})</span>
              </button>

              {user?.role === 'admin' && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className="w-full text-left py-2.5 text-sm font-bold text-amber-700 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>{t('navAdmin')}</span>
                </button>
              )}

              <button
                onClick={() => {
                  dispatch(logout());
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('navLogout')} ({user?.name})</span>
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-sm text-center font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-xl"
              >
                {t('navSignIn')}
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register');
                  setMobileMenuOpen(false);
                }}
                className="w-full btn-outline-gold text-sm py-2.5"
              >
                {t('navRegister')}
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
