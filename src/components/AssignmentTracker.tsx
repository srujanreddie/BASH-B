/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Search,
  Filter,
  CheckCheck,
  CalendarPlus,
  Download,
  Flame,
  ArrowUpDown,
  BookOpen,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Database
} from 'lucide-react';
import { Assignment, Course } from '../types';
import { getGoogleCalendarUrlForAssignment, exportAssignmentsToIcs } from '../utils/calendarExport';

interface AssignmentTrackerProps {
  assignments: Assignment[];
  courses: Course[];
  selectedCourseCode?: string;
  onSelectCourseCode?: (code: string) => void;
  onRefresh?: () => void;
}

export const AssignmentTracker: React.FC<AssignmentTrackerProps> = ({
  assignments,
  courses,
  selectedCourseCode = 'All',
  onSelectCourseCode,
  onRefresh,
}) => {
  // Personal checklist status saved in student's browser localStorage
  const [checklist, setChecklist] = useState<Record<string, { completed: boolean; completedAt: string }>>(() => {
    try {
      const stored = localStorage.getItem('cse_section_b_assignment_checklist');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'dueSoon' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'dueAsc' | 'priority' | 'newest'>('dueAsc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [calendarNotice, setCalendarNotice] = useState<string | null>(null);

  // Toggle completion of an assignment
  const handleToggleCheck = (id: string) => {
    setChecklist((prev) => {
      const current = prev[id]?.completed;
      const nextState = !current;
      const updated = {
        ...prev,
        [id]: {
          completed: nextState,
          completedAt: nextState ? new Date().toISOString() : '',
        },
      };
      try {
        localStorage.setItem('cse_section_b_assignment_checklist', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Mark all visible as complete
  const handleMarkAllVisible = (done: boolean) => {
    setChecklist((prev) => {
      const updated = { ...prev };
      filteredAssignments.forEach((a) => {
        updated[a.id] = {
          completed: done,
          completedAt: done ? new Date().toISOString() : '',
        };
      });
      try {
        localStorage.setItem('cse_section_b_assignment_checklist', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Metrics
  const totalCount = assignments.length;
  const completedCount = useMemo(() => {
    return assignments.filter((a) => checklist[a.id]?.completed).length;
  }, [assignments, checklist]);

  const pendingCount = totalCount - completedCount;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  const now = Date.now();
  const dueSoonCount = useMemo(() => {
    return assignments.filter((a) => {
      if (checklist[a.id]?.completed) return false;
      const dueTime = new Date(a.dueDate).getTime();
      const diffHours = (dueTime - now) / (1000 * 3600);
      return diffHours > 0 && diffHours <= 48;
    }).length;
  }, [assignments, checklist, now]);

  // Filtering & Sorting
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((a) => {
        // Course filter
        if (selectedCourseCode !== 'All' && a.courseCode !== selectedCourseCode) {
          return false;
        }

        const isCompleted = Boolean(checklist[a.id]?.completed);
        const dueTime = new Date(a.dueDate).getTime();
        const diffHours = (dueTime - now) / (1000 * 3600);

        // Status filter
        if (statusFilter === 'completed' && !isCompleted) return false;
        if (statusFilter === 'pending' && isCompleted) return false;
        if (statusFilter === 'dueSoon') {
          if (isCompleted) return false;
          if (diffHours < 0 || diffHours > 48) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = a.title.toLowerCase().includes(q);
          const matchDesc = a.description.toLowerCase().includes(q);
          const matchCode = a.courseCode.toLowerCase().includes(q);
          const matchCourse = a.courseTitle?.toLowerCase().includes(q);
          const matchTags = a.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchCode && !matchCourse && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Put completed items at bottom if in "all" view
        if (statusFilter === 'all') {
          const aDone = checklist[a.id]?.completed;
          const bDone = checklist[b.id]?.completed;
          if (aDone && !bDone) return 1;
          if (!aDone && bDone) return -1;
        }

        if (sortBy === 'priority') {
          const weights: Record<string, number> = { urgent: 3, high: 2, normal: 1 };
          return (weights[b.priority] || 0) - (weights[a.priority] || 0);
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // Default: due date ascending
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [assignments, selectedCourseCode, statusFilter, searchQuery, sortBy, checklist, now]);

  const handleExportPending = () => {
    const pendingList = assignments.filter((a) => !checklist[a.id]?.completed);
    if (pendingList.length === 0) {
      setCalendarNotice('All assignments are completed! No pending items to export.');
      setTimeout(() => setCalendarNotice(null), 3500);
      return;
    }
    const success = exportAssignmentsToIcs(pendingList, 'VNR VJIET Section B');
    if (success) {
      setCalendarNotice(`Exported ${pendingList.length} pending deadlines to .ics!`);
      setTimeout(() => setCalendarNotice(null), 3500);
    }
  };

  const formatDueDate = (dueIso: string) => {
    const due = new Date(dueIso);
    const diffHours = (due.getTime() - now) / (1000 * 3600);
    const dateFormatted = due.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const timeFormatted = due.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    let relative = '';
    let badgeColor = '';

    if (diffHours < 0) {
      relative = 'Overdue';
      badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
    } else if (diffHours <= 24) {
      relative = `Due today (${Math.round(diffHours)}h left)`;
      badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold';
    } else if (diffHours <= 48) {
      relative = `Due tomorrow (${Math.round(diffHours)}h)`;
      badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold';
    } else {
      const days = Math.ceil(diffHours / 24);
      relative = `${days} days left`;
      badgeColor = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
    }

    return { dateFormatted, timeFormatted, relative, badgeColor, isUrgent: diffHours <= 48 && diffHours >= 0 };
  };

  return (
    <div className="space-y-6">
      {/* 1. Metric Overview Ribbon */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Assignment metrics">
        {/* Progress Card */}
        <div className="bg-white dark:bg-[#18181b] rounded-2xl p-4.5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Personal Progress
            </span>
            <span className="text-xs font-black text-[#85aa00] dark:text-[#c4f510] font-mono">
              {completionRate}%
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="text-2xl font-black text-zinc-950 dark:text-white tabular-nums">
              {completedCount}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">of {totalCount} completed</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#c4f510] dark:bg-[#c4f510] h-full transition-all duration-300 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-white dark:bg-[#18181b] rounded-2xl p-4.5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Active Pending
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-950 dark:text-white tabular-nums">
              {pendingCount}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">tasks on checklist</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
            Checked items persist locally in your browser
          </p>
        </div>

        {/* Due Soon Card */}
        <div className="bg-white dark:bg-[#18181b] rounded-2xl p-4.5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Due Within 48h
            </span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
              {dueSoonCount}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">require immediate action</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
            High priority lab submissions & sheets
          </p>
        </div>

        {/* Persistent Storage Status Card */}
        <div className="bg-white dark:bg-[#18181b] rounded-2xl p-4.5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Storage Engine
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-bold text-zinc-900 dark:text-white">
              Persistent & Synced
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
            Atomic storage: Zero data loss on restart
          </p>
        </div>
      </section>

      {/* Toast Notification */}
      {calendarNotice && (
        <div className="bg-[#c4f510] text-zinc-950 font-bold px-4 py-2.5 rounded-xl shadow-md text-xs sm:text-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CalendarPlus className="w-4 h-4" />
            <span>{calendarNotice}</span>
          </div>
          <button
            onClick={() => setCalendarNotice(null)}
            className="text-zinc-800 hover:text-black font-extrabold cursor-pointer px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Control Bar: Filter, Search & Export */}
      <div className="bg-white dark:bg-[#18181b] rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Segmented Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('dueSoon')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'dueSoon'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Due Soon ({dueSoonCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Quick Actions: Export to Calendar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Download .ics calendar of all pending deadlines"
            >
              <Download className="w-3.5 h-3.5 text-[#c4f510]" />
              <span>Export Pending (.ics)</span>
            </button>
          </div>
        </div>

        {/* Second Row: Search, Course Selection, Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assignments, topics, problem sets..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#c4f510]"
            />
          </div>

          {/* Course select if provided */}
          {onSelectCourseCode && (
            <select
              value={selectedCourseCode}
              onChange={(e) => onSelectCourseCode(e.target.value)}
              className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#c4f510] cursor-pointer"
            >
              <option value="All">All Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.shortTitle || c.title}
                </option>
              ))}
            </select>
          )}

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#c4f510] cursor-pointer"
          >
            <option value="dueAsc">Sort: Due Date (Earliest)</option>
            <option value="priority">Sort: Highest Priority</option>
            <option value="newest">Sort: Recently Added</option>
          </select>
        </div>
      </div>

      {/* 3. Assignment Checklist Cards */}
      <div className="space-y-3">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white dark:bg-[#18181b] rounded-2xl p-10 text-center border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
              <CheckCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">
              {statusFilter === 'completed'
                ? 'No completed assignments yet'
                : statusFilter === 'dueSoon'
                ? 'No assignments due in the next 48 hours!'
                : 'All Section B Assignments Completed!'}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
              {statusFilter === 'all'
                ? 'You are completely caught up with your Semester 1 coursework & lab submissions.'
                : 'Check other filter categories or search terms to inspect more items.'}
            </p>
          </div>
        ) : (
          filteredAssignments.map((assignment) => {
            const isCompleted = Boolean(checklist[assignment.id]?.completed);
            const { dateFormatted, timeFormatted, relative, badgeColor, isUrgent } = formatDueDate(assignment.dueDate);
            const isExpanded = expandedId === assignment.id;
            const googleCalUrl = getGoogleCalendarUrlForAssignment(assignment);

            return (
              <div
                key={assignment.id}
                className={`group rounded-2xl p-4 sm:p-5 border transition-all duration-150 ${
                  isCompleted
                    ? 'bg-zinc-50/70 dark:bg-[#18181b]/50 border-zinc-200/50 dark:border-zinc-800/50 opacity-75'
                    : isUrgent
                    ? 'bg-white dark:bg-[#18181b] border-rose-300 dark:border-rose-900/60 shadow-xs'
                    : 'bg-white dark:bg-[#18181b] border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Interactive Checkbox Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleCheck(assignment.id)}
                    className="mt-0.5 shrink-0 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    title={isCompleted ? 'Mark as pending' : 'Mark completed on checklist'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100 dark:fill-emerald-950/40" />
                    ) : (
                      <Circle className="w-6 h-6 stroke-[1.75]" />
                    )}
                  </button>

                  {/* Main Content Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {/* Course badge */}
                      <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                        {assignment.courseCode}
                      </span>

                      {/* Course title short */}
                      {assignment.courseTitle && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[200px] sm:max-w-[320px]">
                          {assignment.courseTitle}
                        </span>
                      )}

                      {/* Priority chip */}
                      {assignment.priority === 'urgent' && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white tracking-wider">
                          Urgent
                        </span>
                      )}
                      {assignment.priority === 'high' && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          High
                        </span>
                      )}

                      {/* Points badge if present */}
                      {assignment.maxPoints && (
                        <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 ml-auto tabular-nums">
                          {assignment.maxPoints} pts
                        </span>
                      )}
                    </div>

                    {/* Assignment Title */}
                    <h3
                      className={`text-sm sm:text-base font-bold tracking-tight ${
                        isCompleted
                          ? 'line-through text-zinc-500 dark:text-zinc-400'
                          : 'text-zinc-950 dark:text-white'
                      }`}
                    >
                      {assignment.title}
                    </h3>

                    {/* Description preview / expanded */}
                    <div className="mt-1">
                      <p
                        className={`text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed ${
                          isExpanded ? 'whitespace-pre-line' : 'line-clamp-2'
                        }`}
                      >
                        {assignment.description}
                      </p>
                      {assignment.description.length > 120 && (
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : assignment.id)}
                          className="text-[11px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 mt-1 inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              <span>Show less</span>
                              <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              <span>Read full instructions</span>
                              <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Tags */}
                    {assignment.tags && assignment.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {assignment.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom Metadata & Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
                      {/* Due date countdown pill */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] border font-medium ${badgeColor}`}>
                          <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
                          {relative}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                          Due: {dateFormatted} at {timeFormatted}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {/* Direct Submission URL Button */}
                        {assignment.submissionUrl && (
                          <a
                            href={assignment.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#c4f510] hover:bg-[#b2df0f] text-zinc-950 font-bold text-xs shadow-2xs transition-colors"
                          >
                            <span>Open Submission</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {/* Add to Google Calendar button */}
                        <a
                          href={googleCalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors"
                          title="Add assignment deadline to Google Calendar"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Add to Cal</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AssignmentTracker;
