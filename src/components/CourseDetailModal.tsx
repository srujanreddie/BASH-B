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
  Presentation, 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 relative text-left max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-modal-title"
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {detail.code}
              </span>
              <span>·</span>
              <span className="font-semibold">{detail.category}</span>
              <span>·</span>
              <span>{detail.credits} Credits</span>
            </div>
            <h2 id="course-modal-title" className="text-lg font-bold text-slate-900 leading-snug">
              {detail.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>{detail.instructor}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{detail.room}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors shrink-0"
            aria-label="Close course details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Resource Buttons Bar */}
        <div className="px-5 py-2.5 bg-slate-100/60 border-b border-slate-200/60 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            Vault Links:
          </span>
          <button
            onClick={() => handleResourceOpen(`${detail.shortTitle} Syllabus Copy`, detail.resources.syllabusUrl)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors"
          >
            <FileText className="w-3 h-3 text-sky-500" />
            <span>Syllabus Copy</span>
          </button>
          <button
            onClick={() => handleResourceOpen(`${detail.shortTitle} Previous Year Papers (PYQ)`, detail.resources.pyqUrl)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors"
          >
            <HelpCircle className="w-3 h-3 text-amber-500" />
            <span>PYQ Papers</span>
          </button>
          <button
            onClick={() => handleResourceOpen(`${detail.shortTitle} Lecture Slides`, detail.resources.lectureSlidesUrl)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors"
          >
            <Presentation className="w-3 h-3 text-emerald-500" />
            <span>Lecture Slides</span>
          </button>
          <button
            onClick={() => handleResourceOpen(`${detail.shortTitle} Lab Manual / Notes`, detail.resources.labManualUrl)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors"
          >
            <BookOpen className="w-3 h-3 text-purple-500" />
            <span>Handbook / Manual</span>
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-5 pt-3 pb-1 border-b border-slate-100 flex items-center gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('units')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'units'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Syllabus Modules ({detail.units.length} Units)
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'books'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Textbooks & References
          </button>
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'evaluation'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Evaluation Scheme
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'units' && (
            <div className="space-y-3">
              {detail.units.map((unit) => (
                <div
                  key={unit.unitNumber}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                        {unit.unitNumber}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {unit.title}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                      {unit.hours} Hours
                    </span>
                  </div>

                  <ul className="space-y-1.5 pl-8 text-xs text-slate-600 list-disc leading-relaxed">
                    {unit.topics.map((t, idx) => (
                      <li key={idx} className="marker:text-slate-400">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'books' && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[11px] mb-2">
                  Prescribed Textbooks
                </h4>
                <div className="space-y-2">
                  {detail.textbooks.map((b, i) => (
                    <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-2.5">
                      <BookOpen className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                      <span className="text-slate-800 font-medium">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {detail.referenceBooks.length > 0 && (
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[11px] mb-2">
                    Recommended Reference Works
                  </h4>
                  <div className="space-y-2">
                    {detail.referenceBooks.map((b, i) => (
                      <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-2.5">
                        <Layers className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'evaluation' && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Grading & Examination Breakdown</h4>
              <p className="text-slate-700 leading-relaxed font-mono">
                {detail.evaluationScheme}
              </p>
              <div className="pt-2 text-slate-500 text-[11px] leading-relaxed border-t border-slate-200">
                Attendance Policy: Minimum 75% aggregate attendance is mandatory to appear for the Semester End University Examination.
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onFilterFeedByCourse(detail.code);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
          >
            <span>Show Notices for {detail.code} in Feed</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;
