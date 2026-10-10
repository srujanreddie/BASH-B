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

export const UrgentThreatCard: React.FC<UrgentThreatCardProps> = ({
  notices,
  completedMap,
  onSelectNotice,
  onFilterCourse,
}) => {
  const [threatNotice, setThreatNotice] = useState<Notice | null>(null);
  const [countdown, setCountdown] = useState<TimeRemaining | null>(null);

  // Scan and select closest upcoming uncompleted deadline
  useEffect(() => {
    const now = Date.now();
    const activeWithDeadlines = notices
      .filter((n) => {
        if (!n.deadline) return false;
        const time = new Date(n.deadline).getTime();
        const isDone = Boolean(completedMap[n.id || (n as any)._id]);
        return time > now && !isDone;
      })
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

    if (activeWithDeadlines.length > 0) {
      setThreatNotice(activeWithDeadlines[0]);
    } else {
      const anyFuture = notices
        .filter((n) => n.deadline && new Date(n.deadline).getTime() > now)
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

      setThreatNotice(anyFuture.length > 0 ? anyFuture[0] : null);
    }
  }, [notices, completedMap]);

  // Live timer tick every second
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

  // If no threats active or all cleared
  if (!threatNotice || !countdown || countdown.isExpired) {
    return (
      <div className="bg-[#1e1e1e] text-white rounded-[2rem] p-6 shadow-sm border border-zinc-800/80">
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
            No active assignment or exam deadlines pending submission. Good job staying on top of the Semester 1 curriculum!
          </p>
        </div>
      </div>
    );
  }

  const noticeId = threatNotice.id || (threatNotice as any)._id;
  const isExam = threatNotice.category === 'Exam';

  return (
    <div 
      className="bg-[#1e1e1e] text-white rounded-[2rem] p-6 shadow-sm border border-zinc-800/80 transition-all cursor-pointer hover:border-zinc-700"
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
              <span className="bg-[#d2f34c] text-zinc-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                {isExam ? 'CIE Exam' : 'Due Soon'}
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
          <span>Live Ticker</span>
        </div>
      </div>

      {/* Two Highlight Metrics with Lime Green & Soft Purple Bars (matches Sleep Efficiency & Duration in reference) */}
      <div className="grid grid-cols-2 gap-4 pb-5 mb-5 border-b border-zinc-800/80">
        {/* Left Stat: Lime Green Accent */}
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-8 bg-[#d2f34c] rounded-full shrink-0 shadow-[0_0_8px_rgba(210,243,76,0.5)]" />
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums leading-none">
              {countdown.days > 0 ? (
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
            <p className="text-xs text-zinc-400 mt-1 font-medium">Countdown Remaining</p>
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
          { label: 'Thu', h: 'h-24', active: 'lime', value: countdown.days > 0 ? `${countdown.days}d` : 'Now' },
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
