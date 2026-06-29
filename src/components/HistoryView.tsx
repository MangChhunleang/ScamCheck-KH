import React, { useState, useEffect } from 'react';
import { Clock, Trash2, AlertTriangle, ShieldCheck, RotateCcw, Shield } from 'lucide-react';
import { Language, LocalHistoryItem, LOCAL_HISTORY_KEY } from '../types';

interface HistoryViewProps {
  language: Language;
  onCheckNow: () => void;
}

export default function HistoryView({ language, onCheckNow }: HistoryViewProps) {
  const [history, setHistory] = useState<LocalHistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
      if (raw) {
        const parsed: LocalHistoryItem[] = JSON.parse(raw);
        // Sort newest first
        parsed.sort((a, b) => b.createdAt - a.createdAt);
        setHistory(parsed);
      }
    } catch {
      setHistory([]);
    }
  };

  const deleteItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated));
  };

  const clearAll = () => {
    setHistory([]);
    localStorage.removeItem(LOCAL_HISTORY_KEY);
  };

  const formatDate = (ts: number): string => {
    const d = new Date(ts);
    return d.toLocaleDateString('km-KH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRiskStyle = (level: 'Low' | 'Medium' | 'High') => {
    switch (level) {
      case 'High':
        return {
          badge: 'bg-red-100 text-red-700 border border-red-200',
          border: 'border-l-red-500',
          icon: AlertTriangle,
          label: language === 'km' ? 'ហានិភ័យខ្ពស់' : 'High Risk',
        };
      case 'Medium':
        return {
          badge: 'bg-amber-100 text-amber-700 border border-amber-200',
          border: 'border-l-amber-500',
          icon: AlertTriangle,
          label: language === 'km' ? 'ហានិភ័យមធ្យម' : 'Medium Risk',
        };
      default:
        return {
          badge: 'bg-green-100 text-green-700 border border-green-200',
          border: 'border-l-green-500',
          icon: ShieldCheck,
          label: language === 'km' ? 'ហានិភ័យទាប' : 'Low Risk',
        };
    }
  };

  return (
    <div id="history-view-container" className="max-w-3xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#0F172A]">
            {language === 'km' ? 'ប្រវត្តិពិនិត្យ' : 'Recent Checks'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {language === 'km'
              ? 'រក្សាទុកតែនៅលើឧបករណ៍នេះប៉ុណ្ណោះ — ឯកជនភ័ព្ទ ១០០%'
              : 'Stored only on this device — 100% private'}
          </p>
        </div>
        <div className="flex items-center bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
          <Shield className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
          <span className="text-[10px] font-bold text-amber-700 uppercase">
            {language === 'km' ? 'ទិន្នន័យឯកជន' : 'Private'}
          </span>
        </div>
      </div>

      {history.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center bg-slate-100 p-4 rounded-3xl mb-4">
            <Clock className="w-8 h-8 text-slate-400 stroke-[1.8px]" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A] mb-2">
            {language === 'km' ? 'មិនទាន់មានប្រវត្តិពិនិត្យទេ។' : 'No recent checks yet.'}
          </h3>
          <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">
            {language === 'km'
              ? 'ពិនិត្យសារគួរឱ្យសង្ស័យ ហើយប្រវត្តិរបស់អ្នកនឹងបង្ហាញនៅទីនេះ។'
              : 'Check a suspicious message and your history will appear here.'}
          </p>
          <button
            onClick={onCheckNow}
            className="bg-brand-blue text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#1E293B] transition-all"
          >
            {language === 'km' ? 'ពិនិត្យឥឡូវនេះ' : 'Check Now'}
          </button>
        </div>
      ) : (
        <>
          {/* Clear all button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={clearAll}
              aria-label={language === 'km' ? 'លុបប្រវត្តិទាំងអស់' : 'Clear all history'}
              className="flex items-center space-x-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'លុបប្រវត្តិទាំងអស់' : 'Clear All'}</span>
            </button>
          </div>

          {/* History cards */}
          <div className="space-y-3">
            {history.map((item) => {
              const style = getRiskStyle(item.riskLevel);
              const RiskIcon = style.icon;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border-2 border-l-4 border-gray-200 ${style.border} p-4 shadow-sm`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Risk badge + type */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${style.badge}`}>
                          <RiskIcon className="w-3 h-3" />
                          <span>{style.label}</span>
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[160px]">
                          {item.detectedType}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                          {item.riskScore}/100
                        </span>
                      </div>

                      {/* Preview text */}
                      <p className="text-xs text-gray-700 font-medium leading-relaxed line-clamp-2 mb-2">
                        {item.inputPreview}
                      </p>

                      {/* Detected signals (up to 3) */}
                      {item.detectedSignals.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.detectedSignals.slice(0, 3).map((sig, i) => (
                            <span
                              key={i}
                              className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                            >
                              {sig}
                            </span>
                          ))}
                          {item.detectedSignals.length > 3 && (
                            <span className="text-[9px] font-bold text-slate-400 px-1 py-0.5">
                              +{item.detectedSignals.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Date */}
                      <span className="text-[10px] text-gray-400 font-medium">
                        🕐 {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => deleteItem(item.id)}
                      aria-label={language === 'km' ? 'លុបធាតុនេះ' : 'Delete this item'}
                      className="shrink-0 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-xl transition-all cursor-pointer"
                      title={language === 'km' ? 'លុប' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Privacy note at bottom */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
            <strong className="block font-bold mb-1">
              {language === 'km' ? 'ឯកជនភ័ព្ទ:' : 'Privacy:'}
            </strong>
            {language === 'km'
              ? 'ប្រវត្តិទាំងនេះត្រូវបានរក្សាទុកតែនៅក្នុងឧបករណ៍របស់អ្នកផ្ទាល់ប៉ុណ្ណោះ។ គ្មានខ្លឹមសារសារពេញទំហឹង OTP ពាក្យសម្ងាត់ ឬ PIN ត្រូវបានរក្សាទុកឡើយ។'
              : 'This history is stored only on your device. No full message content, OTP, password, or PIN is ever saved.'}
          </div>
        </>
      )}
    </div>
  );
}
