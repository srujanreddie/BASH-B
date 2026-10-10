/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TimetableConfig, TimetableSlot } from '../types';

export const OFFICIAL_TIMETABLE_VNR_SECTION_B: TimetableConfig = {
  cohortName: 'VNR VJIET — Dept of Computer Science & Engineering',
  section: 'Section B (Class Room E-139)',
  academicYear: '2026-27 (w.e.f: 05/08/2026)',
  lastUpdated: new Date().toISOString(),
  schedule: {
    Monday: [
      {
        id: 'mon-1-2',
        time: '09:00 - 11:00',
        code: '25ES3ME101',
        subject: 'Engineering Drawing (ED)',
        room: 'E-030/031',
        instructor: 'Mr. M. Krishna / Dr. GVL Prasad / Mr. Mohamad Aziz Athani',
        type: 'Drawing',
      },
      {
        id: 'mon-3',
        time: '11:00 - 12:00',
        code: 'STUDY',
        subject: 'Self Study / Tutorial Preparation',
        room: 'E-139',
        instructor: 'Ms. M. Mohana Deepthi (Coordinator)',
        type: 'Tutorial',
      },
      {
        id: 'mon-lnc',
        time: '12:00 - 12:40',
        code: 'LUNCH',
        subject: 'Lunch Break',
        room: 'Campus Food Court',
        type: 'Break',
      },
      {
        id: 'mon-4',
        time: '12:40 - 01:40',
        code: '25ES1CS101',
        subject: 'Programming for Problem Solving (PPS)',
        room: 'E-139',
        instructor: 'Dr. V. Baby',
        type: 'Theory',
      },
      {
        id: 'mon-5',
        time: '01:40 - 02:40',
        code: 'ECA',
        subject: 'Extra Curricular Activities (Sports / ECA)',
        room: 'Sports Complex / Activity Hall',
        type: 'Tutorial',
      },
      {
        id: 'mon-6',
        time: '02:40 - 03:40',
        code: 'CCA',
        subject: 'Co-Curricular Activities (CCA Club Sessions)',
        room: 'E-139',
        type: 'Tutorial',
      },
    ],
    Tuesday: [
      {
        id: 'tue-1-2',
        time: '09:00 - 11:00',
        code: '25BS2CH101 / 25ES2EE101',
        subject: 'EC Lab / BEE Lab (Batch 1: EC Lab | Batch 2: BEE Lab)',
        room: 'B-308 / P-014',
        instructor: 'Dr. S. Rambabu / Dr. O. Sobhana / Dr. E. Shiva Prasad',
        type: 'Lab',
      },
      {
        id: 'tue-3',
        time: '11:00 - 12:00',
        code: '25BS1CH101',
        subject: 'Chemistry for Engineers (CFE)',
        room: 'E-139',
        instructor: 'Dr. S. Rambabu',
        type: 'Theory',
      },
      {
        id: 'tue-lnc',
        time: '12:00 - 12:40',
        code: 'LUNCH',
        subject: 'Lunch Break',
        room: 'Campus Food Court',
        type: 'Break',
      },
      {
        id: 'tue-4',
        time: '12:40 - 01:40',
        code: '25ES1CS101',
        subject: 'Programming for Problem Solving (PPS)',
        room: 'E-139',
        instructor: 'Dr. V. Baby',
        type: 'Theory',
      },
      {
        id: 'tue-5',
        time: '01:40 - 02:40',
        code: 'MTP',
        subject: 'Mentoring Training & Placements (MTP)',
        room: 'E-139',
        instructor: 'CSE Faculty Mentors',
        type: 'Tutorial',
      },
      {
        id: 'tue-6',
        time: '02:40 - 03:40',
        code: 'SPORTS',
        subject: 'Sports & Physical Conditioning',
        room: 'College Grounds',
        type: 'Tutorial',
      },
    ],
    Wednesday: [
      {
        id: 'wed-1-2',
        time: '09:00 - 11:00',
        code: '25ES2CS101 / 25BS2CH101',
        subject: 'PPS Lab / EC Lab (Batch 1: PPS Lab | Batch 2: EC Lab)',
        room: 'E-103 / B-308',
        instructor: 'Dr. V. Baby / Ms. M. Mohana Deepthi / Dr. S. Rambabu',
        type: 'Lab',
      },
      {
        id: 'wed-3',
        time: '11:00 - 12:00',
        code: '25BS1MT101',
        subject: 'Matrices and Calculus (MAC)',
        room: 'E-139',
        instructor: 'Dr. B. Naga Malleswari',
        type: 'Theory',
      },
      {
        id: 'wed-lnc',
        time: '12:00 - 12:40',
        code: 'LUNCH',
        subject: 'Lunch Break',
        room: 'Campus Food Court',
        type: 'Break',
      },
      {
        id: 'wed-4',
        time: '12:40 - 01:40',
        code: 'STUDY',
        subject: 'Self Study / Problem Walkthrough',
        room: 'E-139',
        type: 'Tutorial',
      },
      {
        id: 'wed-5',
        time: '01:40 - 02:40',
        code: '25ES3ME101',
        subject: 'Engineering Drawing (ED)',
        room: 'E-030/031',
        instructor: 'Mr. M. Krishna / Dr. GVL Prasad',
        type: 'Drawing',
      },
      {
        id: 'wed-6',
        time: '02:40 - 03:40',
        code: 'STUDY',
        subject: 'Revision & Peer Learning Hours',
        room: 'E-139',
        type: 'Tutorial',
      },
    ],
    Thursday: [
      {
        id: 'thu-1',
        time: '09:00 - 10:00',
        code: '25BS1MT101',
        subject: 'Matrices and Calculus (MAC)',
        room: 'E-139',
        instructor: 'Dr. B. Naga Malleswari',
        type: 'Theory',
      },
      {
        id: 'thu-2',
        time: '10:00 - 11:00',
        code: '25ES1CS101',
        subject: 'Programming for Problem Solving (PPS)',
        room: 'E-139',
        instructor: 'Dr. V. Baby',
        type: 'Theory',
      },
      {
        id: 'thu-3',
        time: '11:00 - 12:00',
        code: '25ES1EE101',
        subject: 'Basic Electrical Engineering (BEE)',
        room: 'E-139',
        instructor: 'Dr. K. Veeresham',
        type: 'Theory',
      },
      {
        id: 'thu-lnc',
        time: '12:00 - 12:40',
        code: 'LUNCH',
        subject: 'Lunch Break',
        room: 'Campus Food Court',
        type: 'Break',
      },
      {
        id: 'thu-4',
        time: '12:40 - 01:40',
        code: '25BS1CH101',
        subject: 'Chemistry for Engineers (CFE)',
        room: 'E-139',
        instructor: 'Dr. S. Rambabu',
        type: 'Theory',
      },
      {
        id: 'thu-5-6',
        time: '01:40 - 03:40',
        code: 'LIBRARY',
        subject: 'Central Library Reference & Research Hours',
        room: 'Central Library',
        type: 'Tutorial',
      },
    ],
    Friday: [
      {
        id: 'fri-1',
        time: '09:00 - 10:00',
        code: '25ES1CS101',
        subject: 'Programming for Problem Solving (PPS)',
        room: 'E-139',
        instructor: 'Dr. V. Baby',
        type: 'Theory',
      },
      {
        id: 'fri-2',
        time: '10:00 - 11:00',
        code: '25BS1CH101',
        subject: 'Chemistry for Engineers (CFE)',
        room: 'E-139',
        instructor: 'Dr. S. Rambabu',
        type: 'Theory',
      },
      {
        id: 'fri-3',
        time: '11:00 - 12:00',
        code: '25BS1MT101',
        subject: 'Matrices and Calculus (MAC)',
        room: 'E-139',
        instructor: 'Dr. B. Naga Malleswari',
        type: 'Theory',
      },
      {
        id: 'fri-lnc',
        time: '12:00 - 12:40',
        code: 'LUNCH',
        subject: 'Lunch Break',
        room: 'Campus Food Court',
        type: 'Break',
      },
      {
        id: 'fri-4',
        time: '12:40 - 01:40',
        code: '25ES1EE101',
        subject: 'Basic Electrical Engineering (BEE)',
        room: 'E-139',
        instructor: 'Dr. K. Veeresham',
        type: 'Theory',
      },
      {
        id: 'fri-5-6',
        time: '01:40 - 03:40',
        code: '25ES2EE101 / 25ES2CS101',
        subject: 'BEE Lab / PPS Lab (Batch 1: BEE Lab | Batch 2: PPS Lab)',
        room: 'P-014 / E-103',
        instructor: 'Dr. O. Sobhana / Dr. E. Shiva Prasad / Dr. V. Baby',
        type: 'Lab',
      },
    ],
    Saturday: [
      {
        id: 'sat-1',
        time: '09:00 - 10:00',
        code: '25BS1CH101',
        subject: 'Chemistry for Engineers (CFE)',
        room: 'E-139',
        instructor: 'Dr. S. Rambabu',
        type: 'Theory',
      },
      {
        id: 'sat-2',
        time: '10:00 - 11:00',
        code: '25BS1MT101',
        subject: 'Matrices and Calculus (MAC)',
        room: 'E-139',
        instructor: 'Dr. B. Naga Malleswari',
        type: 'Theory',
      },
      {
        id: 'sat-3',
        time: '11:00 - 12:00',
        code: '25ES1EE101',
        subject: 'Basic Electrical Engineering (BEE)',
        room: 'E-139',
        instructor: 'Dr. K. Veeresham',
        type: 'Theory',
      },
      {
        id: 'sat-lnc',
        time: '12:00 - 12:40',
        code: 'LUNCH',
        subject: 'Lunch Break',
        room: 'Campus Food Court',
        type: 'Break',
      },
      {
        id: 'sat-4',
        time: '12:40 - 01:40',
        code: 'STUDY',
        subject: 'Self Study / Seminar Preparation',
        room: 'E-139',
        type: 'Tutorial',
      },
      {
        id: 'sat-5',
        time: '01:40 - 02:40',
        code: '25ES2IT101',
        subject: 'IT Workshop (ITW)',
        room: 'E-115/116',
        instructor: 'Mr. K. Prathap Joshi / Ms. M. Srijitha / Ms. Sana Inayath',
        type: 'Lab',
      },
      {
        id: 'sat-6',
        time: '02:40 - 03:40',
        code: 'CVA-L1',
        subject: 'Career Vision Approach - Level 1 (CVA-L1)',
        room: 'E-139',
        instructor: 'Mrs. P. Prasanna',
        type: 'Tutorial',
      },
    ],
  },
};

export const DEFAULT_TIMETABLE_SECTION_B = OFFICIAL_TIMETABLE_VNR_SECTION_B;
export const DEFAULT_TIMETABLE_SECTION_A = OFFICIAL_TIMETABLE_VNR_SECTION_B;

export const TIMETABLE_STORAGE_KEY = 'cse_sem1_timetable_config';

export function loadLocalTimetable(): TimetableConfig {
  try {
    const raw = localStorage.getItem(TIMETABLE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.schedule && typeof parsed.schedule === 'object') {
        // If it was the older sample schedule, ensure we upgrade to official VNR VJIET timetable
        if (parsed.cohortName?.includes('VNR') || parsed.section?.includes('E-139')) {
          return parsed;
        }
      }
    }
  } catch {
    // fallback
  }
  return OFFICIAL_TIMETABLE_VNR_SECTION_B;
}

export function saveLocalTimetable(config: TimetableConfig): void {
  try {
    const updated = {
      ...config,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/**
 * Parses time strings like "09:00 - 10:00", "09:00 - 11:00", "12:40 - 01:40", "01:40 - 03:40"
 */
export function parseSlotTimeRange(timeStr: string): { startMinutes: number; endMinutes: number } | null {
  const parts = timeStr.split('-').map((s) => s.trim());
  if (parts.length !== 2) return null;

  function parseSingleTime(str: string): number {
    const match = str.match(/^(\d{1,2})[:.](\d{2})\s*(AM|PM)?$/i);
    if (!match) return -1;
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const meridiem = match[3] ? match[3].toUpperCase() : null;

    if (meridiem === 'PM' && hour < 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;

    // College timetable hours: 12 is noon, 1, 2, 3 are afternoon PM
    if (!meridiem) {
      if (hour >= 1 && hour <= 6) {
        hour += 12; // 1pm - 6pm
      }
    }
    return hour * 60 + minute;
  }

  const startMinutes = parseSingleTime(parts[0]);
  const endMinutes = parseSingleTime(parts[1]);

  if (startMinutes === -1 || endMinutes === -1) return null;
  return { startMinutes, endMinutes };
}

export function isSlotActive(slot: TimetableSlot, date: Date = new Date()): boolean {
  const range = parseSlotTimeRange(slot.time);
  if (!range) return false;
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  return currentMinutes >= range.startMinutes && currentMinutes < range.endMinutes;
}

export function getActiveSlot(slots: TimetableSlot[], date: Date = new Date()): TimetableSlot | null {
  for (const s of slots) {
    if (isSlotActive(s, date)) return s;
  }
  return null;
}

export function getNextSlot(slots: TimetableSlot[], date: Date = new Date()): TimetableSlot | null {
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  for (const s of slots) {
    const range = parseSlotTimeRange(s.time);
    if (range && range.startMinutes > currentMinutes) {
      return s;
    }
  }
  return null;
}
