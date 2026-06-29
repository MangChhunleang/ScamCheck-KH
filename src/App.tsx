import React, { useState } from 'react';
import {
  ActiveTab, Language, ScanResult,
  LocalHistoryItem, LOCAL_HISTORY_KEY, LOCAL_HISTORY_MAX,
} from './types';
import { sanitizeInputPreview, sanitizeFeedbackComment } from './lib/sanitize';
import { createConvexClient, convexMutate, convexMutateAwait } from './lib/convex';
// Components
import BottomNavBar from './components/BottomNavBar';
import LanguageToggle from './components/LanguageToggle';
import HomeView from './components/HomeView';
import ResultView from './components/ResultView';
import LearnView from './components/LearnView';
import HelpView from './components/HelpView';
import AboutView from './components/AboutView';
import HistoryView from './components/HistoryView';
import ReportView from './components/ReportView';

import { ShieldCheck, Info } from 'lucide-react';

// Convex client — null if VITE_CONVEX_URL is not set (graceful offline mode)
const convexClient = createConvexClient();

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------
function saveToLocalHistory(item: LocalHistoryItem): void {
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    const existing: LocalHistoryItem[] = raw ? JSON.parse(raw) : [];
    // Prepend newest, cap at max
    const updated = [item, ...existing].slice(0, LOCAL_HISTORY_MAX);
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be blocked in some browser contexts — fail silently
  }
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('checker');
  const [language, setLanguage] = useState<Language>('km');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<(ScanResult & { id: string }) | null>(null);
  const [pastedText, setPastedText] = useState('');

  const [appToast, setAppToast] = useState<{
    text: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setAppToast({ text, type });
    setTimeout(() => setAppToast(null), 4500);
  };

  // -------------------------------------------------------------------------
  // Core: analyze a suspicious message
  // -------------------------------------------------------------------------
  const handleAnalyzeText = async (text: string) => {
    setIsLoading(true);
    setPastedText(text);
    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, lang: language }),
      });

      if (!response.ok) throw new Error('API server returned error');

      const apiResult = await response.json();

      const checkId =
        'check_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

      // Sanitize to a short preview — strip OTP, PIN, password, bank data
      const inputPreview = sanitizeInputPreview(text, 120);

      setSelectedResult({ ...apiResult, id: checkId });

      // ── 1. Save to localStorage (always — private, no login required) ────
      const historyItem: LocalHistoryItem = {
        id: checkId,
        inputPreview,
        detectedType: apiResult.detected_type,
        riskLevel: apiResult.risk_level,
        riskScore: apiResult.risk_score,
        detectedSignals: (apiResult.detected_signals || []).slice(0, 5),
        createdAt: Date.now(),
      };
      saveToLocalHistory(historyItem);

      // ── 2. Cloud sync to Convex (non-blocking — skipped if not configured) 
      //    Store only DETERMINISTIC rule-based data. The Gemini-worded explanation
      //    is shown to the user on screen but is NOT persisted — we save the
      //    rule-based reasons/steps so the database stays consistent and AI-free.
      if (convexClient) {
        convexMutate(convexClient, 'mutations:saveScamCheck', {
          inputPreview,
          detectedType: apiResult.detected_type,
          riskLevel: apiResult.risk_level,
          riskScore: apiResult.risk_score,
          detectedSignals: apiResult.detected_signals || [],
          reasons: apiResult.rule_reasons_en || [],
          safeNextSteps: apiResult.rule_safe_next_steps_en || [],
          language,
        });
      }
    } catch (err) {
      console.error(err);
      showToast(
        language === 'km'
          ? 'មិនអាចភ្ជាប់ទៅសេវាបានទេ។ សូមព្យាយាមម្តងទៀត។'
          : 'Could not connect to the service. Please try again.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Feedback — thumb up / down on a result
  // Awaitable: throws on failure so ResultView can show an error and let the
  // user retry (it only locks to "done" on a confirmed save).
  // -------------------------------------------------------------------------
  const handleSubmitFeedback = async (feedbackData: {
    isCorrect: boolean | null;
    userChoice: 'correct' | 'not_correct' | 'not_sure';
    suggestedType?: string;
    suggestedRiskLevel?: string;
    comment?: string;
  }) => {
    if (!selectedResult) return;

    const cleanComment = feedbackData.comment
      ? sanitizeFeedbackComment(feedbackData.comment)
      : undefined;

    // Short sanitized preview of original text for context (80 chars max)
    const inputPreview = pastedText
      ? sanitizeInputPreview(pastedText, 80)
      : undefined;

    if (!convexClient) {
      // No backend configured — surface as a failure so the form stays retryable.
      throw new Error('Convex is not configured.');
    }

    // Awaitable mutation — will throw if the save fails, which ResultView catches.
    await convexMutateAwait(convexClient, 'mutations:submitFeedback', {
      scamCheckId: selectedResult.id || undefined,
      inputPreview,
      detectedType: selectedResult.detected_type,
      riskLevel: selectedResult.risk_level,
      riskScore: selectedResult.risk_score,
      detectedSignals: (selectedResult.detected_signals || []).slice(0, 8),
      isCorrect: feedbackData.isCorrect ?? false,
      comment: cleanComment,
    });
  };

  // -------------------------------------------------------------------------
  // Report submission — sanitized before sending
  // -------------------------------------------------------------------------
  const handleSubmitReport = async (data: {
    scamType: string;
    platform: string;
    descriptionPreview: string;   // already sanitized in ReportView
    contact?: string;
  }) => {
    if (convexClient) {
      await convexMutate(convexClient, 'mutations:submitReport', {
        scamType: data.scamType,
        platform: data.platform,
        descriptionPreview: data.descriptionPreview,
        contact: data.contact,
      });
    }
    // ReportView handles its own success UI — no toast needed here
  };

  // -------------------------------------------------------------------------
  // Navigate away from result back to checker
  // -------------------------------------------------------------------------
  const handleBackToChecker = () => {
    setSelectedResult(null);
    setActiveTab('checker');
  };

  // -------------------------------------------------------------------------
  // View renderer
  // -------------------------------------------------------------------------
  const renderView = () => {
    switch (activeTab) {
      case 'checker':
        if (selectedResult) {
          return (
            <ResultView
              language={language}
              result={selectedResult}
              pastedText={pastedText}
              onBack={handleBackToChecker}
              onSubmitFeedback={handleSubmitFeedback}
              onGoToEmergency={() => setActiveTab('help')}
            />
          );
        }
        return (
          <HomeView
            language={language}
            onAnalyze={handleAnalyzeText}
            isLoading={isLoading}
          />
        );

      case 'learn':
        return (
          <LearnView
            language={language}
            onCheckNow={() => { setSelectedResult(null); setActiveTab('checker'); }}
          />
        );

      case 'help':
        return (
          <HelpView
            language={language}
            onCheckNow={() => { setSelectedResult(null); setActiveTab('checker'); }}
          />
        );

      case 'history':
        return (
          <HistoryView
            language={language}
            onCheckNow={() => { setSelectedResult(null); setActiveTab('checker'); }}
          />
        );

      case 'report':
        return (
          <ReportView
            language={language}
            onSubmitReport={handleSubmitReport}
          />
        );

      case 'about':
        return <AboutView language={language} />;

      default:
        return (
          <HomeView
            language={language}
            onAnalyze={handleAnalyzeText}
            isLoading={isLoading}
          />
        );
    }
  };

  return (
    <div id="scamcheck-app-root" className="min-h-screen bg-gray-50 flex flex-col pb-nav-safe md:pb-0 overflow-x-hidden">

      {/* ── Mobile top header ───────────────────────────────────────────── */}
      <div
        id="mobile-top-header"
        className="md:hidden sticky top-0 bg-brand-blue text-white shadow-sm px-4 py-3 flex items-center justify-between z-40"
      >
        {/* Brand */}
        <div
          id="mobile-brand-wrapper"
          onClick={() => { setSelectedResult(null); setActiveTab('checker'); }}
          className="flex items-center space-x-2 cursor-pointer select-none"
        >
          <div className="bg-white p-1 rounded-lg text-brand-blue">
            <ShieldCheck className="w-5 h-5 stroke-[2.2px]" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight leading-tight">ScamCheck KH</h1>
            <p className="text-[8px] text-kh-gold font-bold uppercase leading-none tracking-wider">
              ឆែកមុនពេលជឿ
            </p>
          </div>
        </div>

        {/* Right side: language toggle + about icon */}
        <div className="flex items-center space-x-2">
          <LanguageToggle language={language} setLanguage={setLanguage} />
          <button
            onClick={() => setActiveTab('about')}
            title="About"
            className={`p-1.5 rounded-lg transition-colors ${
              activeTab === 'about'
                ? 'bg-white/20 text-kh-gold'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Desktop header + language toggle ────────────────────────────── */}
      <div className="hidden md:block">
        <BottomNavBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={language}
        />
        <div
          id="desktop-sub-header"
          className="max-w-7xl mx-auto px-4 py-2 flex justify-end"
        >
          <LanguageToggle language={language} setLanguage={setLanguage} />
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main id="main-content-scroller" className="flex-grow">
        {renderView()}
      </main>

      {/* ── Desktop footer with About link ───────────────────────────────── */}
      <footer className="hidden md:flex justify-center items-center py-4 border-t border-gray-100 gap-6">
        <button
          onClick={() => setActiveTab('about')}
          className={`text-xs font-medium transition-colors ${
            activeTab === 'about'
              ? 'text-brand-blue font-bold'
              : 'text-gray-400 hover:text-brand-blue'
          }`}
        >
          {language === 'km' ? 'អំពី ScamCheck KH' : 'About ScamCheck KH'}
        </button>
        <span className="text-gray-200 select-none">|</span>
        <span className="text-xs text-gray-300 select-none">
          {language === 'km' ? 'ឆែកមុនពេលជឿ' : 'Check Before You Trust'}
        </span>
      </footer>

      {/* ── Mobile bottom nav ────────────────────────────────────────────── */}
      <div className="md:hidden">
        <BottomNavBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={language}
        />
      </div>

      {/* ── Toast notification ───────────────────────────────────────────── */}
      {appToast && (
        <div
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2.5 px-5 py-3.5 rounded-2xl shadow-xl border-2 transition-all animate-bounce max-w-[92%] w-max ${
            appToast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : appToast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <span className="text-base">
            {appToast.type === 'success' ? '✅' : appToast.type === 'error' ? '❌' : '⚠️'}
          </span>
          <span className="text-xs font-bold leading-snug">{appToast.text}</span>
        </div>
      )}
    </div>
  );
}
