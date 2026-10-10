/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Calendar,
  ExternalLink,
  Check,
  AlertCircle,
  Database,
  Flame,
  Clock,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  BookOpen
} from 'lucide-react';
import { Assignment, Course } from '../types';
import { safeFetchJson } from '../utils/api';

interface AssignmentManagerProps {
  assignments: Assignment[];
  courses: Course[];
  token: string | null;
  onRefresh: () => void;
  onShowMessage: (msg: string) => void;
  onShowError: (err: string) => void;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  assignments,
  courses,
  token,
  onRefresh,
  onShowMessage,
  onShowError,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [courseCode, setCourseCode] = useState(courses[0]?.code || '25ES1CS101');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [priority, setPriority] = useState<'urgent' | 'high' | 'normal'>('normal');
  const [maxPoints, setMaxPoints] = useState<number>(20);
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringSeed, setRestoringSeed] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setCourseCode(courses[0]?.code || '25ES1CS101');
    setTitle('');
    setDescription('');
    setDueDate('');
    setSubmissionUrl('');
    setPriority('normal');
    setMaxPoints(20);
    setTags('');
  };

  const handleStartEdit = (a: Assignment) => {
    setEditingId(a.id);
    setCourseCode(a.courseCode);
    setTitle(a.title);
    setDescription(a.description);
    setDueDate(a.dueDate ? new Date(a.dueDate).toISOString().slice(0, 16) : '');
    setSubmissionUrl(a.submissionUrl || '');
    setPriority(a.priority || 'normal');
    setMaxPoints(a.maxPoints || 20);
    setTags(a.tags ? a.tags.join(', ') : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !courseCode || !dueDate) {
      onShowError('Course code, title, description, and due date are required.');
      return;
    }

    setSubmitting(true);
    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      courseCode,
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate).toISOString(),
      submissionUrl: submissionUrl.trim(),
      priority,
      maxPoints: Number(maxPoints) || 20,
      tags: parsedTags,
    };

    try {
      const url = editingId ? `/api/assignments/${editingId}` : '/api/assignments';
      const method = editingId ? 'PUT' : 'POST';

      const res = await safeFetchJson<{ success: boolean; message?: string; assignment?: Assignment }>(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok && res.data?.success) {
        onShowMessage(res.data.message || (editingId ? 'Assignment updated!' : 'Assignment broadcasted!'));
        resetForm();
        onRefresh();
      } else {
        onShowError(res.data?.message || 'Failed to save assignment');
      }
    } catch (err: any) {
      onShowError(err.message || 'Error communicating with server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete assignment "${itemTitle}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await safeFetchJson<{ success: boolean; message?: string }>(`/api/assignments/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok && res.data?.success) {
        onShowMessage(res.data.message || 'Assignment removed successfully.');
        if (editingId === id) resetForm();
        onRefresh();
      } else {
        onShowError(res.data?.message || 'Failed to delete assignment');
      }
    } catch (err: any) {
      onShowError(err.message || 'Error deleting assignment');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestoreStandardSeed = async () => {
    if (!window.confirm('Restore standard 5 Section B curriculum assignments? This replaces the active assignment list.')) {
      return;
    }

    setRestoringSeed(true);
    try {
      const res = await safeFetchJson<{ success: boolean; message?: string }>('/api/assignments/reset-seed', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok && res.data?.success) {
        onShowMessage(res.data.message || 'Standard assignments restored successfully.');
        resetForm();
        onRefresh();
      } else {
        onShowError(res.data?.message || 'Failed to restore default assignments');
      }
    } catch (err: any) {
      onShowError(err.message || 'Error restoring assignments');
    } finally {
      setRestoringSeed(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Persistent Storage Header Status Card */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-[1.75rem] p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-zinc-950 dark:text-white">
                Dual-Layer Persistent Storage Active
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold">
                Atomic JSON & DB
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              All published assignments are written permanently to disk (<span className="font-mono">data/assignments.json</span>) with zero loss on restart.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRestoreStandardSeed}
          disabled={restoringSeed}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer shrink-0"
          title="Reset to default Section B curriculum assignments"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${restoringSeed ? 'animate-spin' : ''}`} />
          <span>Restore Standard 5 Assignments</span>
        </button>
      </div>

      {/* 2. Main Grid: Form on Left, List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] p-6 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs sticky top-24">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#85aa00] dark:text-[#c4f510]" />
                <span>{editingId ? 'Edit Assignment' : 'Broadcast New Assignment'}</span>
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-semibold cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Course Selection */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Course / Subject *
                </label>
                <select
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium focus:ring-2 focus:ring-[#c4f510] focus:outline-none cursor-pointer"
                >
                  {courses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} · {c.shortTitle || c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignment Title */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lab Sheet 3: Dynamic Memory Allocation in C"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-[#c4f510] focus:outline-none"
                  required
                />
              </div>

              {/* Instructions / Description */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Instructions & Criteria *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Problem numbers, required format (PDF/source code), edge cases, and submission rules..."
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-[#c4f510] focus:outline-none leading-relaxed"
                  required
                />
              </div>

              {/* Due Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Due Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#c4f510] focus:outline-none font-mono text-[11px]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Priority Tier
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#c4f510] focus:outline-none cursor-pointer"
                  >
                    <option value="normal">Normal (Standard)</option>
                    <option value="high">High (48h cutoff)</option>
                    <option value="urgent">Urgent (Immediate)</option>
                  </select>
                </div>
              </div>

              {/* Submission URL & Max Points */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Submission Link (URL)
                  </label>
                  <input
                    type="url"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    placeholder="https://classroom.google.com/..."
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-[#c4f510] focus:outline-none font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={maxPoints}
                    onChange={(e) => setMaxPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#c4f510] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. Lab Sheet, C Programming, Pointers"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-[#c4f510] focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 px-4 bg-[#c4f510] hover:bg-[#b2df0f] text-zinc-950 font-black rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{submitting ? 'Saving...' : editingId ? 'Update Assignment' : 'Broadcast Assignment'}</span>
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="py-2.5 px-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Active Assignments List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
              <span>Active Tracked Assignments</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {assignments.length} Total
              </span>
            </h3>
            <span className="text-[11px] text-zinc-500 font-medium">Sorted by due date</span>
          </div>

          {assignments.length === 0 ? (
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] p-8 text-center border border-zinc-200/80 dark:border-zinc-800/80">
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No active assignments posted</p>
              <p className="text-xs text-zinc-500 mt-1 mb-4">Click below to load the standard curriculum assignments.</p>
              <button
                type="button"
                onClick={handleRestoreStandardSeed}
                className="px-4 py-2 rounded-full bg-[#c4f510] text-zinc-950 font-bold text-xs shadow-xs"
              >
                Load Standard 5 Assignments
              </button>
            </div>
          ) : (
            assignments.map((item) => {
              const due = new Date(item.dueDate);
              const formattedDate = due.toLocaleDateString([], {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
              const formattedTime = due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-[#1e1e1e] rounded-[1.75rem] p-5 border transition-all ${
                    editingId === item.id
                      ? 'border-[#c4f510] ring-2 ring-[#c4f510]/40 shadow-sm'
                      : 'border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                        {item.courseCode}
                      </span>
                      {item.priority === 'urgent' && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white">
                          Urgent
                        </span>
                      )}
                      {item.priority === 'high' && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                          High
                        </span>
                      )}
                      {item.maxPoints && (
                        <span className="text-[10px] font-mono text-zinc-400">
                          {item.maxPoints} pts
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Edit Assignment"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        disabled={deletingId === item.id}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-zinc-950 dark:text-white tracking-tight mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-3">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px]">
                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-mono">
                      <Calendar className="w-3 h-3 text-[#85aa00] dark:text-[#c4f510]" />
                      <span>Due: {formattedDate} at {formattedTime}</span>
                    </div>

                    {item.submissionUrl && (
                      <a
                        href={item.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                      >
                        <span>Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentManager;
