/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Printer, 
  Settings, 
  Radio, 
  ChevronRight,
  BookOpen,
  Sparkles,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TimetableConfig, TimetableSlot } from '../types';
import { 
  loadLocalTimetable, 
  getActiveSlot, 
  getNextSlot, 
  DEFAULT_TIMETABLE_SECTION_B,
  DEFAULT_TIMETABLE_SECTION_A 
} from '../data/timetableData';
import { safeFetchJson } from '../utils/api';

interface CohortTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCourse?: (code: string) => void;
}

export const CohortTimetableModal: React.FC<CohortTimetableModalProps> = ({
  isOpen,
  onClose,
  onSelectCourse,
}) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [activeDay, setActiveDay] = useState(
    days.includes(currentDayName) ? currentDayName : 'Monday'
  );
  const [selectedSection, setSelectedSection] = useState<'B' | 'A'>('B');
  const [timetableConfig, setTimetableConfig] = useState<TimetableConfig>(loadLocalTimetable());
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const token = sessionStorage.getItem('cse_admin_token');
      setIsAdmin(Boolean(token));
    } catch {
      setIsAdmin(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Load local storage first for zero latency
    const local = loadLocalTimetable();
    setTimetableConfig(local);

    // Fetch from server if reachable
    safeFetchJson<{ success: boolean; timetable: TimetableConfig }>('/api/timetable')
      .then((res) => {
        if (res.ok && res.data?.timetable) {
          setTimetableConfig(res.data.timetable);
        }
      })
      .catch(() => {
        // use local
      });
  }, [isOpen]);

  if (!isOpen) return null;

  // Decide schedule source based on section toggle
  const currentSchedule = selectedSection === 'B' 
    ? timetableConfig.schedule 
    : DEFAULT_TIMETABLE_SECTION_A.schedule;

  const currentSlots: TimetableSlot[] = currentSchedule[activeDay] || [];
  const isTodayActive = activeDay === currentDayName;
  const activeSlot = isTodayActive ? getActiveSlot(currentSlots) : null;
  const nextSlot = isTodayActive ? getNextSlot(currentSlots) : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] max-w-3xl w-full shadow-2xl border border-zinc-200/80 dark:border-zinc-800 relative text-left max-h-[92vh] flex flex-col overflow-hidden transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timetable-modal-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between gap-3 bg-[#1e1e1e] text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-zinc-800 text-[#d2f34c] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[#d2f34c]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="timetable-modal-title" className="text-base font-extrabold text-white tracking-tight truncate">
                  {timetableConfig.cohortName}
                </h2>
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-[#d2f34c] text-zinc-950 shrink-0">
                  {selectedSection === 'B' ? 'BASH-B' : 'Sec A'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium truncate">
                Academic Year {timetableConfig.academicYear} · Weekly Lecture & Lab Routine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="p-2 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Print Timetable"
              aria-label="Print timetable"
            >
              <Printer className="w-4 h-4" />
            </button>
            {isAdmin && (
              <Link
                to="/dashboard?tab=timetable"
                onClick={onClose}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-full bg-[#d2f34c] hover:bg-[#c2e43b] text-zinc-950 transition-colors uppercase tracking-wider"
                title="Manage Timetable in Admin Dashboard"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Link>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close timetable"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section Switcher & Day Navigation */}
        <div className="px-5 py-3 bg-[#f2f2f4] dark:bg-[#171719] border-b border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          {/* Day Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {days.map((day) => {
              const isToday = day === currentDayName;
              const isSelected = activeDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#d2f34c] text-zinc-950 shadow-xs font-black ring-2 ring-[#d2f34c]/40'
                      : 'bg-white dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700'
                  }`}
                >
                  <span>{day}</span>
                  {isToday && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-zinc-950 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'}`}>
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Section Selector Pill */}
          <div className="flex items-center bg-zinc-200/90 dark:bg-zinc-800 p-0.5 rounded-full text-xs shrink-0 font-medium">
            <button
              onClick={() => setSelectedSection('B')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                selectedSection === 'B' 
                  ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-2xs font-bold' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              Section B (BASH-B)
            </button>
            <button
              onClick={() => setSelectedSection('A')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                selectedSection === 'A' 
                  ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-2xs font-bold' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              Section A
            </button>
          </div>
        </div>

        {/* Live Active Class Status Banner (If today) */}
        {isTodayActive && (activeSlot || nextSlot) && (
          <div className="mx-5 mt-3 p-3.5 rounded-2xl bg-[#d2f34c]/20 border border-[#d2f34c]/50 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d2f34c] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#8bb507]"></span>
              </span>
              <div className="min-w-0">
                {activeSlot ? (
                  <p className="font-semibold text-zinc-950 truncate">
                    <span className="font-black text-zinc-900">In Session Now:</span> {activeSlot.time} · {activeSlot.subject} ({activeSlot.room})
                  </p>
                ) : nextSlot ? (
                  <p className="font-medium text-zinc-900 truncate">
                    <span className="font-bold text-zinc-800">Upcoming Next:</span> {nextSlot.time} · {nextSlot.subject} ({nextSlot.room})
                  </p>
                ) : null}
              </div>
            </div>
            {activeSlot && !activeSlot.code.includes('BREAK') && onSelectCourse && (
              <button
                onClick={() => {
                  onSelectCourse(activeSlot.code);
                  onClose();
                }}
                className="shrink-0 text-xs font-bold text-zinc-950 bg-[#d2f34c] px-3 py-1 rounded-full shadow-2xs hover:bg-[#c2e43b] transition-colors cursor-pointer"
              >
                View Syllabus
              </button>
            )}
          </div>
        )}

        {/* Schedule List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {currentSlots.length === 0 ? (
            <div className="p-8 text-center bg-[#f2f2f4] dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500">
              <Calendar className="w-8 h-8 mx-auto text-zinc-400 mb-2 opacity-50" />
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No scheduled periods for {activeDay}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Enjoy your study break or weekend revision!</p>
            </div>
          ) : (
            currentSlots.map((slot, idx) => {
              const isBreak = slot.type === 'Break' || slot.code === 'BREAK' || slot.code === 'LUNCH';
              const isCurrent = isTodayActive && activeSlot?.id === slot.id;

              return (
                <div
                  key={slot.id || idx}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isCurrent
                      ? 'bg-white dark:bg-zinc-900 border-[#d2f34c] ring-2 ring-[#d2f34c]/40 text-zinc-950 dark:text-white shadow-md'
                      : isBreak
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-950 dark:text-amber-200'
                      : slot.type === 'Lab'
                      ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50 text-purple-950 dark:text-purple-200 hover:bg-purple-50/70 dark:hover:bg-purple-950/30'
                      : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  }`}
                >
                  {/* Left: Time and Tag */}
                  <div className="flex items-center gap-2 sm:w-36 shrink-0 font-mono text-xs tabular-nums font-bold text-zinc-600 dark:text-zinc-400">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                    <span>{slot.time}</span>
                    {isCurrent && (
                      <span className="sm:hidden text-[10px] font-black px-2 py-0.5 rounded-full bg-[#d2f34c] text-zinc-950">
                        NOW
                      </span>
                    )}
                  </div>

                  {/* Middle: Subject, Instructor & Room */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!isBreak && (
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#1e1e1e] text-white shrink-0">
                          {slot.code}
                        </span>
                      )}
                      <span className="text-xs sm:text-sm font-extrabold text-zinc-950 dark:text-white truncate">
                        {slot.subject}
                      </span>
                      {isCurrent && (
                        <span className="hidden sm:inline-flex text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#d2f34c] text-zinc-950 animate-pulse">
                          LIVE NOW
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{slot.room}</span>
                      </span>
                      {slot.instructor && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{slot.instructor}</span>
                          </span>
                        </>
                      )}
                      <span>·</span>
                      <span className={`font-semibold ${
                        slot.type === 'Lab' ? 'text-[#5a4dd0] dark:text-[#aea8ff]' :
                        slot.type === 'Drawing' ? 'text-amber-700 dark:text-amber-400' :
                        isBreak ? 'text-amber-800 dark:text-amber-300' : 'text-zinc-600 dark:text-zinc-400'
                      }`}>
                        {slot.type}
                      </span>
                    </div>
                  </div>

                  {/* Right Action: Filter Feed / Course Vault */}
                  {!isBreak && onSelectCourse && (
                    <div className="flex items-center gap-1.5 shrink-0 pt-1 sm:pt-0">
                      <button
                        onClick={() => {
                          onSelectCourse(slot.code);
                          onClose();
                        }}
                        className="text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Deadlines & Notes</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-[#f2f2f4] dark:bg-[#171719] flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline font-medium">Practical labs run in 2-3 hour continuous blocks.</span>
            <span className="sm:hidden font-mono text-[11px]">BASH-B Routine</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CohortTimetableModal;
