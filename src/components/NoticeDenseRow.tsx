/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, Clock, ExternalLink, FileText, FolderGit2 } from 'lucide-react';
import { Notice } from '../types';

interface NoticeDenseRowProps {
  notice: Notice;
  isCompleted: boolean;
  onToggleComplete: (id: string) => void;
  onFilterCourse?: (courseCode: string) => void;
  onOpenResourcePreview?: (title: string, url: string, courseCode: string) => void;
}

export const NoticeDenseRow: React.FC<NoticeDenseRowProps> = ({
  notice,
  isCompleted,
  onToggleComplete,
  onFilterCourse,
  onOpenResourcePreview,
}) => {
  const noticeId = notice.id || (notice as any)._id;

  const formatDeadline = (deadlineIso?: string | null) => {
    if (!deadlineIso) return null;
    const date = new Date(deadlineIso);
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

    const isExam = notice.category === 'Exam';
    let status = '';
    if (diffHours < 0) status = isExam ? 'Concluded' : 'Expired';
    else if (diffHours <= 24) status = isExam ? `Exam in ${Math.max(1, Math.round(diffHours))}h` : `Due in ${Math.max(1, Math.round(diffHours))}h`;
    else status = isExam ? `Exam in ${Math.round(diffHours / 24)}d` : `In ${Math.round(diffHours / 24)}d`;

    return {
      dateText: date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status,
      isNear: diffHours >= 0 && diffHours <= 24,
      isOverdue: diffHours < 0,
      isExam,
    };
  };

  const dl = formatDeadline(notice.deadline);

  return (
    <div
      className={`px-3 py-2.5 rounded-lg border transition-all flex items-center justify-between gap-3 text-xs ${
        isCompleted
          ? 'bg-slate-50/70 border-slate-200/80 opacity-60 line-through'
          : 'bg-white hover:bg-slate-50/70 border-slate-200 text-slate-900 shadow-2xs'
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggleComplete(noticeId)}
        className="w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors"
        aria-label="Toggle task completion"
      >
        <div
          className={`w-4 h-4 rounded flex items-center justify-center ${
            isCompleted ? 'bg-slate-700 text-white' : 'border border-slate-300 bg-white'
          }`}
        >
          {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      </button>

      {/* Subject Code */}
      <button
        type="button"
        onClick={() => onFilterCourse && onFilterCourse(notice.courseCode)}
        className="font-mono font-bold text-slate-800 hover:text-indigo-600 shrink-0 w-24 text-left"
      >
        {notice.courseCode}
      </button>

      {/* Title & Category */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold truncate text-slate-900">
            {notice.title}
          </span>
          <span className="text-[11px] text-slate-400 shrink-0">
            ({notice.category})
          </span>
        </div>
      </div>

      {/* Deadline */}
      <div className="shrink-0 w-36 text-right font-mono tabular-nums">
        {dl ? (
          <span
            className={`flex items-center justify-end gap-1 ${
              dl.isNear ? 'text-rose-600 font-bold' : dl.isOverdue ? 'text-slate-400' : 'text-amber-700'
            }`}
          >
            <Clock className="w-3 h-3 shrink-0" />
            <span>{dl.status}</span>
          </span>
        ) : (
          <span className="text-slate-400 text-[11px]">No deadline</span>
        )}
      </div>

      {/* External Link */}
      <div className="shrink-0 w-24 text-right">
        {notice.resourceLink ? (
          <button
            type="button"
            onClick={() =>
              onOpenResourcePreview &&
              onOpenResourcePreview(notice.resourceLabel || notice.title, notice.resourceLink!, notice.courseCode)
            }
            className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded transition-colors"
          >
            <span>Drive</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        ) : (
          <span className="text-slate-300 text-[11px]">-</span>
        )}
      </div>
    </div>
  );
};

export default NoticeDenseRow;
