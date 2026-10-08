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
  Check, 
  AlertCircle,
  FileText,
  Clock
} from 'lucide-react';

/**
 * Protected Admin Dashboard with full CRUD capabilities:
 * - Create notices with course code, category, deadline, resource URL
 * - Edit existing notices
 * - Delete notices
 * - Seed default 9 courses and dummy deadlines
 */
export const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Assignment');
  const [courseCode, setCourseCode] = useState('25ES1CS101');
  const [deadline, setDeadline] = useState('');
  const [resourceLink, setResourceLink] = useState('');
  const [resourceLabel, setResourceLabel] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const token = sessionStorage.getItem('cse_admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin-login');
      return;
    }
    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesRes, noticesRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/notices'),
      ]);

      const coursesData = await coursesRes.json();
      const noticesData = await noticesRes.json();

      if (coursesData.success) {
        setCourses(coursesData.courses);
        if (coursesData.courses.length > 0 && !courseCode) {
          setCourseCode(coursesData.courses[0].code);
        }
      }
      if (noticesData.success) {
        setNotices(noticesData.notices);
      }
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cse_admin_token');
    sessionStorage.removeItem('cse_admin_user');
    navigate('/admin-login');
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

  const startEdit = (notice) => {
    setEditingNoticeId(notice.id || notice._id);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !courseCode || !category) {
      setError('Please fill in required fields');
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
      resourceLabel: resourceLabel || (resourceLink ? 'Attached Resource' : ''),
      isUrgent,
    };

    try {
      const url = editingNoticeId ? `/api/notices/${editingNoticeId}` : '/api/notices';
      const method = editingNoticeId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          return;
        }
        throw new Error(data.message || 'Operation failed');
      }

      setSuccessMsg(editingNoticeId ? 'Notice updated successfully!' : 'Notice created successfully!');
      resetForm();
      fetchData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;

    try {
      const response = await fetch(`/api/notices/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete');
      }

      setSuccessMsg('Notice deleted successfully.');
      fetchData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReseed = async () => {
    if (!window.confirm('Reset database with Semester 1 default courses and dummy deadlines?')) return;

    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg('Reseeded default curriculum data!');
        fetchData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      setError('Reseed error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Student View</span>
            </Link>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="font-semibold text-sm tracking-tight text-white">
              CSE Cohort Admin Console
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReseed}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reseed Defaults</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 text-xs text-rose-300 hover:text-rose-100 bg-rose-950/60 hover:bg-rose-900 rounded-lg transition-colors flex items-center gap-1 border border-rose-800"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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

            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notice Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lab Record Submission: Experiment 5"
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course Code (Sem 1) *
                  </label>
                  <select
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.shortTitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Exam">Exam / Midterm</option>
                    <option value="Material">Material / Handout</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>
                    {category === 'Exam'
                      ? 'Date & Time of Exam *'
                      : category === 'Assignment'
                      ? 'Target Submission Deadline *'
                      : 'Reference / Target Date (Optional)'}
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">
                    {category === 'Exam'
                      ? 'Examination commencement time'
                      : category === 'Assignment'
                      ? 'Cutoff submission time'
                      : 'Optional for Materials'}
                  </span>
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required={category === 'Exam'}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resource Link (Drive / GitHub / PDF URL)
                </label>
                <input
                  type="url"
                  value={resourceLink}
                  onChange={(e) => setResourceLink(e.target.value)}
                  placeholder="https://drive.google.com/... or https://github.com/..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resource Label / Button Text
                </label>
                <input
                  type="text"
                  value={resourceLabel}
                  onChange={(e) => setResourceLabel(e.target.value)}
                  placeholder="e.g. Experiment 5 Code & Test Cases"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Instructions & Rubrics *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specific requirements, submission instructions, and penalty clauses..."
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wide transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Processing...</span>
                  ) : editingNoticeId ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Update Notice</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Publish to Cohort Noticeboard</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Active Notice Inventory ({notices.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Live notices synchronized across all student sessions
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500">Loading notices...</span>
              </div>
            ) : notices.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500 mb-2">No active notices found in database.</p>
                <button
                  onClick={handleReseed}
                  className="px-3 py-1.5 text-xs bg-slate-900 text-white rounded-lg"
                >
                  Seed Default Deadlines
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {notices.map((n) => {
                  const id = n.id || n._id;
                  return (
                    <div
                      key={id}
                      className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                            <span className="font-mono font-semibold text-slate-900">
                              {n.courseCode}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="font-medium text-slate-700">{n.category}</span>
                            {n.deadline && (
                              <>
                                <span className="text-slate-300">·</span>
                                <span className="font-mono tabular-nums text-amber-700 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(n.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </>
                            )}
                          </div>

                          <h4 className="text-sm font-semibold text-slate-900 leading-snug mb-1">
                            {n.title}
                          </h4>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2">
                            {n.description}
                          </p>

                          {n.resourceLink && (
                            <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-medium">
                              <FileText className="w-3 h-3" />
                              <span className="truncate max-w-xs">{n.resourceLabel || n.resourceLink}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => startEdit(n)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Notice"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
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
    </div>
  );
};

export default Dashboard;
