import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck, Lock, Loader2, AlertCircle, LogOut, Flag, MessageSquare, BarChart3,
} from 'lucide-react';
import { getConvexClient, convexQueryOnce, adminEmail } from '../lib/convex';
import { PASSCODE_KEY, isUnauthorized, AdminTab } from './admin/adminShared';
import ReportsPanel from './admin/ReportsPanel';
import FeedbackPanel from './admin/FeedbackPanel';
import InsightsPanel from './admin/InsightsPanel';

/**
 * Single admin console that owns the passcode gate ONCE and switches between
 * Reports / Feedback / Insights panels IN-APP (no page reload, no re-verify).
 *
 * Routes /admin/reports, /admin/feedback, /admin/insights all render this with
 * the matching initial tab. Switching tabs updates the URL via
 * history.replaceState so deep links and the address bar stay correct, while
 * the unlocked session is kept in memory for instant navigation.
 *
 * SECURITY: the passcode is verified SERVER-SIDE on every Convex call
 * (convex/admin.ts → requireAdmin). The browser holds no trusted secret.
 */

const TAB_META: Record<AdminTab, { label: string; title: string; path: string; Icon: typeof Flag }> = {
  reports: { label: 'Reports', title: 'Scam Reports', path: '/admin/reports', Icon: Flag },
  feedback: { label: 'Feedback', title: 'Feedback', path: '/admin/feedback', Icon: MessageSquare },
  insights: { label: 'Insights', title: 'Insights', path: '/admin/insights', Icon: BarChart3 },
};

const TAB_ORDER: AdminTab[] = ['reports', 'feedback', 'insights'];

export default function AdminConsole({ initialTab = 'reports' }: { initialTab?: AdminTab }) {
  const client = getConvexClient();

  const [unlocked, setUnlocked] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [restoring, setRestoring] = useState<boolean>(
    () => Boolean(sessionStorage.getItem(PASSCODE_KEY))
  );

  const [tab, setTab] = useState<AdminTab>(initialTab);

  // The verified passcode for the session, surfaced as state so panels re-load
  // when it becomes available.
  const [passcode, setPasscode] = useState<string>('');
  const passcodeRef = useRef<string>('');

  // ── Session lock ────────────────────────────────────────────────────────
  const lockOut = useCallback((message: string) => {
    sessionStorage.removeItem(PASSCODE_KEY);
    passcodeRef.current = '';
    setPasscode('');
    setUnlocked(false);
    setAuthError(message);
  }, []);

  const onSessionExpired = useCallback(() => {
    lockOut('Admin session expired or passcode is incorrect.');
  }, [lockOut]);

  // ── Restore a saved session by verifying the stored passcode once ─────────
  useEffect(() => {
    const stored = sessionStorage.getItem(PASSCODE_KEY);
    if (!stored || !client) {
      setRestoring(false);
      return;
    }
    (async () => {
      try {
        // Lightweight verification call; panels load their own data afterwards.
        await convexQueryOnce(client, 'queries:adminGetReports', { adminPasscode: stored });
        passcodeRef.current = stored;
        setPasscode(stored);
        setUnlocked(true);
      } catch (err) {
        console.error(err);
        if (isUnauthorized(err)) {
          lockOut('Admin session expired or passcode is incorrect.');
        } else {
          // Connection issue — trust the stored passcode so the user can retry.
          passcodeRef.current = stored;
          setPasscode(stored);
          setUnlocked(true);
        }
      } finally {
        setRestoring(false);
      }
    })();
  }, [client, lockOut]);

  // ── Keep the URL in sync with the active tab (no reload) ──────────────────
  const selectTab = useCallback((next: AdminTab) => {
    setTab(next);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', TAB_META[next].path);
    }
  }, []);

  // ── Passcode gate (verified server-side) ──────────────────────────────────
  const handleUnlock = async () => {
    setAuthError('');
    if (!client) {
      setAuthError('Convex is not configured. Set VITE_CONVEX_URL in your .env file.');
      return;
    }
    if (!passcodeInput) {
      setAuthError('Please enter the admin passcode.');
      return;
    }
    setVerifying(true);
    try {
      await convexQueryOnce(client, 'queries:adminGetReports', { adminPasscode: passcodeInput });
      passcodeRef.current = passcodeInput;
      sessionStorage.setItem(PASSCODE_KEY, passcodeInput);
      setPasscode(passcodeInput);
      setUnlocked(true);
      setPasscodeInput('');
    } catch (err) {
      console.error(err);
      if (isUnauthorized(err)) {
        setAuthError('Incorrect passcode.');
      } else {
        setAuthError('Could not verify passcode. Check your Convex connection.');
      }
    } finally {
      setVerifying(false);
    }
  };

  // ── Loader while restoring a saved session ────────────────────────────────
  if (!unlocked && restoring) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <p className="text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // ── Passcode screen ───────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center bg-brand-blue text-white p-3 rounded-2xl mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-[#0F172A]">Admin Access</h1>
            <p className="text-xs text-gray-500 mt-1">ScamCheck KH — Review Console</p>
          </div>

          <label htmlFor="admin-passcode" className="block text-sm font-bold text-[#0F172A] mb-2">
            Admin Passcode
          </label>
          <input
            id="admin-passcode"
            type="password"
            value={passcodeInput}
            onChange={(e) => setPasscodeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !verifying && handleUnlock()}
            placeholder="Enter passcode"
            disabled={verifying}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue transition disabled:opacity-50"
          />

          {authError && (
            <p className="text-xs text-red-600 font-bold mt-2 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{authError}</span>
            </p>
          )}

          <button
            onClick={handleUnlock}
            disabled={verifying}
            className="w-full mt-4 bg-brand-blue hover:bg-[#1E293B] disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Unlock</span>
            )}
          </button>

          <p className="text-[10px] text-gray-400 mt-4 leading-relaxed text-center">
            Passcode is verified securely on the Convex server.
            {adminEmail ? ` Admin: ${adminEmail}` : ''}
          </p>

          <a href="/" className="block text-center text-xs text-gray-400 hover:text-brand-blue mt-3 font-medium">
            ← Back to ScamCheck KH
          </a>
        </div>
      </div>
    );
  }

  // ── Unlocked console ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-brand-blue text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-white p-1.5 rounded-xl text-brand-blue">
              <ShieldCheck className="w-5 h-5 stroke-[2.5px]" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Admin · {TAB_META[tab].title}</h1>
              <p className="text-[10px] text-kh-gold font-medium">ScamCheck KH Review Console</p>
            </div>
          </div>
          <button
            onClick={() => lockOut('')}
            className="flex items-center space-x-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* In-app sub-nav (instant tab switch, no reload) */}
      <div className="bg-white border-b border-gray-200">
        <div
          className="max-w-5xl mx-auto px-2 sm:px-4 flex items-center gap-1 overflow-x-auto no-scrollbar"
          role="tablist"
          aria-label="Admin sections"
        >
          {TAB_ORDER.map((id) => {
            const { label, Icon } = TAB_META[id];
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectTab(id)}
                className={`flex items-center space-x-1.5 shrink-0 whitespace-nowrap px-3 sm:px-4 py-3 min-h-[44px] text-xs font-bold border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
                  active
                    ? 'text-brand-blue border-brand-blue'
                    : 'text-gray-500 hover:text-brand-blue border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active panel — keyed so each tab loads its own fresh data */}
      {client && tab === 'reports' && (
        <ReportsPanel client={client} passcode={passcode} onSessionExpired={onSessionExpired} />
      )}
      {client && tab === 'feedback' && (
        <FeedbackPanel client={client} passcode={passcode} onSessionExpired={onSessionExpired} />
      )}
      {client && tab === 'insights' && (
        <InsightsPanel client={client} passcode={passcode} onSessionExpired={onSessionExpired} />
      )}
    </div>
  );
}
