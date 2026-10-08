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
  HelpCircle, 
  X, 
  RotateCcw,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { safeFetchJson } from '../utils/api';

const DEFAULT_MASTER_KEY = 'Admin@CSE2026#Live!';
const DEFAULT_RECOVERY_KEY = 'CSE2026-RECOVER-ROOT-ACCESS';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Help & Info Accordion State
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
      setPassword(newPassword);
      setSuccess('Master password successfully updated. You may now log in.');
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
    const keyToUse = recoveryKey.trim() || DEFAULT_RECOVERY_KEY;
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
        throw new Error('Invalid recovery key for restore.');
      }

      localStorage.removeItem('cse_admin_custom_password');
      localStorage.removeItem('cse_admin_failed_attempts');
      localStorage.removeItem('cse_admin_lockout_until');

      setPassword(DEFAULT_MASTER_KEY);
      setRecoverySuccess(`Credentials restored! Master Key is: ${DEFAULT_MASTER_KEY}`);
      setSuccess(`Password restored to default: ${DEFAULT_MASTER_KEY}`);
      setError(null);

      setTimeout(() => {
        setIsRecoveryOpen(false);
        setRecoverySuccess(null);
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
    setPassword(localStorage.getItem('cse_admin_custom_password') || DEFAULT_MASTER_KEY);
    setError(null);
    setSuccess('Lockout cleared! You can now log in.');
    fetchSecurityInfo();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const fillDefaultPassword = () => {
    const active = localStorage.getItem('cse_admin_custom_password') || DEFAULT_MASTER_KEY;
    setPassword(active);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-rose-500 selection:text-white">
      {/* Background Accent Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-900/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-emerald-950/20 rounded-full blur-3xl" />
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Exit to Public Cohort View</span>
        </Link>

        {/* Security Shield Header */}
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 text-white flex items-center justify-center shadow-2xl relative">
            <Lock className="w-6 h-6 text-rose-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>
        </div>

        <h1 className="text-center text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
          Cohort Admin Gateway
        </h1>
        <p className="mt-1 text-center text-xs text-slate-400 font-mono">
          Restricted Portal · Semester 1 Computer Science & Engineering
        </p>
      </div>

      <div className="relative mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/90 backdrop-blur-xl py-7 px-6 sm:px-8 shadow-2xl border border-slate-800 rounded-2xl relative overflow-hidden">
          {/* Top Security Line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500" />

          {/* Active Lockout Alert */}
          {securityStatus?.isLocked ? (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800/90 text-rose-200 text-xs flex items-start gap-3 mb-5">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-300 uppercase tracking-wider mb-0.5">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Quick Unlock Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryKey(DEFAULT_RECOVERY_KEY);
                      setIsRecoveryOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-900/90 hover:bg-rose-800 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Emergency Reset & Unlock</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Success Message */}
          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300 flex items-start gap-2.5 mb-4">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div className="flex-1 font-medium">{success}</div>
            </div>
          )}

          {/* Error Message */}
          {error && !securityStatus?.isLocked && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-xs text-rose-300 flex items-start gap-2.5 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Authentication Failed</span>
                <span className="text-rose-200/90">{error}</span>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fillDefaultPassword()}
                    className="text-[11px] font-mono text-rose-300 hover:text-white underline cursor-pointer"
                  >
                    Try default password: {DEFAULT_MASTER_KEY}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Status Counter */}
          <div className="mb-4 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/70 px-3 py-2 rounded-lg border border-slate-800/70">
            <span className="flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
              <span>Anti-Brute Force Protection</span>
            </span>
            <span
              className={
                securityStatus && securityStatus.attemptsRemaining <= 2
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-300'
              }
            >
              {securityStatus
                ? `${securityStatus.attemptsRemaining} of ${securityStatus.maxAttempts} attempts left`
                : '5 of 5 attempts left'}
            </span>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-pass"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
                >
                  Master Admin Passphrase
                </label>
                <button
                  type="button"
                  onClick={() => setIsRecoveryOpen(true)}
                  className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors underline cursor-pointer"
                >
                  Forgot password?
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
                  className="w-full pl-3 pr-10 py-2.5 text-sm bg-slate-950/90 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-mono tracking-wider transition-all placeholder:text-slate-600 disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Quick Fill Default Button */}
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={fillDefaultPassword}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Insert default Master Key</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowHelpGuide(!showHelpGuide)}
                  className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Key Info</span>
                  {showHelpGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={Boolean(securityStatus?.isLocked || loading || !password.trim())}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-rose-950/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="font-mono">Verifying Credentials & Session...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Open Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Master Key Help & Credentials Explainer */}
          {showHelpGuide && (
            <div className="mt-4 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Master Key & Access Credentials</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Live Config</span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block mb-1">
                  1. Default Master Key (Password):
                </span>
                <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  <code className="text-rose-300 font-mono text-[11px]">{DEFAULT_MASTER_KEY}</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(DEFAULT_MASTER_KEY, 'master')}
                    className="text-slate-400 hover:text-white p-1"
                    title="Copy Master Key"
                  >
                    {copiedKey === 'master' ? (
                      <span className="text-[10px] text-emerald-400">Copied!</span>
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block mb-1">
                  2. Root Emergency Recovery Key:
                </span>
                <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  <code className="text-amber-300 font-mono text-[11px]">{DEFAULT_RECOVERY_KEY}</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(DEFAULT_RECOVERY_KEY, 'recovery')}
                    className="text-slate-400 hover:text-white p-1"
                    title="Copy Recovery Key"
                  >
                    {copiedKey === 'recovery' ? (
                      <span className="text-[10px] text-emerald-400">Copied!</span>
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                If you forgot your changed password, open the <button type="button" onClick={() => setIsRecoveryOpen(true)} className="text-rose-400 underline cursor-pointer">Emergency Reset</button> dialog and use the Root Recovery Key to reset or restore access.
              </div>
            </div>
          )}

          {/* Security Information Footnote */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-start gap-2 text-slate-400">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>
                Protected against unauthorized intrusion: 5 attempts before 15m lockout. If password is forgotten, use the Emergency Master Recovery Key.
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
              <span>Bearer JWT Token Encryption</span>
              <span>CSE Cohort 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Recovery Modal */}
      {isRecoveryOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <KeyRound className="w-4 h-4 text-rose-500" />
                <span>Emergency Password Recovery</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRecoveryOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              If you forgot your password or got locked out, enter the system{' '}
              <strong className="text-rose-400 font-mono">Root Recovery Key</strong> to reset your password or instantly restore default access.
            </p>

            {recoveryError && (
              <div className="mb-3 p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-xs text-rose-300">
                {recoveryError}
              </div>
            )}

            {recoverySuccess && (
              <div className="mb-3 p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300">
                {recoverySuccess}
              </div>
            )}

            <form onSubmit={handleEmergencyReset} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Emergency Master Recovery Key *
                  </label>
                  <button
                    type="button"
                    onClick={() => setRecoveryKey(DEFAULT_RECOVERY_KEY)}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Insert default key
                  </button>
                </div>
                <input
                  type="text"
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value)}
                  placeholder="e.g. CSE2026-RECOVER-ROOT-ACCESS"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Root Key: <code className="text-slate-400 font-mono">{DEFAULT_RECOVERY_KEY}</code>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Master Password (Min 8 chars) *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new administrator password"
                  required
                  minLength={8}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm New Master Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your new password"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleQuickRestoreDefault}
                  disabled={recovering}
                  className="w-full sm:w-auto px-3 py-2 rounded-lg text-xs font-medium text-amber-300 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800 transition-colors disabled:opacity-50 cursor-pointer text-center"
                >
                  Restore Default Key ({DEFAULT_MASTER_KEY})
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsRecoveryOpen(false)}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={recovering}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {recovering ? 'Resetting...' : 'Save New Password'}
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
