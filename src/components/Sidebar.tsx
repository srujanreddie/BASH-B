/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutGrid, 
  BookOpen, 
  Calendar, 
  Lock, 
  ExternalLink, 
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Clock,
  Layers,
  GraduationCap,
  ListTodo
} from 'lucide-react';
import { Course } from '../types';
import ThemeToggle from './ThemeToggle';
import BashBLogo from './BashBLogo';

interface SidebarProps {
  courses: Course[];
  selectedCourseCode: string;
  onSelectCourse: (code: string) => void;
  noticeCountsByCourse?: Record<string, number>;
  onOpenTimetable?: () => void;
  onOpenCourseDetail?: (code: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  activeMainTab?: 'feed' | 'assignments';
  onSelectMainTab?: (tab: 'feed' | 'assignments') => void;
  pendingAssignmentsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  courses,
  selectedCourseCode,
  onSelectCourse,
  noticeCountsByCourse = {},
  onOpenTimetable,
  onOpenCourseDetail,
  isOpenMobile = false,
  onCloseMobile,
  activeMainTab = 'feed',
  onSelectMainTab,
  pendingAssignmentsCount = 0,
}) => {
  const isAllActive = selectedCourseCode === 'All' && activeMainTab === 'feed';
  const isAssignmentsActive = activeMainTab === 'assignments';

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-5 text-white">
      {/* Top Header / Brand */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-6 px-1">
          <div className="flex items-center gap-2.5">
            {/* Logo Mark matching user's bash-b design */}
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xs p-1">
              <BashBLogo size={28} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-white tracking-tight">
                  <span>bash</span>
                  <span className="text-[#c8f828]">-b</span>
                </span>
                <span className="text-[11px] font-bold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full">
                  CSE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Sec B · Room E-139</p>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Section Label */}
        <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          <span>Subject Vault</span>
          <span className="text-zinc-500 font-mono">9 Modules</span>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-22rem)] pr-1" aria-label="Course navigation">
          {/* 1. All Notices Overview */}
          <button
            onClick={() => {
              onSelectMainTab?.('feed');
              onSelectCourse('All');
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 cursor-pointer ${
              isAllActive
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutGrid className={`w-4 h-4 ${isAllActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
              <span>All Deadlines</span>
            </div>
            {isAllActive && (
              <span className="bg-[#d2f34c] text-zinc-950 text-[11px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                Active
              </span>
            )}
          </button>

          {/* 2. Assignment Checklist Tracker Tab */}
          <button
            onClick={() => {
              onSelectMainTab?.('assignments');
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 cursor-pointer ${
              isAssignmentsActive
                ? 'bg-[#c4f510] text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <ListTodo className={`w-4 h-4 ${isAssignmentsActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
              <span>Assignment Checklist</span>
            </div>
            {isAssignmentsActive ? (
              <span className="bg-zinc-950 text-[#c4f510] text-[10px] font-black px-2 py-0.5 rounded-full">
                Checklist
              </span>
            ) : pendingAssignmentsCount > 0 ? (
              <span className="bg-[#c4f510]/20 text-[#c4f510] text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
                {pendingAssignmentsCount}
              </span>
            ) : null}
          </button>

          {/* 3. The 9 Semester 1 Subjects */}
          {courses.map((course) => {
            const isSelected = selectedCourseCode === course.code && activeMainTab === 'feed';
            const count = noticeCountsByCourse[course.code] ?? 0;

            return (
              <div key={course.code} className="relative group">
                <button
                  onClick={() => {
                    onSelectMainTab?.('feed');
                    onSelectCourse(course.code);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      course.category === 'Lab' 
                        ? 'bg-[#aea8ff]' 
                        : course.category === 'Drawing' 
                        ? 'bg-amber-400' 
                        : 'bg-[#d2f34c]'
                    }`} />
                    <span className="truncate text-left">
                      {course.shortTitle || course.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Active State Indicator with Lime Green Bubble */}
                    {isSelected ? (
                      <span className="bg-[#d2f34c] text-zinc-950 text-[11px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                        {count > 0 ? count : '•'}
                      </span>
                    ) : count > 0 ? (
                      <span className="text-zinc-400 text-xs font-mono font-medium bg-zinc-800 px-1.5 py-0.2 rounded-full">
                        {count}
                      </span>
                    ) : null}
                  </div>
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Promo Card + Timetable Shortcut + Admin */}
      <div className="pt-4 space-y-3">
        {/* "Upgrade to Pro" Style Card from Reference */}
        <div className="bg-[#d2f34c] text-zinc-950 rounded-[1.75rem] p-4.5 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-900">
                Official Timetable
              </span>
              <span className="text-sm">⚡</span>
            </div>
            <h4 className="text-sm font-black text-zinc-950 leading-snug">
              Section B · Room E-139
            </h4>
            <p className="text-[11px] text-zinc-800/90 font-medium mt-0.5 mb-3">
              Full weekly timetable w.e.f. 05/08/2026.
            </p>

            <button
              type="button"
              onClick={onOpenTimetable}
              className="w-full bg-zinc-900 hover:bg-black text-white rounded-full py-2 px-3 text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>View Weekly Timetable</span>
            </button>
          </div>
        </div>

        {/* Global Theme Toggle (Light / Dark mode selection) */}
        <div className="pt-1">
          <ThemeToggle variant="segmented" className="w-full !bg-zinc-800/90 !border-zinc-700/70" />
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-2 text-xs text-zinc-400 pt-1">
          <a
            href="/admin-login"
            className="flex items-center gap-1.5 hover:text-white transition-colors text-zinc-400 font-medium"
          >
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Admin Gateway</span>
          </a>
          <span className="text-[10px] text-zinc-400 font-mono">v2.6 · 2026</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside 
        className="hidden lg:block w-72 xl:w-80 shrink-0 bg-[#1e1e1e] dark:bg-[#18181b] rounded-[2rem] m-3 mr-0 shadow-md border border-transparent dark:border-zinc-800/80 h-[calc(100vh-1.5rem)] sticky top-3 overflow-hidden transition-colors duration-200"
        aria-label="Subject Vault Sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-out Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-80 max-w-[85vw] bg-[#1e1e1e] dark:bg-[#18181b] border-r border-transparent dark:border-zinc-800 h-full shadow-2xl z-10 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
