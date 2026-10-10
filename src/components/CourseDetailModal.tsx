/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  ExternalLink, 
  Check, 
  ChevronRight,
  GraduationCap,
  Clock,
  Layers,
  MapPin,
  UserCheck
} from 'lucide-react';
import { Course } from '../types';
import { SEMESTER_1_DETAILED_COURSES } from '../data/syllabusData';

interface CourseDetailModalProps {
  courseCode: string | null;
  onClose: () => void;
  onFilterFeedByCourse: (code: string) => void;
  onOpenResourcePreview?: (title: string, url: string, courseCode: string) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  courseCode,
  onClose,
  onFilterFeedByCourse,
  onOpenResourcePreview,
}) => {
  const [activeTab, setActiveTab] = useState<'units' | 'books' | 'evaluation'>('units');

  if (!courseCode) return null;

  const detail = SEMESTER_1_DETAILED_COURSES[courseCode];
  if (!detail) return null;

  const handleResourceOpen = (title: string, url: string) => {
    if (onOpenResourcePreview) {
      onOpenResourcePreview(title, url, detail.code);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] max-w-2xl w-full shadow-2xl border border-zinc-200/80 dark:border-zinc-800 relative text-left max-h-[90vh] flex flex-col overflow-hidden transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-modal-title"
      >
        {/* Header */}
        <div className="p-6 pb-5 border-b border-zinc-800 flex items-start justify-between gap-4 bg-[#1e1e1e] text-white">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2">
              <span className="font-black text-zinc-950 bg-[#d2f34c] px-3 py-0.5 rounded-full">
                {detail.code}
              </span>
              <span>·</span>
              <span className="font-bold text-zinc-300">{detail.category}</span>
              <span>·</span>
              <span className="text-zinc-400">{detail.credits} Credits</span>
            </div>
            <h2 id="course-modal-title" className="text-xl font-extrabold text-white leading-snug tracking-tight">
              {detail.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#d2f34c]" />
                <span>{detail.instructor}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#aea8ff]" />
                <span>{detail.room}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
            aria-label="Close course details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Resource Buttons Bar */}
        <div className="px-6 py-3 bg-[#f2f2f4] dark:bg-[#171719] border-b border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
            Vault Links:
          </span>
          <button
            onClick={() => handleResourceOpen(`${detail.shortTitle} Syllabus Copy`, detail.resources.syllabusUrl)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full bg-white dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#5a4dd0] dark:text-[#aea8ff]" />
            <span>Syllabus Copy</span>
          </button>
          <button
            onClick={() => handleResourceOpen(`${detail.shortTitle} Previous Year Papers (PYQ)`, detail.resources.pyqUrl)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full bg-white dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>PYQ Papers</span>
          </button>
        </div>

        {/* Tab Controls (Pills) */}
        <div className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('units')}
            className={`px-4 py-2 rounded-full font-bold transition-all cursor-pointer ${
              activeTab === 'units'
                ? 'bg-[#d2f34c] text-zinc-950 font-black shadow-xs'
                : 'bg-[#f2f2f4] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            Syllabus Modules ({detail.units.length})
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`px-4 py-2 rounded-full font-bold transition-all cursor-pointer ${
              activeTab === 'books'
                ? 'bg-[#d2f34c] text-zinc-950 font-black shadow-xs'
                : 'bg-[#f2f2f4] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            Textbooks & References
          </button>
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`px-4 py-2 rounded-full font-bold transition-all cursor-pointer ${
              activeTab === 'evaluation'
                ? 'bg-[#d2f34c] text-zinc-950 font-black shadow-xs'
                : 'bg-[#f2f2f4] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            Evaluation Scheme
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'units' && (
            <div className="space-y-3">
              {detail.units.map((unit) => (
                <div
                  key={unit.unitNumber}
                  className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-[#f2f2f4]/50 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-900 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-[#1e1e1e] dark:bg-zinc-800 text-[#d2f34c] font-mono text-xs font-black flex items-center justify-center">
                        {unit.unitNumber}
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-zinc-950 dark:text-white">
                        {unit.title}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {unit.hours} Hours
                    </span>
                  </div>

                  <ul className="space-y-1.5 pl-9 text-xs text-zinc-600 dark:text-zinc-400 list-disc leading-relaxed">
                    {unit.topics.map((t, idx) => (
                      <li key={idx} className="marker:text-zinc-400 dark:marker:text-zinc-600">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'books' && (
            <div className="space-y-5 text-xs">
              <div>
                <h4 className="font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 text-[11px] mb-2.5">
                  Prescribed Textbooks
                </h4>
                <div className="space-y-2">
                  {detail.textbooks.map((b, i) => (
                    <div key={i} className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-start gap-3 shadow-2xs">
                      <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                        <BookOpen className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                      </div>
                      <span className="text-zinc-900 dark:text-zinc-200 font-semibold leading-relaxed">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {detail.referenceBooks.length > 0 && (
                <div>
                  <h4 className="font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 text-[11px] mb-2.5">
                    Recommended Reference Works
                  </h4>
                  <div className="space-y-2">
                    {detail.referenceBooks.map((b, i) => (
                      <div key={i} className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-start gap-3 shadow-2xs">
                        <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                          <Layers className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                        </div>
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'evaluation' && (
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#f2f2f4]/60 dark:bg-zinc-900/60 text-xs space-y-3.5">
              <h4 className="font-extrabold text-zinc-950 dark:text-white text-sm">Grading & Examination Breakdown</h4>
              <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed font-mono">
                {detail.evaluationScheme}
              </p>
              <div className="pt-3 text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed border-t border-zinc-200 dark:border-zinc-800 font-medium">
                Attendance Policy: Minimum 75% aggregate attendance is mandatory to appear for the Semester End University Examination.
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-[#f2f2f4] dark:bg-[#171719] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onFilterFeedByCourse(detail.code);
              onClose();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer shadow-2xs"
          >
            <span>Show Notices for {detail.code}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-black rounded-full bg-[#1e1e1e] hover:bg-zinc-800 text-white transition-colors cursor-pointer uppercase tracking-wider"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;
