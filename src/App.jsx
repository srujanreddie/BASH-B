import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import NoticeFeed from './components/NoticeFeed';
import { Menu, Calendar, Lock } from 'lucide-react';

const DUMMY_COURSES = [
  { code: '25BS1MT101', shortTitle: 'MAC', title: 'Matrices and Calculus', category: 'Theory', credits: 4 },
  { code: '25BS1CH101', shortTitle: 'CFE', title: 'Chemistry for Engineers', category: 'Theory', credits: 3 },
  { code: '25ES1EE101', shortTitle: 'BEE', title: 'Basic Electrical Engineering', category: 'Theory', credits: 3 },
  { code: '25ES1CS101', shortTitle: 'PPS', title: 'Programming for Problem Solving', category: 'Theory', credits: 3 },
  { code: '25ES3ME101', shortTitle: 'ED', title: 'Engineering Drawing', category: 'Drawing', credits: 3 },
  { code: '25BS2CH101', shortTitle: 'EC LAB', title: 'Engineering Chemistry Lab', category: 'Lab', credits: 1 },
  { code: '25ES2CS101', shortTitle: 'PPS LAB', title: 'PPS Laboratory', category: 'Lab', credits: 1 },
  { code: '25ES2IT101', shortTitle: 'ITW', title: 'IT Workshop', category: 'Lab', credits: 1 },
  { code: '25ES2EE101', shortTitle: 'BEE LAB', title: 'BEE Laboratory', category: 'Lab', credits: 1 },
];

const DUMMY_NOTICES = [
  {
    id: 'n-seed-1',
    title: 'CIE-1 Mid-Term Examination: Matrices & Calculus',
    description: 'Continuous Internal Evaluation (CIE-1) covering Unit I (Matrices, Rank, Eigenvalues) and Unit II (Differential Calculus). Calculators permitted. 50 Marks.',
    category: 'Exam',
    courseCode: '25BS1MT101',
    courseTitle: 'Matrices and Calculus',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    resourceLink: 'https://drive.google.com/drive/folders/cse-pyq-25BS1MT101',
    resourceLabel: 'Calculus PYQs & Model Papers',
    isUrgent: true,
  },
  {
    id: 'n-seed-2',
    title: 'PPS Lab Assignment #4 Submission: Dynamic Memory Allocation',
    description: 'Submit verified code and output printouts for experiments 7 & 8 (malloc, calloc, realloc, linked list basics). Late submissions forfeit 20% lab marks.',
    category: 'Assignment',
    courseCode: '25ES2CS101',
    courseTitle: 'Programming for Problem Solving Laboratory',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    resourceLink: 'https://github.com/cse-cohort-2026/pps-lab-solutions',
    resourceLabel: 'GitHub Assignment Repo',
    isUrgent: false,
  },
  {
    id: 'n-seed-3',
    title: 'BEE Single Phase Transformer Observation Verification',
    description: 'All Section A and B students must obtain faculty signature on observation notebooks prior to the open circuit test demonstration this Friday.',
    category: 'Material',
    courseCode: '25ES2EE101',
    courseTitle: 'Basic Electrical Engineering Laboratory',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    resourceLink: 'https://drive.google.com/file/d/cse-25ES2EE101-circuit-guide/preview',
    resourceLabel: 'BEE Circuit Schematics Guide',
    isUrgent: false,
  },
];

export default function App() {
  const [courses] = useState(DUMMY_COURSES);
  const [notices] = useState(DUMMY_NOTICES);
  const [selectedCourseCode, setSelectedCourseCode] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [completedMap, setCompletedMap] = useState(() => {
    try {
      const stored = localStorage.getItem('cse_sem1_ghost_completed');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [starredMap, setStarredMap] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleToggleComplete = (id) => {
    setCompletedMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('cse_sem1_ghost_completed', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleToggleStar = (id) => {
    setStarredMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredNotices = notices.filter((notice) => {
    const id = notice.id || notice._id;
    if (hideCompleted && completedMap[id]) return false;
    if (onlyStarred && !starredMap[id]) return false;
    if (selectedCategory !== 'All' && notice.category !== selectedCategory) return false;
    if (selectedCourseCode !== 'All' && notice.courseCode !== selectedCourseCode) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        notice.title.toLowerCase().includes(q) ||
        notice.description.toLowerCase().includes(q) ||
        notice.courseCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f2f2f4] text-zinc-950 flex flex-col lg:flex-row antialiased selection:bg-[#d2f34c] selection:text-zinc-950">
      {/* 1. The Left Sidebar (Dark sleek theme bg-[#1e1e1e], rounded-[2rem]) */}
      <Sidebar
        courses={courses}
        selectedCourseCode={selectedCourseCode}
        onSelectCourse={(code) => {
          setSelectedCourseCode(code);
          setMobileMenuOpen(false);
        }}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content Area (Soft off-white / light gray bg-[#f2f2f4]) */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Navbar */}
        <div className="lg:hidden bg-[#1e1e1e] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md bg-[#d2f34c] text-zinc-950 flex items-center justify-center font-black text-xs">
                ⚡
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">flux</span>
              <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded-full font-bold text-zinc-400">
                CSE B
              </span>
            </div>
          </div>
        </div>

        {/* Main Notice Feed */}
        <main className="flex-1 p-3 sm:p-5 lg:p-7 max-w-7xl w-full mx-auto">
          <NoticeFeed
            notices={filteredNotices}
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
          />
        </main>
      </div>
    </div>
  );
}
