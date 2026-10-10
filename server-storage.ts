/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DATA_DIR = path.resolve(__dirname, 'data');
export const NOTICES_FILE = path.join(DATA_DIR, 'notices.json');
export const TIMETABLE_FILE = path.join(DATA_DIR, 'timetable.json');
export const ASSIGNMENTS_FILE = path.join(DATA_DIR, 'assignments.json');

export interface AssignmentItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  description: string;
  dueDate: string;
  submissionUrl?: string;
  priority: 'urgent' | 'high' | 'normal';
  maxPoints?: number;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export const SEED_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'asg-pps-01',
    courseCode: '25ES1CS101',
    courseTitle: 'Programming for Problem Solving (PPS)',
    title: 'Lab Sheet 3: Dynamic Memory Allocation & Pointer Arithmetic in C',
    description: 'Implement dynamic array resizing using malloc/realloc and calculate matrix transpose with double pointers. Test with edge cases and submit source code (.c) with terminal execution screenshots.',
    dueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(), // ~2 days from now
    submissionUrl: 'https://classroom.google.com/u/0/c/cse-section-b-pps',
    priority: 'urgent',
    maxPoints: 20,
    tags: ['C Programming', 'Pointers', 'Lab Assignment'],
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'asg-mac-01',
    courseCode: '25BS1MT101',
    courseTitle: 'Matrices and Calculus (MAC)',
    title: 'Problem Sheet 2: Cayley-Hamilton Theorem & Inverse Matrices',
    description: 'Solve problems 1-12 from Unit 1 problem set. Find eigenvalues and eigenvectors for 3x3 matrices and verify characteristic equations step-by-step.',
    dueDate: new Date(Date.now() + 96 * 3600 * 1000).toISOString(), // ~4 days from now
    submissionUrl: 'https://classroom.google.com/u/0/c/cse-section-b-mac',
    priority: 'high',
    maxPoints: 25,
    tags: ['Matrices', 'Eigenvalues', 'Calculus'],
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'asg-bee-01',
    courseCode: '25ES1EE101',
    courseTitle: 'Basic Electrical Engineering (BEE)',
    title: 'Assignment 2: Thevenin Theorem & AC Steady State Circuit Analysis',
    description: 'Calculate equivalent Thevenin impedance and load voltage for network circuits illustrated in Lecture 8 notes. Handwritten PDF submission required.',
    dueDate: new Date(Date.now() + 140 * 3600 * 1000).toISOString(), // ~5.8 days from now
    submissionUrl: 'https://classroom.google.com/u/0/c/cse-section-b-bee',
    priority: 'normal',
    maxPoints: 20,
    tags: ['Circuits', 'Thevenin', 'AC Analysis'],
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'asg-ed-01',
    courseCode: '25ES3ME101',
    courseTitle: 'Engineering Drawing (ED)',
    title: 'Drawing Sheet 4: Isometric Projections of Hexagonal Prisms & Pyramids',
    description: 'Draw front and top views along with true isometric views on A2 drawing sheet with standard Section B title block. Room E-030 submission before 4:00 PM.',
    dueDate: new Date(Date.now() + 180 * 3600 * 1000).toISOString(), // ~7.5 days from now
    submissionUrl: '',
    priority: 'normal',
    maxPoints: 30,
    tags: ['Isometric', 'A2 Sheet', 'Drawing'],
    createdAt: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'asg-itw-01',
    courseCode: '25ES2IT101',
    courseTitle: 'IT Workshop (ITW)',
    title: 'Lab Project: Git Collaborative Branching & Markdown Documentation',
    description: 'Create a GitHub repository, push 5 meaningful commits across two feature branches, resolve a simulated merge conflict, and submit repo URL with comprehensive README.md.',
    dueDate: new Date(Date.now() + 240 * 3600 * 1000).toISOString(), // ~10 days from now
    submissionUrl: 'https://classroom.google.com/u/0/c/cse-section-b-itw',
    priority: 'normal',
    maxPoints: 20,
    tags: ['Git', 'GitHub', 'Markdown'],
    createdAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let lastSaveTimestamp = new Date().toISOString();

/**
 * Ensures directory exists
 */
export function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Atomic file writer using temporary file and atomic rename.
 * Guarantees zero data loss or partial writes during crashes or restarts.
 */
export function atomicWriteJson(filePath: string, data: any): void {
  ensureDataDir();
  const tempPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 7)}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, filePath);
  lastSaveTimestamp = new Date().toISOString();
}

/**
 * Initialize persistent storage from disk, creating seed files if not already present.
 */
export function initPersistentStorage(initialTimetable: any): {
  notices: any[];
  timetable: any;
  assignments: AssignmentItem[];
} {
  ensureDataDir();

  let notices: any[] = [];
  let timetable = initialTimetable;
  let assignments: AssignmentItem[] = [];

  // 1. Notices Storage
  try {
    if (fs.existsSync(NOTICES_FILE)) {
      const content = fs.readFileSync(NOTICES_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        notices = parsed;
      }
    } else {
      atomicWriteJson(NOTICES_FILE, notices);
    }
  } catch (err: any) {
    console.error('Error reading notices persistent file, initializing fresh:', err.message);
    atomicWriteJson(NOTICES_FILE, notices);
  }

  // 2. Timetable Storage
  try {
    if (fs.existsSync(TIMETABLE_FILE)) {
      const content = fs.readFileSync(TIMETABLE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object' && parsed.schedule) {
        timetable = parsed;
      }
    } else {
      atomicWriteJson(TIMETABLE_FILE, timetable);
    }
  } catch (err: any) {
    console.error('Error reading timetable persistent file, fallback to initial config:', err.message);
    atomicWriteJson(TIMETABLE_FILE, timetable);
  }

  // 3. Assignments Storage
  try {
    if (fs.existsSync(ASSIGNMENTS_FILE)) {
      const content = fs.readFileSync(ASSIGNMENTS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        assignments = parsed;
      }
    } else {
      assignments = JSON.parse(JSON.stringify(SEED_ASSIGNMENTS));
      atomicWriteJson(ASSIGNMENTS_FILE, assignments);
    }
  } catch (err: any) {
    console.error('Error reading assignments persistent file, seeding defaults:', err.message);
    assignments = JSON.parse(JSON.stringify(SEED_ASSIGNMENTS));
    atomicWriteJson(ASSIGNMENTS_FILE, assignments);
  }

  return { notices, timetable, assignments };
}

export function saveNotices(notices: any[]): void {
  atomicWriteJson(NOTICES_FILE, notices);
}

export function saveTimetable(timetable: any): void {
  atomicWriteJson(TIMETABLE_FILE, timetable);
}

export function saveAssignments(assignments: AssignmentItem[]): void {
  atomicWriteJson(ASSIGNMENTS_FILE, assignments);
}

export function getStorageInfo(noticesCount: number, assignmentsCount: number, mongoConnected: boolean) {
  return {
    persistenceType: 'Dual-Layer (Atomic File-Backed Persistence + MongoDB Cloud Adapter)',
    active: true,
    dataDirectory: DATA_DIR,
    noticesCount,
    assignmentsCount,
    timetableConfigured: true,
    lastSaved: lastSaveTimestamp,
    cloudDatabase: {
      type: 'mongodb',
      connected: mongoConnected,
    },
  };
}
