/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  Calendar, 
  Lock, 
  RefreshCw, 
  X,
  Sparkles,
  Layers,
  ListTodo,
  LayoutGrid
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import NoticeFeed from '../components/NoticeFeed';
import AssignmentTracker from '../components/AssignmentTracker';
import ThemeToggle from '../components/ThemeToggle';
import BashBLogo from '../components/BashBLogo';
import ResourceViewerModal from '../components/ResourceViewerModal';
import CourseDetailModal from '../components/CourseDetailModal';
import CohortTimetableModal from '../components/CohortTimetableModal';
import QuickPrintModal from '../components/QuickPrintModal';
import { Course, Notice, Assignment, CategoryFilter } from '../types';
import { safeFetchJson } from '../utils/api';
import { SEED_COURSES, DEFAULT_NOTICES } from '../data/seedCourses';

export const Home: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const stored = localStorage.getItem('cse_sem1_cached_courses');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return SEED_COURSES;
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    try {
      const cached = localStorage.getItem('cse_sem1_cached_notices');
      if (cached !== null) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_NOTICES;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const stored = localStorage.getItem('cse_sem1_cached_assignments');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [activeMainTab, setActiveMainTab] = useState<'feed' | 'assignments'>('feed');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Modal States
  const [detailCourseCode, setDetailCourseCode] = useState<string | null>(null);
  const [isTimetableOpen, setIsTimetableOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Filter States
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

  const pendingAssignmentsCount = useMemo(() => {
    try {
      const checklist = JSON.parse(localStorage.getItem('cse_section_b_assignment_checklist') || '{}');
      return assignments.filter((a) => !checklist[a.id]?.completed).length;
    } catch {
      return assignments.length;
    }
  }, [assignments]);

  const loadData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    try {
      const [coursesRes, noticesRes, assignmentsRes] = await Promise.all([
        safeFetchJson<{ success: boolean; courses: Course[] }>('/api/courses'),
        safeFetchJson<{ success: boolean; notices: Notice[] }>('/api/notices'),
        safeFetchJson<{ success: boolean; assignments: Assignment[] }>('/api/assignments'),
      ]);

      if (coursesRes.ok && coursesRes.data?.courses && coursesRes.data.courses.length > 0) {
        setCourses(coursesRes.data.courses);
        try {
          localStorage.setItem('cse_sem1_cached_courses', JSON.stringify(coursesRes.data.courses));
        } catch {
          // ignore
        }
      }
      if (noticesRes.ok && noticesRes.data?.notices) {
        setNotices(noticesRes.data.notices);
        try {
          localStorage.setItem('cse_sem1_cached_notices', JSON.stringify(noticesRes.data.notices));
        } catch {
          // ignore
        }
      }
      if (assignmentsRes.ok && assignmentsRes.data?.assignments) {
        setAssignments(assignmentsRes.data.assignments);
        try {
          localStorage.setItem('cse_sem1_cached_assignments', JSON.stringify(assignmentsRes.data.assignments));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn('API sync deferred; using local offline cohort cache.', err);
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

  // Filter notices based on search, course, category, and toggles
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
        const matchesTags = notice.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesCode && !matchesCourse && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [notices, selectedCategory, selectedCourseCode, searchQuery, hideCompleted, onlyStarred, completedMap, starredMap]);

  // Notice counts per course
  const noticeCountsByCourse = useMemo(() => {
    const map: Record<string, number> = {};
    notices.forEach((n) => {
      map[n.courseCode] = (map[n.courseCode] || 0) + 1;
    });
    return map;
  }, [notices]);

  return (
    <div className="min-h-screen bg-[#f2f2f4] dark:bg-[#121214] text-zinc-950 dark:text-zinc-100 flex flex-col lg:flex-row antialiased selection:bg-[#d2f34c] selection:text-zinc-950 transition-colors duration-200">
      {/* 1. Left Sidebar (The "Subject Vault") - Desktop & Mobile */}
      <Sidebar
        courses={courses}
        selectedCourseCode={selectedCourseCode}
        onSelectCourse={(code) => {
          setSelectedCourseCode(code);
          setMobileMenuOpen(false);
        }}
        noticeCountsByCourse={noticeCountsByCourse}
        onOpenTimetable={() => {
          setIsTimetableOpen(true);
          setMobileMenuOpen(false);
        }}
        onOpenCourseDetail={(code) => {
          setDetailCourseCode(code);
          setMobileMenuOpen(false);
        }}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        activeMainTab={activeMainTab}
        onSelectMainTab={(tab) => {
          setActiveMainTab(tab);
          setMobileMenuOpen(false);
        }}
        pendingAssignmentsCount={pendingAssignmentsCount}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Top App Bar */}
        <div className="lg:hidden bg-[#1e1e1e] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <BashBLogo size={24} />
              <span className="font-black text-base tracking-tight text-white">
                <span>bash</span><span className="text-[#c8f828]">-b</span>
              </span>
              <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded-full font-bold text-zinc-400">
                CSE B
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle variant="segmented" className="!bg-zinc-800/90 !border-zinc-700/80 scale-90 sm:scale-100 origin-right" />
            <button
              onClick={() => setIsTimetableOpen(true)}
              className="p-1.5 rounded-full bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
              title="Open Timetable"
            >
              <Calendar className="w-4 h-4 text-[#d2f34c]" />
            </button>
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-1.5 rounded-full bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/admin-login"
              className="p-1.5 rounded-full bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
              title="Admin Login"
            >
              <Lock className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Notice Feed Container */}
        <main className="flex-1 p-3 sm:p-5 lg:p-7 max-w-7xl w-full mx-auto">
          {/* Top Primary View Switcher: Noticeboard vs Assignment Tracker */}
          <div className="flex items-center gap-2 mb-6 p-1.5 bg-zinc-200/80 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-2xl w-fit shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveMainTab('feed')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeMainTab === 'feed'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Noticeboard & Schedule</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMainTab('assignments')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeMainTab === 'assignments'
                  ? 'bg-[#c4f510] text-zinc-950 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              <span>Assignment Checklist</span>
              {pendingAssignmentsCount > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                  activeMainTab === 'assignments' ? 'bg-zinc-950 text-[#c4f510]' : 'bg-[#c4f510] text-zinc-950'
                }`}>
                  {pendingAssignmentsCount}
                </span>
              )}
            </button>
          </div>

          {activeMainTab === 'feed' ? (
            <NoticeFeed
              notices={filteredNotices}
              courses={courses}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedCourseCode={selectedCourseCode}
              onSelectCourseCode={setSelectedCourseCode}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              hideCompleted={hideCompleted}
              onToggleHideCompleted={() => setHideCompleted(!hideCompleted)}
              onlyStarred={onlyStarred}
              onToggleOnlyStarred={() => setOnlyStarred(!onlyStarred)}
              completedMap={completedMap}
              onToggleComplete={handleToggleComplete}
              starredMap={starredMap}
              onToggleStar={handleToggleStar}
              onOpenResourcePreview={handleOpenResource}
              onOpenPrintSheet={() => setIsPrintOpen(true)}
              onOpenTimetable={() => setIsTimetableOpen(true)}
            />
          ) : (
            <AssignmentTracker
              assignments={assignments}
              courses={courses}
              selectedCourseCode={selectedCourseCode}
              onSelectCourseCode={setSelectedCourseCode}
              onRefresh={() => loadData(true)}
            />
          )}
        </main>
      </div>

      {/* 3. Modals */}
      {/* Weekly Cohort Timetable Modal */}
      <CohortTimetableModal
        isOpen={isTimetableOpen}
        onClose={() => setIsTimetableOpen(false)}
        onSelectCourse={(code) => setSelectedCourseCode(code)}
      />

      {/* Course Unit-by-Unit Syllabus Detail Modal */}
      <CourseDetailModal
        courseCode={detailCourseCode}
        onClose={() => setDetailCourseCode(null)}
        onFilterFeedByCourse={(code) => setSelectedCourseCode(code)}
        onOpenResourcePreview={handleOpenResource}
      />

      {/* Quick Print A4 Checklist Modal */}
      <QuickPrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        notices={filteredNotices}
        completedMap={completedMap}
      />

      {/* Resource Gateway Modal */}
      <ResourceViewerModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        title={modalState.title}
        url={modalState.url}
        courseCode={modalState.courseCode}
      />

      {/* Floating Theme Switcher Pill (quick access anytime on public page) */}
      <ThemeToggle variant="floating" />
    </div>
  );
};

export default Home;
