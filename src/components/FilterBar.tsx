import React from 'react';
import { Search, X, CheckSquare, CalendarPlus, Printer, Calendar, Star } from 'lucide-react';
import { Course, CategoryFilter } from '../types';

interface FilterBarProps {
  categories: { key: CategoryFilter; label: string; count?: number }[];
  selectedCategory: CategoryFilter;
  onSelectCategory: (category: CategoryFilter) => void;
  courses: Course[];
  selectedCourseCode: string;
  onSelectCourseCode: (code: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hideCompleted: boolean;
  onToggleHideCompleted: () => void;
  completedCount: number;
  totalCount: number;
  onlyStarred?: boolean;
  onToggleOnlyStarred?: () => void;
  starredCount?: number;
  onExportCalendar?: () => void;
  onOpenPrintSheet?: () => void;
  onOpenTimetable?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  courses,
  selectedCourseCode,
  onSelectCourseCode,
  searchQuery,
  onSearchChange,
  hideCompleted,
  onToggleHideCompleted,
  completedCount,
  totalCount,
  onlyStarred = false,
  onToggleOnlyStarred,
  starredCount = 0,
  onExportCalendar,
  onOpenPrintSheet,
  onOpenTimetable,
}) => {
  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedCourseCode !== 'All' ||
    searchQuery.trim() !== '' ||
    hideCompleted ||
    onlyStarred;

  const handleResetFilters = () => {
    onSelectCategory('All');
    onSelectCourseCode('All');
    onSearchChange('');
  };

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3 space-y-2.5">
        {/* Row 1: Search & Category Filter Segmented Control & Ghost Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search assignments, midterms, lab records..."
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs (Segmented Control per Design Constitution) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto shrink-0">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => onSelectCategory(cat.key)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{cat.label}</span>
                  {typeof cat.count === 'number' && (
                    <span className="ml-1 text-[11px] opacity-60 font-mono">({cat.count})</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Star Filter & Hide Ghosted Tasks Toggle & Productivity Tools */}
          <div className="flex items-center flex-wrap sm:flex-nowrap justify-between sm:justify-end gap-2 shrink-0">
            {/* Star Filter Toggle */}
            {onToggleOnlyStarred && (
              <button
                type="button"
                onClick={onToggleOnlyStarred}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                  onlyStarred
                    ? 'bg-amber-500 text-white border-amber-500 shadow-2xs font-semibold'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                }`}
                title="Filter only starred notices"
              >
                <Star className={`w-3.5 h-3.5 ${onlyStarred ? 'fill-white' : 'text-amber-500'}`} />
                <span>Starred</span>
                <span className="font-mono text-[11px] opacity-80">({starredCount})</span>
              </button>
            )}

            {/* Ghost Toggle */}
            <button
              type="button"
              onClick={onToggleHideCompleted}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                hideCompleted
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              }`}
              title="Toggle completed/ghosted assignments"
            >
              <CheckSquare className="w-3.5 h-3.5 shrink-0" />
              <span>{hideCompleted ? 'Hiding Checked' : 'Hide Checked'}</span>
              <span className="font-mono text-[11px] opacity-75">
                ({completedCount}/{totalCount})
              </span>
            </button>

            {/* Weekly Timetable Modal Trigger */}
            {onOpenTimetable && (
              <button
                type="button"
                onClick={onOpenTimetable}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors"
                title="View Weekly Schedule (Mon-Fri)"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Timetable</span>
              </button>
            )}

            {/* Export .ICS Calendar */}
            {onExportCalendar && (
              <button
                type="button"
                onClick={onExportCalendar}
                className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 border border-slate-200 transition-colors"
                title="Export all deadlines to iCalendar (.ics)"
                aria-label="Export to Calendar (.ics)"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Print Checklist Sheet */}
            {onOpenPrintSheet && (
              <button
                type="button"
                onClick={onOpenPrintSheet}
                className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
                title="Print A4 Deadline Checklist"
                aria-label="Print Checklist"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Horizontal Scrollable Subject Code Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0 pr-1">
            Subject:
          </span>

          <button
            type="button"
            onClick={() => onSelectCourseCode('All')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors shrink-0 ${
              selectedCourseCode === 'All'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Courses
          </button>

          {courses.map((course) => {
            const isSelected = selectedCourseCode === course.code;
            return (
              <button
                key={course.code}
                type="button"
                onClick={() => onSelectCourseCode(course.code)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={`${course.code}: ${course.title}`}
              >
                <span className="font-mono">{course.code}</span>
                <span className="opacity-70 text-[11px]">({course.shortTitle})</span>
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="ml-auto text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline px-2 py-1 whitespace-nowrap shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
