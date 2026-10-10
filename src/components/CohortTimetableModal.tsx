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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 relative text-left max-h-[92vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timetable-modal-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-900 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-white/10 text-emerald-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="timetable-modal-title" className="text-base font-bold text-white truncate">
                  {timetableConfig.cohortName}
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold shrink-0">
                  {selectedSection === 'B' ? 'BASH-B' : 'Sec A'}
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">
                Academic Year {timetableConfig.academicYear} · Weekly Lecture & Lab Routine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Print Timetable"
              aria-label="Print timetable"
            >
              <Printer className="w-4 h-4" />
            </button>
            {isAdmin && (
              <Link
                to="/dashboard?tab=timetable"
                onClick={onClose}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors"
                title="Manage Timetable in Admin Dashboard"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Link>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close timetable"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Switcher & Day Navigation */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          {/* Day Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {days.map((day) => {
              const isToday = day === currentDayName;
              const isSelected = activeDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span>{day}</span>
                  {isToday && (
                    <span className={`text-[10px] px-1 rounded font-normal ${isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-emerald-100 text-emerald-800 font-semibold'}`}>
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Section Selector Pill */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs shrink-0 font-medium">
            <button
              onClick={() => setSelectedSection('B')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedSection === 'B' 
                  ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Section B (BASH-B)
            </button>
            <button
              onClick={() => setSelectedSection('A')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedSection === 'A' 
                  ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Section A
            </button>
          </div>
        </div>

        {/* Live Active Class Status Banner (If today) */}
        {isTodayActive && (activeSlot || nextSlot) && (
          <div className="mx-4 sm:mx-5 mt-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="min-w-0">
                {activeSlot ? (
                  <p className="font-semibold text-emerald-950 truncate">
                    <span className="font-bold text-emerald-700">In Session Now:</span> {activeSlot.time} · {activeSlot.subject} ({activeSlot.room})
                  </p>
                ) : nextSlot ? (
                  <p className="font-medium text-emerald-900 truncate">
                    <span className="font-bold text-emerald-700">Upcoming Next:</span> {nextSlot.time} · {nextSlot.subject} ({nextSlot.room})
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
                className="shrink-0 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline"
              >
                View Syllabus
              </button>
            )}
          </div>
        )}

        {/* Schedule List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2.5">
          {currentSlots.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
              <Calendar className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
              <p className="text-sm font-semibold">No scheduled periods for {activeDay}</p>
              <p className="text-xs text-slate-400 mt-1">Enjoy your study break or weekend revision!</p>
            </div>
          ) : (
            currentSlots.map((slot, idx) => {
              const isBreak = slot.type === 'Break' || slot.code === 'BREAK' || slot.code === 'LUNCH';
              const isCurrent = isTodayActive && activeSlot?.id === slot.id;

              return (
                <div
                  key={slot.id || idx}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    isCurrent
                      ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20 text-emerald-950 shadow-xs'
                      : isBreak
                      ? 'bg-amber-50/40 border-amber-200/60 text-amber-900'
                      : slot.type === 'Lab'
                      ? 'bg-purple-50/30 border-purple-200 text-purple-950 hover:bg-purple-50/60'
                      : slot.type === 'Drawing'
                      ? 'bg-sky-50/30 border-sky-200 text-sky-950 hover:bg-sky-50/60'
                      : slot.type === 'Tutorial'
                      ? 'bg-indigo-50/30 border-indigo-200 text-indigo-950 hover:bg-indigo-50/60'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  {/* Left: Time and Tag */}
                  <div className="flex items-center gap-2 sm:w-36 shrink-0 font-mono text-xs tabular-nums font-semibold text-slate-600">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{slot.time}</span>
                    {isCurrent && (
                      <span className="sm:hidden text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                        NOW
                      </span>
                    )}
                  </div>

                  {/* Middle: Subject, Instructor & Room */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!isBreak && (
                        <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                          {slot.code}
                        </span>
                      )}
                      <span className="text-xs sm:text-sm font-semibold truncate">
                        {slot.subject}
                      </span>
                      {isCurrent && (
                        <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white animate-pulse">
                          LIVE NOW
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{slot.room}</span>
                      </span>
                      {slot.instructor && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{slot.instructor}</span>
                          </span>
                        </>
                      )}
                      <span>·</span>
                      <span className={`font-medium ${
                        slot.type === 'Lab' ? 'text-purple-700' :
                        slot.type === 'Tutorial' ? 'text-indigo-700' :
                        slot.type === 'Drawing' ? 'text-sky-700' :
                        isBreak ? 'text-amber-700' : 'text-slate-600'
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
                        className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" />
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
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Practical labs run in 3-hour continuous blocks (02:00 PM - 05:00 PM).</span>
            <span className="sm:hidden font-mono text-[11px]">BASH-B Timetable</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
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
