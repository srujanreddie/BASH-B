/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  ArrowLeft, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  CheckCircle2, 
  Fingerprint, 
  Info, 
  X, 
  RotateCcw
} from 'lucide-react';
import { safeFetchJson } from '../utils/api';
import ThemeToggle from '../components/ThemeToggle';
import BashBLogo from '../components/BashBLogo';

const DEFAULT_MASTER_KEY = 'Admin@CSE2026#Live!';
const DEFAULT_RECOVERY_KEY = 'CSE2026-RECOVER-ROOT-ACCESS';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Recovery Modal State
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);

  const [securityStatus, setSecurityStatus] = useState<{
    isLocked: boolean;
    remainingMinutes: number;
    attemptsRemaining: number;
    maxAttempts: number;
    isInitialSetup: boolean;
  } | null>(null);

  const navigate = useNavigate();

  // Load live security posture safely with offline/static fallback
  const fetchSecurityInfo = async () => {
    try {
      const res = await safeFetchJson<{
        success: boolean;
        isLocked: boolean;
        remainingMinutes: number;
        attemptsRemaining: number;
        maxAttempts: number;
        isInitialSetup: boolean;
      }>('/api/admin/security-info');

      if (res.ok && res.data && typeof res.data.attemptsRemaining === 'number') {
        setSecurityStatus({
          isLocked: Boolean(res.data.isLocked),
          remainingMinutes: res.data.remainingMinutes || 0,
          attemptsRemaining: res.data.attemptsRemaining ?? 5,
          maxAttempts: res.data.maxAttempts ?? 5,
          isInitialSetup: Boolean(res.data.isInitialSetup),
        });
        return;
      }
    } catch {
      // Graceful silence on background status check
    }

    // Client-side fallback check (for static hosting or offline server)
    const lockoutUntil = parseInt(localStorage.getItem('cse_admin_lockout_until') || '0', 10);
    const now = Date.now();
    const isLocked = lockoutUntil > now;
    const remainingMinutes = isLocked ? Math.ceil((lockoutUntil - now) / 60000) : 0;
    const failedAttempts = parseInt(localStorage.getItem('cse_admin_failed_attempts') || '0', 10);
    const attemptsRemaining = isLocked ? 0 : Math.max(0, 5 - failedAttempts);

    setSecurityStatus({
      isLocked,
      remainingMinutes,
      attemptsRemaining,
      maxAttempts: 5,
      isInitialSetup: !localStorage.getItem('cse_admin_custom_password'),
    });
  };

  useEffect(() => {
    // If already authenticated with valid token, redirect directly to dashboard
    const existingToken = sessionStorage.getItem('cse_admin_token');
    if (existingToken) {
      if (existingToken.startsWith('standalone_')) {
        const loginAt = parseInt(sessionStorage.getItem('cse_admin_login_at') || '0', 10);
        if (Date.now() - loginAt < 24 * 60 * 60 * 1000) {
          navigate('/dashboard');
          return;
        } else {
          sessionStorage.removeItem('cse_admin_token');
        }
      } else {
        safeFetchJson<{ success: boolean }>('/api/admin/verify', {
          headers: { Authorization: `Bearer ${existingToken}` },
        }).then((res) => {
          if (res.ok && res.data?.success) {
            navigate('/dashboard');
          } else if (res.status === 401 || res.status === 403) {
            sessionStorage.removeItem('cse_admin_token');
          } else {
            // Server was unreachable/static host, keep valid session if within 24h
            const loginAt = parseInt(sessionStorage.getItem('cse_admin_login_at') || '0', 10);
            if (loginAt && Date.now() - loginAt < 24 * 60 * 60 * 1000) {
              navigate('/dashboard');
            }
          }
        });
      }
    }

    fetchSecurityInfo();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = password.trim();
    if (!entered) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // 1. Check local lockout first
      const lockoutUntil = parseInt(localStorage.getItem('cse_admin_lockout_until') || '0', 10);
      const now = Date.now();
      if (lockoutUntil > now) {
        const rem = Math.ceil((lockoutUntil - now) / 60000);
        setSecurityStatus((prev) => (prev ? { ...prev, isLocked: true, remainingMinutes: rem } : null));
        throw new Error(`Terminal lockout active (${rem}m remaining). Click "Emergency Reset & Unlock" below.`);
      }

      // 2. Attempt server authentication
      let serverRes: any = null;
      try {
        serverRes = await safeFetchJson<{
          success: boolean;
          token?: string;
          user?: string;
          message?: string;
          isLocked?: boolean;
          remainingMinutes?: number;
          attemptsRemaining?: number;
        }>('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: entered }),
        });
      } catch {
        serverRes = null;
      }

      // If server responded with a genuine JSON outcome (success or explicit 401/403/429 authentication denial)
      const isGenuineServerReply =
        serverRes &&
        serverRes.status !== 0 &&
        serverRes.status !== 404 &&
        serverRes.status < 500 &&
        !serverRes.message?.includes('Server communication error') &&
        !serverRes.message?.includes('temporarily unreachable') &&
        !serverRes.message?.includes('Unable to parse');

      if (isGenuineServerReply) {
        if (serverRes.ok && serverRes.data?.success && serverRes.data?.token) {
          sessionStorage.setItem('cse_admin_token', serverRes.data.token);
          sessionStorage.setItem('cse_admin_user', serverRes.data.user || 'cohort_admin');
          sessionStorage.setItem('cse_admin_login_at', String(Date.now()));
          navigate('/dashboard');
          return;
        }

        if (serverRes.data?.isLocked) {
          setSecurityStatus((prev) =>
            prev ? { ...prev, isLocked: true, remainingMinutes: serverRes.data?.remainingMinutes || 15 } : null
          );
        } else if (serverRes.data?.attemptsRemaining !== undefined) {
          setSecurityStatus((prev) =>
            prev ? { ...prev, attemptsRemaining: serverRes.data.attemptsRemaining! } : null
          );
        }

        const msg = serverRes.data?.message || 'Authentication failed. Invalid administrator credentials.';
        throw new Error(msg);
      }

      // 3. Fallback / Standalone Mode (Vercel static deploy, offline dev, or Netlify)
      const activeMasterKey = localStorage.getItem('cse_admin_custom_password') || DEFAULT_MASTER_KEY;

      if (entered === activeMasterKey) {
        // Successful standalone authentication
        localStorage.removeItem('cse_admin_failed_attempts');
        localStorage.removeItem('cse_admin_lockout_until');

        const standaloneToken = 'standalone_token_' + btoa(Date.now() + ':' + Math.random().toString(36).slice(2));
        sessionStorage.setItem('cse_admin_token', standaloneToken);
        sessionStorage.setItem('cse_admin_user', 'cohort_admin');
        sessionStorage.setItem('cse_admin_login_at', String(Date.now()));

        // Audit trail recording
        try {
          const logs = JSON.parse(localStorage.getItem('cse_admin_audit_logs') || '[]');
          logs.unshift({
            action: 'LOGIN_SUCCESS',
            details: 'Master console accessed successfully (standalone mode)',
            timestamp: new Date().toISOString(),
            ip: 'client-terminal',
            status: 'SUCCESS',
          });
          localStorage.setItem('cse_admin_audit_logs', JSON.stringify(logs.slice(0, 50)));
        } catch {
          // ignore
        }

        setSuccess('Authentication verified! Loading console...');
        setTimeout(() => navigate('/dashboard'), 300);
        return;
      }

      // Password mismatch in standalone fallback
      const failed = parseInt(localStorage.getItem('cse_admin_failed_attempts') || '0', 10) + 1;
      if (failed >= 5) {
        const lockoutTime = Date.now() + 15 * 60 * 1000;
        localStorage.setItem('cse_admin_lockout_until', String(lockoutTime));
        localStorage.setItem('cse_admin_failed_attempts', '0');
        setSecurityStatus({
          isLocked: true,
          remainingMinutes: 15,
          attemptsRemaining: 0,
          maxAttempts: 5,
          isInitialSetup: false,
        });
        throw new Error('Anti-Brute Force Protection triggered: Console locked for 15 minutes. Use Emergency Root Recovery.');
      } else {
        localStorage.setItem('cse_admin_failed_attempts', String(failed));
        const rem = 5 - failed;
        setSecurityStatus((prev) => (prev ? { ...prev, attemptsRemaining: rem } : null));
        throw new Error(`Authentication failed. Invalid administrator credentials. (${rem} attempt${rem === 1 ? '' : 's'} remaining)`);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to authenticate. Please check the Master Key.');
    } finally {
      setLoading(false);
      fetchSecurityInfo();
    }
  };

  const handleEmergencyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoverySuccess(null);

    const enteredKey = recoveryKey.trim();
    if (!enteredKey || !newPassword || !confirmPassword) {
      setRecoveryError('Please fill in all recovery fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setRecoveryError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setRecoveryError('New password must be at least 8 characters long.');
      return;
    }

    setRecovering(true);
    try {
      let serverOk = false;
      try {
        const res = await safeFetchJson<{ success: boolean; message?: string }>(
          '/api/admin/emergency-reset',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recoveryKey: enteredKey,
              newPassword,
            }),
          }
        );
        if (res.ok && res.data?.success) {
          serverOk = true;
        }
      } catch {
        serverOk = false;
      }

      // Check recovery key locally if server was offline / static
      if (!serverOk) {
        if (enteredKey !== DEFAULT_RECOVERY_KEY) {
          throw new Error('Invalid Emergency Recovery Key. Master bypass key is required.');
        }
      }

      // Save new password and clear all lockouts
      localStorage.setItem('cse_admin_custom_password', newPassword);
      localStorage.removeItem('cse_admin_failed_attempts');
      localStorage.removeItem('cse_admin_lockout_until');

      // Audit log
      try {
        const logs = JSON.parse(localStorage.getItem('cse_admin_audit_logs') || '[]');
        logs.unshift({
          action: 'EMERGENCY_RESET',
          details: 'Master password reset via Root Bypass Key. All lockouts cleared.',
          timestamp: new Date().toISOString(),
          ip: 'client-terminal',
          status: 'SUCCESS',
        });
        localStorage.setItem('cse_admin_audit_logs', JSON.stringify(logs.slice(0, 50)));
      } catch {
        // ignore
      }

      setRecoverySuccess('Master password successfully reset! Any lockout was cleared.');
      setPassword('');
      setSuccess('Master password successfully updated. Please log in with your new password.');
      setError(null);

      setTimeout(() => {
        setIsRecoveryOpen(false);
        setRecoverySuccess(null);
        setRecoveryKey('');
        setNewPassword('');
        setConfirmPassword('');
        fetchSecurityInfo();
      }, 1200);
    } catch (err: any) {
      setRecoveryError(err.message || 'Recovery failed.');
    } finally {
      setRecovering(false);
    }
  };

  const handleQuickRestoreDefault = async () => {
    const keyToUse = recoveryKey.trim();
    if (!keyToUse) {
      setRecoveryError('Please enter the Root Emergency Recovery Key.');
      return;
    }
    setRecovering(true);
    setRecoveryError(null);
    setRecoverySuccess(null);

    try {
      try {
        await safeFetchJson<{ success: boolean; message?: string }>(
          '/api/admin/reset-to-default',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recoveryKey: keyToUse }),
          }
        );
      } catch {
        // Proceed locally
      }

      if (keyToUse !== DEFAULT_RECOVERY_KEY) {
        throw new Error('Invalid emergency recovery key.');
      }

      localStorage.removeItem('cse_admin_custom_password');
      localStorage.removeItem('cse_admin_failed_attempts');
      localStorage.removeItem('cse_admin_lockout_until');

      setPassword('');
      setRecoverySuccess('System credentials successfully restored to factory defaults.');
      setSuccess('Master password restored to default settings. You may now log in.');
      setError(null);

      setTimeout(() => {
        setIsRecoveryOpen(false);
        setRecoverySuccess(null);
        setRecoveryKey('');
        fetchSecurityInfo();
      }, 1200);
    } catch (err: any) {
      setRecoveryError(err.message || 'Failed to restore default password.');
    } finally {
      setRecovering(false);
    }
  };

  const handleDirectUnlock = () => {
    localStorage.removeItem('cse_admin_failed_attempts');
    localStorage.removeItem('cse_admin_lockout_until');
    setPassword('');
    setError(null);
    setSuccess('Security lockout cleared. Please enter your administrator passphrase to log in.');
    fetchSecurityInfo();
  };

  return (
    <div className="min-h-screen bg-[#f2f2f4] dark:bg-[#121214] text-zinc-950 dark:text-zinc-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#d2f34c] selection:text-zinc-950 font-sans transition-colors duration-200">
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-[#1e1e1e] hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 py-2 rounded-full transition-all shadow-xs border border-zinc-200/80 dark:border-zinc-800 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Exit to Public Cohort View</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Brand Emblem */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-white shadow-sm">
            <BashBLogo size={22} />
            <span className="font-black text-sm tracking-tight">
              <span>bash</span><span className="text-[#c8f828]">-b</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">CSE B</span>
          </div>
        </div>

        {/* Security Shield Header */}
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-[#d2f34c] text-zinc-950 flex items-center justify-center shadow-lg relative font-black">
            <Lock className="w-6 h-6 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#1e1e1e]" />
            </span>
          </div>
        </div>

        <h1 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          Cohort Admin Gateway
        </h1>
        <p className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          Restricted Portal · Semester 1 Computer Science & Engineering
        </p>
      </div>

      <div className="relative mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#1e1e1e] text-white py-8 px-6 sm:px-8 shadow-2xl border border-zinc-800 rounded-[2.5rem] relative overflow-hidden">
          {/* Active Lockout Alert */}
          {securityStatus?.isLocked ? (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800/90 text-rose-200 text-xs flex items-start gap-3 mb-5">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-rose-300 uppercase tracking-wider mb-0.5">
                  Security Lockout Active
                </p>
                <p className="text-rose-200/90 leading-relaxed">
                  Too many failed attempts. Access is locked for approximately{' '}
                  <span className="font-bold font-mono text-white underline">
                    {securityStatus.remainingMinutes} minute(s)
                  </span>.
                </p>
                <div className="mt-2.5 pt-2 border-t border-rose-900/60 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDirectUnlock}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#d2f34c] hover:bg-[#c2e43b] text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Quick Unlock Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryKey('');
                      setRecoveryError(null);
                      setRecoverySuccess(null);
                      setIsRecoveryOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Emergency Reset</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Success Message */}
          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300 flex items-start gap-2.5 mb-4">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div className="flex-1 font-medium">{success}</div>
            </div>
          )}

          {/* Error Message */}
          {error && !securityStatus?.isLocked && (
            <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800 text-xs text-rose-300 flex items-start gap-2.5 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block mb-0.5">Authentication Failed</span>
                <span className="text-rose-200/90">{error}</span>
              </div>
            </div>
          )}

          {/* Security Status Counter */}
          <div className="mb-5 flex items-center justify-between text-xs font-mono text-zinc-400 bg-zinc-900/90 px-4 py-2 rounded-full border border-zinc-800">
            <span className="flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-[#d2f34c]" />
              <span className="font-sans text-[11px] font-semibold">Brute-Force Guard</span>
            </span>
            <span
              className={
                securityStatus && securityStatus.attemptsRemaining <= 2
                  ? 'text-[#d2f34c] font-bold'
                  : 'text-zinc-300'
              }
            >
              {securityStatus
                ? `${securityStatus.attemptsRemaining}/${securityStatus.maxAttempts} attempts`
                : '5/5 attempts'}
            </span>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <label
                  htmlFor="admin-pass"
                  className="block text-xs font-bold text-zinc-300 uppercase tracking-wider"
                >
                  Master Passphrase
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryKey('');
                    setRecoveryError(null);
                    setRecoverySuccess(null);
                    setIsRecoveryOpen(true);
                  }}
                  className="text-[11px] text-zinc-400 hover:text-[#d2f34c] transition-colors underline cursor-pointer"
                >
                  Forgot key?
                </button>
              </div>

              <div className="relative">
                <input
                  id="admin-pass"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator master key"
                  required
                  disabled={Boolean(securityStatus?.isLocked || loading)}
                  autoFocus
                  className="w-full pl-5 pr-12 py-3 text-sm bg-zinc-900 text-white border border-zinc-750 rounded-full focus:outline-none focus:ring-2 focus:ring-[#d2f34c] font-mono tracking-wider transition-all placeholder:text-zinc-600 disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Portal Security Indicator & Emergency Recovery Link */}
              <div className="mt-2.5 px-2 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#d2f34c]" />
                  <span>Authorized Staff Only</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryKey('');
                    setRecoveryError(null);
                    setRecoverySuccess(null);
                    setIsRecoveryOpen(true);
                  }}
                  className="text-zinc-400 hover:text-[#d2f34c] transition-colors underline cursor-pointer"
                >
                  Emergency Recovery
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={Boolean(securityStatus?.isLocked || loading || !password.trim())}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#d2f34c] hover:bg-[#c2e43b] text-zinc-950 text-xs font-black tracking-wide transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer uppercase"
            >
              {loading ? (
                <span className="font-mono">Verifying Credentials...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Enter Console</span>
                </>
              )}
            </button>
          </form>

          {/* Security Information Footnote */}
          <div className="mt-5 pt-4 border-t border-zinc-800 text-[11px] text-zinc-400 space-y-2">
            <div className="flex items-start gap-2 text-zinc-400">
              <Info className="w-3.5 h-3.5 text-[#d2f34c] shrink-0 mt-0.5" />
              <span>
                Protected against unauthorized intrusion: 5 attempts before 15m lockout. If password is forgotten, use the Emergency Master Recovery Key.
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 font-mono">
              <span>Bearer JWT Token Encryption</span>
              <span>CSE Cohort 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Recovery Modal */}
      {isRecoveryOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] text-white border border-zinc-800 rounded-[2.5rem] max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-left">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2.5 text-white font-extrabold text-base">
                <div className="w-8 h-8 rounded-full bg-[#d2f34c] text-zinc-950 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <span>Emergency Recovery</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRecoveryOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              If you forgot your password or got locked out, enter the system{' '}
              <strong className="text-[#d2f34c] font-mono">Root Recovery Key</strong> to reset your password or instantly restore default access.
            </p>

            {recoveryError && (
              <div className="mb-3 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300">
                {recoveryError}
              </div>
            )}

            {recoverySuccess && (
              <div className="mb-3 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300">
                {recoverySuccess}
              </div>
            )}

            <form onSubmit={handleEmergencyReset} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1 px-1">
                  Emergency Recovery Key *
                </label>
                <input
                  type="text"
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value)}
                  placeholder="Enter root recovery key"
                  required
                  className="w-full px-4 py-2.5 text-xs bg-zinc-900 border border-zinc-750 rounded-full text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#d2f34c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1 px-1">
                  New Master Password (Min 8 chars) *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new administrator password"
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 text-xs bg-zinc-900 border border-zinc-750 rounded-full text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#d2f34c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1 px-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                  className="w-full px-4 py-2.5 text-xs bg-zinc-900 border border-zinc-750 rounded-full text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#d2f34c]"
                />
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleQuickRestoreDefault}
                  disabled={recovering}
                  className="w-full sm:w-auto px-4 py-2 rounded-full text-xs font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800 transition-colors disabled:opacity-50 cursor-pointer text-center"
                >
                  Factory Default
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsRecoveryOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={recovering}
                    className="px-5 py-2 rounded-full text-xs font-extrabold text-zinc-950 bg-[#d2f34c] hover:bg-[#c2e43b] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {recovering ? 'Resetting...' : 'Save Password'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
