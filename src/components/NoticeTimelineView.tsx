/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock, AlertTriangle, Calendar, BookOpen, CheckCircle2 } from 'lucide-react';
import { Notice } from '../types';
import NoticeCard from './NoticeCard';

interface NoticeTimelineViewProps {
  notices: Notice[];
  completedMap: Record<string, boolean>;
  onToggleComplete: (id: string) => void;
  onFilterCourse?: (courseCode: string) => void;
  onOpenResourcePreview?: (title: string, url: string, courseCode: string) => void;
}

export const NoticeTimelineView: React.FC<NoticeTimelineViewProps> = ({
  notices,
  completedMap,
  onToggleComplete,
  onFilterCourse,
  onOpenResourcePreview,
}) => {
  const now = Date.now();
  const day24 = 24 * 60 * 60 * 1000;
  const day7 = 7 * 24 * 60 * 60 * 1000;

  // Group notices into timeline milestones
  const immediateThreats: Notice[] = [];
  const thisWeek: Notice[] = [];
  const upcomingBeyond: Notice[] = [];
  const materials: Notice[] = [];
  const expired: Notice[] = [];

  notices.forEach((n) => {
    if (!n.deadline) {
      materials.push(n);
      return;
    }

    const t = new Date(n.deadline).getTime();
    const diff = t - now;

    if (diff < 0) {
      expired.push(n);
    } else if (diff <= day24) {
      immediateThreats.push(n);
    } else if (diff <= day7) {
      thisWeek.push(n);
    } else {
      upcomingBeyond.push(n);
    }
  });

  const renderSection = (
    title: string,
    subtitle: string,
    items: Notice[],
    badgeColor: string,
    icon: React.ReactNode
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
          <span className={`p-1.5 rounded-lg ${badgeColor} text-white`}>
            {icon}
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            <span className="text-[11px] text-slate-500">
              {subtitle} · {items.length} {items.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((notice) => {
            const id = notice.id || (notice as any)._id;
            return (
              <NoticeCard
                key={id}
                notice={notice}
                isCompleted={Boolean(completedMap[id])}
                onToggleComplete={onToggleComplete}
                onFilterCourse={onFilterCourse}
                onOpenResourcePreview={onOpenResourcePreview}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 text-left py-2">
      {renderSection(
        'Immediate Threat Zone (< 24 Hours)',
        'Requires prompt submission or revision today',
        immediateThreats,
        'bg-rose-600',
        <AlertTriangle className="w-4 h-4" />
      )}

      {renderSection(
        'This Week’s Milestones (Next 2-7 Days)',
        'Midterm exams, drawing sheets, and numerical assignments',
        thisWeek,
        'bg-amber-600',
        <Clock className="w-4 h-4" />
      )}

      {renderSection(
        'Future Deadlines (> 7 Days)',
        'Upcoming viva assessments and lab reports',
        upcomingBeyond,
        'bg-indigo-600',
        <Calendar className="w-4 h-4" />
      )}

      {renderSection(
        'Study Handouts & Reference Materials',
        'Lecture slide archives, formula banks, and PYQ solutions',
        materials,
        'bg-emerald-600',
        <BookOpen className="w-4 h-4" />
      )}

      {renderSection(
        'Past Due / Archived Notices',
        'Historical semester deliverables',
        expired,
        'bg-slate-600',
        <CheckCircle2 className="w-4 h-4" />
      )}
    </div>
  );
};

export default NoticeTimelineView;
