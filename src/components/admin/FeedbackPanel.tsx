import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, AlertCircle, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import type { ConvexClient } from 'convex/browser';
import { convexQueryOnce } from '../../lib/convex';
import { isUnauthorized, riskBadge, formatDate } from './adminShared';

interface AdminFeedback {
  _id: string;
  _creationTime: number;
  scamCheckId?: string;
  inputPreview?: string;
  detectedType: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  detectedSignals?: string[];
  isCorrect: boolean;
  comment?: string;
  createdAt: number;
}

interface Props {
  client: ConvexClient;
  passcode: string;
  onSessionExpired: () => void;
}

export default function FeedbackPanel({ client, passcode, onSessionExpired }: Props) {
  const [items, setItems] = useState<AdminFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = (await convexQueryOnce(client, 'queries:adminGetFeedback', {
        adminPasscode: passcode,
      })) as AdminFeedback[];
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      if (isUnauthorized(err)) onSessionExpired();
      else setLoadError('Could not load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [client, passcode, onSessionExpired]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = {
    total: items.length,
    correct: items.filter((f) => f.isCorrect).length,
    incorrect: items.filter((f) => !f.isCorrect).length,
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      {/* Summary + refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-600">Total: {counts.total}</span>
          <span className="px-3 py-1.5 rounded-xl bg-green-50 border border-green-200 text-green-700">Correct: {counts.correct}</span>
          <span className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700">Not correct: {counts.incorrect}</span>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center space-x-1.5 text-xs font-bold text-brand-blue bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loadError && (
        <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{loadError}</span>
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading feedback...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center bg-slate-100 p-4 rounded-3xl mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A] mb-1">No feedback yet.</h3>
          <p className="text-xs text-gray-500">User feedback on scan results will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <div key={f._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {f.isCorrect ? (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                    <ThumbsUp className="w-3 h-3" />
                    <span>Correct</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                    <ThumbsDown className="w-3 h-3" />
                    <span>Not correct</span>
                  </span>
                )}
                <span className="text-[11px] font-bold text-[#0F172A] bg-gray-100 px-2 py-0.5 rounded-md">{f.detectedType}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${riskBadge(f.riskLevel)}`}>{f.riskLevel}</span>
                <span className="text-[10px] font-bold text-gray-400">{f.riskScore}/100</span>
              </div>

              {f.inputPreview && (
                <p className="text-xs text-gray-700 leading-relaxed mb-2">
                  <span className="font-bold text-gray-500">Preview: </span>
                  {f.inputPreview}
                </p>
              )}

              {f.detectedSignals && f.detectedSignals.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {f.detectedSignals.map((sig, i) => (
                    <span key={i} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      {sig}
                    </span>
                  ))}
                </div>
              )}

              {f.comment && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-2">
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    <span className="font-bold">User note: </span>
                    {f.comment}
                  </p>
                </div>
              )}

              <p className="text-[10px] text-gray-400">🕐 {formatDate(f.createdAt || f._creationTime)}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-gray-400 mt-6 text-center leading-relaxed">
        Feedback contains only sanitized previews. OTP, passwords, PINs, ID numbers,
        and bank details are never stored or shown.
      </p>
    </main>
  );
}
