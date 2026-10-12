import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Default to English ('en') as requested by user
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('yene_kiray_lang') || 'en';
  });

  const setLanguage = (lang) => {
    const validLang = lang === 'am' ? 'am' : 'en';
    setLanguageState(validLang);
    localStorage.setItem('yene_kiray_lang', validLang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'am' : 'en');
  };

  // Translation helper function
  const t = (key, fallback = '') => {
    if (!key) return '';
    const currentDict = translations[language] || translations.en;
    if (currentDict && currentDict[key] !== undefined) {
      return currentDict[key];
    }
    // Fallback to English dictionary if key missing in Amharic
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key];
    }
    return fallback || key;
  };

  // Helper to dynamically get category title according to active language
  const getCategoryTitle = (category) => {
    if (!category) return '';
    if (language === 'am' && category.name_am) {
      return category.name_am;
    }
    return category.name || category.title || '';
  };

  // Helper to get category description
  const getCategoryDesc = (category) => {
    if (!category) return '';
    if (language === 'am' && category.description_am) {
      return category.description_am;
    }
    return category.description || '';
  };

  const CITY_MAP_AM = {
    'Addis Ababa': 'አዲስ አበባ',
    'Hawassa': 'ሐዋሳ',
    'Adama': 'አዳማ',
    'Bahir Dar': 'ባሕር ዳር',
    'Bishoftu': 'ቢሾፍቱ',
    'Mekelle': 'መቀሌ',
    'Dire Dawa': 'ድሬዳዋ',
    'Gondar': 'ጎንደር',
    'Jimma': 'ጅማ',
    'Other': 'ሌሎች ከተሞች',
    'Other Cities': 'ሌሎች ከተሞች'
  };

  const getCityTitle = (city) => {
    if (!city) return '';
    if (language === 'am' && CITY_MAP_AM[city]) {
      return CITY_MAP_AM[city];
    }
    return city;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        getCategoryTitle,
        getCategoryDesc,
        getCityTitle,
        isAmharic: language === 'am'
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
