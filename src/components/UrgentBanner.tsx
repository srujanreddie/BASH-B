/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Notice } from '../types';

interface UrgentBannerProps {
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
  totalMs: number;
}

function calculateTimeRemaining(targetIso: string): TimeRemaining {
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, totalMs: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isExpired: false, totalMs: diff };
}

export const UrgentBanner: React.FC<UrgentBannerProps> = ({
  notices,
  completedMap,
  onSelectNotice,
  onFilterCourse,
}) => {
  const [threatNotice, setThreatNotice] = useState<Notice | null>(null);
  const [countdown, setCountdown] = useState<TimeRemaining | null>(null);

  // Scan active deadlines and automatically select the closest upcoming uncompleted event
  useEffect(() => {
    const now = Date.now();
    const activeWithDeadlines = notices
      .filter((n) => {
        if (!n.deadline) return false;
        const time = new Date(n.deadline).getTime();
        // Ignore ghosted (completed by this student) items unless all are done
        const isDone = Boolean(completedMap[n.id || (n as any)._id]);
        return time > now && !isDone;
      })
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

    // Fallback: If all uncompleted future deadlines are cleared, check any future deadline
    if (activeWithDeadlines.length > 0) {
      setThreatNotice(activeWithDeadlines[0]);
    } else {
      const anyFuture = notices
        .filter((n) => n.deadline && new Date(n.deadline).getTime() > now)
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

      setThreatNotice(anyFuture.length > 0 ? anyFuture[0] : null);
    }
  }, [notices, completedMap]);

  // Live timer tick every 1000ms
  useEffect(() => {
    if (!threatNotice || !threatNotice.deadline) {
      setCountdown(null);
      return;
    }

    const updateTimer = () => {
      setCountdown(calculateTimeRemaining(threatNotice.deadline!));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [threatNotice]);

  if (!threatNotice || !countdown || countdown.isExpired) {
    return (
      <aside aria-label="Status Banner" className="w-full bg-slate-900 border-b border-slate-800 text-slate-100 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs md:text-sm">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 font-semibold tracking-wide">NO IMMEDIATE THREATS</span>
            <span className="text-slate-400 hidden sm:inline">All current semester deadlines are cleared or submitted.</span>
          </div>
          <span className="text-slate-400 text-xs font-mono tabular-nums">Cohort Sync: Active</span>
        </div>
      </aside>
    );
  }

  const isCompleted = Boolean(completedMap[threatNotice.id || (threatNotice as any)._id]);
  const isCritical = countdown.totalMs < 24 * 60 * 60 * 1000; // Under 24h

  return (
    <aside 
      aria-label="Next Immediate Threat Banner" 
      className={`w-full text-white transition-colors border-b ${
        isCritical
          ? 'bg-rose-950 border-rose-800'
          : 'bg-amber-950 border-amber-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
        {/* Threat Identifier & Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex items-center justify-center p-1 rounded bg-white/10 shrink-0" aria-hidden="true">
            <AlertTriangle className={`w-4 h-4 ${isCritical ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
          </span>

          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-xs uppercase tracking-wider font-bold text-amber-200">
              {threatNotice.category === 'Exam' ? 'UPCOMING EXAM' : 'NEXT THREAT'}
            </span>
            <span className="text-slate-400" aria-hidden="true">·</span>
            <button
              onClick={() => onFilterCourse && onFilterCourse(threatNotice.courseCode)}
              className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-black/40 hover:bg-black/60 transition-colors text-white tracking-wide shrink-0"
              title={`Filter by ${threatNotice.courseCode}`}
            >
              [{threatNotice.courseCode}]
            </button>
            <span className="text-xs md:text-sm font-medium truncate text-slate-100">
              {threatNotice.title}
            </span>
          </div>
        </div>

        {/* Live Countdown & Jump CTA */}
        <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0">
          <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded text-xs font-mono tabular-nums text-white border border-white/10">
            <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="hidden sm:inline text-[11px] font-mono text-amber-200/90 mr-0.5">
              {threatNotice.category === 'Exam' ? 'Exam in:' : 'Due in:'}
            </span>
            <span className="font-semibold">
              {countdown.days > 0 && `${countdown.days}d `}
              {String(countdown.hours).padStart(2, '0')}h{' '}
              {String(countdown.minutes).padStart(2, '0')}m{' '}
              <span className="text-amber-300 font-bold">{String(countdown.seconds).padStart(2, '0')}s</span>
            </span>
          </div>

          {isCompleted ? (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Marked Done
            </span>
          ) : (
            <button
              onClick={() => onSelectNotice && onSelectNotice(threatNotice.id || (threatNotice as any)._id)}
              className="text-xs font-medium text-slate-200 hover:text-white flex items-center gap-0.5 py-1 px-2 rounded hover:bg-white/10 transition-colors"
            >
              <span>View Notice</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default UrgentBanner;
