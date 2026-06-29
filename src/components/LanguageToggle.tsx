import React from 'react';
import { Language } from '../types';

interface LanguageToggleProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  isDarkBg?: boolean;
}

export default function LanguageToggle({ language, setLanguage, isDarkBg = false }: LanguageToggleProps) {
  const containerClasses = isDarkBg 
    ? "flex items-center bg-white/10 p-1 rounded-xl border border-white/10" 
    : "flex items-center bg-[#0F172A]/10 p-1 rounded-xl border border-[#0F172A]/5";

  const getButtonClasses = (isActive: boolean) => {
    if (isActive) {
      return isDarkBg
        ? "px-3 py-1 bg-[#FDF8F1] text-[#0F172A] rounded-lg font-bold text-xs transition-all shadow-sm"
        : "px-3 py-1 bg-[#0F172A] text-[#FDF8F1] rounded-lg font-bold text-xs transition-all shadow-sm";
    } else {
      return isDarkBg
        ? "px-3 py-1 text-white/80 hover:text-white font-bold text-xs transition-all"
        : "px-3 py-1 text-[#0F172A]/70 hover:text-[#0F172A] font-bold text-xs transition-all";
    }
  };

  return (
    <div id="language-toggle-container" className={containerClasses}>
      <button
        id="toggle-lang-km"
        onClick={() => setLanguage('km')}
        className={getButtonClasses(language === 'km')}
      >
        <span>KH</span>
      </button>
      <button
        id="toggle-lang-en"
        onClick={() => setLanguage('en')}
        className={getButtonClasses(language === 'en')}
      >
        <span>EN</span>
      </button>
    </div>
  );
}
