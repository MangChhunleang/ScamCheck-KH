/**
 * Shared helpers for the admin console panels.
 *
 * SECURITY: The passcode entered in the console is verified SERVER-SIDE by
 * Convex (convex/admin.ts → requireAdmin) on every call. The browser holds no
 * trusted secret.
 */

export const PASSCODE_KEY = 'scamcheck_admin_passcode';

export type AdminTab = 'reports' | 'feedback' | 'insights';

/** Detects the server-side UNAUTHORIZED error thrown by requireAdmin(). */
export function isUnauthorized(err: unknown): boolean {
  return err instanceof Error && err.message.includes('UNAUTHORIZED');
}

export function formatDate(ts: number): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Badge styling for report status. */
export function statusStyle(status: string): { badge: string; label: string } {
  switch (status) {
    case 'reviewing':
      return { badge: 'bg-blue-100 text-brand-blue border border-blue-200', label: 'Reviewing' };
    case 'resolved':
      return { badge: 'bg-green-100 text-green-700 border border-green-200', label: 'Resolved' };
    case 'new':
    default:
      return { badge: 'bg-amber-100 text-amber-700 border border-amber-200', label: 'New' };
  }
}

/** Badge styling for risk level. */
export function riskBadge(level: string): string {
  switch (level) {
    case 'High':
      return 'bg-red-100 text-red-700 border border-red-200';
    case 'Medium':
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    default:
      return 'bg-green-100 text-green-700 border border-green-200';
  }
}
