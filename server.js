/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Backend Entry Point: Express + Mongoose + JWT Auth
 * Server for CSE Semester 1 Noticeboard & Resource Directory
 */

import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import crypto from 'crypto';
import Course from './models/Course.js';
import Notice from './models/Notice.js';
import verifyAdminToken from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
let currentAdminPassword = process.env.ADMIN_PASSWORD || 'Admin@CSE2026#Live!';
const JWT_SECRET = process.env.JWT_SECRET || 'cse_sem1_super_secret_jwt_key_2026';
const MONGO_URI = process.env.MONGO_URI || '';

app.use(express.json());

// -----------------------------------------------------------------------------
// Core Curriculum Data (Semester 1 Seed)
// -----------------------------------------------------------------------------
const SEMESTER_1_COURSES = [
  {
    code: '25BS1MT101',
    title: 'Matrices and Calculus',
    shortTitle: 'Calculus',
    category: 'Theory',
    credits: 4,
    syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-matrices-calculus-syllabus/preview',
    pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25BS1MT101',
    lectureSlidesUrl: 'https://drive.google.com/drive/folders/cse-slides-25BS1MT101',
    labManualUrl: 'https://drive.google.com/file/d/cse-25BS1MT101-formula-handbook/preview',
    description: 'Eigenvalues, Cayley-Hamilton theorem, multivariable Taylor expansion, Jacobians, and vector calculus.',
  },
  {
    code: '25BS1CH101',
    title: 'Chemistry for Engineers',
    shortTitle: 'Chemistry',
    category: 'Theory',
    credits: 3,
    syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-eng-chem-syllabus/preview',
    pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25BS1CH101',
    lectureSlidesUrl: 'https://drive.google.com/drive/folders/cse-slides-25BS1CH101',
    labManualUrl: 'https://drive.google.com/file/d/cse-chem-cheatsheet/preview',
    description: 'Thermodynamics, electrochemistry, polymer composites, battery chemistry, and engineering nanomaterials.',
  },
  {
    code: '25ES1EE101',
    title: 'Basic Electrical Engineering',
    shortTitle: 'BEE',
    category: 'Theory',
    credits: 3,
    syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-bee-syllabus/preview',
    pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25ES1EE101',
    lectureSlidesUrl: 'https://drive.google.com/drive/folders/cse-slides-25ES1EE101',
    labManualUrl: 'https://drive.google.com/file/d/cse-bee-circuit-theorems/preview',
    description: 'DC & AC circuit analysis, Kirchhoff laws, Thevenin theorem, single-phase transformers, and 3-phase induction motors.',
  },
  {
    code: '25ES1CS101',
    title: 'Programming for Problem Solving',
    shortTitle: 'PPS',
    category: 'Theory',
    credits: 3,
    syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-pps-syllabus/preview',
    pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25ES1CS101',
    lectureSlidesUrl: 'https://drive.google.com/drive/folders/cse-slides-25ES1CS101',
    labManualUrl: 'https://github.com/cse-cohort-2026/pps-c-lecture-code',
    description: 'Structured programming in C, pointers, memory allocation, recursion, structures, and file handling.',
  },
  {
    code: '25ES3ME101',
    title: 'Engineering Drawing',
    shortTitle: 'Engg Drawing',
    category: 'Drawing',
    credits: 3,
    syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-drawing-syllabus/preview',
    pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25ES3ME101',
    lectureSlidesUrl: 'https://drive.google.com/drive/folders/cse-slides-25ES3ME101',
    labManualUrl: 'https://drive.google.com/file/d/cse-autocad-drawing-sheets/preview',
    description: 'Orthographic projections, isometric projections, sections of solids, development of surfaces, and CAD drafting.',
  },
  {
    code: '25BS2CH101',
    title: 'Engineering Chemistry Laboratory',
    shortTitle: 'Chem Lab',
    category: 'Lab',
    credits: 1,
    syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-chemlab-syllabus/preview',
    pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25BS2CH101',
    lectureSlidesUrl: 'https://drive.google.com/drive/folders/cse-chemlab-viva-prep',
    labManualUrl: 'https://drive.google.com/file/d/cse-25BS2CH101-lab-manual/preview',
    description: 'Practical titrations, total hardness of water by EDTA, conductometric analysis, and Redwood viscometer experiments.',
  },
  {
    code: '25ES2CS101',
    title: 'Programming for Problem Solving Laboratory',
    shortTitle: 'PPS Lab',
    category: 'Lab',
    credits: 1,
    syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-ppslab-syllabus/preview',
    pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25ES2CS101',
    lectureSlidesUrl: 'https://github.com/cse-cohort-2026/pps-lab-solutions',
    labManualUrl: 'https://drive.google.com/file/d/cse-25ES2CS101-lab-manual-complete/preview',
    description: 'Hands-on programming in C: 12 syllabus experiments from control flow to pointers, file processing, and data structures.',
  },
  {
    code: '25ES2IT101',
    title: 'IT Workshop',
    shortTitle: 'IT Workshop',
    category: 'Lab',
    credits: 1,
    syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-it-workshop-syllabus/preview',
    pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25ES2IT101',
    lectureSlidesUrl: 'https://drive.google.com/drive/folders/cse-itworkshop-guides',
    labManualUrl: 'https://drive.google.com/file/d/cse-it-workshop-lab-manual/preview',
    description: 'PC assembly, Linux installation, dual-boot setups, Git version control workflows, and scientific documentation using LaTeX.',
  },
  {
    code: '25ES2EE101',
    title: 'Basic Electrical Engineering Laboratory',
    shortTitle: 'BEE Lab',
    category: 'Lab',
    credits: 1,
    syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-beelab-syllabus/preview',
    pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25ES2EE101',
    lectureSlidesUrl: 'https://drive.google.com/drive/folders/cse-beelab-viva',
    labManualUrl: 'https://drive.google.com/file/d/cse-25ES2EE101-lab-manual/preview',
    description: 'Hardware verification of Ohm and Kirchhoff laws, Superposition theorem, OC/SC tests on transformers, and power factor correction.',
  },
];

// Anti-brute force lockout and token revoking
const revokedTokens = new Set();
const loginAttempts = new Map();

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// In-Memory store for fast demo-free execution
let memoryCourses = JSON.parse(JSON.stringify(SEMESTER_1_COURSES));
let memoryNotices = []; // Clean live noticeboard: 0 demo notices

// MongoDB Connection
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch((err) => console.warn('MongoDB connection note:', err.message));
}

// -----------------------------------------------------------------------------
// Authentication Endpoints
// -----------------------------------------------------------------------------

app.get('/api/admin/security-info', (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const record = loginAttempts.get(clientIp);
  const now = Date.now();
  const isLocked = Boolean(record && record.lockedUntil > now);
  const remainingMinutes = isLocked ? Math.ceil((record.lockedUntil - now) / 60000) : 0;
  const attemptsRemaining = record ? Math.max(0, 5 - record.count) : 5;

  return res.json({
    success: true,
    isLocked,
    remainingMinutes,
    attemptsRemaining,
    maxAttempts: 5,
  });
});

app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const record = loginAttempts.get(clientIp);

  if (record && record.lockedUntil > now) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return res.status(429).json({
      success: false,
      isLocked: true,
      remainingMinutes,
      message: `Security Lockout: Access locked for ${remainingMinutes} more minute(s).`,
    });
  }

  if (!safeCompare(password || '', currentAdminPassword)) {
    await new Promise((r) => setTimeout(r, 600)); // anti-brute delay
    const currentCount = (record ? record.count : 0) + 1;
    const isLockedNow = currentCount >= 5;
    const lockedUntil = isLockedNow ? now + 15 * 60 * 1000 : 0;

    loginAttempts.set(clientIp, {
      count: currentCount,
      lastAttempt: now,
      lockedUntil,
    });

    if (isLockedNow) {
      return res.status(429).json({
        success: false,
        isLocked: true,
        remainingMinutes: 15,
        message: 'Security Alert: Maximum login attempts (5/5) exceeded. Locked for 15 minutes.',
      });
    }

    return res.status(401).json({
      success: false,
      attemptsRemaining: 5 - currentCount,
      message: `Access Denied: Invalid administrator credentials. ${5 - currentCount} attempt(s) remaining.`,
    });
  }

  loginAttempts.delete(clientIp);

  const token = jwt.sign({ role: 'admin', user: 'cohort_lead_admin' }, JWT_SECRET, {
    expiresIn: '6h',
  });

  return res.json({
    success: true,
    token,
    user: 'cohort_lead_admin',
    message: 'Authentication successful',
  });
});

app.post('/api/admin/logout', verifyAdminToken, (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) revokedTokens.add(token);
  return res.json({ success: true, message: 'Logged out successfully.' });
});

app.post('/api/admin/change-password', verifyAdminToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Both passwords required' });
  }
  if (!safeCompare(currentPassword, currentAdminPassword)) {
    return res.status(401).json({ success: false, message: 'Current password verification failed' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
  }
  currentAdminPassword = newPassword;
  return res.json({ success: true, message: 'Master admin password successfully updated' });
});

app.get('/api/admin/verify', verifyAdminToken, (req, res) => {
  return res.json({ success: true, user: req.user });
});

// -----------------------------------------------------------------------------
// Public Endpoints
// -----------------------------------------------------------------------------

app.get('/api/courses', (req, res) => {
  return res.json({ success: true, count: memoryCourses.length, courses: memoryCourses });
});

app.get('/api/notices', (req, res) => {
  const { category, courseCode, search } = req.query;
  let results = [...memoryNotices];

  if (category && category !== 'All') {
    results = results.filter((n) => n.category.toLowerCase() === String(category).toLowerCase());
  }
  if (courseCode && courseCode !== 'All') {
    results = results.filter((n) => n.courseCode.toUpperCase() === String(courseCode).toUpperCase());
  }
  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.courseCode.toLowerCase().includes(q)
    );
  }

  return res.json({ success: true, count: results.length, notices: results });
});

app.get('/api/threats/urgent', (req, res) => {
  const now = Date.now();
  const future = memoryNotices
    .filter((n) => n.deadline && new Date(n.deadline).getTime() > now)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return res.json({
    success: true,
    urgentNotice: future.length > 0 ? future[0] : null,
    isAllCleared: future.length === 0,
  });
});

// -----------------------------------------------------------------------------
// CRUD Operations (Protected)
// -----------------------------------------------------------------------------

app.post('/api/notices', verifyAdminToken, (req, res) => {
  const { title, description, category, courseCode, deadline, resourceLink, resourceLabel, isUrgent, tags } = req.body;

  if (!title || !description || !courseCode || !category) {
    return res.status(400).json({ success: false, message: 'Required fields missing' });
  }

  if (category === 'Exam' && !deadline) {
    return res.status(400).json({ success: false, message: 'Date and time of exam is required for Exam broadcasts.' });
  }

  const course = memoryCourses.find((c) => c.code.toUpperCase() === courseCode.toUpperCase());
  const newNotice = {
    id: 'n-' + Date.now(),
    title: title.trim(),
    description: description.trim(),
    category,
    courseCode: courseCode.trim().toUpperCase(),
    courseTitle: course ? course.title : courseCode,
    deadline: deadline ? new Date(deadline).toISOString() : null,
    resourceLink: resourceLink ? resourceLink.trim() : '',
    resourceLabel: resourceLabel ? resourceLabel.trim() : (category === 'Exam' ? 'Exam Syllabus / PYQs' : 'Resource Link'),
    isUrgent: Boolean(isUrgent),
    tags: Array.isArray(tags) ? tags : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryNotices.unshift(newNotice);
  return res.status(201).json({ success: true, message: 'Notice broadcasted successfully', notice: newNotice });
});

app.put('/api/notices/:id', verifyAdminToken, (req, res) => {
  const { id } = req.params;
  const idx = memoryNotices.findIndex((n) => n.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Notice not found' });

  const { title, description, category, courseCode, deadline, resourceLink, resourceLabel, isUrgent, tags } = req.body;
  memoryNotices[idx] = {
    ...memoryNotices[idx],
    ...(title && { title: title.trim() }),
    ...(description && { description: description.trim() }),
    ...(category && { category }),
    ...(courseCode && { courseCode: courseCode.trim().toUpperCase() }),
    deadline: deadline !== undefined ? (deadline ? new Date(deadline).toISOString() : null) : memoryNotices[idx].deadline,
    ...(resourceLink !== undefined && { resourceLink: resourceLink.trim() }),
    ...(resourceLabel !== undefined && { resourceLabel: resourceLabel.trim() }),
    ...(isUrgent !== undefined && { isUrgent: Boolean(isUrgent) }),
    ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
    updatedAt: new Date().toISOString(),
  };

  return res.json({ success: true, message: 'Notice updated', notice: memoryNotices[idx] });
});

app.delete('/api/notices/:id', verifyAdminToken, (req, res) => {
  const { id } = req.params;
  memoryNotices = memoryNotices.filter((n) => n.id !== id);
  return res.json({ success: true, message: 'Notice deleted successfully' });
});

app.post('/api/admin/purge-notices', verifyAdminToken, (req, res) => {
  const count = memoryNotices.length;
  memoryNotices = [];
  return res.json({ success: true, message: `All ${count} notices purged. Live noticeboard is clean.` });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CSE Sem 1 Server running on http://0.0.0.0:${PORT}`);
});

export default app;
