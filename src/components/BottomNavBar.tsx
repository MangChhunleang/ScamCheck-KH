import React from 'react';
import { ShieldCheck, BookOpen, AlertTriangle, Clock, Flag } from 'lucide-react';
import { ActiveTab, Language } from '../types';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  language: Language;
}

export default function BottomNavBar({ activeTab, setActiveTab, language }: BottomNavBarProps) {
  const navItems = [
    {
      id: 'checker' as ActiveTab,
      labelKm: 'ពិនិត្យ',
      labelEn: 'Check',
      icon: ShieldCheck,
    },
    {
      id: 'learn' as ActiveTab,
      labelKm: 'រៀន',
      labelEn: 'Learn',
      icon: BookOpen,
    },
    {
      id: 'help' as ActiveTab,
      labelKm: 'ជំនួយ',
      labelEn: 'Help',
      icon: AlertTriangle,
    },
    {
      id: 'history' as ActiveTab,
      labelKm: 'ប្រវត្តិ',
      labelEn: 'History',
      icon: Clock,
    },
    {
      id: 'report' as ActiveTab,
      labelKm: 'រាយការណ៍',
      labelEn: 'Report',
      icon: Flag,
    },
  ];

  return (
    <div id="navigation-root">
      {/* Mobile Bottom Navigation */}
      <nav
        id="mobile-nav-bar"
        aria-label={language === 'km' ? 'ម៉ឺនុយចម្បង' : 'Main navigation'}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-1 py-1 pb-safe z-50 flex justify-around items-center"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const label = language === 'km' ? item.labelKm : item.labelEn;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 min-h-[48px] py-1.5 px-0.5 rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
                isActive
                  ? 'text-brand-blue font-semibold scale-105'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon
                id={`nav-icon-${item.id}`}
                aria-hidden="true"
                className={`w-5 h-5 mb-0.5 transition-transform duration-200 ${
                  isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'
                }`}
              />
              <span
                id={`nav-label-${item.id}`}
                className="w-full text-center text-[10px] tracking-tight truncate leading-tight select-none"
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Desktop Header Navigation */}
      <header
        id="desktop-nav-bar"
        className="hidden md:block sticky top-0 bg-brand-blue text-white shadow-md z-50 w-full"
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            id="desktop-brand-trigger"
            onClick={() => setActiveTab('checker')}
            className="flex items-center space-x-2.5 cursor-pointer select-none"
          >
            <div className="bg-white p-1.5 rounded-xl text-brand-blue">
              <ShieldCheck className="w-6 h-6 stroke-[2.5px]" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">ScamCheck KH</h1>
              <p className="text-[10px] text-kh-gold font-medium">
                ឆែកមុនពេលជឿ • Check Before You Trust
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const label = language === 'km' ? item.labelKm : item.labelEn;

              return (
                <button
                  key={item.id}
                  id={`desktop-nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-kh-gold shadow-sm'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2px]" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>
    </div>
  );
}
