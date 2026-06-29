import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, Trash2, Eye, CheckCircle2, AlertCircle, Flag } from 'lucide-react';
import type { ConvexClient } from 'convex/browser';
import { convexQueryOnce, convexMutateAwait } from '../../lib/convex';
import { isUnauthorized, statusStyle, formatDate } from './adminShared';

interface AdminReport {
  _id: string;
  _creationTime: number;
  scamType: string;
  platform: string;
  descriptionPreview: string;
  contact?: string;
  status: string;
  createdAt: number;
}

type ReportStatus = 'new' | 'reviewing' | 'resolved';

interface Props {
  client: ConvexClient;
  passcode: string;
  onSessionExpired: () => void;
}

export default function ReportsPanel({ client, passcode, onSessionExpired }: Props) {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = (await convexQueryOnce(client, 'queries:adminGetReports', {
        adminPasscode: passcode,
      })) as AdminReport[];
      setReports(Array.isArray(data) ? data : []);
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

  const updateStatus = async (id: string, status: ReportStatus) => {
    setBusyId(id);
    try {
      await convexMutateAwait(client, 'mutations:updateReportStatus', {
        adminPasscode: passcode,
        id,
        status,
      });
      setReports((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    } catch (err) {
      console.error(err);
      if (isUnauthorized(err)) onSessionExpired();
      else setLoadError('Could not save. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const removeReport = async (id: string) => {
    if (!window.confirm('Delete this report permanently? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await convexMutateAwait(client, 'mutations:deleteReport', {
        adminPasscode: passcode,
        id,
      });
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      if (isUnauthorized(err)) onSessionExpired();
      else setLoadError('Could not save. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const counts = {
    total: reports.length,
    new: reports.filter((r) => r.status === 'new').length,
    reviewing: reports.filter((r) => r.status === 'reviewing').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      {/* Summary + refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-600">Total: {counts.total}</span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">New: {counts.new}</span>
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-brand-blue">Reviewing: {counts.reviewing}</span>
          <span className="px-3 py-1.5 rounded-xl bg-green-50 border border-green-200 text-green-700">Resolved: {counts.resolved}</span>
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

      {loading && reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center bg-slate-100 p-4 rounded-3xl mb-4">
            <Flag className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A] mb-1">No reports yet.</h3>
          <p className="text-xs text-gray-500">Submitted scam reports will appear here.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-bold">Scam Type</th>
                  <th className="px-4 py-3 font-bold">Platform</th>
                  <th className="px-4 py-3 font-bold">Description Preview</th>
                  <th className="px-4 py-3 font-bold">Contact</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Created</th>
                  <th className="px-4 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((r) => {
                  const st = statusStyle(r.status);
                  const isBusy = busyId === r._id;
                  return (
                    <tr key={r._id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-bold text-[#0F172A] align-top whitespace-nowrap">{r.scamType}</td>
                      <td className="px-4 py-3 text-gray-600 align-top whitespace-nowrap">{r.platform}</td>
                      <td className="px-4 py-3 text-gray-700 align-top max-w-xs">{r.descriptionPreview}</td>
                      <td className="px-4 py-3 text-gray-500 align-top whitespace-nowrap">{r.contact || '—'}</td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-block px-2.5 py-1 rounded-full font-bold ${st.badge}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 align-top whitespace-nowrap">{formatDate(r.createdAt || r._creationTime)}</td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => updateStatus(r._id, 'reviewing')}
                            disabled={isBusy || r.status === 'reviewing'}
                            title="Mark as reviewing"
                            aria-label="Mark report as reviewing"
                            className="p-1.5 rounded-lg text-brand-blue hover:bg-blue-50 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(r._id, 'resolved')}
                            disabled={isBusy || r.status === 'resolved'}
                            title="Mark as resolved"
                            aria-label="Mark report as resolved"
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeReport(r._id)}
                            disabled={isBusy}
                            title="Delete report"
                            aria-label="Delete report"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-colors"
                          >
                            {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {reports.map((r) => {
              const st = statusStyle(r.status);
              const isBusy = busyId === r._id;
              return (
                <div key={r._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[#0F172A] truncate">{r.scamType}</h3>
                      <p className="text-[11px] text-gray-500">{r.platform}</p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold ${st.badge}`}>{st.label}</span>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed mb-2">{r.descriptionPreview}</p>

                  {r.contact && (
                    <p className="text-[11px] text-gray-500 mb-2">
                      <span className="font-bold">Contact:</span> {r.contact}
                    </p>
                  )}

                  <p className="text-[10px] text-gray-400 mb-3">🕐 {formatDate(r.createdAt || r._creationTime)}</p>

                  <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                    <button
                      onClick={() => updateStatus(r._id, 'reviewing')}
                      disabled={isBusy || r.status === 'reviewing'}
                      className="flex-1 flex items-center justify-center space-x-1 text-[11px] font-bold text-brand-blue bg-blue-50 py-2 rounded-lg disabled:opacity-30"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Reviewing</span>
                    </button>
                    <button
                      onClick={() => updateStatus(r._id, 'resolved')}
                      disabled={isBusy || r.status === 'resolved'}
                      className="flex-1 flex items-center justify-center space-x-1 text-[11px] font-bold text-green-700 bg-green-50 py-2 rounded-lg disabled:opacity-30"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </button>
                    <button
                      onClick={() => removeReport(r._id)}
                      disabled={isBusy}
                      aria-label="Delete report"
                      className="flex items-center justify-center text-red-500 bg-red-50 px-3 py-2 rounded-lg disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                      {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <p className="text-[10px] text-gray-400 mt-6 text-center leading-relaxed">
        Reports contain only sanitized previews. OTP, passwords, PINs, ID numbers,
        and bank details are never stored or shown.
      </p>
    </main>
  );
}
