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
    <nav className="sticky top-0 z-50 bg-[#030304]/95 backdrop-blur-xl border-b border-white/[0.08] transition-all duration-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0a0a0d] border border-white/[0.1] p-1.5 flex items-center justify-center group-hover:border-amber-500/40 transition-all duration-200">
              <img src="/logo-key.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white font-sans leading-none">
                የኔ <span className="text-amber-400">ኪራይ</span>
              </span>
              <span className="text-[11px] text-neutral-400 font-normal tracking-wide mt-1">
                Marketplace
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'home' 
                  ? 'text-white bg-white/[0.06] border border-white/[0.08]' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              {t('navBrowse')}
            </button>

            {isAuthenticated && (
              <>
                <button
                  onClick={() => handleNavClick('saved')}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                    currentView === 'saved' 
                      ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' 
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <span>{t('navSaved')}</span>
                  {savedItems.length > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-black">
                      {savedItems.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNavClick('my-listings')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                    currentView === 'my-listings' 
                      ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' 
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>{t('navMyListings')}</span>
                </button>
              </>
            )}

            {/* Admin Portal Tab (Only visible to admin role) */}
            {user?.role === 'admin' && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                  currentView === 'admin'
                    ? 'text-black bg-amber-400 font-bold'
                    : 'text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t('navAdmin')}</span>
              </button>
            )}
          </div>

          {/* Action CTAs: Language Switcher, Post Listing & User Session */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher Pill Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-white transition-all text-xs font-medium cursor-pointer shadow-sm group"
              title={isAmharic ? "Switch to English" : "ወደ አማርኛ ቀይር"}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform duration-200" />
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${isAmharic ? 'bg-amber-400 text-black' : 'text-neutral-400'}`}>
                አማ
              </span>
              <span className="text-neutral-600 text-[10px]">/</span>
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${!isAmharic ? 'bg-amber-400 text-black' : 'text-neutral-400'}`}>
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
              className="btn-gold text-xs py-2 px-4 font-semibold tracking-wide"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t('navPostRent')}</span>
            </button>

            {/* Real-time Chat Trigger */}
            {isAuthenticated && (
              <button
                onClick={() => dispatch(openChat())}
                title={t('navMessages')}
                className="relative p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-amber-400 transition-all hover:border-amber-500/40"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-bold rounded-full bg-amber-500 text-black shadow-md shadow-amber-500/40 animate-pulse border-2 border-[#030304]">
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
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-black font-bold flex items-center justify-center text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-white max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#0D0D0D] border border-neutral-800 rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-neutral-800">
                      <p className="text-xs text-neutral-400">{t('signedInAs')}</p>
                      <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-amber-400 font-semibold uppercase">
                        Role: {user?.role}
                      </span>
                    </div>

                    <button
                      onClick={() => handleNavClick('my-listings')}
                      className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-white flex items-center gap-2.5"
                    >
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>{t('navMyListings')}</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('saved')}
                      className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-white flex items-center gap-2.5"
                    >
                      <Bookmark className="w-4 h-4 text-amber-400" />
                      <span>{t('navSaved')}</span>
                    </button>

                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full text-left px-4 py-2 text-sm text-amber-400 hover:bg-neutral-900 flex items-center gap-2.5 font-semibold"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>{t('navAdmin')}</span>
                      </button>
                    )}

                    <div className="border-t border-neutral-800 my-1"></div>

                    <button
                      onClick={() => {
                        dispatch(logout());
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-neutral-900 flex items-center gap-2.5"
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
                  className="px-4 py-2 text-sm font-semibold text-white hover:text-amber-400 transition-colors"
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 text-neutral-200 border border-neutral-800 text-xs font-semibold hover:border-amber-500/40"
              title={isAmharic ? "Switch to English" : "ወደ አማርኛ ቀይር"}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400">{isAmharic ? 'አማ' : 'EN'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#07080a]/95 backdrop-blur-xl border-b border-white/[0.08] px-4 pt-3 pb-6 space-y-3">
          {/* Mobile Language Switcher inside Drawer */}
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
            <span className="text-xs text-neutral-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              ቋንቋ / Language
            </span>
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold"
            >
              {isAmharic ? 'አማርኛ (ወደ English ቀይር)' : 'English (ወደ አማርኛ ቀይር)'}
            </button>
          </div>

          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-left py-2.5 text-sm font-medium text-neutral-200 hover:text-amber-400"
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
                className="w-full text-left py-2.5 text-sm font-medium text-neutral-200 hover:text-amber-400 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
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
                className="w-full text-left py-2.5 text-sm font-medium text-neutral-200 hover:text-amber-400 flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>{t('navMyListings')}</span>
              </button>
              <button
                onClick={() => handleNavClick('saved')}
                className="w-full text-left py-2.5 text-sm font-medium text-neutral-200 hover:text-amber-400 flex items-center gap-2"
              >
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>{t('navSaved')} ({savedItems.length})</span>
              </button>

              {user?.role === 'admin' && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className="w-full text-left py-2.5 text-sm font-semibold text-amber-400 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('navAdmin')}</span>
                </button>
              )}

              <button
                onClick={() => {
                  dispatch(logout());
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 text-sm text-rose-400 flex items-center gap-2"
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
                className="w-full py-2.5 text-sm text-center font-semibold text-white bg-neutral-900 border border-neutral-800 rounded-xl"
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
