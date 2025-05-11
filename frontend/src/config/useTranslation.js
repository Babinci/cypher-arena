// useTranslation.js - Simple translation hook for Cypher Arena
import { useState, useEffect } from 'react';
import translations from './translations';

export const useTranslation = () => {
  // Default to 'pl' or get from localStorage if available
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'pl';
  });

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key) => {
    // Access nested keys using dot notation if needed
    const keys = key.split('.');
    let translation = translations[language];
    
    for (const k of keys) {
      if (!translation[k]) {
        // Fallback to English if translation is missing
        return key in translations['en'] ? translations['en'][key] : key;
      }
      translation = translation[k];
    }
    
    return translation;
  };

  return {
    t,
    language,
    setLanguage,
    languages: Object.keys(translations) // Available languages
  };
};

export default useTranslation;