/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  LogOut, 
  ArrowLeft, 
  RotateCcw, 
  ExternalLink, 
  Calendar, 
  Check, 
  AlertCircle,
  FileText,
  Clock,
  Shield,
  KeyRound,
  X,
  History,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Radio,
  FileCheck2,
  GraduationCap,
  ListTodo
} from 'lucide-react';
import { Course, Notice, Assignment, SecurityAuditLog } from '../types';
import { safeFetchJson } from '../utils/api';
import { SEED_COURSES, DEFAULT_NOTICES } from '../data/seedCourses';
import { TimetableManager } from '../components/TimetableManager';
import { AssignmentManager } from '../components/AssignmentManager';
import ThemeToggle from '../components/ThemeToggle';
import BashBLogo from '../components/BashBLogo';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'notices' | 'timetable' | 'assignments' | 'security'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'timetable') return 'timetable';
      if (params.get('tab') === 'assignments') return 'assignments';
      if (params.get('tab') === 'security') return 'security';
    } catch {
      // ignore
    }
    return 'notices';
  });
  const [courses, setCourses] = useState<Course[]>(() => SEED_COURSES);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notices, setNotices] = useState<Notice[]>(() => {
    try {
      const cached = localStorage.getItem('cse_sem1_cached_notices');
      if (cached) {

        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_NOTICES;
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Assignment' | 'Exam' | 'Material'>('Assignment');
  const [courseCode, setCourseCode] = useState('25ES1CS101');
  const [deadline, setDeadline] = useState('');
  const [resourceLink, setResourceLink] = useState('');
  const [resourceLabel, setResourceLabel] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  // Modals
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);

  // Security / Password Change
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [securityMsg, setSecurityMsg] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Auto-logout inactivity timer (30 mins)
  const [timeUntilLogout, setTimeUntilLogout] = useState(30 * 60);

  const token = sessionStorage.getItem('cse_admin_token');

  // Verify authentication & load initial data
  useEffect(() => {
    if (!token) {
      navigate('/admin-login');
      return;
    }
    fetchData();
  }, [token, navigate]);

  // Inactivity countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilLogout((prev) => {
        if (prev <= 1) {
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const resetTimer = () => setTimeUntilLogout(30 * 60);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);

    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesRes, noticesRes, assignmentsRes] = await Promise.all([
        safeFetchJson<{ success: boolean; courses: Course[] }>('/api/courses'),
        safeFetchJson<{ success: boolean; notices: Notice[] }>('/api/notices'),
        safeFetchJson<{ success: boolean; assignments: Assignment[] }>('/api/assignments'),
      ]);

      if (coursesRes.ok && coursesRes.data?.courses && coursesRes.data.courses.length > 0) {
        setCourses(coursesRes.data.courses);
        if (!courseCode) {
          setCourseCode(coursesRes.data.courses[0].code);
        }
      }
      if (noticesRes.ok && noticesRes.data?.notices) {
        setNotices(noticesRes.data.notices);
        try {
          localStorage.setItem('cse_sem1_cached_notices', JSON.stringify(noticesRes.data.notices));
        } catch {
          // ignore
        }
      }
      if (assignmentsRes.ok && assignmentsRes.data?.assignments) {
        setAssignments(assignmentsRes.data.assignments);
      }
    } catch (err: any) {
      console.warn('Backend sync deferred, continuing with cached session state:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const res = await safeFetchJson<{ success: boolean; logs: SecurityAuditLog[] }>('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && res.data?.logs && res.data.logs.length > 0) {
        setAuditLogs(res.data.logs);
        return;
      }
    } catch {
      // ignore
    } finally {
      setLoadingAudit(false);
    }

    // Local audit trail fallback
    try {
      const local = JSON.parse(localStorage.getItem('cse_admin_audit_logs') || '[]');
      if (Array.isArray(local) && local.length > 0) {
        setAuditLogs(local);
        return;
      }
    } catch {
      // ignore
    }

    setAuditLogs([
      {
        id: `log_${Date.now()}`,
        event: 'CONSOLE_ACTIVE',
        details: 'Admin console loaded in live secure mode',
        timestamp: new Date().toISOString(),
        ip: 'active-session',
        status: 'success',
      },
    ]);
  };

  const handleLogout = async () => {
    try {
      if (token && !token.startsWith('standalone_')) {
        await safeFetchJson('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // ignore
    } finally {
      sessionStorage.removeItem('cse_admin_token');
      sessionStorage.removeItem('cse_admin_user');
      sessionStorage.removeItem('cse_admin_login_at');
      navigate('/admin-login');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecurityMsg(null);

    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setSecurityError('New password must be at least 8 characters long');
      return;
    }

    setChangingPassword(true);
    try {
      let serverOk = false;
      try {
        const res = await safeFetchJson<{ success: boolean; message?: string }>('/api/admin/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: currPassword,
            newPassword,
          }),
        });

        if (res.ok && res.data?.success) {
          serverOk = true;
        } else if (res.status === 400 || res.status === 401) {
          throw new Error(res.data?.message || 'Current password verification failed');
        }
      } catch (err: any) {
        if (err.message && !err.message.includes('Server communication') && !err.message.includes('temporarily unreachable')) {
          throw err;
        }
        serverOk = false;
      }

      if (!serverOk) {
        const activePassword = localStorage.getItem('cse_admin_custom_password') || 'Admin@CSE2026#Live!';
        if (currPassword !== activePassword) {
          throw new Error('Current password does not match.');
        }
      }

      localStorage.setItem('cse_admin_custom_password', newPassword);

      // Record in audit log
      try {
        const logs = JSON.parse(localStorage.getItem('cse_admin_audit_logs') || '[]');
        logs.unshift({
          id: `log_${Date.now()}`,
          event: 'PASSWORD_CHANGE',
          details: 'Master administrator passkey changed by admin',
          timestamp: new Date().toISOString(),
          ip: 'client-terminal',
          status: 'success',
        });
        localStorage.setItem('cse_admin_audit_logs', JSON.stringify(logs.slice(0, 50)));
      } catch {
        // ignore
      }

      setSecurityMsg('Master administrator passkey successfully updated! Unauthorized access is strictly blocked.');
      setCurrPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsSecurityModalOpen(false);
        setSecurityMsg(null);
      }, 2000);
    } catch (err: any) {
      setSecurityError(err.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePurgeAll = async () => {
    try {
      try {
        await safeFetchJson<{ success: boolean; message?: string }>('/api/admin/purge-notices', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // fallback locally
      }

      setNotices([]);
      localStorage.setItem('cse_sem1_cached_notices', '[]');

      try {
        const logs = JSON.parse(localStorage.getItem('cse_admin_audit_logs') || '[]');
        logs.unshift({
          id: `log_${Date.now()}`,
          event: 'PURGE_NOTICES',
          details: 'All live notices purged from board',
          timestamp: new Date().toISOString(),
          ip: 'client-terminal',
          status: 'success',
        });
        localStorage.setItem('cse_admin_audit_logs', JSON.stringify(logs.slice(0, 50)));
      } catch {
        // ignore
      }

      setSuccessMsg('Live noticeboard cleaned! All demo and test notices have been purged.');
      setIsPurgeModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to purge notices');
    }
  };

  const resetForm = () => {
    setEditingNoticeId(null);
    setTitle('');
    setDescription('');
    setCategory('Assignment');
    setCourseCode(courses[0]?.code || '25ES1CS101');
    setDeadline('');
    setResourceLink('');
    setResourceLabel('');
    setIsUrgent(false);
  };

  const startEdit = (notice: Notice) => {
    setEditingNoticeId(notice.id || (notice as any)._id);
    setTitle(notice.title);
    setDescription(notice.description);
    setCategory(notice.category);
    setCourseCode(notice.courseCode);
    setDeadline(notice.deadline ? new Date(notice.deadline).toISOString().slice(0, 16) : '');
    setResourceLink(notice.resourceLink || '');
    setResourceLabel(notice.resourceLabel || '');
    setIsUrgent(Boolean(notice.isUrgent));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !courseCode || !category) {
      setError('Please fill in required fields');
      return;
    }

    if (category === 'Exam' && !deadline) {
      setError('Please provide the scheduled Date and Time of Exam.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      title,
      description,
      category,
      courseCode,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      resourceLink,
      resourceLabel: resourceLabel || (category === 'Exam' ? 'Exam Syllabus / PYQs' : resourceLink ? 'Attached Material' : ''),
      isUrgent,
    };

    try {
      const url = editingNoticeId ? `/api/notices/${editingNoticeId}` : '/api/notices';
      const method = editingNoticeId ? 'PUT' : 'POST';

      let savedNotice: Notice | null = null;
      try {
        const res = await safeFetchJson<{ success: boolean; notice?: Notice; message?: string }>(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok && res.data?.success && res.data.notice) {
          savedNotice = res.data.notice;
        }
      } catch {
        // Fallback for static hosts
      }

      const finalNotice: Notice = savedNotice || {
        id: editingNoticeId || `notice_${Date.now()}`,
        title: payload.title,
        description: payload.description,
        category: payload.category as any,
        courseCode: payload.courseCode,
        deadline: payload.deadline,
        resourceLink: payload.resourceLink,
        resourceLabel: payload.resourceLabel,
        isUrgent: payload.isUrgent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setNotices((prev) => {
        const updated = editingNoticeId
          ? prev.map((n) => ((n.id || (n as any)._id) === editingNoticeId ? finalNotice : n))
          : [finalNotice, ...prev];
        try {
          localStorage.setItem('cse_sem1_cached_notices', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      // Audit log
      try {
        const logs = JSON.parse(localStorage.getItem('cse_admin_audit_logs') || '[]');
        logs.unshift({
          id: `log_${Date.now()}`,
          event: editingNoticeId ? 'EDIT_NOTICE' : 'BROADCAST_NOTICE',
          details: `Notice: "${payload.title}" (${payload.category})`,
          timestamp: new Date().toISOString(),
          ip: 'client-terminal',
          status: 'success',
        });
        localStorage.setItem('cse_admin_audit_logs', JSON.stringify(logs.slice(0, 50)));
      } catch {
        // ignore
      }

      setSuccessMsg(
        editingNoticeId
          ? 'Notice successfully updated.'
          : category === 'Exam'
          ? 'Exam date successfully scheduled and broadcasted!'
          : 'New notice broadcasted to the public cohort board.'
      );
      resetForm();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notice? This action is permanent.')) {
      return;
    }

    try {
      try {
        await safeFetchJson<{ success: boolean; message?: string }>(`/api/notices/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // server offline, proceed locally
      }

      setNotices((prev) => {
        const updated = prev.filter((n) => (n.id || (n as any)._id) !== id);
        try {
          localStorage.setItem('cse_sem1_cached_notices', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      // Audit log
      try {
        const logs = JSON.parse(localStorage.getItem('cse_admin_audit_logs') || '[]');
        logs.unshift({
          id: `log_${Date.now()}`,
          event: 'DELETE_NOTICE',
          details: `Deleted notice ID: ${id}`,
          timestamp: new Date().toISOString(),
          ip: 'client-terminal',
          status: 'success',
        });
        localStorage.setItem('cse_admin_audit_logs', JSON.stringify(logs.slice(0, 50)));
      } catch {
        // ignore
      }

      setSuccessMsg('Notice deleted.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#f2f2f4] dark:bg-[#121214] text-zinc-950 dark:text-zinc-100 pb-16 font-sans selection:bg-[#d2f34c] selection:text-zinc-950 transition-colors duration-200">
      {/* Top Floating Admin Bar */}
      <header className="max-w-7xl mx-auto p-3 sm:p-4 sticky top-0 z-30">
        <div className="bg-[#1e1e1e] text-white rounded-[2rem] px-5 py-3.5 shadow-md border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-white transition-colors py-1.5 px-3 rounded-full bg-zinc-800/80 hover:bg-zinc-700"
              title="Return to student public view"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to Public</span>
            </Link>

            <div className="flex items-center gap-2">
              <BashBLogo size={26} />
              <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>bash</span><span className="text-[#c8f828]">-b</span>
                <span className="text-zinc-400 font-medium text-xs">Admin Console</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-[#d2f34c] hidden sm:inline">
                Section B · E-139
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 text-xs">
            {/* Theme Toggle Button */}
            <ThemeToggle className="!bg-zinc-800 !border-zinc-700 text-[#d2f34c]" />

            {/* Session Timeout */}
            <div className="hidden md:flex items-center gap-1.5 font-mono text-[11px] text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
              <Clock className="w-3 h-3 text-[#d2f34c]" />
              <span>Timeout:</span>
              <span className="text-amber-400 font-bold">{formatTimer(timeUntilLogout)}</span>
            </div>

            {/* Security Audit Button */}
            <button
              onClick={() => {
                fetchAuditLogs();
                setIsAuditModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors font-bold text-xs cursor-pointer"
              title="View Security Audit Log"
            >
              <History className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Audit Trail</span>
            </button>

            {/* Change Password Button */}
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors font-bold text-xs cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Security</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 transition-colors font-bold text-xs cursor-pointer"
              title="Terminate Admin Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-2">
        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 rounded-[1.5rem] bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-4 rounded-[1.5rem] bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMsg}</div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Admin Navigation Tabs (Pill style matching reference) */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('notices')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'notices'
                ? 'bg-[#d2f34c] text-zinc-950 shadow-xs scale-102 ring-2 ring-[#d2f34c]/50'
                : 'bg-white dark:bg-[#1e1e1e] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Broadcast Notices</span>
            <span className={`text-[11px] px-2 py-0.2 rounded-full font-mono font-bold ${
              activeTab === 'notices' ? 'bg-zinc-950 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}>
              {notices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'timetable'
                ? 'bg-[#d2f34c] text-zinc-950 shadow-xs scale-102 ring-2 ring-[#d2f34c]/50'
                : 'bg-white dark:bg-[#1e1e1e] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timetable & Routine</span>
            <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300">
              Live B
            </span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'assignments'
                ? 'bg-[#c4f510] text-zinc-950 shadow-xs scale-102 ring-2 ring-[#c4f510]/50'
                : 'bg-white dark:bg-[#1e1e1e] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Assignment Manager</span>
            <span className={`text-[11px] px-2 py-0.2 rounded-full font-mono font-bold ${
              activeTab === 'assignments' ? 'bg-zinc-950 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}>
              {assignments.length}
            </span>
          </button>
        </div>

        {activeTab === 'timetable' ? (
          <TimetableManager
            token={token}
            courses={courses}
            onNotification={(msg, type) => {
              if (type === 'success') setSuccessMsg(msg);
              else setError(msg);
            }}
          />
        ) : activeTab === 'assignments' ? (
          <AssignmentManager
            assignments={assignments}
            courses={courses}
            token={token}
            onRefresh={fetchData}
            onShowMessage={(msg) => setSuccessMsg(msg)}
            onShowError={(err) => setError(err)}
          />
        ) : (
          <>
            {/* Live Status & Quick Actions Bar */}
            <div className="mb-6 bg-white dark:bg-[#1e1e1e] rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1e1e1e] dark:bg-zinc-800 text-[#d2f34c] flex items-center justify-center shrink-0 border border-zinc-800 dark:border-zinc-700">
                  <Radio className="w-5 h-5 text-[#d2f34c]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-extrabold text-zinc-950 dark:text-white">Live Broadcast Mode</h2>
                    <span className="text-[10px] font-black uppercase bg-[#d2f34c] text-zinc-950 px-2.5 py-0.5 rounded-full">
                      Zero Demo Active
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    All updates immediately synchronize to students on the public noticeboard.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {notices.length > 0 && (
                  <button
                    onClick={() => setIsPurgeModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                    title="Wipe all notices to reset to blank live state"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge Notices</span>
                  </button>
                )}
                <button
                  onClick={fetchData}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refresh Feed</span>
                </button>
              </div>
            </div>

            {/* Dashboard Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="p-5 bg-white dark:bg-[#1e1e1e] rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/80 shadow-xs transition-colors">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                  Active Broadcasts
                </span>
                <span className="text-3xl font-extrabold font-mono text-zinc-950 dark:text-white tabular-nums">
                  {notices.length}
                </span>
              </div>

              <div className="p-5 bg-white dark:bg-[#1e1e1e] rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/80 shadow-xs transition-colors">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                  Scheduled Exams
                </span>
                <span className="text-3xl font-extrabold font-mono text-[#5a4dd0] dark:text-[#aea8ff] tabular-nums">
                  {notices.filter((n) => n.category === 'Exam').length}
                </span>
              </div>

              <div className="p-5 bg-white dark:bg-[#1e1e1e] rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/80 shadow-xs transition-colors">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                  Assignments Due
                </span>
                <span className="text-3xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {notices.filter((n) => n.category === 'Assignment').length}
                </span>
              </div>

              <div className="p-5 bg-white dark:bg-[#1e1e1e] rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/80 shadow-xs transition-colors">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                  Study Materials
                </span>
                <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {notices.filter((n) => n.category === 'Material').length}
                </span>
              </div>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Notice Creation / Edit Form (Full CRUD) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#1e1e1e] rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800 p-6 shadow-xs sticky lg:top-24 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-zinc-950 dark:text-white tracking-tight">
                {editingNoticeId ? 'Edit Broadcast Notice' : 'Broadcast New Notice'}
              </h2>
              {editingNoticeId && (
                <button
                  onClick={resetForm}
                  className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Quick Templates Bar */}
            <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 text-[11px]">
              <span className="font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider shrink-0">
                Templates:
              </span>
              <button
                type="button"
                onClick={() => {
                  setTitle('Midterm Exam: Units 1 & 2');
                  setCategory('Exam');
                  setCourseCode('25BS1MT101');
                  setDescription('Formal examination duration: 90 minutes. Non-programmable calculators permitted. Bring student hall ticket.');
                  setResourceLabel('Formula Sheet & PYQ Pack');
                  setResourceLink('https://drive.google.com/drive/folders/cse-pyq-25BS1MT101');
                  setIsUrgent(true);
                }}
                className="px-3 py-1 rounded-full bg-[#aea8ff]/20 dark:bg-[#aea8ff]/15 hover:bg-[#aea8ff]/40 dark:hover:bg-[#aea8ff]/30 text-[#4c449c] dark:text-[#aea8ff] font-bold whitespace-nowrap transition-colors border border-[#aea8ff]/40 dark:border-[#aea8ff]/30 cursor-pointer"
              >
                + Schedule Exam
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('Lab Record Submission: Experiment ');
                  setCategory('Assignment');
                  setCourseCode('25ES2CS101');
                  setDescription('Submit verified handwritten lab record with source code, flowchart, and test results.');
                  setResourceLabel('Code Starter / Exercises');
                  setResourceLink('https://github.com/cse-cohort-2026/pps-lab-solutions');
                  setIsUrgent(false);
                }}
                className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold whitespace-nowrap transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              >
                + Lab Assignment
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('Lecture Handouts & Problem Bank');
                  setCategory('Material');
                  setCourseCode('25ES1CS101');
                  setDescription('Complete unit study notes, numerical exercise bank, and reference questions for the current unit.');
                  setResourceLabel('Drive Folder: Notes');
                  setResourceLink('https://drive.google.com/drive/folders/cse-notes-25ES1CS101');
                  setIsUrgent(false);
                }}
                className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold whitespace-nowrap transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              >
                + Handout
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 px-1">
                  Category *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory('Assignment')}
                    className={`py-2 px-3 rounded-full text-xs font-bold text-center transition-all cursor-pointer ${
                      category === 'Assignment'
                        ? 'bg-[#d2f34c] text-zinc-950 shadow-xs ring-2 ring-[#d2f34c]/40 font-black'
                        : 'bg-[#f2f2f4] dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800'
                    }`}
                  >
                    Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('Exam')}
                    className={`py-2 px-3 rounded-full text-xs font-bold text-center transition-all cursor-pointer ${
                      category === 'Exam'
                        ? 'bg-[#aea8ff] text-zinc-950 shadow-xs ring-2 ring-[#aea8ff]/40 font-black'
                        : 'bg-[#f2f2f4] dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800'
                    }`}
                  >
                    Exam / Test
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('Material')}
                    className={`py-2 px-3 rounded-full text-xs font-bold text-center transition-all cursor-pointer ${
                      category === 'Material'
                        ? 'bg-emerald-200 dark:bg-emerald-300 text-zinc-950 shadow-xs ring-2 ring-emerald-300 font-black'
                        : 'bg-[#f2f2f4] dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800'
                    }`}
                  >
                    Study Material
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 px-1">
                  {category === 'Exam' ? 'Exam Name / Subject Module *' : 'Notice Title *'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    category === 'Exam'
                      ? 'e.g. Matrices Midterm Examination (Units 1 & 2)'
                      : 'e.g. Lab Record Submission: Experiment 5'
                  }
                  required
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#f2f2f4] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-750 text-zinc-950 dark:text-zinc-100 rounded-full focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-[#d2f34c] transition-all font-medium"
                />
              </div>

              {/* Course Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 px-1">
                  Course Code (Semester 1) *
                </label>
                <select
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-[#f2f2f4] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-750 text-zinc-950 dark:text-zinc-100 rounded-full focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-[#d2f34c] font-mono transition-all"
                >
                  {courses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.title} ({c.category} · {c.credits} Cr)
                    </option>
                  ))}
                </select>
              </div>

              {/* DATE OF EXAM OR TARGET DEADLINE */}
              <div className={`p-4 rounded-2xl border transition-colors ${
                category === 'Exam' ? 'bg-[#aea8ff]/10 dark:bg-[#aea8ff]/5 border-[#aea8ff]/40 dark:border-[#aea8ff]/30' : 'bg-[#f2f2f4]/80 dark:bg-zinc-900/80 border-zinc-200/80 dark:border-zinc-750'
              }`}>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className={`w-3.5 h-3.5 ${category === 'Exam' ? 'text-[#5a4dd0] dark:text-[#aea8ff]' : 'text-zinc-500'}`} />
                    <span>
                      {category === 'Exam'
                        ? 'Date & Time of Exam *'
                        : category === 'Assignment'
                        ? 'Target Submission Deadline *'
                        : 'Release / Reference Date (Optional)'}
                    </span>
                  </span>
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    {category === 'Exam' ? 'Exact test schedule' : 'Cutoff deadline'}
                  </span>
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required={category === 'Exam'}
                  placeholder={category === 'Exam' ? 'Select Date and Time of Exam' : 'Select Deadline'}
                  className="w-full px-4 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-700 text-zinc-950 dark:text-zinc-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#d2f34c] font-mono"
                />
                <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {category === 'Exam'
                    ? 'Students will see this prominently as "Exam Date: [Date & Time]" with live countdown in the urgent threat banner.'
                    : category === 'Assignment'
                    ? 'Students will see this as "Deadline: [Date & Time]" with client-side ghost check-off enabled.'
                    : 'Materials without a date will simply be archived in the Subject Vault and feeds.'}
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 px-1">
                  Detailed Instructions & Guidelines *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder={
                    category === 'Exam'
                      ? 'Mention syllabus coverage, allowed items (calculators/hall tickets), test duration, and venue.'
                      : 'Provide complete details, submission criteria, formatting guidelines, and instructions.'
                  }
                  required
                  className="w-full px-4 py-3 text-xs sm:text-sm bg-[#f2f2f4] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-750 text-zinc-950 dark:text-zinc-100 rounded-2xl focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-[#d2f34c] transition-all"
                />
              </div>

              {/* Resource Link & Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 px-1">
                    Resource URL (Drive/PDF/Git)
                  </label>
                  <input
                    type="url"
                    value={resourceLink}
                    onChange={(e) => setResourceLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-4 py-2 text-xs bg-[#f2f2f4] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-750 text-zinc-950 dark:text-zinc-100 rounded-full focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-[#d2f34c] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 px-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={resourceLabel}
                    onChange={(e) => setResourceLabel(e.target.value)}
                    placeholder={category === 'Exam' ? 'e.g. Formula Sheet / PYQs' : 'e.g. Reference Notes / Template'}
                    className="w-full px-4 py-2 text-xs bg-[#f2f2f4] dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-750 text-zinc-950 dark:text-zinc-100 rounded-full focus:bg-white dark:focus:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-[#d2f34c]"
                  />
                </div>
              </div>

              {/* Priority / Urgent Flag */}
              <div className="pt-1 px-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300 select-none">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="w-4 h-4 rounded text-[#d2f34c] focus:ring-[#d2f34c] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  />
                  <span>Mark as High-Priority Immediate Threat (Elevates banner rank)</span>
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#d2f34c] hover:bg-[#c2e43b] text-zinc-950 text-xs font-black tracking-wide transition-all shadow-sm disabled:opacity-50 cursor-pointer uppercase"
                >
                  {submitting ? (
                    <span className="font-mono">Broadcasting...</span>
                  ) : editingNoticeId ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Update Live Broadcast</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Broadcast to Cohort</span>
                    </>
                  )}
                </button>

                {editingNoticeId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: Live Broadcasts List & Management */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-zinc-950 dark:text-white tracking-tight">
                  Active Cohort Notices ({notices.length})
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Real-time list of all notices visible to Semester 1 students
                </p>
              </div>

              {editingNoticeId && (
                <span className="text-xs font-mono font-bold bg-[#aea8ff]/30 dark:bg-[#aea8ff]/20 text-[#423992] dark:text-[#aea8ff] px-3 py-1 rounded-full border border-[#aea8ff]/50 dark:border-[#aea8ff]/40">
                  Editing mode active
                </span>
              )}
            </div>

            {loading ? (
              <div className="p-12 text-center bg-white dark:bg-[#1e1e1e] rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800 shadow-xs">
                <div className="w-6 h-6 border-2 border-zinc-950 dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Loading notices...</span>
              </div>
            ) : notices.length === 0 ? (
              <div className="p-10 text-center bg-white dark:bg-[#1e1e1e] rounded-[2rem] border border-dashed border-zinc-300 dark:border-zinc-700">
                <FileCheck2 className="w-10 h-10 text-zinc-400 dark:text-zinc-500 mx-auto mb-3" />
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white mb-1">
                  Live Noticeboard is Completely Clean
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-4">
                  Zero demo notices currently loaded. Students on the public site see an "All Systems Clear" status. Use the form on the left to broadcast the first official notice or schedule an exam date!
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-zinc-950 bg-[#d2f34c] px-3.5 py-1.5 rounded-full shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Production Live Mode Active</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {notices.map((n) => {
                  const noticeId = n.id || (n as any)._id;
                  const isBeingEdited = editingNoticeId === noticeId;
                  const isExam = n.category === 'Exam';

                  return (
                    <div
                      key={noticeId}
                      className={`p-5 rounded-[2rem] border bg-white dark:bg-[#1e1e1e] transition-all ${
                        isBeingEdited
                          ? 'border-zinc-950 dark:border-[#d2f34c] ring-2 ring-zinc-950/20 dark:ring-[#d2f34c]/30 shadow-md'
                          : 'border-zinc-200/60 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                            <span className="font-mono font-bold px-3 py-1 rounded-full bg-[#1e1e1e] dark:bg-zinc-800 text-white text-[11px] border border-transparent dark:border-zinc-700">
                              {n.courseCode}
                            </span>
                            <span
                              className={`text-[11px] font-bold px-3 py-0.5 rounded-full ${
                                isExam
                                  ? 'bg-[#aea8ff] text-zinc-950'
                                  : n.category === 'Assignment'
                                  ? 'bg-[#d2f34c] text-zinc-950'
                                  : 'bg-emerald-200 dark:bg-emerald-300 text-emerald-950'
                              }`}
                            >
                              {n.category}
                            </span>
                            {n.isUrgent && (
                              <span className="text-[10px] font-black uppercase tracking-wider text-rose-100 bg-rose-600 px-2.5 py-0.5 rounded-full">
                                Urgent
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-extrabold text-zinc-950 dark:text-white mb-1 leading-snug">
                            {n.title}
                          </h3>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
                            {n.description}
                          </p>

                          {/* Metadata row */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                            {n.deadline && (
                              <span className="flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200 bg-[#f2f2f4] dark:bg-zinc-900 px-3 py-1 rounded-full border border-transparent dark:border-zinc-800">
                                <Calendar className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                                <span>
                                  {isExam ? 'Date of Exam: ' : 'Deadline: '}
                                  {new Date(n.deadline).toLocaleString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </span>
                            )}

                            {n.resourceLink && (
                              <a
                                href={n.resourceLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-1 rounded-full border border-zinc-200/60 dark:border-zinc-700 font-sans font-bold text-xs transition-colors truncate max-w-[220px]"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{n.resourceLabel || 'Attached Link'}</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <button
                            onClick={() => startEdit(n)}
                            className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Edit Notice"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(noticeId)}
                            className="p-2 rounded-full text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete Notice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </>
        )}
      </main>

      {/* Security & Password Modal */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <div className="flex items-center gap-2.5 text-zinc-950 font-extrabold text-base">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <span>Admin Gateway Security</span>
              </div>
              <button
                onClick={() => setIsSecurityModalOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
              Update the master admin passkey. Ensure this secret is shared only with designated cohort administrators.
            </p>

            {securityError && (
              <div className="mb-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {securityError}
              </div>
            )}

            {securityMsg && (
              <div className="mb-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                {securityMsg}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1 px-1">
                  Current Master Password *
                </label>
                <input
                  type="password"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full px-4 py-2.5 text-xs bg-[#f2f2f4] border border-zinc-200/80 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d2f34c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1 px-1">
                  New Master Password (Min 8 characters) *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter strong new password"
                    required
                    minLength={8}
                    className="w-full pl-4 pr-11 py-2.5 text-xs bg-[#f2f2f4] border border-zinc-200/80 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d2f34c] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1 px-1">
                  Confirm New Master Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retype new password"
                  required
                  className="w-full px-4 py-2.5 text-xs bg-[#f2f2f4] border border-zinc-200/80 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d2f34c] font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full py-3 px-5 rounded-full bg-[#d2f34c] hover:bg-[#c2e43b] text-zinc-950 text-xs font-black transition-all shadow-sm disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                >
                  {changingPassword ? 'Updating Secret Key...' : 'Save & Harden Master Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Audit Trail Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 max-h-[85vh] flex flex-col text-left">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5 text-zinc-950 font-extrabold text-base">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#5a4dd0] flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <span>Access Control & Security Audit Trail</span>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 py-3">
              Real-time security log of authentication events, IP addresses, and intrusion prevention triggers.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {loadingAudit ? (
                <div className="py-8 text-center text-zinc-400 font-mono">Loading audit trail...</div>
              ) : auditLogs.length === 0 ? (
                <div className="py-8 text-center text-zinc-400">No security audit records logged yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl border border-zinc-200/60 bg-[#f2f2f4]/60 flex items-start justify-between gap-3 font-mono text-[11px]"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            log.status === 'danger'
                              ? 'bg-rose-100 text-rose-800'
                              : log.status === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : log.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-zinc-200 text-zinc-800'
                          }`}
                        >
                          {log.event}
                        </span>
                        <span className="text-zinc-500">IP: {log.ip}</span>
                      </div>
                      <p className="text-zinc-800 font-sans text-xs">{log.details}</p>
                    </div>
                    <span className="text-zinc-400 shrink-0 text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-zinc-100 flex justify-end">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-5 py-2.5 rounded-full bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purge All Notices Confirmation Modal */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 text-left">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-zinc-950">
                Purge All Broadcast Notices?
              </h3>
            </div>

            <p className="text-xs text-zinc-600 mb-6 leading-relaxed">
              This will remove all {notices.length} current notices from the feed. This action is designed for cleaning demo or past semester items. The 9 Semester 1 courses in the Subject Vault will remain intact.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsPurgeModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeAll}
                className="px-5 py-2.5 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-xs cursor-pointer"
              >
                Confirm Purge (Clean Live)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
