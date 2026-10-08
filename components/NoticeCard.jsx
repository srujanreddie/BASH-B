/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  ExternalLink, 
  FolderGit2, 
  FileText, 
  Calendar, 
  Share2 
} from 'lucide-react';

/**
 * NoticeCard with "Ghost" Check-Off & Centralized Resource Links.
 * Client-side checked states are kept in localStorage without mutating the database.
 */
export const NoticeCard = ({
  notice,
  isCompleted = false,
  onToggleComplete,
  onFilterCourse,
  onOpenResourcePreview,
}) => {
  const [copied, setCopied] = useState(false);
  const noticeId = notice.id || notice._id;

  const formatDeadline = (deadlineIso) => {
    if (!deadlineIso) return null;
    const date = new Date(deadlineIso);
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });

    const isExam = notice.category === 'Exam';
    let urgencyTag = '';
    if (diffHours < 0) {
      urgencyTag = isExam ? 'Exam Concluded' : 'Expired';
    } else if (diffHours <= 24) {
      urgencyTag = isExam ? 'Exam in < 24h' : 'Due in < 24h';
    } else if (diffHours <= 72) {
      urgencyTag = isExam ? `Exam in ${Math.round(diffHours / 24)}d` : `Due in ${Math.round(diffHours / 24)}d`;
    } else {
      urgencyTag = isExam ? `Exam: ${dateStr}` : `Due: ${dateStr}`;
    }

    return {
      dateStr,
      timeStr,
      urgencyTag,
      isOverdue: diffHours < 0,
      isNear: diffHours >= 0 && diffHours <= 24,
      isExam,
    };
  };

  const deadlineInfo = formatDeadline(notice.deadline);

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      const shareText = `[${notice.courseCode}] ${notice.title} - CSE Sem 1 Notice`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText}\n${notice.description}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  const handleResourceClick = (e) => {
    e.stopPropagation();
    if (!notice.resourceLink) return;
    if (onOpenResourcePreview) {
      onOpenResourcePreview(notice.resourceLabel || notice.title, notice.resourceLink, notice.courseCode);
    } else {
      window.open(notice.resourceLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article
      className={`group relative rounded-xl border p-4 sm:p-5 transition-all duration-200 ${
        isCompleted
          ? 'bg-slate-50/70 border-slate-200/80 opacity-60'
          : 'bg-white hover:bg-slate-50/30 border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Ghost Checkbox */}
        <div className="pt-0.5 shrink-0">
          <label 
            htmlFor={`notice-check-${noticeId}`}
            className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
            title={isCompleted ? 'Mark as incomplete' : 'Ghost check-off (Saved locally)'}
          >
            <input
              id={`notice-check-${noticeId}`}
              type="checkbox"
              checked={isCompleted}
              onChange={() => onToggleComplete && onToggleComplete(noticeId)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                isCompleted
                  ? 'bg-slate-700 border-slate-700 text-white'
                  : 'border-slate-300 group-hover:border-slate-400 bg-white'
              }`}
            >
              {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </label>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <button
              type="button"
              onClick={() => onFilterCourse && onFilterCourse(notice.courseCode)}
              className="font-mono font-semibold text-slate-900 hover:text-indigo-600 transition-colors hover:underline"
            >
              {notice.courseCode}
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-medium text-slate-700">{notice.category}</span>
            {notice.courseTitle && (
              <>
                <span aria-hidden="true" className="text-slate-300 hidden sm:inline">·</span>
                <span className="truncate max-w-[200px] text-slate-500 hidden sm:inline">
                  {notice.courseTitle}
                </span>
              </>
            )}
            {deadlineInfo && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span
                  className={`font-mono tabular-nums flex items-center gap-1 ${
                    deadlineInfo.isNear
                      ? 'text-rose-600 font-semibold'
                      : deadlineInfo.isOverdue
                      ? 'text-slate-400'
                      : 'text-amber-700'
                  }`}
                >
                  <Clock className="w-3 h-3 shrink-0" />
                  {deadlineInfo.urgencyTag || deadlineInfo.dateStr}
                </span>
              </>
            )}
          </div>

          <h3
            className={`text-base font-semibold tracking-tight text-slate-900 leading-snug mb-1.5 ${
              isCompleted ? 'line-through text-slate-500' : ''
            }`}
          >
            {notice.title}
          </h3>

          <p
            className={`text-sm leading-relaxed mb-3 ${
              isCompleted ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {notice.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div>
              {notice.resourceLink ? (
                <button
                  type="button"
                  onClick={handleResourceClick}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  {notice.resourceLink.includes('github') ? (
                    <FolderGit2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  )}
                  <span className="truncate max-w-[220px]">
                    {notice.resourceLabel || 'Open Attached Resource'}
                  </span>
                  <ExternalLink className="w-3 h-3 text-indigo-400 shrink-0" />
                </button>
              ) : (
                <span className="text-xs text-slate-400 italic">No external link attached</span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              {notice.deadline && (
                <div className="flex items-center gap-1 font-mono tabular-nums text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{new Date(notice.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title={copied ? 'Copied details to clipboard!' : 'Copy notice details'}
              >
                {copied ? (
                  <span className="text-[11px] text-emerald-600 font-semibold px-1">Copied!</span>
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default NoticeCard;
