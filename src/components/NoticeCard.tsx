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
  Share2,
  CalendarPlus,
  Star
} from 'lucide-react';
import { Notice } from '../types';
import { getGoogleCalendarUrl } from '../utils/calendarExport';

interface NoticeCardProps {
  notice: Notice;
  isCompleted: boolean;
  onToggleComplete: (id: string) => void;
  isStarred?: boolean;
  onToggleStar?: (id: string) => void;
  onFilterCourse?: (courseCode: string) => void;
  onOpenResourcePreview?: (title: string, url: string, courseCode: string) => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  isCompleted,
  onToggleComplete,
  isStarred = false,
  onToggleStar,
  onFilterCourse,
  onOpenResourcePreview,
}) => {
  const [copied, setCopied] = useState(false);
  const noticeId = notice.id || (notice as any)._id;

  // Format deadline and compute remaining status
  const formatDeadline = (deadlineIso?: string | null) => {
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

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const shareText = `[${notice.courseCode}] ${notice.title} - CSE Sem 1 Notice`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText}\n${notice.description}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  const handleResourceClick = (e: React.MouseEvent) => {
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
      className={`group relative rounded-[2rem] border p-5 sm:p-6 transition-all duration-200 ${
        isCompleted
          ? 'bg-zinc-100/70 border-zinc-200/80 opacity-60'
          : 'bg-white hover:border-zinc-300 border-zinc-200/70 shadow-xs hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Ghost Check-Off Checkbox */}
        <div className="pt-0.5 shrink-0">
          <label 
            htmlFor={`checkbox-${noticeId}`}
            className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer hover:bg-zinc-100 transition-colors"
            title={isCompleted ? 'Mark as incomplete' : 'Ghost check-off (Saved locally)'}
          >
            <input
              id={`checkbox-${noticeId}`}
              type="checkbox"
              checked={isCompleted}
              onChange={() => onToggleComplete(noticeId)}
              className="sr-only"
            />
            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                isCompleted
                  ? 'bg-[#d2f34c] border-[#d2f34c] text-zinc-950 font-bold'
                  : 'border-zinc-300 group-hover:border-zinc-400 bg-white'
              }`}
            >
              {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </label>
        </div>

        {/* Notice Main Content */}
        <div className="min-w-0 flex-1">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
            <button
              type="button"
              onClick={() => onFilterCourse && onFilterCourse(notice.courseCode)}
              className="font-mono font-bold text-white bg-[#1e1e1e] hover:bg-zinc-800 transition-colors px-2.5 py-0.5 rounded-full text-[11px]"
            >
              {notice.courseCode}
            </button>
            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
              notice.category === 'Exam'
                ? 'bg-[#aea8ff] text-zinc-950'
                : notice.category === 'Assignment'
                ? 'bg-[#d2f34c] text-zinc-950'
                : 'bg-emerald-200 text-emerald-950'
            }`}>
              {notice.category}
            </span>
            {notice.courseTitle && (
              <span className="truncate max-w-[200px] text-zinc-500 font-medium hidden sm:inline">
                {notice.courseTitle}
              </span>
            )}
            {deadlineInfo && (
              <span
                className={`font-mono tabular-nums flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                  deadlineInfo.isNear
                    ? 'bg-rose-100 text-rose-800'
                    : deadlineInfo.isOverdue
                    ? 'bg-zinc-100 text-zinc-500'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                <Clock className="w-3 h-3 shrink-0" />
                {deadlineInfo.urgencyTag || deadlineInfo.dateStr}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={`text-base font-extrabold tracking-tight text-zinc-950 leading-snug mb-1.5 ${
              isCompleted ? 'line-through text-zinc-400' : ''
            }`}
          >
            {notice.title}
          </h3>

          {/* Description */}
          <p
            className={`text-xs sm:text-sm leading-relaxed mb-4 ${
              isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-600'
            }`}
          >
            {notice.description}
          </p>

          {/* Bottom Bar: Centralized Drive Links & Utility Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-100">
            {/* Left: Resource Link (Drive/GitHub/PDF) */}
            <div>
              {notice.resourceLink ? (
                <button
                  type="button"
                  onClick={handleResourceClick}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-800 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-full transition-colors border border-zinc-200 cursor-pointer shadow-2xs"
                >
                  {notice.resourceLink.includes('github') ? (
                    <FolderGit2 className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-[#5a4dd0] shrink-0" />
                  )}
                  <span className="truncate max-w-[220px]">
                    {notice.resourceLabel || 'Open Attached Resource'}
                  </span>
                  <ExternalLink className="w-3 h-3 text-zinc-400 shrink-0" />
                </button>
              ) : (
                <span className="text-xs text-zinc-400 font-medium">No external link attached</span>
              )}
            </div>

            {/* Right: Deadline Exact Date & Share / GCal / Star Tools */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs text-zinc-500">
              {notice.deadline && (
                <div className="flex items-center gap-1 font-mono tabular-nums text-zinc-600 font-semibold bg-[#f2f2f4] px-2.5 py-1 rounded-full text-[11px]">
                  <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span>
                    {notice.category === 'Exam' ? 'Exam: ' : 'Due: '}
                    {new Date(notice.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              {/* Add to Google Calendar */}
              {notice.deadline && (
                <a
                  href={getGoogleCalendarUrl(notice) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
                  title="Add deadline to Google Calendar"
                  aria-label="Add to Google Calendar"
                >
                  <CalendarPlus className="w-4 h-4" />
                </a>
              )}

              {/* Personal Star / Priority */}
              {onToggleStar && (
                <button
                  type="button"
                  onClick={() => onToggleStar(noticeId)}
                  className={`p-1.5 rounded-full transition-colors ${
                    isStarred
                      ? 'text-amber-500 hover:text-amber-600'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  }`}
                  title={isStarred ? 'Unstar task' : 'Star this priority task'}
                  aria-label="Toggle star priority"
                >
                  <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400' : ''}`} />
                </button>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title={copied ? 'Copied details to clipboard!' : 'Copy notice details'}
                aria-label="Copy notice details"
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
