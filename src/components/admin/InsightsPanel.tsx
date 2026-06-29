import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, AlertCircle, Flag, MessageSquare, BarChart3, ThumbsDown } from 'lucide-react';
import type { ConvexClient } from 'convex/browser';
import { convexQueryOnce } from '../../lib/convex';
import { isUnauthorized, riskBadge, formatDate } from './adminShared';

interface ScamTypeCount { type: string; count: number; }
interface SignalCount { signal: string; count: number; }
interface IncorrectFeedbackItem {
  _id: string;
  detectedType: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  inputPreview: string;
  comment: string;
  createdAt: number;
}
interface Insights {
  totalReports: number;
  newReports: number;
  reviewingReports: number;
  resolvedReports: number;
  totalFeedback: number;
  correctFeedback: number;
  incorrectFeedback: number;
  mostCommonScamTypes: ScamTypeCount[];
  mostCommonWarningSignals: SignalCount[];
  recentIncorrectFeedback: IncorrectFeedbackItem[];
}

interface Props {
  client: ConvexClient;
  passcode: string;
  onSessionExpired: () => void;
}

/** Small reusable stat card. */
function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: 'slate' | 'amber' | 'blue' | 'green' | 'red';
}) {
  const tones: Record<string, string> = {
    slate: 'bg-white border-gray-200 text-gray-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    blue: 'bg-blue-50 border-blue-200 text-brand-blue',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };
  return (
    <div className={`rounded-2xl border shadow-sm p-4 text-center ${tones[tone]}`}>
      <div className="text-2xl font-black leading-none">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider mt-1.5 opacity-80">{label}</div>
    </div>
  );
}

export default function InsightsPanel({ client, passcode, onSessionExpired }: Props) {
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const result = (await convexQueryOnce(client, 'queries:adminGetInsights', {
        adminPasscode: passcode,
      })) as Insights;
      setData(result);
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

  const incorrectPct =
    data && data.totalFeedback > 0
      ? Math.round((data.incorrectFeedback / data.totalFeedback) * 100)
      : 0;

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex justify-end mb-5">
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

      {loading && !data ? (
        <div className="text-center py-16 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading insights...</p>
        </div>
      ) : !data ? (
        <div className="text-center py-16 text-gray-400">
          <BarChart3 className="w-8 h-8 mx-auto mb-3" />
          <p className="text-sm">Not enough data yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Reports Summary */}
          <section>
            <h2 className="text-sm font-black text-[#0F172A] mb-3 flex items-center space-x-2">
              <Flag className="w-4 h-4 text-brand-blue" />
              <span>Reports Summary</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total" value={data.totalReports} tone="slate" />
              <StatCard label="New" value={data.newReports} tone="amber" />
              <StatCard label="Reviewing" value={data.reviewingReports} tone="blue" />
              <StatCard label="Resolved" value={data.resolvedReports} tone="green" />
            </div>
          </section>

          {/* Section 2: Feedback Summary */}
          <section>
            <h2 className="text-sm font-black text-[#0F172A] mb-3 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-brand-blue" />
              <span>Feedback Summary</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total" value={data.totalFeedback} tone="slate" />
              <StatCard label="Correct" value={data.correctFeedback} tone="green" />
              <StatCard label="Not correct" value={data.incorrectFeedback} tone="red" />
              <StatCard label="Incorrect %" value={`${incorrectPct}%`} tone="amber" />
            </div>
          </section>

          {/* Section 3: Most Common Scam Types */}
          <section>
            <h2 className="text-sm font-black text-[#0F172A] mb-3">Most Common Scam Types</h2>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
              {data.mostCommonScamTypes.length === 0 ? (
                <p className="text-xs text-gray-400 p-4">No data yet.</p>
              ) : (
                data.mostCommonScamTypes.map((t, i) => (
                  <div key={t.type} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-[10px] font-bold text-gray-400 w-4 shrink-0">{i + 1}.</span>
                      <span className="text-xs font-bold text-[#0F172A] truncate">{t.type}</span>
                    </div>
                    <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2.5 py-1 rounded-lg shrink-0">{t.count}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Section 4: Most Common Warning Signals */}
          <section>
            <h2 className="text-sm font-black text-[#0F172A] mb-3">Most Common Warning Signals</h2>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              {data.mostCommonWarningSignals.length === 0 ? (
                <p className="text-xs text-gray-400">No data yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.mostCommonWarningSignals.map((s) => (
                    <span key={s.signal} className="inline-flex items-center space-x-1.5 text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg">
                      <span>{s.signal}</span>
                      <span className="text-brand-blue bg-white px-1.5 rounded">{s.count}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Section 5: Recent Incorrect Feedback */}
          <section>
            <h2 className="text-sm font-black text-[#0F172A] mb-3 flex items-center space-x-2">
              <ThumbsDown className="w-4 h-4 text-red-500" />
              <span>Recent Incorrect Feedback</span>
            </h2>
            {data.recentIncorrectFeedback.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <p className="text-xs text-gray-400">No incorrect feedback yet. 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentIncorrectFeedback.map((f) => (
                  <div key={f._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
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

                    {f.comment && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-2">
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                          <span className="font-bold">User note: </span>
                          {f.comment}
                        </p>
                      </div>
                    )}

                    <p className="text-[10px] text-gray-400">🕐 {formatDate(f.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <p className="text-[10px] text-gray-400 mt-6 text-center leading-relaxed">
        Insights use only sanitized previews and comments. OTP, passwords, PINs,
        ID numbers, and bank details are never stored or shown.
      </p>
    </main>
  );
}
