/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle, Sparkles } from 'lucide-react';

interface TimetableSlot {
  time: string;
  code: string;
  subject: string;
  room: string;
  type: 'Theory' | 'Lab' | 'Drawing' | 'Break';
}

const SCHEDULE: Record<string, TimetableSlot[]> = {
  Monday: [
    { time: '09:00 - 10:00', code: '25BS1MT101', subject: 'Matrices and Calculus', room: 'LH 101', type: 'Theory' },
    { time: '10:00 - 11:00', code: '25ES1CS101', subject: 'Programming for Problem Solving', room: 'Turing Hall', type: 'Theory' },
    { time: '11:00 - 11:15', code: 'BREAK', subject: 'Morning Tea Break', room: 'Cafeteria', type: 'Break' },
    { time: '11:15 - 12:15', code: '25BS1CH101', subject: 'Chemistry for Engineers', room: 'SC 203', type: 'Theory' },
    { time: '12:15 - 01:15', code: '25ES1EE101', subject: 'Basic Electrical Engineering', room: 'EE 104', type: 'Theory' },
    { time: '01:15 - 02:00', code: 'LUNCH', subject: 'Lunch Intermission', room: 'Campus Mess', type: 'Break' },
    { time: '02:00 - 05:00', code: '25ES2CS101', subject: 'PPS Lab (Batch A & B)', room: 'Linux Lab 2', type: 'Lab' },
  ],
  Tuesday: [
    { time: '09:00 - 10:00', code: '25ES1EE101', subject: 'Basic Electrical Engineering', room: 'EE 104', type: 'Theory' },
    { time: '10:00 - 11:00', code: '25BS1MT101', subject: 'Matrices and Calculus', room: 'LH 101', type: 'Theory' },
    { time: '11:00 - 11:15', code: 'BREAK', subject: 'Morning Tea Break', room: 'Cafeteria', type: 'Break' },
    { time: '11:15 - 12:15', code: '25ES1CS101', subject: 'Programming for Problem Solving', room: 'Turing Hall', type: 'Theory' },
    { time: '12:15 - 01:15', code: '25BS1CH101', subject: 'Chemistry for Engineers', room: 'SC 203', type: 'Theory' },
    { time: '01:15 - 02:00', code: 'LUNCH', subject: 'Lunch Intermission', room: 'Campus Mess', type: 'Break' },
    { time: '02:00 - 05:00', code: '25ES3ME101', subject: 'Engineering Drawing Sheet Drafting', room: 'Drawing Hall 302', type: 'Drawing' },
  ],
  Wednesday: [
    { time: '09:00 - 10:00', code: '25BS1CH101', subject: 'Chemistry for Engineers', room: 'SC 203', type: 'Theory' },
    { time: '10:00 - 11:00', code: '25ES1EE101', subject: 'Basic Electrical Engineering', room: 'EE 104', type: 'Theory' },
    { time: '11:00 - 11:15', code: 'BREAK', subject: 'Morning Tea Break', room: 'Cafeteria', type: 'Break' },
    { time: '11:15 - 12:15', code: '25BS1MT101', subject: 'Matrices and Calculus Tutorial', room: 'LH 101', type: 'Theory' },
    { time: '12:15 - 01:15', code: '25ES1CS101', subject: 'PPS Code Walkthrough', room: 'Turing Hall', type: 'Theory' },
    { time: '01:15 - 02:00', code: 'LUNCH', subject: 'Lunch Intermission', room: 'Campus Mess', type: 'Break' },
    { time: '02:00 - 05:00', code: '25BS2CH101', subject: 'Engineering Chemistry Lab (EDTA Titrations)', room: 'Chemistry Lab B-12', type: 'Lab' },
  ],
  Thursday: [
    { time: '09:00 - 10:00', code: '25ES1CS101', subject: 'Programming for Problem Solving', room: 'Turing Hall', type: 'Theory' },
    { time: '10:00 - 11:00', code: '25BS1MT101', subject: 'Matrices and Calculus', room: 'LH 101', type: 'Theory' },
    { time: '11:00 - 11:15', code: 'BREAK', subject: 'Morning Tea Break', room: 'Cafeteria', type: 'Break' },
    { time: '11:15 - 12:15', code: '25BS1CH101', subject: 'Chemistry for Engineers', room: 'SC 203', type: 'Theory' },
    { time: '12:15 - 01:15', code: '25ES1EE101', subject: 'BEE Problem Solving Session', room: 'EE 104', type: 'Theory' },
    { time: '01:15 - 02:00', code: 'LUNCH', subject: 'Lunch Intermission', room: 'Campus Mess', type: 'Break' },
    { time: '02:00 - 05:00', code: '25ES2EE101', subject: 'Basic Electrical Engineering Lab', room: 'Machines Lab B-04', type: 'Lab' },
  ],
  Friday: [
    { time: '09:00 - 10:00', code: '25BS1MT101', subject: 'Matrices & Vector Calculus', room: 'LH 101', type: 'Theory' },
    { time: '10:00 - 11:00', code: '25ES1EE101', subject: 'Basic Electrical Engineering', room: 'EE 104', type: 'Theory' },
    { time: '11:00 - 11:15', code: 'BREAK', subject: 'Morning Tea Break', room: 'Cafeteria', type: 'Break' },
    { time: '11:15 - 12:15', code: '25ES1CS101', subject: 'Algorithms & Structs', room: 'Turing Hall', type: 'Theory' },
    { time: '12:15 - 01:15', code: '25BS1CH101', subject: 'Engineering Chemistry', room: 'SC 203', type: 'Theory' },
    { time: '01:15 - 02:00', code: 'LUNCH', subject: 'Lunch Intermission', room: 'Campus Mess', type: 'Break' },
    { time: '02:00 - 05:00', code: '25ES2IT101', subject: 'IT Workshop (Linux & Git Lab)', room: 'Systems Lab 1', type: 'Lab' },
  ],
};

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
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [activeDay, setActiveDay] = useState(
    days.includes(currentDayName) ? currentDayName : 'Monday'
  );

  if (!isOpen) return null;

  const currentSlots = SCHEDULE[activeDay] || SCHEDULE['Monday'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 relative text-left max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timetable-modal-title"
      >
        {/* Header */}
        <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 id="timetable-modal-title" className="text-base font-bold text-slate-900">
                CSE Semester 1 Weekly Timetable
              </h2>
              <p className="text-xs text-slate-500">
                Section A & B Lecture Schedule · Academic Year 2026-27
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close timetable"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Day Selector Buttons */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto">
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
                  <span className={`text-[10px] px-1 rounded font-normal ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Schedule List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-2.5">
          {currentSlots.map((slot, idx) => {
            const isBreak = slot.type === 'Break';
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  isBreak
                    ? 'bg-amber-50/50 border-amber-200/60 text-amber-900'
                    : slot.type === 'Lab'
                    ? 'bg-purple-50/40 border-purple-200 text-purple-950 hover:bg-purple-50/70'
                    : slot.type === 'Drawing'
                    ? 'bg-sky-50/40 border-sky-200 text-sky-950 hover:bg-sky-50/70'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {/* Time */}
                <div className="w-32 shrink-0 flex items-center gap-1.5 font-mono text-xs tabular-nums font-semibold text-slate-500">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{slot.time}</span>
                </div>

                {/* Subject & Code */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!isBreak && (
                      <span className="font-mono text-xs font-bold shrink-0">
                        {slot.code}
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-semibold truncate">
                      {slot.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{slot.room}</span>
                    </span>
                    <span>·</span>
                    <span>{slot.type}</span>
                  </div>
                </div>

                {/* Filter Feed Action */}
                {!isBreak && onSelectCourse && (
                  <button
                    onClick={() => {
                      onSelectCourse(slot.code);
                      onClose();
                    }}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded transition-colors shrink-0"
                  >
                    View Deadlines
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Labs run in 3-hour continuous sessions from 2:00 PM to 5:00 PM.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CohortTimetableModal;
