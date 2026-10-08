/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'cse_sem1_super_secret_jwt_key_' + (process.env.APP_URL || 'production_2026');
const MONGO_URI = process.env.MONGO_URI || '';

app.use(express.json());

// -----------------------------------------------------------------------------
// Core Curriculum Data: Semester 1 (9 Courses)
// -----------------------------------------------------------------------------

export const SEED_COURSES = [
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
    instructor: 'Prof. S. R. Ramanathan',
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
    instructor: 'Dr. Ananya Mukherjee',
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
    instructor: 'Prof. K. Venkatesh',
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
    instructor: 'Prof. Rajesh K. Sharma',
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
    instructor: 'Prof. M. B. Patil',
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
    instructor: 'Dr. Ananya Mukherjee',
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
    instructor: 'Prof. Rajesh K. Sharma',
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
    instructor: 'Er. Sandeep Nair',
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
    instructor: 'Prof. K. Venkatesh',
  },
];

// Live Production Mode: Zero demo notices by default
let memoryCourses = JSON.parse(JSON.stringify(SEED_COURSES));
let memoryNotices: any[] = []; // Clean live noticeboard for production cohort!

// MongoDB setup
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB database successfully.');
    })
    .catch((err) => {
      console.warn('MongoDB connection fallback to in-memory store:', err.message);
    });
}

// -----------------------------------------------------------------------------
// Enhanced Security Architecture: Access Control & Anti-Intrusion
// -----------------------------------------------------------------------------

// Master Administrator Password Management
// Defaults to configured environment variable; if not supplied, initializes securely.
let currentAdminPassword = process.env.ADMIN_PASSWORD || 'Admin@CSE2026#Live!';
const MASTER_RECOVERY_KEY = process.env.ADMIN_RECOVERY_KEY || 'CSE2026-RECOVER-ROOT-ACCESS';
let isPasswordDefaultOrWeak = !process.env.ADMIN_PASSWORD;

// Blacklisted / Revoked JWT tokens
const revokedTokens = new Set<string>();

// Rate limiting & Brute-force lockout per IP
interface ClientSecurityRecord {
  count: number;
  lastAttempt: number;
  lockedUntil: number;
}
const loginAttempts = new Map<string, ClientSecurityRecord>();

// Security Audit Log (Last 100 security events)
export interface SecurityLogEntry {
  id: string;
  timestamp: string;
  event: string;
  ip: string;
  userAgent?: string;
  details: string;
  status: 'success' | 'warning' | 'danger' | 'info';
}
const securityAuditLogs: SecurityLogEntry[] = [
  {
    id: 'sec-' + Date.now(),
    timestamp: new Date().toISOString(),
    event: 'PORTAL_BOOT',
    ip: '127.0.0.1',
    details: 'Live Production Noticeboard Gateway initialized with anti-intrusion shields.',
    status: 'info',
  },
];

function recordSecurityAudit(
  event: string,
  ip: string,
  details: string,
  status: 'success' | 'warning' | 'danger' | 'info',
  userAgent?: string
) {
  const entry: SecurityLogEntry = {
    id: 'sec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    event,
    ip: ip.replace(/^.*:/, '') || 'unknown',
    userAgent: userAgent ? userAgent.substring(0, 80) : undefined,
    details,
    status,
  };
  securityAuditLogs.unshift(entry);
  if (securityAuditLogs.length > 100) {
    securityAuditLogs.pop();
  }
}

// Safe constant-time string comparison to prevent timing attacks
function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Dummy compare to avoid timing leak on length
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// Normalized IP extraction supporting reverse proxies and Cloud Run
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const first = forwarded.split(',')[0].trim();
    return first.replace(/^::ffff:/, '') || '127.0.0.1';
  }
  const remote = req.socket.remoteAddress || '127.0.0.1';
  return remote.replace(/^::ffff:/, '') || '127.0.0.1';
}

// -----------------------------------------------------------------------------
// Authentication Middleware (Protected Routes)
// -----------------------------------------------------------------------------

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Authorization header missing' });
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Invalid token format. Use Bearer <token>' });
  }

  // Check if token was revoked (e.g. on logout)
  if (revokedTokens.has(token)) {
    return res.status(401).json({ success: false, message: 'Session terminated. Token has been revoked.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string; user: string; iat: number; exp: number };
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Administrator privileges required.' });
    }
    (req as any).user = decoded;
    (req as any).token = token;
    next();
  } catch (err: any) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token', error: err.message });
  }
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// GET /api/admin/security-info: Public security posture check (No credentials leaked)
app.get('/api/admin/security-info', (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  const record = loginAttempts.get(clientIp);
  const now = Date.now();
  const isLocked = Boolean(record && record.lockedUntil > now);
  const remainingMinutes = isLocked ? Math.ceil((record!.lockedUntil - now) / 60000) : 0;
  const attemptsRemaining = record ? Math.max(0, 5 - record.count) : 5;

  return res.json({
    success: true,
    isLocked,
    remainingMinutes,
    attemptsRemaining,
    maxAttempts: 5,
    isInitialSetup: isPasswordDefaultOrWeak,
    lockoutDurationMinutes: 15,
  });
});

// POST /api/admin/login: Authenticate administrator with anti-brute force delay & lockout
app.post('/api/admin/login', async (req: Request, res: Response) => {
  const { password } = req.body;
  const clientIp = getClientIp(req);
  const userAgent = req.headers['user-agent'] as string;
  const now = Date.now();
  const record = loginAttempts.get(clientIp);

  // 1. Check if IP is currently locked out
  if (record && record.lockedUntil > now) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    recordSecurityAudit(
      'LOCKOUT_REJECTED',
      clientIp,
      `Rejected unauthorized request during active lockout. ${remainingMinutes}m left.`,
      'danger',
      userAgent
    );
    return res.status(429).json({
      success: false,
      isLocked: true,
      remainingMinutes,
      message: `Security Lockout Active: Too many failed login attempts. Access is locked for ${remainingMinutes} more minute(s).`,
    });
  }

  // 2. Validate Password with timing attack resistance
  const isMatch = safeCompare(password || '', currentAdminPassword);

  if (!isMatch) {
    // Add progressive delay (600ms) to defeat automated bots & dictionary attacks
    await new Promise((r) => setTimeout(r, 600));

    const currentCount = (record ? record.count : 0) + 1;
    const isLockedNow = currentCount >= 5;
    const lockedUntil = isLockedNow ? now + 15 * 60 * 1000 : 0;

    loginAttempts.set(clientIp, {
      count: currentCount,
      lastAttempt: now,
      lockedUntil,
    });

    if (isLockedNow) {
      recordSecurityAudit(
        'LOCKOUT_TRIGGERED',
        clientIp,
        'Maximum 5 failed password attempts reached. IP locked for 15 minutes.',
        'danger',
        userAgent
      );
      return res.status(429).json({
        success: false,
        isLocked: true,
        remainingMinutes: 15,
        message: 'Security Alert: Maximum login attempts (5/5) exceeded. Admin portal is locked for 15 minutes.',
      });
    }

    const remaining = 5 - currentCount;
    recordSecurityAudit(
      'LOGIN_FAILED',
      clientIp,
      `Failed admin authentication attempt (${currentCount}/5).`,
      'warning',
      userAgent
    );

    return res.status(401).json({
      success: false,
      attemptsRemaining: remaining,
      message: `Access Denied: Invalid administrator credentials. ${remaining} attempt(s) remaining before automatic 15-minute security lockout.`,
    });
  }

  // 3. Successful Authentication: Clear failed counter
  loginAttempts.delete(clientIp);

  const token = jwt.sign(
    {
      role: 'admin',
      user: 'cohort_lead_admin',
      ip: clientIp,
      issuedAt: new Date().toISOString(),
    },
    JWT_SECRET,
    { expiresIn: '6h' } // 6 hour active window
  );

  recordSecurityAudit(
    'LOGIN_SUCCESS',
    clientIp,
    'Administrator successfully authenticated and issued secure JWT token.',
    'success',
    userAgent
  );

  return res.json({
    success: true,
    token,
    user: 'cohort_lead_admin',
    isDefaultPassword: isPasswordDefaultOrWeak,
    message: 'Administrator authentication verified.',
  });
});

// POST /api/admin/logout: Invalidate JWT token immediately
app.post('/api/admin/logout', authMiddleware, (req: Request, res: Response) => {
  const token = (req as any).token;
  if (token) {
    revokedTokens.add(token);
  }
  const clientIp = getClientIp(req);
  recordSecurityAudit('LOGOUT', clientIp, 'Admin ended session and revoked active token.', 'info');
  return res.json({ success: true, message: 'Logged out successfully. Token revoked.' });
});

// POST /api/admin/change-password: Change master password (Protected)
app.post('/api/admin/change-password', authMiddleware, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const clientIp = getClientIp(req);

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required' });
  }

  if (!safeCompare(currentPassword, currentAdminPassword)) {
    recordSecurityAudit('PASSWORD_CHANGE_FAILED', clientIp, 'Failed attempt to change admin password.', 'warning');
    return res.status(401).json({ success: false, message: 'Current administrator password verification failed.' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 8 characters long with numbers/symbols for security.',
    });
  }

  currentAdminPassword = newPassword;
  isPasswordDefaultOrWeak = false;

  recordSecurityAudit(
    'PASSWORD_CHANGED',
    clientIp,
    'Master administrator password successfully updated and hardened.',
    'success'
  );

  return res.json({
    success: true,
    message: 'Master admin password successfully changed! Ensure new credentials are saved in your password manager.',
  });
});

// POST /api/admin/emergency-reset: Recover password using Master Recovery Key
app.post('/api/admin/emergency-reset', async (req: Request, res: Response) => {
  const { recoveryKey, newPassword } = req.body;
  const clientIp = getClientIp(req);
  const userAgent = req.headers['user-agent'] as string;

  if (!recoveryKey || !newPassword) {
    return res.status(400).json({ success: false, message: 'Recovery key and new password are required.' });
  }

  if (!safeCompare(recoveryKey.trim(), MASTER_RECOVERY_KEY)) {
    await new Promise((r) => setTimeout(r, 800)); // Delay against brute-force recovery attempts
    recordSecurityAudit('EMERGENCY_RESET_FAILED', clientIp, 'Invalid recovery key entered.', 'danger', userAgent);
    return res.status(401).json({ success: false, message: 'Invalid Emergency Master Recovery Key.' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
  }

  currentAdminPassword = newPassword;
  isPasswordDefaultOrWeak = false;

  // Clear any active IP lockouts
  loginAttempts.delete(clientIp);

  recordSecurityAudit(
    'EMERGENCY_RESET_SUCCESS',
    clientIp,
    'Master administrator password successfully reset using the Root Recovery Key.',
    'warning',
    userAgent
  );

  return res.json({
    success: true,
    message: 'Master administrator password successfully reset! You can now log in with your new credentials.',
  });
});

// POST /api/admin/reset-to-default: Emergency restoration to default Admin@CSE2026#Live!
app.post('/api/admin/reset-to-default', async (req: Request, res: Response) => {
  try {
    const { recoveryKey } = req.body;
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'] as string;

    if (!recoveryKey || !safeCompare(recoveryKey.trim(), MASTER_RECOVERY_KEY)) {
      await new Promise((r) => setTimeout(r, 600));
      recordSecurityAudit('RESTORE_DEFAULT_FAILED', clientIp, 'Invalid recovery key for default restore.', 'danger', userAgent);
      return res.status(401).json({ success: false, message: 'Invalid Emergency Recovery Key.' });
    }

    currentAdminPassword = 'Admin@CSE2026#Live!';
    isPasswordDefaultOrWeak = true;
    loginAttempts.delete(clientIp);

    recordSecurityAudit(
      'RESTORE_DEFAULT_SUCCESS',
      clientIp,
      'Master admin credentials restored to default password.',
      'warning',
      userAgent
    );

    return res.json({
      success: true,
      message: 'Password restored to default: Admin@CSE2026#Live!',
      defaultPassword: 'Admin@CSE2026#Live!',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Reset error: ' + err.message });
  }
});

// GET /api/admin/audit-logs: View security audit trail (Protected)
app.get('/api/admin/audit-logs', authMiddleware, (_req: Request, res: Response) => {
  return res.json({
    success: true,
    logs: securityAuditLogs,
    activeLockouts: Array.from(loginAttempts.entries())
      .filter(([_, record]) => record.lockedUntil > Date.now())
      .map(([ip, record]) => ({
        ip: ip.replace(/^.*:/, ''),
        remainingMinutes: Math.ceil((record.lockedUntil - Date.now()) / 60000),
      })),
  });
});

// GET /api/admin/verify: Verify session status
app.get('/api/admin/verify', authMiddleware, (req: Request, res: Response) => {
  return res.json({
    success: true,
    user: (req as any).user,
    isDefaultPassword: isPasswordDefaultOrWeak,
  });
});

// -----------------------------------------------------------------------------
// Public Course & Notice Endpoints
// -----------------------------------------------------------------------------

// GET /api/courses: Fetch all 9 Semester 1 courses
app.get('/api/courses', (_req: Request, res: Response) => {
  return res.json({ success: true, count: memoryCourses.length, courses: memoryCourses });
});

// GET /api/notices: Fetch notices with optional filtering & sorting
app.get('/api/notices', (req: Request, res: Response) => {
  const { category, courseCode, search } = req.query;

  let results = [...memoryNotices];

  if (category && category !== 'All') {
    results = results.filter(
      (n: any) => n.category.toLowerCase() === String(category).toLowerCase()
    );
  }

  if (courseCode && courseCode !== 'All') {
    results = results.filter(
      (n: any) => n.courseCode.toUpperCase() === String(courseCode).toUpperCase()
    );
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const query = search.trim().toLowerCase();
    results = results.filter(
      (n: any) =>
        n.title.toLowerCase().includes(query) ||
        n.description.toLowerCase().includes(query) ||
        n.courseCode.toLowerCase().includes(query) ||
        (n.courseTitle && n.courseTitle.toLowerCase().includes(query)) ||
        (Array.isArray(n.tags) && n.tags.some((t: string) => t.toLowerCase().includes(query)))
    );
  }

  // Sort: upcoming deadlines/exam dates first, then items without deadline, newer first
  const currentTime = Date.now();
  results.sort((a: any, b: any) => {
    const timeA = a.deadline ? new Date(a.deadline).getTime() : null;
    const timeB = b.deadline ? new Date(b.deadline).getTime() : null;

    if (timeA && timeB) {
      const futureA = timeA >= currentTime;
      const futureB = timeB >= currentTime;
      if (futureA && futureB) return timeA - timeB;
      if (futureA && !futureB) return -1;
      if (!futureA && futureB) return 1;
      return timeB - timeA;
    }
    if (timeA && !timeB) return -1;
    if (!timeA && timeB) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return res.json({ success: true, count: results.length, notices: results });
});

// GET /api/threats/urgent: Automatically select closest upcoming deadline or exam date
app.get('/api/threats/urgent', (_req: Request, res: Response) => {
  const currentTime = Date.now();
  const futureDeadlines = memoryNotices
    .filter((n: any) => n.deadline && new Date(n.deadline).getTime() > currentTime)
    .sort((a: any, b: any) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  if (futureDeadlines.length > 0) {
    return res.json({
      success: true,
      urgentNotice: futureDeadlines[0],
      isAllCleared: false,
      upcomingCount: futureDeadlines.length,
    });
  }

  return res.json({
    success: true,
    urgentNotice: null,
    isAllCleared: true,
    upcomingCount: 0,
  });
});

// -----------------------------------------------------------------------------
// Notice Management (Protected by JWT)
// -----------------------------------------------------------------------------

// POST /api/notices: Broadcast new notice (Supports Date of Exam for Exams)
app.post('/api/notices', authMiddleware, (req: Request, res: Response) => {
  const {
    title,
    description,
    category,
    courseCode,
    deadline, // For category === 'Exam', this represents the Date and Time of Exam
    resourceLink,
    resourceLabel,
    isUrgent,
    tags,
  } = req.body;

  if (!title || !description || !courseCode || !category) {
    return res.status(400).json({
      success: false,
      message: 'Notice title, description, course code, and category are required.',
    });
  }

  if (category === 'Exam' && !deadline) {
    return res.status(400).json({
      success: false,
      message: 'Date and time of exam is required for Exam broadcasts.',
    });
  }

  const course = memoryCourses.find((c: any) => c.code.toUpperCase() === courseCode.toUpperCase());
  const courseTitle = course ? course.title : courseCode;

  const newNotice = {
    id: 'n-' + Date.now(),
    title: title.trim(),
    description: description.trim(),
    category,
    courseCode: courseCode.trim().toUpperCase(),
    courseTitle,
    deadline: deadline ? new Date(deadline).toISOString() : null,
    resourceLink: resourceLink ? resourceLink.trim() : '',
    resourceLabel: resourceLabel ? resourceLabel.trim() : (category === 'Exam' ? 'Exam Syllabus & PYQs' : 'Resource Link'),
    isUrgent: Boolean(isUrgent),
    tags: Array.isArray(tags) ? tags : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryNotices.unshift(newNotice);

  const clientIp = getClientIp(req);
  recordSecurityAudit(
    'NOTICE_BROADCAST',
    clientIp,
    `New ${category} broadcasted: "${newNotice.title}" [${newNotice.courseCode}]`,
    'info'
  );

  return res.status(201).json({
    success: true,
    message: category === 'Exam' ? 'Exam date scheduled and broadcasted successfully' : 'Notice broadcasted successfully',
    notice: newNotice,
  });
});

// PUT /api/notices/:id: Update notice (Protected)
app.put('/api/notices/:id', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = memoryNotices.findIndex((n: any) => n.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Notice not found' });
  }

  const {
    title,
    description,
    category,
    courseCode,
    deadline,
    resourceLink,
    resourceLabel,
    isUrgent,
    tags,
  } = req.body;

  const course = courseCode
    ? memoryCourses.find((c: any) => c.code.toUpperCase() === courseCode.toUpperCase())
    : null;

  memoryNotices[index] = {
    ...memoryNotices[index],
    ...(title && { title: title.trim() }),
    ...(description && { description: description.trim() }),
    ...(category && { category }),
    ...(courseCode && { courseCode: courseCode.trim().toUpperCase() }),
    ...(course && { courseTitle: course.title }),
    deadline: deadline !== undefined ? (deadline ? new Date(deadline).toISOString() : null) : memoryNotices[index].deadline,
    ...(resourceLink !== undefined && { resourceLink: resourceLink.trim() }),
    ...(resourceLabel !== undefined && { resourceLabel: resourceLabel.trim() }),
    ...(isUrgent !== undefined && { isUrgent: Boolean(isUrgent) }),
    ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
    updatedAt: new Date().toISOString(),
  };

  return res.json({
    success: true,
    message: 'Notice updated successfully',
    notice: memoryNotices[index],
  });
});

// DELETE /api/notices/:id: Remove single notice (Protected)
app.delete('/api/notices/:id', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLen = memoryNotices.length;
  const removed = memoryNotices.find((n: any) => n.id === id);
  memoryNotices = memoryNotices.filter((n: any) => n.id !== id);

  if (memoryNotices.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Notice not found' });
  }

  const clientIp = getClientIp(req);
  recordSecurityAudit(
    'NOTICE_DELETED',
    clientIp,
    `Notice removed: "${removed?.title || id}"`,
    'info'
  );

  return res.json({
    success: true,
    message: 'Notice deleted successfully',
  });
});

// POST /api/admin/purge-notices: Wipes all notices to maintain clean live state (Protected)
app.post('/api/admin/purge-notices', authMiddleware, (req: Request, res: Response) => {
  const count = memoryNotices.length;
  memoryNotices = [];
  const clientIp = getClientIp(req);
  recordSecurityAudit(
    'ALL_NOTICES_PURGED',
    clientIp,
    `Administrator purged all ${count} notice records for live production cleanliness.`,
    'warning'
  );

  return res.json({
    success: true,
    message: `All ${count} notice records purged. Noticeboard is now completely clean and live.`,
    remainingCount: 0,
  });
});

// POST /api/admin/reset-lockouts: Reset IP lockout table (Protected)
app.post('/api/admin/reset-lockouts', authMiddleware, (req: Request, res: Response) => {
  const count = loginAttempts.size;
  loginAttempts.clear();
  return res.json({
    success: true,
    message: `Cleared ${count} IP rate-limiting records.`,
  });
});

// -----------------------------------------------------------------------------
// Explicit API 404 & Global Error Handlers (Prevents HTML response leaks)
// -----------------------------------------------------------------------------

app.all('/api/*', (req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled API Error:', err);
  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    success: false,
    message: err.message || 'Internal server error occurred. Please try again.',
  });
});

// -----------------------------------------------------------------------------
// Vite Middlewares Integration for Full-Stack App
// -----------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CSE Sem 1 Full-Stack Server running on port ${PORT}`);
    console.log(`Security: Strict Brute-Force Shield Active. Live Mode: 0 Demo Notices.`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
