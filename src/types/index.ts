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
  lectureSlidesUrl?: string;
  labManualUrl?: string;
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
