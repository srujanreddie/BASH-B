/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  HelpCircle, 
  Presentation, 
  BookOpen, 
  Filter, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  GraduationCap 
} from 'lucide-react';

/**
 * Semester 1 "Subject Vault"
 * Displays the 9 courses as interactive cards with quick-access resource buttons.
 * Clicking a course card filters the main feed below to show ONLY that subject.
 */
export const SubjectVault = ({
  courses = [],
  selectedCourseCode = 'All',
  onSelectCourse,
  onOpenResourcePreview,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCardClick = (code) => {
    if (selectedCourseCode === code) {
      onSelectCourse('All');
    } else {
      onSelectCourse(code);
    }
  };

  const handleResourceClick = (e, title, url, code) => {
    e.stopPropagation();
    if (!url) return;
    if (onOpenResourcePreview) {
      onOpenResourcePreview(title, url, code);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Vault Header Bar */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-900 text-white shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                  Semester 1 Subject Vault
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  9 Modules · 20 Credits
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Tap any course card to filter feed deadlines. Access official syllabus, PYQs, slides, and manuals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedCourseCode !== 'All' && (
              <button
                onClick={() => onSelectCourse('All')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
              >
                <span>Clear filter ({selectedCourseCode})</span>
                <span className="text-slate-400">×</span>
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              <span>{isExpanded ? 'Collapse' : 'Show All (9)'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Course Cards Grid */}
        {isExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1 pb-2">
            {courses.map((course) => {
              const isSelected = selectedCourseCode === course.code;

              return (
                <div
                  key={course.code}
                  onClick={() => handleCardClick(course.code)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(course.code);
                    }
                  }}
                  className={`group relative text-left rounded-xl p-3.5 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/50'
                      : 'bg-white hover:bg-slate-50/80 text-slate-900 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top metadata line */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`font-mono font-semibold tracking-wider ${
                          isSelected ? 'text-indigo-300' : 'text-slate-600'
                        }`}
                      >
                        {course.code}
                      </span>
                      <span className={isSelected ? 'text-slate-500' : 'text-slate-300'}>·</span>
                      <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>
                        {course.category}
                      </span>
                      <span className={isSelected ? 'text-slate-500' : 'text-slate-300'}>·</span>
                      <span className={`font-mono tabular-nums ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {course.credits} Credits
                      </span>
                    </div>

                    {isSelected && (
                      <span className="flex items-center gap-0.5 text-[11px] font-medium text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                        <Check className="w-3 h-3" />
                        Active Filter
                      </span>
                    )}
                  </div>

                  <h3 className={`text-sm font-semibold tracking-tight mb-1 line-clamp-1 ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}>
                    {course.title}
                  </h3>
                  <p className={`text-xs line-clamp-2 mb-3 leading-relaxed ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {course.description || `${course.category} module for Semester 1 Computer Science.`}
                  </p>

                  {/* Resource Buttons */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex flex-wrap gap-1.5">
                    {course.syllabusUrl && (
                      <button
                        type="button"
                        onClick={(e) => handleResourceClick(e, `${course.shortTitle} Syllabus Copy`, course.syllabusUrl, course.code)}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                          isSelected
                            ? 'bg-white/10 hover:bg-white/20 text-slate-100'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <FileText className="w-3 h-3 text-sky-500 shrink-0" />
                        <span>Syllabus</span>
                      </button>
                    )}

                    {course.pyqUrl && (
                      <button
                        type="button"
                        onClick={(e) => handleResourceClick(e, `${course.shortTitle} Previous Year Papers (PYQ)`, course.pyqUrl, course.code)}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                          isSelected
                            ? 'bg-white/10 hover:bg-white/20 text-slate-100'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <HelpCircle className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>PYQs</span>
                      </button>
                    )}

                    {course.lectureSlidesUrl && (
                      <button
                        type="button"
                        onClick={(e) => handleResourceClick(e, `${course.shortTitle} Lecture Slides`, course.lectureSlidesUrl, course.code)}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                          isSelected
                            ? 'bg-white/10 hover:bg-white/20 text-slate-100'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Presentation className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>Slides</span>
                      </button>
                    )}

                    {course.labManualUrl && (
                      <button
                        type="button"
                        onClick={(e) => handleResourceClick(e, `${course.shortTitle} Lab Manual`, course.labManualUrl, course.code)}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                          isSelected
                            ? 'bg-white/10 hover:bg-white/20 text-slate-100'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <BookOpen className="w-3 h-3 text-purple-500 shrink-0" />
                        <span>Lab Manual</span>
                      </button>
                    )}

                    <div className="ml-auto flex items-center">
                      <span className={`text-[11px] flex items-center gap-0.5 ${
                        isSelected ? 'text-indigo-300' : 'text-slate-400 group-hover:text-slate-600'
                      }`}>
                        <Filter className="w-3 h-3" />
                        <span className="hidden sm:inline">Feed filter</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default SubjectVault;
