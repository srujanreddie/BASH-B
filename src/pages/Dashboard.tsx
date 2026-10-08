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
  GraduationCap
} from 'lucide-react';
import { Course, Notice, SecurityAuditLog } from '../types';
import { safeFetchJson } from '../utils/api';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
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
      const [coursesRes, noticesRes] = await Promise.all([
        safeFetchJson<{ success: boolean; courses: Course[] }>('/api/courses'),
        safeFetchJson<{ success: boolean; notices: Notice[] }>('/api/notices'),
      ]);

      if (coursesRes.ok && coursesRes.data?.courses) {
        setCourses(coursesRes.data.courses);
        if (coursesRes.data.courses.length > 0 && !courseCode) {
          setCourseCode(coursesRes.data.courses[0].code);
        }
      }
      if (noticesRes.ok && noticesRes.data?.notices) {
        setNotices(noticesRes.data.notices);
      }
    } catch (err: any) {
      setError('Failed to fetch data: ' + err.message);
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
      if (res.ok && res.data?.logs) {
        setAuditLogs(res.data.logs);
      }
    } catch (err: any) {
      console.error('Audit fetch error:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (token) {
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

      if (!res.ok || !res.data?.success) {
        throw new Error(res.data?.message || res.message || 'Failed to update password');
      }

      setSecurityMsg('Master administrator passkey successfully updated! Unauthorized access is strictly blocked.');
      setCurrPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsSecurityModalOpen(false);
        setSecurityMsg(null);
      }, 2500);
    } catch (err: any) {
      setSecurityError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePurgeAll = async () => {
    try {
      const res = await safeFetchJson<{ success: boolean; message?: string }>('/api/admin/purge-notices', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && res.data?.success) {
        setNotices([]);
        setSuccessMsg('Live noticeboard cleaned! All demo and test notices have been purged.');
        setIsPurgeModalOpen(false);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        throw new Error(res.data?.message || res.message || 'Failed to purge notices');
      }
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

      const res = await safeFetchJson<{ success: boolean; message?: string }>(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok || !res.data?.success) {
        throw new Error(res.data?.message || res.message || 'Failed to save notice');
      }

      setSuccessMsg(
        editingNoticeId
          ? 'Notice successfully updated.'
          : category === 'Exam'
          ? 'Exam date successfully scheduled and broadcasted!'
          : 'New notice broadcasted to the public cohort board.'
      );
      resetForm();
      fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notice? This action is permanent.')) {
      return;
    }

    try {
      const res = await safeFetchJson<{ success: boolean; message?: string }>(`/api/notices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok || !res.data?.success) {
        throw new Error(res.data?.message || res.message || 'Failed to delete notice');
      }

      setSuccessMsg('Notice deleted.');
      setNotices((prev) => prev.filter((n) => (n.id || (n as any)._id) !== id));
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
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-16 font-sans">
      {/* Top Admin Security Bar */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors py-1 px-2 rounded hover:bg-slate-800/80"
              title="Return to student public view"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Noticeboard</span>
            </Link>
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-sm font-bold tracking-tight text-white">
                Live Admin Console
              </h1>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60 hidden sm:inline">
                Semester 1 CSE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* Session Timeout */}
            <div className="hidden md:flex items-center gap-1.5 font-mono text-[11px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Auto-logout in:</span>
              <span className="text-amber-400 font-bold">{formatTimer(timeUntilLogout)}</span>
            </div>

            {/* Security Audit Button */}
            <button
              onClick={() => {
                fetchAuditLogs();
                setIsAuditModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              title="View Security Audit Log"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Audit Trail</span>
            </button>

            {/* Change Password Button */}
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Security & Password</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 transition-colors"
              title="Terminate Admin Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock & Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMsg}</div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live Status & Quick Actions Bar */}
        <div className="mb-6 bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Live Broadcast Mode</h2>
                <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  Zero Demo Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                All changes immediately synchronize to students on the public noticeboard.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notices.length > 0 && (
              <button
                onClick={() => setIsPurgeModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                title="Wipe all notices to reset to blank live state"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge All Notices</span>
              </button>
            )}
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Active Broadcasts
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {notices.length}
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Scheduled Exams
            </span>
            <span className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
              {notices.filter((n) => n.category === 'Exam').length}
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Assignments Due
            </span>
            <span className="text-2xl font-bold font-mono text-indigo-600 tabular-nums">
              {notices.filter((n) => n.category === 'Assignment').length}
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Study Materials
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
              {notices.filter((n) => n.category === 'Material').length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Notice Creation / Edit Form (Full CRUD) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sticky lg:top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {editingNoticeId ? 'Edit Broadcast Notice' : 'Broadcast New Notice'}
              </h2>
              {editingNoticeId && (
                <button
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Quick Templates Bar */}
            <div className="flex items-center gap-1.5 mb-3.5 overflow-x-auto pb-1 text-[11px]">
              <span className="font-semibold text-slate-400 uppercase tracking-wider shrink-0">
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
                className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium whitespace-nowrap transition-colors border border-amber-200"
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
                  setResourceLabel('Lab Manual / Boilerplate');
                  setResourceLink('https://github.com/cse-cohort-2026/pps-lab-solutions');
                  setIsUrgent(false);
                }}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap transition-colors"
              >
                + Lab Assignment
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('Lecture Handouts & Problem Bank');
                  setCategory('Material');
                  setCourseCode('25ES1CS101');
                  setDescription('Complete lecture slides, numerical exercise bank, and reference notes for the current unit.');
                  setResourceLabel('Drive Folder: Notes');
                  setResourceLink('https://drive.google.com/drive/folders/cse-slides-25ES1CS101');
                  setIsUrgent(false);
                }}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap transition-colors"
              >
                + Handout
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory('Assignment')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                      category === 'Assignment'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('Exam')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                      category === 'Exam'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 font-semibold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Exam / Test
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('Material')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                      category === 'Material'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Study Material
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Course Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course Code (Semester 1) *
                </label>
                <select
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                >
                  {courses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.title} ({c.category} · {c.credits} Cr)
                    </option>
                  ))}
                </select>
              </div>

              {/* DATE OF EXAM OR TARGET DEADLINE (Specifically asks date of exam for exams!) */}
              <div className={`p-3 rounded-xl border transition-colors ${
                category === 'Exam' ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
              }`}>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className={`w-3.5 h-3.5 ${category === 'Exam' ? 'text-amber-600' : 'text-slate-500'}`} />
                    <span>
                      {category === 'Exam'
                        ? 'Date & Time of Exam *'
                        : category === 'Assignment'
                        ? 'Target Submission Deadline *'
                        : 'Release / Reference Date (Optional)'}
                    </span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">
                    {category === 'Exam' ? 'Exact test schedule' : 'Cutoff deadline'}
                  </span>
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required={category === 'Exam'}
                  placeholder={category === 'Exam' ? 'Select Date and Time of Exam' : 'Select Deadline'}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  {category === 'Exam'
                    ? 'Students will see this prominently as "Exam Date: [Date & Time]" with live countdown in the urgent threat banner.'
                    : category === 'Assignment'
                    ? 'Students will see this as "Deadline: [Date & Time]" with client-side ghost check-off enabled.'
                    : 'Materials without a date will simply be archived in the Subject Vault and feeds.'}
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Resource Link & Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Resource URL (Drive/PDF/Git)
                  </label>
                  <input
                    type="url"
                    value={resourceLink}
                    onChange={(e) => setResourceLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={resourceLabel}
                    onChange={(e) => setResourceLabel(e.target.value)}
                    placeholder={category === 'Exam' ? 'e.g. Formula Sheet / PYQs' : 'e.g. Lab Manual / Template'}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Priority / Urgent Flag */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                  />
                  <span>Mark as High-Priority Immediate Threat (Elevates banner rank)</span>
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wide transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <span>Broadcasting...</span>
                  ) : editingNoticeId ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Update Live Broadcast</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Broadcast to Cohort</span>
                    </>
                  )}
                </button>

                {editingNoticeId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium"
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
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Active Cohort Notices ({notices.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time list of all notices visible to Semester 1 students
                </p>
              </div>

              {editingNoticeId && (
                <span className="text-xs font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                  Editing mode active
                </span>
              )}
            </div>

            {loading ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs text-slate-500">Loading notices...</span>
              </div>
            ) : notices.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  Live Noticeboard is Completely Clean
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                  Zero demo notices currently loaded. Students on the public site see an "All Systems Clear" status. Use the form on the left to broadcast the first official notice or schedule an exam date!
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <Check className="w-3.5 h-3.5" />
                  <span>Production Live Mode Active</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {notices.map((n) => {
                  const noticeId = n.id || (n as any)._id;
                  const isBeingEdited = editingNoticeId === noticeId;
                  const isExam = n.category === 'Exam';

                  return (
                    <div
                      key={noticeId}
                      className={`p-4 rounded-xl border bg-white transition-all ${
                        isBeingEdited
                          ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs">
                            <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white text-[11px]">
                              {n.courseCode}
                            </span>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                isExam
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : n.category === 'Assignment'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {n.category}
                            </span>
                            {n.isUrgent && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                Urgent
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                            {n.title}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                            {n.description}
                          </p>

                          {/* Metadata row */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
                            {n.deadline && (
                              <span className="flex items-center gap-1 font-semibold text-slate-700">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
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
                              <span className="flex items-center gap-1 text-indigo-600 truncate max-w-[200px]">
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{n.resourceLabel || 'Attached Link'}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <button
                            onClick={() => startEdit(n)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Edit Notice"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(noticeId)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
      </main>

      {/* Security & Password Modal */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Shield className="w-5 h-5 text-rose-600" />
                <span>Admin Gateway Security</span>
              </div>
              <button
                onClick={() => setIsSecurityModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Update the master admin passkey. Ensure this secret is shared only with designated cohort administrators.
            </p>

            {securityError && (
              <div className="mb-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {securityError}
              </div>
            )}

            {securityMsg && (
              <div className="mb-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                {securityMsg}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Master Password *
                </label>
                <input
                  type="password"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                    className="w-full pl-3 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Master Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retype new password"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <History className="w-5 h-5 text-indigo-600" />
                <span>Access Control & Security Audit Trail</span>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 py-3">
              Real-time security log of authentication events, IP addresses, and intrusion prevention triggers.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {loadingAudit ? (
                <div className="py-8 text-center text-slate-400">Loading audit trail...</div>
              ) : auditLogs.length === 0 ? (
                <div className="py-8 text-center text-slate-400">No security audit records logged yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-start justify-between gap-3 font-mono text-[11px]"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.status === 'danger'
                              ? 'bg-rose-100 text-rose-800'
                              : log.status === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : log.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {log.event}
                        </span>
                        <span className="text-slate-500">IP: {log.ip}</span>
                      </div>
                      <p className="text-slate-700 font-sans text-xs">{log.details}</p>
                    </div>
                    <span className="text-slate-400 shrink-0 text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purge All Notices Confirmation Modal */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">
                Purge All Broadcast Notices?
              </h3>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              This will remove all {notices.length} current notices from the feed. This action is designed for cleaning demo or past semester items. The 9 Semester 1 courses in the Subject Vault will remain intact.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsPurgeModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeAll}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
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
