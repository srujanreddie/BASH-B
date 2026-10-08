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
  RotateCcw
} from 'lucide-react';

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

  // Load live security posture (lockout status, remaining attempts)
  const fetchSecurityInfo = async () => {
    try {
      const res = await fetch('/api/admin/security-info');
      const data = await res.json();
      if (data.success) {
        setSecurityStatus({
          isLocked: data.isLocked,
          remainingMinutes: data.remainingMinutes,
          attemptsRemaining: data.attemptsRemaining,
          maxAttempts: data.maxAttempts,
          isInitialSetup: data.isInitialSetup,
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // If already authenticated with valid token, redirect directly to dashboard
    const existingToken = sessionStorage.getItem('cse_admin_token');
    if (existingToken) {
      fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${existingToken}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) navigate('/dashboard');
        })
        .catch(() => {
          sessionStorage.removeItem('cse_admin_token');
        });
    }

    fetchSecurityInfo();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.isLocked) {
          setSecurityStatus((prev) => prev ? { ...prev, isLocked: true, remainingMinutes: data.remainingMinutes || 15 } : null);
        } else if (data.attemptsRemaining !== undefined) {
          setSecurityStatus((prev) => prev ? { ...prev, attemptsRemaining: data.attemptsRemaining } : null);
        }
        throw new Error(data.message || 'Authentication failed. Access denied.');
      }

      // Store JWT token and session metadata
      sessionStorage.setItem('cse_admin_token', data.token);
      sessionStorage.setItem('cse_admin_user', data.user || 'cohort_admin');
      sessionStorage.setItem('cse_admin_login_at', String(Date.now()));

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Unable to authenticate. Check server logs.');
    } finally {
      setLoading(false);
      fetchSecurityInfo();
    }
  };

  const handleEmergencyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoverySuccess(null);

    if (!recoveryKey.trim() || !newPassword || !confirmPassword) {
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
      const res = await fetch('/api/admin/emergency-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recoveryKey: recoveryKey.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Recovery failed.');
      }

      setRecoverySuccess('Password successfully reset! You can now log in.');
      setPassword(newPassword);
      setSuccess('Master password successfully reset! Any lockout was cleared.');
      setError(null);

      setTimeout(() => {
        setIsRecoveryOpen(false);
        setRecoverySuccess(null);
        setRecoveryKey('');
        setNewPassword('');
        setConfirmPassword('');
        fetchSecurityInfo();
      }, 2000);
    } catch (err: any) {
      setRecoveryError(err.message);
    } finally {
      setRecovering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-rose-500 selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" />

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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
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
              <div>
                <p className="font-semibold text-rose-300 uppercase tracking-wider mb-0.5">
                  Security Lockout Active
                </p>
                <p className="text-rose-200/90 leading-relaxed">
                  Maximum failed password attempts exceeded. Access is locked for approximately{' '}
                  <span className="font-bold font-mono text-white underline">
                    {securityStatus.remainingMinutes} minute(s)
                  </span>.
                </p>
                <button
                  type="button"
                  onClick={() => setIsRecoveryOpen(true)}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-rose-300 hover:text-white underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Forgot password? Reset via Emergency Recovery Key</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* Success Message */}
          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-start gap-2.5 mb-4">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div className="flex-1 font-medium">{success}</div>
            </div>
          )}

          {/* Error Message */}
          {error && !securityStatus?.isLocked && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-start gap-2.5 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Authentication Failed</span>
                <span className="text-rose-200/80">{error}</span>
              </div>
            </div>
          )}

          {/* Security Status Counter */}
          <div className="mb-4 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/70 px-3 py-2 rounded-lg border border-slate-800/70">
            <span className="flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
              <span>Anti-Brute Force Protection</span>
            </span>
            <span className={securityStatus && securityStatus.attemptsRemaining <= 2 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
              {securityStatus ? `${securityStatus.attemptsRemaining} of ${securityStatus.maxAttempts} attempts left` : '5 of 5 attempts left'}
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
                  placeholder="Enter administrator passkey"
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
            </div>

            <button
              type="submit"
              disabled={Boolean(securityStatus?.isLocked || loading || !password.trim())}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-rose-950/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="font-mono">Verifying Credentials & Key...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Open Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Security Information Footnote */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-start gap-2 text-slate-400">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>
                Protected against unauthorized intrusion: 5 attempts before 15m lockout. If password is forgotten, use the Master Recovery Key.
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
              <span>TLS / Bearer JWT Authentication</span>
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
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              If you forgot your password, enter the system <strong className="text-rose-400 font-mono">Emergency Master Recovery Key</strong> to reset your password and clear any active lockout immediately.
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Emergency Master Recovery Key *
                </label>
                <input
                  type="text"
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value)}
                  placeholder="e.g. CSE2026-RECOVER-ROOT-ACCESS"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Default Key: <code className="text-slate-400 font-mono">CSE2026-RECOVER-ROOT-ACCESS</code>
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
                  placeholder="Enter your new password"
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

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecoveryOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recovering}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {recovering ? 'Resetting Access...' : 'Reset Master Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
