# Fully Functional Academic Hub & Persistence Architecture

Transform the VNR VJIET Section B portal into a fully functional, resilient academic hub featuring cloud-backed persistent data storage for all notices and schedules, alongside an assignment deadline tracker with student personal checklist controls.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed through user clarification and establish the implementation scope:

- **Confirmed Decision 1 (Core Focus)**: Implement end-to-end data persistence across server restarts for notices, schedule changes, course links, and new student utilities.
- **Confirmed Decision 2 (Storage Strategy)**: Support Cloud database persistence (MongoDB / PostgreSQL) coupled with an atomic server-side JSON file persistence layer to guarantee zero data loss under any runtime condition.
- **Confirmed Decision 3 (Student Feature)**: Integrate an Assignment Deadline Tracker with course filtering, urgency tiers, submission links, and local personal task completion checklists.

---

## 1. Overview & Core Concept

- **What It Does**: Provides Section B students and faculty coordinators with a single source of truth for dynamic timetable management, official urgent notices, syllabus/PYQ links, and academic deadline tracking.
- **Target Audience / Persona**: First-year CSE Section B students navigating daily lecture timings, assignment due dates, and lab requirements; Class Representatives and Faculty updating schedules and posting official announcements.
- **Key Value**: Eliminates lost announcements and unsaved timetable changes through robust persistent storage, while helping students maintain 100% assignment submission rates via a dedicated interactive checklist.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Student Daily Workflow**:
   - Student visits the public hub (`/`), views today's schedule and the latest announcements.
   - Student switches to the **Assignments** tab, sees upcoming assignments color-coded by urgency (Due Soon, Upcoming, Completed).
   - Student checks off their completed assignments; completion states persist immediately in their browser without requiring a login.
   - Student exports deadlines directly to Google Calendar or downloads an `.ics` calendar file.

2. **Admin / Class Representative Workflow**:
   - Coordinator logs into the protected admin portal (`/admin-login`).
   - Posts a new notice or assignment (title, course code, due date, submission URL, instructions).
   - Changes are saved immediately to the server's persistent store and reflected live on the public feed.
   - Updates the timetable (e.g., room change or rescheduled lab) and changes persist permanently.

### Visual Identity & Theme

- **Aesthetic Direction**: High-density academic command center with sleek dark/light mode continuity, clean typographic hierarchy, and zero generic AI slop.
- **Color Palette & Mood**:
  - Dominant Neutral: `#09090b` (zinc-950 dark) / `#f8fafc` (slate-50 light).
  - Structural Surfaces: `#18181b` (zinc-900) with subtle hairline borders (`border-zinc-800` / `border-slate-200`).
  - Brand Accent: `#c4f510` (high-contrast electric lime) for section branding, active status pills, and primary CTAs.
  - Urgency Tiers: Crimson (`#ef4444`) for high-priority/overdue, Amber (`#f59e0b`) for due within 48h, Emerald (`#10b981`) for completed.
- **Typography & Hierarchy**:
  - Display / Headings: `Plus Jakarta Sans` with bold weights and tight tracking.
  - Body & UI: Clean sans with balanced line-heights and text-wrap balance.
  - Timestamps & Metrics: Monospace tabular numerals (`font-mono tabular-nums`) for zero-jitter alignment.
- **Anti-Slop Discipline**:
  - No decorative pulsing dots or code comment headers (`// HEADER`).
  - Metadata separated cleanly with typographic middle dots (`·`) instead of nested pill badge sandwiches.
  - Single-line controls with truncation support.

---

## 3. Key Product Decisions & Trade-Offs

- **Dual-Layer Persistence Strategy**:
  - *Chosen Approach*: Implement a primary Cloud DB connection (MongoDB/PostgreSQL) with an automatic, atomic file-backed JSON store (`data/notices.json`, `data/timetable.json`, `data/assignments.json`).
  - *Why*: Guarantees that even if external cloud credentials or network connections fluctuate, all admin edits, new announcements, and timetables are written to disk and never lost.
  - *Alternatives Considered*: Pure in-memory storage (fails on restart) vs. purely client-side storage (cannot be shared across classmates).

- **Assignment Checklists Hybrid State**:
  - *Chosen Approach*: Official assignment entries are managed centrally by the admin/CR and stored server-side. Individual student checkbox completion states (`isCompleted`, `completedAt`) are stored client-side in `localStorage`.
  - *Why*: Students do not need individual passwords or account sign-ups to mark their own homework done, preserving frictionless public access while keeping official deadlines centrally synchronized.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Vite React Client (SPA)                         │
├───────────────────────────────────┬────────────────────────────────────┤
│           Public Views            │            Admin Portal            │
│  - NoticeFeed & UrgentThreat      │  - Notice Publisher & Manager      │
│  - Timetable Schedule View        │  - Timetable Slot Editor           │
│  - Assignment Checklist Hub       │  - Assignment Broadcaster          │
│  - Course Curriculum Drawer       │  - Security Audit & Recovery Log   │
└─────────────────┬─────────────────┴──────────────────┬─────────────────┘
                  │ HTTP /api/notices                  │ Bearer JWT Auth
                  │ HTTP /api/timetable                │ HTTP /api/admin/*
                  │ HTTP /api/assignments              │
                  ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Express API Server (server.ts)                    │
├────────────────────────────────────────────────────────────────────────┤
│  - REST Controllers: Notices, Timetable, Assignments, Courses, Auth   │
│  - Security Engine: Rate Limiting, Brute Force Lockout, Token Revoke   │
│  - Storage Abstraction Layer (StorageService)                          │
└─────────────────┬────────────────────────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
┌──────────────────────────────────┐ ┌──────────────────────────────────┐
│      Cloud DB Adapter            │ │     Persistent File Store        │
│  (MongoDB / PostgreSQL / SQL)    │ │  - data/notices.json             │
│  Used when connection string is  │ │  - data/timetable.json           │
│  configured in environment       │ │  - data/assignments.json         │
└──────────────────────────────────┘ └──────────────────────────────────┘
```

### Data Models

1. **Assignment Entity**:
   - `id`: Unique identifier (string)
   - `courseCode`: Course identifier (e.g. `25ES1CS101`, `25BS1MT101`)
   - `title`: Short title of the lab work, problem sheet, or project
   - `description`: Instructions, problem numbers, or submission criteria
   - `dueDate`: ISO date string
   - `submissionUrl`: Link to Google Classroom / LMS / Portal
   - `priority`: `'urgent' | 'high' | 'normal'`
   - `createdAt`: ISO timestamp

2. **Notice Entity**:
   - Full support for title, content, tag, urgency (`threat | high | medium | low`), pinned state, attachments, and scheduled expiry.

3. **Timetable Entity**:
   - Cohort details, room numbers, day-by-day periods, and course references.

### Interactive Component & State Mapping

- **Assignments Tracker**: Filter by course or status (`All`, `Pending`, `Done`), search by keyword, quick-add to calendar, toggle completion with immediate local save.
- **Admin Assignment Manager**: Form validation, date-time picker, link validation, instant broadcast to the public feed.
- **Storage Sync**: Atomic file writes (`fs.writeFileSync` to temporary files then renamed) to ensure data integrity during simultaneous writes.
