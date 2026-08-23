/**
 * Centralised API base URL.
 *
 * In production (Vercel) set NEXT_PUBLIC_API_BASE to your deployed
 * backend URL, e.g.  https://eduhub-for-production.onrender.com
 *
 * Locally it falls back to http://localhost:5000.
 */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
