/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Course {
  code: string;
  title: string;
  shortTitle: string;
  category: 'Theory' | 'Lab' | 'Drawing' | 'Practical/Drawing';
  credits: number;
  syllabusUrl?: string;
  pyqUrl?: string;
  description?: string;
  instructor?: string;
}

export interface Notice {
  id: string;
  _id?: string;
  title: string;
  description: string;
  category: 'Assignment' | 'Exam' | 'Material';
  courseCode: string;
  courseTitle?: string;
  deadline?: string | null;
  resourceLink?: string;
  resourceLabel?: string;
  isUrgent?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type CategoryFilter = 'All' | 'Assignment' | 'Exam' | 'Material';

export type UITheme = 'academic' | 'terminal' | 'notion' | 'campus' | 'oled';
export type LayoutView = 'cards' | 'dense' | 'timeline';

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  event: string;
  ip: string;
  userAgent?: string;
  details: string;
  status: 'success' | 'warning' | 'danger' | 'info';
}

export type TimetableSlotType = 'Theory' | 'Lab' | 'Tutorial' | 'Drawing' | 'Break';

export interface TimetableSlot {
  id: string;
  time: string; // e.g. "09:00 - 10:00"
  code: string; // e.g. "25BS1MT101" or "BREAK" or "LUNCH"
  subject: string;
  room: string;
  instructor?: string;
  type: TimetableSlotType;
}

export type TimetableSchedule = Record<string, TimetableSlot[]>;

export interface TimetableConfig {
  cohortName: string;
  section: string; // e.g. "Section B (BASH-B)"
  academicYear: string;
  lastUpdated?: string;
  schedule: TimetableSchedule;
}

export interface Assignment {
  id: string;
  _id?: string;
  courseCode: string;
  courseTitle?: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string
  submissionUrl?: string;
  priority: 'urgent' | 'high' | 'normal';
  maxPoints?: number;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface StudentChecklistEntry {
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface StorageStatus {
  fileStorage: {
    active: boolean;
    storagePath: string;
    noticesCount: number;
    timetableConfigured: boolean;
    assignmentsCount: number;
    lastSaved: string;
  };
  cloudDatabase: {
    type: 'mongodb' | 'none';
    connected: boolean;
  };
}

