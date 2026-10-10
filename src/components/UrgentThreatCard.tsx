/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  Flame, 
  Sparkles,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Notice } from '../types';

interface UrgentThreatCardProps {
  notices: Notice[];
  completedMap: Record<string, boolean>;
  onSelectNotice?: (noticeId: string) => void;
  onFilterCourse?: (courseCode: string) => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isNoDeadline?: boolean;
  totalMs: number;
}

function calculateTimeRemaining(targetIso?: string | null): TimeRemaining {
  if (!targetIso) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false, isNoDeadline: true, totalMs: 0 };
  }
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    const overdueDiff = Math.abs(diff);
    const days = Math.floor(overdueDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((overdueDiff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((overdueDiff / (1000 * 60)) % 60);
    const seconds = Math.floor((overdueDiff / 1000) % 60);
    return { days, hours, minutes, seconds, isExpired: true, totalMs: diff };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isExpired: false, totalMs: diff };
}

export const UrgentThreatCard: React.FC<UrgentThreatCardProps> = ({
  notices,
  completedMap,
  onSelectNotice,
  onFilterCourse,
}) => {
  const [threatNotice, setThreatNotice] = useState<Notice | null>(null);
  const [countdown, setCountdown] = useState<TimeRemaining | null>(null);

  // Scan and select closest uncompleted task / deadline in this section
  useEffect(() => {
    const now = Date.now();
    const uncompletedNotices = notices.filter((n) => {
      const id = n.id || (n as any)._id;
      return !completedMap[id];
    });

    if (uncompletedNotices.length === 0) {
      setThreatNotice(null);
      return;
    }

    // 1. Prioritize uncompleted notices with upcoming future deadlines
    const futureDeadlines = uncompletedNotices
      .filter((n) => n.deadline && new Date(n.deadline).getTime() > now)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

    if (futureDeadlines.length > 0) {
      setThreatNotice(futureDeadlines[0]);
      return;
    }

    // 2. Next, prioritize uncompleted notices with overdue deadlines (urgent action needed)
    const overdueDeadlines = uncompletedNotices
      .filter((n) => n.deadline && new Date(n.deadline).getTime() <= now)
      .sort((a, b) => new Date(b.deadline!).getTime() - new Date(a.deadline!).getTime());

    if (overdueDeadlines.length > 0) {
      setThreatNotice(overdueDeadlines[0]);
      return;
    }

    // 3. Next, prioritize uncompleted Exam or Assignment tasks even without a strict ISO deadline
    const priorityTasks = uncompletedNotices
      .filter((n) => n.category === 'Exam' || n.category === 'Assignment');

    if (priorityTasks.length > 0) {
      setThreatNotice(priorityTasks[0]);
      return;
    }

    // 4. Any remaining uncompleted notice in this section
    setThreatNotice(uncompletedNotices[0]);
  }, [notices, completedMap]);

  // Live timer tick every second
  useEffect(() => {
    if (!threatNotice) {
      setCountdown(null);
      return;
    }

    const updateTimer = () => {
      setCountdown(calculateTimeRemaining(threatNotice.deadline));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [threatNotice]);

  // Check if there are any uncompleted items in this section
  const uncompletedCount = notices.filter((n) => !completedMap[n.id || (n as any)._id]).length;

  // ONLY show Threat Radar Clean if there is NOTHING to do in this section!
  if (uncompletedCount === 0 || !threatNotice) {
    return (
      <div className="bg-[#1e1e1e] dark:bg-[#18181b] text-white rounded-[2rem] p-6 shadow-sm border border-zinc-800/80 dark:border-zinc-800 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[#d2f34c]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Threat Radar Clean</h3>
              <p className="text-xs text-zinc-400">Next Immediate Threat Status</p>
            </div>
          </div>
          <span className="bg-zinc-800 text-[#d2f34c] text-xs font-bold px-3 py-1 rounded-full">
            All Clear
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-800/40 border border-zinc-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#d2f34c] shrink-0" />
          <p className="text-xs text-zinc-300">
            {notices.length === 0
              ? 'No notices or tasks posted in this section yet. All clear!'
              : 'All notices and tasks in this section have been marked complete. Good job staying on top of the Semester 1 curriculum!'}
          </p>
        </div>
      </div>
    );
  }

  const noticeId = threatNotice.id || (threatNotice as any)._id;
  const isExam = threatNotice.category === 'Exam';
  const isOverdue = Boolean(countdown?.isExpired);
  const isNoDeadline = Boolean(countdown?.isNoDeadline);

  return (
    <div 
      className="bg-[#1e1e1e] dark:bg-[#18181b] text-white rounded-[2rem] p-6 shadow-sm border border-zinc-800/80 dark:border-zinc-800 transition-all cursor-pointer hover:border-zinc-700 dark:hover:border-zinc-650"
      onClick={() => onSelectNotice?.(noticeId)}
    >
      {/* Top Header Row (matches Sleep Analysis header in reference) */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-zinc-800/80 flex items-center justify-center text-[#d2f34c]">
            {isExam ? <AlertTriangle className="w-4 h-4 text-[#d2f34c]" /> : <Flame className="w-4 h-4 text-[#d2f34c]" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Next Immediate Threat
              </h3>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isOverdue 
                  ? 'bg-rose-500 text-white' 
                  : isExam 
                  ? 'bg-[#d2f34c] text-zinc-950' 
                  : isNoDeadline 
                  ? 'bg-[#aea8ff] text-zinc-950' 
                  : 'bg-[#d2f34c] text-zinc-950'
              }`}>
                {isOverdue ? 'Overdue Action' : isExam ? 'CIE Exam' : isNoDeadline ? 'Active Task' : 'Due Soon'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate max-w-[280px] sm:max-w-md">
              {threatNotice.title}
            </p>
          </div>
        </div>

        {/* Pill Dropdown style selector */}
        <div className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors shrink-0">
          <Clock className="w-3.5 h-3.5 text-[#d2f34c]" />
          <span>{isOverdue ? 'Action Needed' : isNoDeadline ? 'Uncompleted' : 'Live Ticker'}</span>
        </div>
      </div>

      {/* Two Highlight Metrics with Lime Green & Soft Purple Bars */}
      <div className="grid grid-cols-2 gap-4 pb-5 mb-5 border-b border-zinc-800/80">
        {/* Left Stat: Lime Green Accent */}
        <div className="flex items-center gap-2.5">
          <div className={`w-1.5 h-8 rounded-full shrink-0 ${isOverdue ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-[#d2f34c] shadow-[0_0_8px_rgba(210,243,76,0.5)]'}`} />
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums leading-none">
              {!countdown || isNoDeadline ? (
                <span className="text-xl sm:text-2xl font-sans font-bold text-[#d2f34c]">PENDING</span>
              ) : isOverdue ? (
                <span className="text-xl sm:text-2xl font-sans font-bold text-rose-400">
                  {countdown.days > 0 ? `${countdown.days}d OVER` : 'OVERDUE'}
                </span>
              ) : countdown.days > 0 ? (
                <>
                  {countdown.days}<span className="text-sm font-sans font-bold text-[#d2f34c]">d</span> {countdown.hours}<span className="text-sm font-sans font-bold text-[#d2f34c]">h</span>
                </>
              ) : (
                <>
                  {String(countdown.hours).padStart(2, '0')}:
                  {String(countdown.minutes).padStart(2, '0')}:
                  {String(countdown.seconds).padStart(2, '0')}
                </>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              {isNoDeadline ? 'No Strict Deadline Set' : isOverdue ? 'Deadline Passed — Complete Now' : 'Countdown Remaining'}
            </p>
          </div>
        </div>

        {/* Right Stat: Soft Purple Accent */}
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-8 bg-[#aea8ff] rounded-full shrink-0 shadow-[0_0_8px_rgba(174,168,255,0.5)]" />
          <div>
            <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-none truncate">
              {threatNotice.courseCode}
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              {threatNotice.courseTitle || 'Semester 1 Target'}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Urgency Bars (Mimicking the Sleep Analysis monthly bars from reference image) */}
      <div className="flex items-end justify-between gap-2 pt-1 px-1">
        {[
          { label: 'Mon', h: 'h-10', active: false },
          { label: 'Tue', h: 'h-14', active: false },
          { label: 'Wed', h: 'h-12', active: false },
          { label: 'Thu', h: 'h-24', active: 'lime', value: countdown ? (countdown.isNoDeadline ? 'Act' : countdown.isExpired ? 'Due!' : countdown.days > 0 ? `${countdown.days}d` : 'Now') : 'Now' },
          { label: 'Fri', h: 'h-18', active: 'purple', value: 'Sub' },
          { label: 'Sat', h: 'h-12', active: false },
          { label: 'Sun', h: 'h-8', active: false },
        ].map((bar, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full max-w-[36px] flex flex-col justify-end items-center h-24">
              {bar.active === 'lime' ? (
                <div 
                  className={`w-full ${bar.h} bg-[#d2f34c] text-zinc-950 font-black rounded-full flex flex-col items-center justify-end pb-2 shadow-[0_0_12px_rgba(210,243,76,0.35)] transition-all`}
                >
                  <span className="text-[10px] leading-none font-mono font-bold">
                    {bar.value}
                  </span>
                </div>
              ) : bar.active === 'purple' ? (
                <div 
                  className={`w-full ${bar.h} bg-[#aea8ff] text-zinc-950 font-bold rounded-full flex flex-col items-center justify-end pb-2 shadow-[0_0_12px_rgba(174,168,255,0.35)] transition-all`}
                >
                  <span className="text-[10px] leading-none font-bold">
                    {bar.value}
                  </span>
                </div>
              ) : (
                <div 
                  className={`w-full ${bar.h} bg-zinc-800/80 rounded-full transition-all border border-zinc-700/40 relative overflow-hidden`}
                >
                  {/* Subtle zebra hatch lines matching the reference */}
                  <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,#fff_4px,#fff_6px)]" />
                </div>
              )}
            </div>
            <span className={`text-[11px] font-semibold ${bar.active ? 'text-white' : 'text-zinc-500'}`}>
              {bar.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrgentThreatCard;
