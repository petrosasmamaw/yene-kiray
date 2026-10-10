import React from 'react';
import { ShieldCheck, Phone, Mail, MapPin, Sparkles, Building, Car, Truck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer({ onCategorySelect }) {
  const { t, isAmharic } = useLanguage();

  return (
    <footer className="border-t border-white/[0.06] pt-14 pb-12 text-neutral-400 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#090a0d] border border-white/[0.1] p-1.5 flex items-center justify-center">
                <img src="/logo-key.svg" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold text-white font-sans">
                የኔ <span className="text-amber-500">ኪራይ</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-normal">
              {t('footerTagline')}
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-normal">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('footerModerated')}</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              {t('footerExplore')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => onCategorySelect && onCategorySelect('residential-houses')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-2 text-left"
                >
                  <Building className="w-4 h-4 text-amber-500/80 shrink-0" />
                  <span>{isAmharic ? 'የመኖሪያ ቤቶች እና ቪላዎች' : 'Residential Villas & Apartments'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onCategorySelect && onCategorySelect('cars-vehicles')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-2 text-left"
                >
                  <Car className="w-4 h-4 text-amber-500/80 shrink-0" />
                  <span>{isAmharic ? 'መኪኖች እና ተሽከርካሪዎች' : 'Sedans, SUVs & Vehicles'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onCategorySelect && onCategorySelect('commercial-offices')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-2 text-left"
                >
                  <Building className="w-4 h-4 text-amber-500/80 shrink-0" />
                  <span>{isAmharic ? 'የንግድ እና የቢሮ ቦታዎች' : 'Offices & Retail Spaces'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onCategorySelect && onCategorySelect('heavy-machinery')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-2 text-left"
                >
                  <Truck className="w-4 h-4 text-amber-500/80 shrink-0" />
                  <span>{isAmharic ? 'ከባድ ማሽነሪዎች እና ገልባጮች' : 'Heavy Machinery & Trucks'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Trust & Policy */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-4">
              {t('footerFeatures')}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>{t('footerFeature1')}</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>{t('footerFeature2')}</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>{t('footerFeature3')}</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>{t('footerFeature4')}</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              {t('footerContact')}
            </h4>
            <div className="space-y-3 text-sm">
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
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} የኔ ኪራይ (Yene Kiray). {t('footerRights')}</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-neutral-400 cursor-pointer">{t('footerTerms')}</span>
            <span className="hover:text-neutral-400 cursor-pointer">{t('footerPrivacy')}</span>
            <span className="hover:text-neutral-400 cursor-pointer">{t('footerSecurity')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
