import React from 'react';
import { 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Car, 
  Truck, 
  Tv, 
  Package, 
  Headphones 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SOCIAL_LINKS, TelegramIcon, FacebookIcon, YoutubeIcon, TiktokIcon } from './TopSocialBar';

export default function Footer({ onCategorySelect }) {
  const { t, isAmharic } = useLanguage();

  return (
    <footer className="border-t border-neutral-200/90 pt-12 sm:pt-14 pb-12 text-neutral-600 bg-white/90 backdrop-blur-sm mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12 sm:mb-16">
          
          {/* Brand Info & Social Media Links */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-amber-500/30 p-0.5 flex items-center justify-center shadow-xs overflow-hidden">
                <img src="/logo-badge.png" alt="የኔ ኪራይ Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold text-neutral-950 font-sans">
                የኔ <span className="text-amber-500 font-extrabold">ኪራይ</span>
              </span>
            </div>
            
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">
              {t('footerTagline')}
            </p>

            <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{t('footerModerated')}</span>
            </div>

            {/* Social Media Buttons */}
            <div className="pt-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-2.5">
                {t('footerFollowUs')}
              </span>
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Telegram */}
                <a
                  href={SOCIAL_LINKS.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram Channel"
                  title="Telegram Channel (https://t.me/yene_kiray)"
                  className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-[#229ED9] text-neutral-700 hover:text-white flex items-center justify-center border border-neutral-250 hover:border-[#229ED9] transition-all shadow-xs group"
                >
                  <TelegramIcon className="w-4 h-4 text-[#229ED9] group-hover:text-white transition-colors" />
                </a>

                {/* Facebook */}
                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook Page"
                  title="Facebook Page (https://www.facebook.com/profile.php?id=61595222945310&mibextid=ZbWKwL)"
                  className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-[#1877F2] text-neutral-700 hover:text-white flex items-center justify-center border border-neutral-250 hover:border-[#1877F2] transition-all shadow-xs group"
                >
                  <FacebookIcon className="w-4 h-4 text-[#1877F2] group-hover:text-white transition-colors" />
                </a>

                {/* YouTube */}
                <a
                  href={SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube Channel"
                  title="YouTube Channel"
                  className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-[#FF0000] text-neutral-700 hover:text-white flex items-center justify-center border border-neutral-250 hover:border-[#FF0000] transition-all shadow-xs group"
                >
                  <YoutubeIcon className="w-4 h-4 text-[#FF0000] group-hover:text-white transition-colors" />
                </a>

                {/* TikTok */}
                <a
                  href={SOCIAL_LINKS.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok Account"
                  title="TikTok Account"
                  className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-900 text-neutral-700 hover:text-white flex items-center justify-center border border-neutral-250 hover:border-neutral-900 transition-all shadow-xs group"
                >
                  <TiktokIcon className="w-4 h-4 text-neutral-800 group-hover:text-white transition-colors" />
                </a>

                {/* Customer Support Telegram Account */}
                <a
                  href={SOCIAL_LINKS.supportTelegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Customer Support Telegram"
                  title="Customer Support Telegram (@yene_kiray_support)"
                  className="px-2.5 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 flex items-center gap-1.5 border border-amber-300 text-xs font-semibold transition-all shadow-xs"
                >
                  <TelegramIcon className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Support</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-950 mb-4">
              {t('footerExplore')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => onCategorySelect && onCategorySelect('residential-houses')}
                  className="hover:text-amber-600 transition-colors flex items-center gap-2 text-left text-neutral-700 cursor-pointer"
                >
                  <Building className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{isAmharic ? 'የመኖሪያ ቤቶች እና ቪላዎች' : 'Residential Villas & Houses'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onCategorySelect && onCategorySelect('cars-vehicles')}
                  className="hover:text-amber-600 transition-colors flex items-center gap-2 text-left text-neutral-700 cursor-pointer"
                >
                  <Car className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{isAmharic ? 'መኪኖች እና ተሽከርካሪዎች' : 'Cars & Luxury Vehicles'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onCategorySelect && onCategorySelect('commercial-offices')}
                  className="hover:text-amber-600 transition-colors flex items-center gap-2 text-left text-neutral-700 cursor-pointer"
                >
                  <Building className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{isAmharic ? 'የንግድ እና የቢሮ ቦታዎች' : 'Offices & Commercial Spaces'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onCategorySelect && onCategorySelect('heavy-machinery')}
                  className="hover:text-amber-600 transition-colors flex items-center gap-2 text-left text-neutral-700 cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{isAmharic ? 'ከባድ ማሽነሪዎች እና ገልባጮች' : 'Heavy Machinery & Trucks'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onCategorySelect && onCategorySelect('electronics')}
                  className="hover:text-amber-600 transition-colors flex items-center gap-2 text-left text-neutral-700 cursor-pointer"
                >
                  <Tv className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{isAmharic ? 'ኤሌክትሮኒክስ እና መሣሪያዎች' : 'Electronics & Gadgets'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onCategorySelect && onCategorySelect('other')}
                  className="hover:text-amber-600 transition-colors flex items-center gap-2 text-left text-neutral-700 cursor-pointer"
                >
                  <Package className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{isAmharic ? 'ሌሎች የኪራይ ዘርፎች' : 'Other Rental Items'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Trust & Policy */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950 mb-4">
              {t('footerFeatures')}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-neutral-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{t('footerFeature1')}</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{t('footerFeature2')}</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{t('footerFeature3')}</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{t('footerFeature4')}</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-950 mb-4">
              {t('footerContact')}
            </h4>
            <div className="space-y-3 text-sm text-neutral-700">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{t('footerAddress')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>+251 911 000 000 / +251 912 345 678</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>support@yenekiray.com</span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <Headphones className="w-4 h-4 text-amber-500 shrink-0" />
                <a 
                  href={SOCIAL_LINKS.supportTelegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 hover:text-amber-800 font-semibold hover:underline flex items-center gap-1.5"
                >
                  <TelegramIcon className="w-3.5 h-3.5 text-[#229ED9]" />
                  <span>{SOCIAL_LINKS.supportHandle}</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} የኔ ኪራይ (Yene Kiray). {t('footerRights')}</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-neutral-800 cursor-pointer">{t('footerTerms')}</span>
            <span className="hover:text-neutral-800 cursor-pointer">{t('footerPrivacy')}</span>
            <span className="hover:text-neutral-800 cursor-pointer">{t('footerSecurity')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
