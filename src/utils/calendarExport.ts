/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Notice } from '../types';

/**
 * Format Date to iCalendar UTC timestamp: YYYYMMDDTHHmmssZ
 */
function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Generates an .ics iCalendar file string for a list of notices and triggers browser download.
 */
export function exportNoticesToIcs(notices: Notice[], cohortName = 'CSE Sem 1'): void {
  const activeDeadlines = notices.filter((n) => n.deadline);

  if (activeDeadlines.length === 0) {
    alert('No deadlines with target dates found to export.');
    return;
  }

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CSE Cohort Noticeboard//Deadlines 1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${cohortName} Deadlines`,
  ];

  activeDeadlines.forEach((n) => {
    const start = new Date(n.deadline!);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour event
    const now = new Date();

    const isExam = n.category === 'Exam';
    const summary = isExam ? `[EXAM] [${n.courseCode}] ${n.title}` : `[${n.courseCode}] ${n.title}`;
    const description = isExam
      ? `EXAM SCHEDULE\\nDate & Time: ${start.toLocaleString()}\\nCourse: ${n.courseCode} ${n.courseTitle || ''}\\n${n.description}\\nReference / PYQ: ${n.resourceLink || 'None'}`
      : `SUBMISSION DEADLINE\\nCutoff: ${start.toLocaleString()}\\nCourse: ${n.courseCode}\\n${n.description}\\nResource: ${n.resourceLink || 'None'}`;

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:cse-${n.id || (n as any)._id}@noticeboard.cse`);
    icsContent.push(`DTSTAMP:${formatIcsDate(now)}`);
    icsContent.push(`DTSTART:${formatIcsDate(start)}`);
    icsContent.push(`DTEND:${formatIcsDate(end)}`);
    icsContent.push(`SUMMARY:${summary}`);
    icsContent.push(`DESCRIPTION:${description}`);
    icsContent.push('STATUS:CONFIRMED');
    // Pre-deadline / Pre-exam alarm reminder (2 hours prior)
    icsContent.push('BEGIN:VALARM');
    icsContent.push('TRIGGER:-PT2H');
    icsContent.push('ACTION:DISPLAY');
    icsContent.push(`DESCRIPTION:${isExam ? 'Upcoming examination' : 'Upcoming deadline'} for ${n.courseCode}`);
    icsContent.push('END:VALARM');
    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `cse_sem1_deadlines_${new Date().toISOString().slice(0, 10)}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Creates a direct Google Calendar web event URL for a single notice
 */
export function getGoogleCalendarUrl(notice: Notice): string | null {
  if (!notice.deadline) return null;

  const start = new Date(notice.deadline);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const startFormatted = start.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const endFormatted = end.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const isExam = notice.category === 'Exam';
  const title = encodeURIComponent(
    isExam ? `[EXAM] [${notice.courseCode}] ${notice.title}` : `[${notice.courseCode}] ${notice.title}`
  );
  const details = encodeURIComponent(
    isExam
      ? `EXAMINATION SCHEDULE:\nExam Time: ${start.toLocaleString()}\nCourse: [${notice.courseCode}] ${notice.courseTitle || ''}\n\n${notice.description}\n\nRevision Materials / PYQs: ${notice.resourceLink || 'None'}`
      : `ASSIGNMENT DEADLINE:\nSubmission Cutoff: ${start.toLocaleString()}\nCourse: [${notice.courseCode}]\n\n${notice.description}\n\nAttached Resource: ${notice.resourceLink || 'None'}`
  );
  const location = encodeURIComponent(`${notice.courseCode} Examination Hall / Lecture Room`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startFormatted}/${endFormatted}&details=${details}&location=${location}`;
}
