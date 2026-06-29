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
    const base =
      "px-3.5 py-1.5 min-h-[36px] rounded-lg font-bold text-xs transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-95";
    if (isActive) {
      return isDarkBg
        ? `${base} bg-[#FDF8F1] text-[#0F172A] shadow-sm`
        : `${base} bg-[#0F172A] text-[#FDF8F1] shadow-sm`;
    }
    return isDarkBg
      ? `${base} text-white/80 hover:text-white`
      : `${base} text-[#0F172A]/70 hover:text-[#0F172A]`;
  };

  return (
    <div id="language-toggle-container" className={containerClasses}>
      <button
        id="toggle-lang-km"
        type="button"
        aria-pressed={language === 'km'}
        aria-label="ភាសាខ្មែរ (Khmer)"
        onClick={() => setLanguage('km')}
        className={getButtonClasses(language === 'km')}
      >
        <span>KH</span>
      </button>
      <button
        id="toggle-lang-en"
        type="button"
        aria-pressed={language === 'en'}
        aria-label="English"
        onClick={() => setLanguage('en')}
        className={getButtonClasses(language === 'en')}
      >
        <span>EN</span>
      </button>
    </div>
  );
}
