/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Lock, 
  RefreshCw, 
  ExternalLink, 
  Filter, 
  Palette, 
  LayoutGrid, 
  List, 
  CalendarDays,
  Calendar,
  Printer,
  CalendarPlus,
  BookOpen
} from 'lucide-react';
import UrgentBanner from '../components/UrgentBanner';
import SubjectVault from '../components/SubjectVault';
import FilterBar from '../components/FilterBar';
import NoticeCard from '../components/NoticeCard';
import NoticeDenseRow from '../components/NoticeDenseRow';
import NoticeTimelineView from '../components/NoticeTimelineView';
import ResourceViewerModal from '../components/ResourceViewerModal';
import ThemeSelectorModal from '../components/ThemeSelectorModal';
import CourseDetailModal from '../components/CourseDetailModal';
import CohortTimetableModal from '../components/CohortTimetableModal';
import QuickPrintModal from '../components/QuickPrintModal';
import { Course, Notice, CategoryFilter, UITheme, LayoutView } from '../types';
import { exportNoticesToIcs } from '../utils/calendarExport';
import { safeFetchJson } from '../utils/api';

export const Home: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ghost check-off state in localStorage
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('cse_sem1_ghost_completed');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Starred / Priority state in localStorage
  const [starredMap, setStarredMap] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('cse_sem1_starred');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // UI Theme state (persisted)
  const [theme, setTheme] = useState<UITheme>(() => {
    try {
      return (localStorage.getItem('cse_sem1_ui_theme') as UITheme) || 'academic';
    } catch {
      return 'academic';
    }
  });

  // Layout View mode state (persisted)
  const [layoutView, setLayoutView] = useState<LayoutView>(() => {
    try {
      return (localStorage.getItem('cse_sem1_ui_layout') as LayoutView) || 'cards';
    } catch {
      return 'cards';
    }
  });

  // Modal States
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [detailCourseCode, setDetailCourseCode] = useState<string | null>(null);
  const [isTimetableOpen, setIsTimetableOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Filter Bar state
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hideCompleted, setHideCompleted] = useState<boolean>(false);
  const [onlyStarred, setOnlyStarred] = useState<boolean>(false);

  // Resource Preview Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
    courseCode: string;
  }>({
    isOpen: false,
    title: '',
    url: '',
    courseCode: '',
  });

  const handleSelectTheme = (newTheme: UITheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('cse_sem1_ui_theme', newTheme);
    } catch {
      // ignore
    }
  };

  const handleSelectLayout = (newLayout: LayoutView) => {
    setLayoutView(newLayout);
    try {
      localStorage.setItem('cse_sem1_ui_layout', newLayout);
    } catch {
      // ignore
    }
  };

  const loadData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const [coursesRes, noticesRes] = await Promise.all([
        safeFetchJson<{ success: boolean; courses: Course[] }>('/api/courses'),
        safeFetchJson<{ success: boolean; notices: Notice[] }>('/api/notices'),
      ]);

      if (coursesRes.ok && coursesRes.data?.courses) {
        setCourses(coursesRes.data.courses);
      }
      if (noticesRes.ok && noticesRes.data?.notices) {
        setNotices(noticesRes.data.notices);
      }
    } catch (err: any) {
      setError('Failed to load notices: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleComplete = (noticeId: string) => {
    setCompletedMap((prev) => {
      const next = { ...prev, [noticeId]: !prev[noticeId] };
      try {
        localStorage.setItem('cse_sem1_ghost_completed', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleToggleStar = (noticeId: string) => {
    setStarredMap((prev) => {
      const next = { ...prev, [noticeId]: !prev[noticeId] };
      try {
        localStorage.setItem('cse_sem1_starred', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleOpenResource = (title: string, url: string, courseCode: string) => {
    setModalState({
      isOpen: true,
      title,
      url,
      courseCode,
    });
  };

  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const id = notice.id || (notice as any)._id;

      if (hideCompleted && completedMap[id]) {
        return false;
      }

      if (onlyStarred && !starredMap[id]) {
        return false;
      }

      if (selectedCategory !== 'All' && notice.category !== selectedCategory) {
        return false;
      }

      if (selectedCourseCode !== 'All' && notice.courseCode !== selectedCourseCode) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = notice.title.toLowerCase().includes(q);
        const matchesDesc = notice.description.toLowerCase().includes(q);
        const matchesCode = notice.courseCode.toLowerCase().includes(q);
        const matchesCourse = notice.courseTitle?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCode && !matchesCourse) {
          return false;
        }
      }

      return true;
    });
  }, [notices, selectedCategory, selectedCourseCode, searchQuery, hideCompleted, onlyStarred, completedMap, starredMap]);

  const categoryCounts = useMemo(() => {
    return {
      All: notices.length,
      Assignment: notices.filter((n) => n.category === 'Assignment').length,
      Exam: notices.filter((n) => n.category === 'Exam').length,
      Material: notices.filter((n) => n.category === 'Material').length,
    };
  }, [notices]);

  const completedCount = useMemo(() => {
    return notices.filter((n) => completedMap[n.id || (n as any)._id]).length;
  }, [notices, completedMap]);

  const starredCount = useMemo(() => {
    return notices.filter((n) => starredMap[n.id || (n as any)._id]).length;
  }, [notices, starredMap]);

  // Dynamic Theme Wrapper Classes
  const themeClass = useMemo(() => {
    switch (theme) {
      case 'terminal':
        return 'theme-terminal bg-neutral-950 text-neutral-100 font-mono min-h-screen selection:bg-emerald-500 selection:text-black';
      case 'notion':
        return 'theme-notion bg-[#fcfcfb] text-stone-900 font-sans min-h-screen';
      case 'campus':
        return 'theme-campus bg-slate-50/90 text-slate-900 font-sans min-h-screen';
      case 'oled':
        return 'theme-oled bg-black text-cyan-50 font-sans min-h-screen selection:bg-cyan-400 selection:text-black';
      case 'academic':
      default:
        return 'theme-academic bg-slate-50 text-slate-900 font-sans min-h-screen';
    }
  }, [theme]);

  return (
    <div className={themeClass}>
      {/* 1. Next Immediate Threat (Urgent Banner) */}
      <UrgentBanner
        notices={notices}
        completedMap={completedMap}
        onSelectNotice={(id) => {
          const el = document.getElementById(`notice-${id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
        onFilterCourse={(code) => setSelectedCourseCode(code)}
      />

      {/* 2. Top Bar Contract */}
      <header className={`border-b sticky top-0 z-30 transition-colors ${
        theme === 'terminal'
          ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
          : theme === 'oled'
          ? 'bg-neutral-950 border-neutral-800 text-cyan-300'
          : theme === 'notion'
          ? 'bg-white border-stone-200 text-stone-900'
          : theme === 'campus'
          ? 'bg-white/90 backdrop-blur-md border-indigo-100 text-slate-900'
          : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Zone 1: Wordmark */}
          <Link
            to="/"
            className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2 hover:opacity-90"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
              theme === 'terminal'
                ? 'bg-emerald-500 text-black'
                : theme === 'oled'
                ? 'bg-cyan-400 text-black font-bold'
                : theme === 'campus'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-white'
            }`}>
              CSE
            </div>
            <span>Cohort Sem 1 Hub</span>
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium opacity-80">
            <a href="#vault" className="hover:opacity-100 transition-opacity">
              Subject Vault
            </a>
            <button
              onClick={() => setIsTimetableOpen(true)}
              className="hover:opacity-100 transition-opacity flex items-center gap-1 text-xs sm:text-sm font-medium"
            >
              <span>Weekly Timetable</span>
            </button>
            <a href="#feed" className="hover:opacity-100 transition-opacity">
              Deadlines & Materials
            </a>
            <a
              href="https://drive.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 transition-opacity inline-flex items-center gap-1"
            >
              <span>Batch Drive</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </nav>

          {/* Zone 3: Primary Actions (UI/UX Selector, Refresh, Admin Portal) */}
          <div className="flex items-center gap-2">
            {/* UI/UX Choice Trigger */}
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
                theme === 'terminal'
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border-neutral-700'
                  : theme === 'oled'
                  ? 'bg-neutral-900 hover:bg-neutral-800 text-cyan-300 border-neutral-700'
                  : theme === 'campus'
                  ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
              title="Change UI Theme & Layout Density"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">UI Style</span>
            </button>

            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-2 opacity-70 hover:opacity-100 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-opacity"
              title="Refresh notices from server"
              aria-label="Refresh notice feed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/admin-login"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-xs ${
                theme === 'terminal'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  : theme === 'oled'
                  ? 'bg-cyan-400 hover:bg-cyan-300 text-black'
                  : theme === 'campus'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Gateway</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Semester 1 "Subject Vault" Section */}
      <div id="vault">
        <SubjectVault
          courses={courses}
          selectedCourseCode={selectedCourseCode}
          onSelectCourse={(code) => setSelectedCourseCode(code)}
          onOpenResourcePreview={handleOpenResource}
          onOpenCourseDetail={(code) => setDetailCourseCode(code)}
        />
      </div>

      {/* 4. Multi-Level Filter Bar (Sticky) */}
      <FilterBar
        categories={[
          { key: 'All', label: 'All Notices', count: categoryCounts.All },
          { key: 'Assignment', label: 'Assignments', count: categoryCounts.Assignment },
          { key: 'Exam', label: 'Exams & Quizzes', count: categoryCounts.Exam },
          { key: 'Material', label: 'Materials & Notes', count: categoryCounts.Material },
        ]}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        courses={courses}
        selectedCourseCode={selectedCourseCode}
        onSelectCourseCode={setSelectedCourseCode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        hideCompleted={hideCompleted}
        onToggleHideCompleted={() => setHideCompleted(!hideCompleted)}
        completedCount={completedCount}
        totalCount={notices.length}
        onlyStarred={onlyStarred}
        onToggleOnlyStarred={() => setOnlyStarred(!onlyStarred)}
        starredCount={starredCount}
        onExportCalendar={() => exportNoticesToIcs(filteredNotices)}
        onOpenPrintSheet={() => setIsPrintOpen(true)}
        onOpenTimetable={() => setIsTimetableOpen(true)}
      />

      {/* 5. Main Content Feed */}
      <main id="feed" className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Section Title & View Layout Mode Quick Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight">
                {selectedCourseCode !== 'All' ? `[${selectedCourseCode}] Active Feed` : 'Cohort Broadcast Feed'}
              </h2>
              <span className="text-xs opacity-60 font-mono tabular-nums">
                ({filteredNotices.length} of {notices.length} items)
              </span>
            </div>
            <p className="text-xs opacity-60">
              Ghost check-off tasks as completed — click star to prioritize tasks.
            </p>
          </div>

          {/* Quick Layout Mode Buttons (Cards / Dense Ledger / Timeline) */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-50 mr-1 hidden sm:inline">
              Layout:
            </span>
            <div className="flex items-center gap-1 p-1 bg-slate-200/50 dark:bg-neutral-800 rounded-lg">
              <button
                type="button"
                onClick={() => handleSelectLayout('cards')}
                className={`p-1.5 rounded-md transition-colors ${
                  layoutView === 'cards'
                    ? 'bg-white dark:bg-neutral-700 shadow-2xs font-semibold'
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="Card Grid View"
                aria-label="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleSelectLayout('dense')}
                className={`p-1.5 rounded-md transition-colors ${
                  layoutView === 'dense'
                    ? 'bg-white dark:bg-neutral-700 shadow-2xs font-semibold'
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="Dense Ledger View"
                aria-label="Dense Ledger View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleSelectLayout('timeline')}
                className={`p-1.5 rounded-md transition-colors ${
                  layoutView === 'timeline'
                    ? 'bg-white dark:bg-neutral-700 shadow-2xs font-semibold'
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="Chronological Timeline View"
                aria-label="Chronological Timeline View"
              >
                <CalendarDays className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading / Error / Empty States */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs opacity-60">Loading semester notices and resources...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center max-w-md mx-auto my-8">
            <p className="text-xs text-rose-700 font-medium mb-3">{error}</p>
            <button
              onClick={() => loadData()}
              className="px-3 py-1.5 bg-rose-700 text-white text-xs font-semibold rounded-lg hover:bg-rose-800"
            >
              Retry
            </button>
          </div>
        ) : notices.length === 0 ? (
          <div className="p-10 text-center bg-white/80 dark:bg-neutral-900 rounded-2xl border border-slate-200/80 my-8 max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto mb-3.5 border border-emerald-200/50">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Live Cohort Noticeboard Active
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              All systems clear. No upcoming deadlines or exams posted right now. Use the Subject Vault above to access syllabus copies, PYQ folders, and lecture notes for Semester 1 courses.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href="#vault"
                className="px-3.5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Access Subject Vault (9 Courses)
              </a>
              <Link
                to="/admin-login"
                className="px-3 py-2 border border-slate-300 dark:border-neutral-700 text-xs font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Admin Gateway
              </Link>
            </div>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="p-12 text-center bg-white/70 dark:bg-neutral-900 rounded-2xl border border-slate-200/80 my-6 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 opacity-50 flex items-center justify-center mx-auto mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold mb-1">
              No notices match current filters
            </h3>
            <p className="text-xs opacity-60 mb-4 leading-relaxed">
              Try resetting your subject filter or category tab, or clear the search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedCourseCode('All');
                setSearchQuery('');
                setHideCompleted(false);
                setOnlyStarred(false);
              }}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Render based on user's layout choice */
          <>
            {layoutView === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNotices.map((notice) => {
                  const noticeId = notice.id || (notice as any)._id;
                  const isDone = Boolean(completedMap[noticeId]);
                  const isStarred = Boolean(starredMap[noticeId]);

                  return (
                    <div key={noticeId} id={`notice-${noticeId}`}>
                      <NoticeCard
                        notice={notice}
                        isCompleted={isDone}
                        onToggleComplete={handleToggleComplete}
                        isStarred={isStarred}
                        onToggleStar={handleToggleStar}
                        onFilterCourse={(code) => setSelectedCourseCode(code)}
                        onOpenResourcePreview={handleOpenResource}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {layoutView === 'dense' && (
              <div className="space-y-2">
                <div className="hidden sm:flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider opacity-50 border-b pb-1">
                  <div className="w-5"></div>
                  <div className="w-24">Course</div>
                  <div className="flex-1">Task & Title</div>
                  <div className="w-36 text-right">Deadline / Exam</div>
                  <div className="w-24 text-right">Resource</div>
                </div>
                {filteredNotices.map((notice) => {
                  const noticeId = notice.id || (notice as any)._id;
                  return (
                    <NoticeDenseRow
                      key={noticeId}
                      notice={notice}
                      isCompleted={Boolean(completedMap[noticeId])}
                      onToggleComplete={handleToggleComplete}
                      onFilterCourse={(code) => setSelectedCourseCode(code)}
                      onOpenResourcePreview={handleOpenResource}
                    />
                  );
                })}
              </div>
            )}

            {layoutView === 'timeline' && (
              <NoticeTimelineView
                notices={filteredNotices}
                completedMap={completedMap}
                onToggleComplete={handleToggleComplete}
                onFilterCourse={(code) => setSelectedCourseCode(code)}
                onOpenResourcePreview={handleOpenResource}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 mt-auto py-6 bg-white/40 dark:bg-neutral-900/40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-60">
          <div className="flex items-center gap-2">
            <span className="font-semibold">CSE Cohort 2026</span>
            <span aria-hidden="true">·</span>
            <span>Semester 1 Noticeboard & Resource Directory</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsTimetableOpen(true)}
              className="hover:underline flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              <span>Schedule</span>
            </button>
            <button
              onClick={() => setIsPrintOpen(true)}
              className="hover:underline flex items-center gap-1"
            >
              <Printer className="w-3 h-3" />
              <span>Print Sheet</span>
            </button>
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="hover:underline flex items-center gap-1"
            >
              <Palette className="w-3 h-3" />
              <span>Theme: {theme}</span>
            </button>
            <Link
              to="/admin-login"
              className="hover:underline flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </footer>

      {/* Course Unit-by-Unit Syllabus Detail Modal */}
      <CourseDetailModal
        courseCode={detailCourseCode}
        onClose={() => setDetailCourseCode(null)}
        onFilterFeedByCourse={(code) => setSelectedCourseCode(code)}
        onOpenResourcePreview={handleOpenResource}
      />

      {/* Weekly Cohort Timetable Modal */}
      <CohortTimetableModal
        isOpen={isTimetableOpen}
        onClose={() => setIsTimetableOpen(false)}
        onSelectCourse={(code) => setSelectedCourseCode(code)}
      />

      {/* Quick Print A4 Checklist Modal */}
      <QuickPrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        notices={filteredNotices}
        completedMap={completedMap}
      />

      {/* UI/UX Theme & Layout Selector Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={theme}
        onSelectTheme={handleSelectTheme}
        currentLayout={layoutView}
        onSelectLayout={handleSelectLayout}
      />

      {/* Resource Gateway Modal */}
      <ResourceViewerModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        title={modalState.title}
        url={modalState.url}
        courseCode={modalState.courseCode}
      />
    </div>
  );
};

export default Home;
