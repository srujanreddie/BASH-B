import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Calendar, 
  Check, 
  Clock, 
  Star, 
  Share2, 
  FileText, 
  ChevronDown, 
  Zap,
  Printer
} from 'lucide-react';
import UrgentThreatCard from './UrgentThreatCard';

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

export const NoticeFeed = ({
  notices = DUMMY_NOTICES,
  selectedCategory = 'All',
  onSelectCategory = () => {},
  selectedCourseCode = 'All',
  onSelectCourseCode = () => {},
  searchQuery = '',
  onSearchChange = () => {},
  hideCompleted = false,
  onToggleHideCompleted = () => {},
  onlyStarred = false,
  onToggleOnlyStarred = () => {},
  completedMap = {},
  onToggleComplete = () => {},
  starredMap = {},
  onToggleStar = () => {},
  onOpenResourcePreview = () => {},
  onOpenPrintSheet = () => {},
  onOpenTimetable = () => {},
}) => {
  const [copiedId, setCopiedId] = useState(null);

  const totalCount = notices.length;
  const assignmentsCount = notices.filter((n) => n.category === 'Assignment').length;
  const examsCount = notices.filter((n) => n.category === 'Exam').length;
  const materialsCount = notices.filter((n) => n.category === 'Material').length;
  const completedCount = notices.filter((n) => completedMap[n.id || n._id]).length;

  const handleShare = async (e, notice) => {
    e.stopPropagation();
    const id = notice.id || notice._id;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`[${notice.courseCode}] ${notice.title}\n${notice.description}`);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch {
      // ignore
    }
  };

  const formatDeadline = (deadlineIso) => {
    if (!deadlineIso) return null;
    const date = new Date(deadlineIso);
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

    let urgencyText = '';
    let isUrgent = false;
    if (diffHours < 0) {
      urgencyText = 'Concluded';
    } else if (diffHours <= 24) {
      urgencyText = 'Due in < 24h';
      isUrgent = true;
    } else if (diffHours <= 72) {
      urgencyText = `Due in ${Math.round(diffHours / 24)}d`;
      isUrgent = true;
    } else {
      urgencyText = `Due ${dateStr}`;
    }

    return { dateStr, timeStr, urgencyText, isUrgent };
  };

  const todayDateStr = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* 1. Header (Matching reference top header) */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-[#d2f34c] flex items-center justify-center font-bold text-xs border border-zinc-300">
              B
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                <span>Section B · Room E-139</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <p className="text-[11px] text-zinc-500 font-medium">CSE Cohort 2026-27</p>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
            Semester Overview
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-medium mt-1">
            Take control of your coursework, laboratory tasks & exam deadlines!
          </p>
        </div>

        {/* Right header controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search deadlines, tags..."
              className="pl-9 pr-4 py-2 bg-white rounded-full text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 border border-zinc-200/80 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#d2f34c] w-44 sm:w-56 transition-all"
            />
          </div>

          <button 
            type="button"
            onClick={onOpenTimetable}
            className="w-9 h-9 rounded-full bg-white hover:bg-zinc-100 border border-zinc-200/80 shadow-2xs flex items-center justify-center text-zinc-700 relative transition-colors"
            title="Notifications & Timetable"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2.5 h-2.5 bg-[#d2f34c] rounded-full absolute top-1 right-1 border-2 border-white" />
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-semibold text-zinc-500">
              {todayDateStr}
            </span>
            <button
              type="button"
              onClick={onOpenTimetable}
              className="bg-white hover:bg-zinc-50 border border-zinc-200/80 rounded-full px-3.5 py-1.5 text-xs font-bold text-zinc-800 shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <span>Today</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Overview Metric Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" aria-label="Semester Metrics">
        {/* Card 1: Energy Used style card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-xs border border-zinc-200/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900">
                  <Zap className="w-3.5 h-3.5 fill-zinc-900" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
                  Workload Distribution
                </h3>
              </div>
              <span className="bg-[#d2f34c]/50 text-zinc-900 text-[11px] font-black px-2 py-0.5 rounded-full">
                Active Sem
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-extrabold text-zinc-950 tracking-tight font-mono">
                {totalCount}
              </span>
              <span className="text-xs text-zinc-500 font-medium">total tracked items</span>
            </div>

            {/* Overlapping Circles Graphic */}
            <div className="relative h-28 my-2 flex items-center justify-center">
              <div className="absolute left-6 top-1 w-20 h-20 rounded-full bg-[#aea8ff] text-zinc-950 flex flex-col items-center justify-center shadow-xs">
                <span className="text-base font-extrabold leading-tight font-mono">{assignmentsCount}</span>
                <span className="text-[10px] font-bold text-zinc-800">Assign</span>
              </div>
              <div className="absolute right-8 top-0 w-18 h-18 rounded-full bg-zinc-900 text-white flex flex-col items-center justify-center shadow-xs z-10">
                <span className="text-base font-extrabold leading-tight font-mono">{examsCount}</span>
                <span className="text-[10px] font-bold text-zinc-300">Exams</span>
              </div>
              <div className="absolute bottom-0 right-16 w-16 h-16 rounded-full bg-[#d2f34c] text-zinc-950 flex flex-col items-center justify-center shadow-xs z-20">
                <span className="text-sm font-black leading-tight font-mono">{materialsCount}</span>
                <span className="text-[9px] font-bold text-zinc-900">Notes</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-100 text-xs font-semibold">
            <div className="flex items-center justify-between text-zinc-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#aea8ff]" />
                Assignments
              </span>
              <span className="font-mono">{assignmentsCount} items</span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-[#aea8ff] h-1.5 rounded-full"
                style={{ width: `${totalCount > 0 ? (assignmentsCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-zinc-600 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#d2f34c]" />
                Reference Notes
              </span>
              <span className="font-mono">{materialsCount} items</span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-[#d2f34c] h-1.5 rounded-full"
                style={{ width: `${totalCount > 0 ? (materialsCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Next Immediate Threat Card */}
        <div className="lg:col-span-2">
          <UrgentThreatCard
            notices={notices}
            completedMap={completedMap}
            onSelectNotice={(id) => {
              const el = document.getElementById(`notice-${id}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
          />
        </div>
      </section>

      {/* 3. Quick-Filter Pills Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Assignment', 'Exam', 'Material'].map((cat) => {
            const isActive = selectedCategory === cat;
            const label = cat === 'All' ? 'All' : cat === 'Assignment' ? 'Assignments' : cat === 'Exam' ? 'Exams' : 'Materials';
            const count = cat === 'All' ? totalCount : cat === 'Assignment' ? assignmentsCount : cat === 'Exam' ? examsCount : materialsCount;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all duration-150 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#d2f34c] text-zinc-950 shadow-xs scale-102 ring-2 ring-[#d2f34c]/50'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200/80 shadow-2xs'
                }`}
              >
                <span>{label}</span>
                <span className={`text-[11px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleHideCompleted}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border ${
              hideCompleted
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border-zinc-200/80'
            }`}
          >
            <span>{hideCompleted ? 'Showing Active' : 'Hide Checked'}</span>
            {completedCount > 0 && <span className="ml-1 opacity-75 font-mono">({completedCount})</span>}
          </button>

          <button
            type="button"
            onClick={onToggleOnlyStarred}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border flex items-center gap-1 ${
              onlyStarred
                ? 'bg-amber-400 text-zinc-950 border-amber-400'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border-zinc-200/80'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyStarred ? 'fill-zinc-950' : 'text-zinc-400'}`} />
            <span>Starred</span>
          </button>

          {onOpenPrintSheet && (
            <button
              type="button"
              onClick={onOpenPrintSheet}
              className="rounded-full px-3.5 py-1.5 text-xs font-bold bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200/80 shadow-2xs flex items-center gap-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-500" />
              <span>Print</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Notice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {notices.map((notice) => {
          const id = notice.id || notice._id;
          const isDone = Boolean(completedMap[id]);
          const isStar = Boolean(starredMap[id]);
          const dl = formatDeadline(notice.deadline);
          const isExam = notice.category === 'Exam';

          return (
            <article
              key={id}
              id={`notice-${id}`}
              className={`bg-white rounded-[2rem] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 border flex flex-col justify-between relative ${
                isDone 
                  ? 'border-zinc-200/60 bg-white/70' 
                  : isExam 
                  ? 'border-zinc-200 hover:border-zinc-300' 
                  : 'border-zinc-200/80 hover:border-zinc-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[11px] font-black text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-full">
                      {notice.courseCode}
                    </span>

                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      isExam
                        ? 'bg-[#aea8ff]/25 text-[#483bc2]'
                        : notice.category === 'Assignment'
                        ? 'bg-[#d2f34c]/50 text-zinc-950'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}>
                      {notice.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleStar(id)}
                      className={`p-1.5 rounded-full transition-colors ${
                        isStar ? 'text-amber-500 bg-amber-50' : 'text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isStar ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleComplete(id)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border ${
                        isDone
                          ? 'bg-[#d2f34c] border-[#d2f34c] text-zinc-950 shadow-2xs'
                          : 'border-zinc-300 hover:border-zinc-400 text-transparent bg-white'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 stroke-[3] ${isDone ? 'text-zinc-950' : 'text-transparent'}`} />
                    </button>
                  </div>
                </div>

                <h3 className={`text-base sm:text-lg font-bold leading-snug tracking-tight mb-1.5 transition-colors ${
                  isDone ? 'line-through text-zinc-400' : 'text-zinc-950'
                }`}>
                  {notice.title}
                </h3>

                <p className={`text-xs sm:text-sm leading-relaxed mb-4 transition-colors ${
                  isDone ? 'line-through text-zinc-400 opacity-80' : 'text-zinc-500'
                }`}>
                  {notice.description}
                </p>
              </div>

              <div>
                {dl && (
                  <div className="flex items-center justify-between gap-2 py-2.5 px-3 rounded-xl bg-zinc-50 border border-zinc-100 mb-3 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-600 font-medium">
                      <Clock className={`w-3.5 h-3.5 ${dl.isUrgent ? 'text-[#d2f34c]' : 'text-zinc-400'}`} />
                      <span>{dl.dateStr} · {dl.timeStr}</span>
                    </div>
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase font-mono ${
                      dl.isUrgent ? 'bg-[#d2f34c] text-zinc-950' : 'bg-zinc-200/70 text-zinc-700'
                    }`}>
                      {dl.urgencyText}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100">
                  {notice.resourceLink ? (
                    <button
                      type="button"
                      onClick={() => onOpenResourcePreview(notice.resourceLabel || notice.title, notice.resourceLink, notice.courseCode)}
                      className="rounded-full px-3.5 py-1 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition-colors inline-flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-zinc-600" />
                      <span className="truncate max-w-[150px]">
                        {notice.resourceLabel || 'Open Resource'}
                      </span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-zinc-400 font-medium">
                      No external files
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleShare(e, notice)}
                    className="p-1 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default NoticeFeed;
