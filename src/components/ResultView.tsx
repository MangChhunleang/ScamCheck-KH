import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, ThumbsUp, ThumbsDown, Info, Sparkles, ShieldQuestion } from 'lucide-react';
import { Language, ScanResult } from '../types';
import { getFallbackExplanations } from '../lib/fallbackExplanations';

interface ResultViewProps {
  language: Language;
  result: ScanResult;
  pastedText: string;
  onBack: () => void;
  onGoToEmergency: () => void;
  onSubmitFeedback: (feedbackData: {
    isCorrect: boolean | null;
    userChoice: 'correct' | 'not_correct' | 'not_sure';
    comment?: string;
  }) => Promise<void>;
}

export default function ResultView({
  language,
  result,
  pastedText,
  onBack,
  onGoToEmergency,
  onSubmitFeedback
}: ResultViewProps) {
  const {
    detected_type,
    risk_level,
    risk_score,
    reasons_km = [],
    reasons_en = [],
    safe_next_steps_km = [],
    safe_next_steps_en = [],
    disclaimer_km = '',
    disclaimer_en = '',
    confidence,
    link_analysis,
    explanation_source
  } = result;

  const [feedbackStage, setFeedbackStage] = useState<'idle' | 'comment' | 'done'>('idle');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  // Helper to translate scam types to Khmer
  const translateScamType = (type: string) => {
    if (language !== 'km') return type;
    switch (type) {
      case 'Fake Job Scam': return 'ការបោកប្រាស់ការងារក្លែងក្លាយ (Fake Job)';
      case 'Bank / OTP Scam': return 'ការបោកប្រាស់បន្លំជាធនាគារ ឬសុំលេខកូដសម្ងាត់ OTP';
      case 'KHQR / Payment Scam': return 'ការបោកប្រាស់ទូទាត់ប្រាក់ ឬក្លែងបន្លំវិក្កយបត្រ (KHQR)';
      case 'Online Shopping Scam': return 'ការបោកប្រាស់ក្នុងការទិញទំនិញអនឡាញ';
      case 'Investment Scam': return 'ការបោកប្រាស់ក្នុងការវិនិយោគ (Investment)';
      case 'Account Security Scam': return 'ការបោកប្រាស់គំរាមគណនី និងសន្តិសុខ';
      case 'Suspicious Link': return 'តំណភ្ជាប់គួរឱ្យសង្ស័យ (Suspicious Link)';
      case 'Normal Safe Message': return 'សារមានសុវត្ថិភាពធម្មតា';
      case 'Unknown': return 'មិនស្គាល់ប្រភេទច្បាស់លាស់';
      default: return type;
    }
  };

  const translateConfidence = (level: string) => {
    if (language !== 'km') return level;
    switch (level) {
      case 'High': return 'ខ្ពស់';
      case 'Medium': return 'មធ្យម';
      case 'Low': return 'ទាប';
      default: return level;
    }
  };

  // Helper to determine risk colors and translations
  const getRiskAttributes = () => {
    switch (risk_level) {
      case 'High':
        return {
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badgeColor: 'bg-red-600 text-white',
          titleKm: 'ហានិភ័យខ្ពស់ (High Risk)',
          titleEn: 'High Risk',
          icon: AlertTriangle
        };
      case 'Medium':
        return {
          textColor: 'text-amber-700',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          badgeColor: 'bg-amber-500 text-white',
          titleKm: 'ហានិភ័យមធ្យម (Medium Risk)',
          titleEn: 'Medium Risk',
          icon: AlertTriangle
        };
      case 'Low':
      default:
        return {
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badgeColor: 'bg-green-600 text-white',
          titleKm: 'ហានិភ័យទាប (Low Risk)',
          titleEn: 'Low Risk',
          icon: ShieldCheck
        };
    }
  };

  const attrs = getRiskAttributes();
  const RiskIcon = attrs.icon;

  // Derive explanations with secure multilingual fallback support
  let currentReasons = language === 'km' ? reasons_km : reasons_en;
  let currentSafeSteps = language === 'km' ? safe_next_steps_km : safe_next_steps_en;
  let currentDisclaimer = language === 'km' ? disclaimer_km : disclaimer_en;

  const fallbackData = getFallbackExplanations(detected_type);

  if (!currentReasons || currentReasons.length === 0) {
    currentReasons = language === 'km' ? fallbackData.reasons_km : fallbackData.reasons_en;
  }
  if (!currentSafeSteps || currentSafeSteps.length === 0) {
    currentSafeSteps = language === 'km' ? fallbackData.safe_next_steps_km : fallbackData.safe_next_steps_en;
  }
  if (!currentDisclaimer) {
    currentDisclaimer = language === 'km' ? fallbackData.disclaimer_km : fallbackData.disclaimer_en;
  }

  // Correct → submit immediately
  const handleSubmitCorrect = async () => {
    setSubmittingFeedback(true);
    setFeedbackError('');
    try {
      await onSubmitFeedback({ isCorrect: true, userChoice: 'correct' });
      setFeedbackStage('done');
    } catch (e) {
      console.error(e);
      setFeedbackError(
        language === 'km'
          ? 'មិនអាចរក្សាទុកមតិយោបល់បានទេ។ សូមព្យាយាមម្តងទៀត។'
          : 'Could not save feedback. Please try again.'
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Not correct → reveal optional comment box first
  const handleChooseNotCorrect = () => {
    setFeedbackError('');
    setFeedbackStage('comment');
  };

  // Submit the "not correct" feedback (with optional comment)
  const handleSubmitNotCorrect = async () => {
    setSubmittingFeedback(true);
    setFeedbackError('');
    try {
      await onSubmitFeedback({
        isCorrect: false,
        userChoice: 'not_correct',
        comment: feedbackComment.trim() || undefined,
      });
      setFeedbackStage('done');
    } catch (e) {
      console.error(e);
      setFeedbackError(
        language === 'km'
          ? 'មិនអាចរក្សាទុកមតិយោបល់បានទេ។ សូមព្យាយាមម្តងទៀត។'
          : 'Could not save feedback. Please try again.'
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div id="result-view-container" className="max-w-3xl mx-auto px-4 py-6">
      {/* Header Back Link */}
      <button
        id="btn-back-to-checker"
        type="button"
        onClick={onBack}
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#0F172A] hover:bg-slate-100 mb-6 bg-white py-2.5 px-4 rounded-xl border-2 border-gray-200 shadow-sm cursor-pointer transition-all active:scale-95"
      >
        <ArrowLeft className="w-4 h-4 text-amber-500" />
        <span>{language === 'km' ? 'ពិនិត្យសារផ្សេងទៀត' : 'Check Another'}</span>
      </button>

      {/* Main Score & Risk Summary Card */}
      <div id="result-summary-card" className={`rounded-3xl border-2 p-5 sm:p-6 mb-6 shadow-sm ${attrs.bgColor} ${attrs.borderColor}`}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center space-x-3 min-w-0">
            <div className={`p-2.5 rounded-xl bg-white ${attrs.textColor} shadow-md shrink-0`}>
              <RiskIcon className="w-6 h-6 stroke-[2.2px]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest font-mono">
                {language === 'km' ? 'លទ្ធផលវិភាគ' : 'Analysis Result'}
              </span>
              <h3 className={`text-lg md:text-xl font-bold leading-tight ${attrs.textColor}`}>
                {language === 'km' ? attrs.titleKm : attrs.titleEn}
              </h3>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest font-mono block">
              {language === 'km' ? 'ពិន្ទុហានិភ័យ' : 'Risk Score'}
            </span>
            <div className="flex items-baseline justify-end space-x-0.5">
              <span id="risk-score-value" className={`text-2xl md:text-3xl font-black ${attrs.textColor}`}>
                {risk_score}
              </span>
              <span className="text-xs text-gray-400 font-medium">/100</span>
            </div>
          </div>
        </div>

        {/* Category Badge & Confidence */}
        <div id="result-meta-chips" className="flex flex-wrap items-center gap-2 border-t border-gray-200/50 pt-4 mt-4 text-xs">
          <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-xl font-bold text-[#0F172A] flex items-center space-x-1.5 shadow-sm max-w-full min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span className="min-w-0 break-words">
              {language === 'km' ? `ប្រភេទដែលប្រព័ន្ធសង្ស័យ៖ ${translateScamType(detected_type)}` : `Detected Type: ${detected_type}`}
            </span>
          </div>

          <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-gray-500 font-bold shadow-sm">
            {language === 'km' ? `ភាពជឿជាក់៖ ${translateConfidence(confidence)}` : `Confidence: ${confidence}`}
          </div>

          {/* Explanation source badge — shows whether AI (Gemini) or built-in guidance was used */}
          {explanation_source === 'gemini' ? (
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-xl font-bold shadow-sm flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'km' ? 'ពន្យល់ដោយ AI' : 'AI explained'}</span>
            </div>
          ) : explanation_source === 'fallback' ? (
            <div className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl font-bold shadow-sm flex items-center space-x-1.5">
              <ShieldQuestion className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'km' ? 'ការណែនាំស្តង់ដារ' : 'Standard guidance'}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Link Safety Check Section */}
      {link_analysis && link_analysis.hasLink && (
        <div id="link-safety-check-box" className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 mb-6 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-gray-100">
            <span className="text-xl">🔗</span>
            <h4 className="text-sm font-bold text-[#0F172A]">
              {language === 'km' ? 'ពិនិត្យ Link (Link Safety Check)' : 'Link Safety Check'}
            </h4>
            <span className={`ml-auto text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
              link_analysis.linkRiskLevel === 'High' ? 'bg-red-100 text-red-800' :
              link_analysis.linkRiskLevel === 'Medium' ? 'bg-amber-100 text-amber-800' :
              'bg-green-100 text-green-800'
            }`}>
              {language === 'km'
                ? `ហានិភ័យ៖ ${link_analysis.linkRiskLevel === 'High' ? 'ខ្ពស់' : link_analysis.linkRiskLevel === 'Medium' ? 'មធ្យម' : 'ទាប'}`
                : `Risk: ${link_analysis.linkRiskLevel}`
              }
            </span>
          </div>

          {/* Detected links and domains list */}
          <div className="space-y-3.5 mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono block mb-1">
                {language === 'km' ? 'តំណភ្ជាប់ដែលរកឃើញ' : 'Detected Links'}
              </span>
              <div className="space-y-1.5">
                {link_analysis.detectedLinks.map((link, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-mono text-gray-700 break-all select-all flex items-center">
                    <span className="text-slate-400 mr-2 shrink-0">🔗</span>
                    <span>{link}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono block mb-1">
                {language === 'km' ? 'ឈ្មោះ Domain' : 'Detected Domains'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {link_analysis.domains.map((dom, idx) => (
                  <span key={idx} className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-mono text-gray-600 font-bold">
                    🌐 {dom}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Link Warning Signs (If any) */}
          {((language === 'km' ? link_analysis.linkWarningSignalsKm : link_analysis.linkWarningSignalsEn) || []).length > 0 && (
            <div className="mt-4 mb-4 pt-4 border-t border-dashed border-gray-100">
              <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider font-mono block mb-2">
                {language === 'km' ? 'សញ្ញាព្រមានពី Link (Link Warning Signs)' : 'Link Warning Signs'}
              </span>
              <ul className="space-y-2.5">
                {((language === 'km' ? link_analysis.linkWarningSignalsKm : link_analysis.linkWarningSignalsEn) || []).map((sign, idx) => (
                  <li key={idx} className="text-xs md:text-sm text-red-700 font-medium flex items-start space-x-2">
                    <span className="text-red-500 shrink-0 font-bold">⚠️</span>
                    <span className="leading-relaxed">{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safe Advice for Links */}
          <div className="mt-4 pt-4 border-t border-dashed border-gray-100 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-green-700 tracking-wider font-mono block mb-2.5">
              {language === 'km' ? 'ការណែនាំសុវត្ថិភាពសម្រាប់ Link (Safe Advice for Links)' : 'Safe Advice for Links'}
            </span>
            <ul className="space-y-2">
              {((language === 'km' ? link_analysis.linkSafeAdviceKm : link_analysis.linkSafeAdviceEn) || []).map((advice, idx) => (
                <li key={idx} className="text-xs text-gray-600 flex items-start space-x-2">
                  <span className="text-green-600 shrink-0 mt-0.5">✔</span>
                  <span className="leading-relaxed">{advice}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Why it may be risky (Bullet points) */}
      {currentReasons && currentReasons.length > 0 && (
        <div id="reasons-box" className="bg-white rounded-3xl border-2 border-gray-200 p-5 sm:p-6 mb-6 shadow-sm">
          <h4 className="text-sm font-bold text-[#0F172A] mb-3 flex items-center space-x-2">
            <span className="text-red-600 font-bold">❓</span>
            <span>
              {language === 'km' ? 'ហេតុអ្វីវាគួរឱ្យប្រុងប្រយ័ត្ន៖' : 'Why it may be risky:'}
            </span>
          </h4>
          <ul id="reasons-bullet-list" className="space-y-3">
            {currentReasons.map((reason, idx) => (
              <li key={idx} id={`reason-item-${idx}`} className="text-xs md:text-sm text-gray-600 flex items-start space-x-2.5">
                <span className="text-red-500 mt-1 shrink-0 font-bold">•</span>
                <span className="leading-relaxed text-justify">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* What you should do now (Safe next steps) */}
      {currentSafeSteps && currentSafeSteps.length > 0 && (
        <div id="steps-box" className="bg-white rounded-3xl border-2 border-gray-200 p-5 sm:p-6 mb-6 shadow-sm">
          <h4 className="text-sm font-bold text-[#0F172A] mb-3 flex items-center space-x-2">
            <span className="text-green-600 font-bold">✅</span>
            <span>
              {language === 'km' ? 'អ្វីដែលអ្នកគួរធ្វើឥឡូវនេះ៖' : 'What you should do now:'}
            </span>
          </h4>
          <ul id="steps-bullet-list" className="space-y-3">
            {currentSafeSteps.map((step, idx) => (
              <li key={idx} id={`step-item-${idx}`} className="bg-green-50/20 border border-green-100 p-4 rounded-2xl text-xs md:text-sm text-gray-700 flex items-start space-x-3.5">
                <span className="bg-green-700 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed font-semibold text-justify">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      {currentDisclaimer && (
        <div id="disclaimer-alert" className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start space-x-2.5 mb-6 shadow-sm">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">
              {language === 'km' ? 'សេចក្តីប្រកាសមិនទទួលខុសត្រូវ៖' : 'Disclaimer Guideline:'}
            </strong>
            <span className="leading-relaxed">
              {currentDisclaimer}
            </span>
          </div>
        </div>
      )}

      {/* Interaction Actions */}
      <div id="result-interactive-controls" className="flex flex-col sm:flex-row gap-4 border-t border-gray-200 pt-6">
        {/* Buttons: Check Another and Emergency Help */}
        <button
          id="btn-check-another"
          type="button"
          onClick={onBack}
          className="flex-1 bg-white hover:bg-slate-50 text-[#0F172A] border-2 border-gray-200 font-bold text-sm py-4 px-6 rounded-2xl shadow-md transition-all text-center cursor-pointer active:scale-95"
        >
          {language === 'km' ? 'ឆែកសារម្តងទៀត' : 'Check Another'}
        </button>

        <button
          id="btn-emergency-help-redirect"
          type="button"
          onClick={onGoToEmergency}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white border-2 border-red-600 font-bold text-sm py-4 px-6 rounded-2xl shadow-md transition-all text-center cursor-pointer active:scale-95"
        >
          {language === 'km' ? 'សង្គ្រោះបន្ទាន់' : 'Emergency Help'}
        </button>
      </div>

      {/* Accuracy Feedback Module */}
      <div id="accuracy-feedback-module" className="mt-6 bg-white border-2 border-gray-200 rounded-3xl p-5 shadow-sm">
        {feedbackStage === 'done' ? (
          <div className="text-center py-2">
            <span className="text-xs font-bold text-[#0F172A] flex items-center justify-center space-x-1.5 leading-relaxed">
              <span className="text-lg">✨</span>
              <span>
                {language === 'km'
                  ? 'អរគុណ មតិយោបល់របស់អ្នកត្រូវបានរក្សាទុក។'
                  : 'Thanks, your feedback was saved.'}
              </span>
            </span>
          </div>
        ) : (
          <div className="w-full">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest block mb-3 text-center font-mono">
              {language === 'km' ? 'តើលទ្ធផលនេះត្រឹមត្រូវទេ?' : 'Was this result correct?'}
            </span>

            {/* Correct / Not correct buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                id="btn-feedback-correct"
                type="button"
                onClick={handleSubmitCorrect}
                disabled={submittingFeedback || feedbackStage === 'comment'}
                className="flex items-center space-x-1.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 active:scale-95"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{language === 'km' ? 'ត្រឹមត្រូវ' : 'Correct'}</span>
              </button>
              <button
                id="btn-feedback-incorrect"
                type="button"
                onClick={handleChooseNotCorrect}
                disabled={submittingFeedback}
                className={`flex items-center space-x-1.5 border px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 active:scale-95 ${
                  feedbackStage === 'comment'
                    ? 'bg-red-100 border-red-300 text-red-700 ring-2 ring-red-200'
                    : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>{language === 'km' ? 'មិនត្រឹមត្រូវ' : 'Not correct'}</span>
              </button>
            </div>

            {/* Error message — form stays usable so the user can retry */}
            {feedbackError && (
              <p
                id="feedback-error-msg"
                className="mt-3 text-center text-xs text-red-600 font-bold flex items-center justify-center space-x-1.5"
              >
                <span>⚠️</span>
                <span>{feedbackError}</span>
              </p>
            )}

            {/* Optional comment box (only after "Not correct") */}
            {feedbackStage === 'comment' && (
              <div id="feedback-comment-box" className="mt-4 border-t border-gray-100 pt-4">
                <label className="block text-xs font-bold text-[#0F172A] mb-2">
                  {language === 'km'
                    ? 'ប្រាប់យើងថាផ្នែកណាដែលមិនត្រឹមត្រូវ (ស្រេចចិត្ត)'
                    : 'Tell us what was wrong (optional)'}
                </label>
                <textarea
                  id="feedback-comment-input"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  rows={3}
                  maxLength={500}
                  disabled={submittingFeedback}
                  placeholder={
                    language === 'km'
                      ? 'ឧ. នេះមិនមែនជាការបោកប្រាស់ទេ វាជាសារពីធនាគារពិតប្រាកដ...'
                      : 'e.g. This is not a scam, it was a real message from my bank...'
                  }
                  className="w-full border-2 border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-brand-blue transition resize-none disabled:opacity-50"
                />
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                  {language === 'km'
                    ? 'កុំដាក់ OTP ពាក្យសម្ងាត់ PIN លេខអត្តសញ្ញាណ ឬព័ត៌មានធនាគារ។'
                    : 'Do not include OTP, password, PIN, ID number, or bank details.'}
                </p>
                <button
                  id="btn-submit-feedback"
                  type="button"
                  onClick={handleSubmitNotCorrect}
                  disabled={submittingFeedback}
                  className="w-full mt-3 bg-brand-blue hover:bg-[#1E293B] disabled:bg-gray-300 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {submittingFeedback ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>{language === 'km' ? 'កំពុងផ្ញើ...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <span>{language === 'km' ? 'ផ្ញើ Feedback' : 'Submit Feedback'}</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
