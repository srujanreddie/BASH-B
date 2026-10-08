/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, X, CheckSquare } from 'lucide-react';

/**
 * Multi-Level Filter Bar:
 * - Category segmented control (All, Assignments, Exams, Materials)
 * - Horizontal scrollable subject pills (All 9 courses)
 * - Real-time search query
 * - Ghost completion filter toggle
 */
export const FilterBar = ({
  categories = [],
  selectedCategory = 'All',
  onSelectCategory,
  courses = [],
  selectedCourseCode = 'All',
  onSelectCourseCode,
  searchQuery = '',
  onSearchChange,
  hideCompleted = false,
  onToggleHideCompleted,
  completedCount = 0,
  totalCount = 0,
}) => {
  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedCourseCode !== 'All' ||
    searchQuery.trim() !== '' ||
    hideCompleted;

  const handleResetFilters = () => {
    onSelectCategory('All');
    onSelectCourseCode('All');
    onSearchChange('');
  };

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search */}
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

          {/* Category Tabs */}
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

          {/* Ghost Completion Filter */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleHideCompleted}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                hideCompleted
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 shrink-0" />
              <span>{hideCompleted ? 'Hiding Checked' : 'Hide Checked'}</span>
              <span className="font-mono text-[11px] opacity-75">
                ({completedCount}/{totalCount})
              </span>
            </button>
          </div>
        </div>

        {/* Subject Pills */}
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
