import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MessageSquareCode, Headphones, Sparkles } from 'lucide-react';

export const SOCIAL_LINKS = {
  telegram: 'https://t.me/yene_kiray',
  youtube: 'https://youtube.com/@yene_kiray?si=Y1QhRItduF-xoxLH',
  tiktok: 'https://vm.tiktok.com/ZS9UJ7teBVTuV-qNgrY/',
  supportTelegram: 'https://t.me/yene_kiray_support',
  supportHandle: '@yene_kiray_support'
};

export const TelegramIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.95-1.28 4.91-2.13 5.9-2.54 2.81-1.17 3.39-1.37 3.77-1.38.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
  </svg>
);

export const YoutubeIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const TiktokIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.41a6.33 6.33 0 0 0-.85-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.28 8.28 0 0 0 4.85 1.57v-3.5c-.38-.01-.76-.05-1.13-.13z" />
  </svg>
);

export default function TopSocialBar() {
  const { t, isAmharic } = useLanguage();

  return (
    <div className="bg-neutral-900 border-b border-neutral-800 text-neutral-300 text-[11px] sm:text-xs py-1.5 px-3 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Left: Social Media Label & Support Link */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 text-neutral-200 font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="truncate">{t('topSocialMedia')}</span>
          </div>

          <span className="text-neutral-700 hidden sm:inline">|</span>

          {/* Telegram Support Link */}
          <a
            href={SOCIAL_LINKS.supportTelegram}
            target="_blank"
            rel="noopener noreferrer"
            title="Customer Support Telegram"
            className="hidden md:flex items-center gap-1 text-neutral-400 hover:text-amber-400 transition-colors group cursor-pointer"
          >
            <Headphones className="w-3 h-3 text-amber-500/80 group-hover:text-amber-400" />
            <span className="text-[11px] text-neutral-300">{t('topCustomerSupport')}:</span>
            <span className="text-[11px] font-semibold text-neutral-200 group-hover:text-amber-300 underline decoration-neutral-700 underline-offset-2">
              {SOCIAL_LINKS.supportHandle}
            </span>
          </a>
        </div>

        {/* Right: Direct Social Buttons (Clean, compact, not big) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Telegram Channel Button */}
          <a
            href={SOCIAL_LINKS.telegram}
            target="_blank"
            rel="noopener noreferrer"
            title="Telegram Channel"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-800/80 hover:bg-[#229ED9]/20 hover:text-[#229ED9] text-neutral-300 transition-all border border-neutral-750 hover:border-[#229ED9]/50 cursor-pointer"
          >
            <TelegramIcon className="w-3 h-3 text-[#229ED9]" />
            <span className="font-semibold text-[11px] hidden sm:inline">Telegram</span>
          </a>

          {/* YouTube Channel Button */}
          <a
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            title="YouTube Channel"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-800/80 hover:bg-[#FF0000]/20 hover:text-[#FF4E45] text-neutral-300 transition-all border border-neutral-750 hover:border-[#FF0000]/50 cursor-pointer"
          >
            <YoutubeIcon className="w-3 h-3 text-[#FF0000]" />
            <span className="font-semibold text-[11px] hidden sm:inline">YouTube</span>
          </a>

          {/* TikTok Channel Button */}
          <a
            href={SOCIAL_LINKS.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            title="TikTok Account"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-800/80 hover:bg-neutral-700/80 hover:text-white text-neutral-300 transition-all border border-neutral-750 hover:border-neutral-600 cursor-pointer"
          >
            <TiktokIcon className="w-3 h-3 text-cyan-400" />
            <span className="font-semibold text-[11px] hidden sm:inline">TikTok</span>
          </a>

          {/* Support Telegram on Mobile */}
          <a
            href={SOCIAL_LINKS.supportTelegram}
            target="_blank"
            rel="noopener noreferrer"
            title="Support @yene_kiray_support"
            className="flex md:hidden items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 text-[10.5px] font-medium border border-amber-500/30 transition-all"
          >
            <TelegramIcon className="w-2.5 h-2.5 text-amber-400" />
            <span>Support</span>
          </a>

        </div>

      </div>
    </div>
  );
}
