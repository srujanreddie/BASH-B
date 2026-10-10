// server.ts
import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var JWT_SECRET = process.env.JWT_SECRET || "cse_sem1_super_secret_jwt_key_" + (process.env.APP_URL || "production_2026");
var MONGO_URI = process.env.MONGO_URI || "";
app.use(express.json());
var SEED_COURSES = [
  {
    code: "25BS1MT101",
    title: "Matrices and Calculus (MAC)",
    shortTitle: "MAC",
    category: "Theory",
    credits: 4,
    syllabusUrl: "https://drive.google.com/file/d/cse-sem1-matrices-calculus-syllabus/preview",
    pyqUrl: "https://drive.google.com/drive/folders/cse-pyq-25BS1MT101",
    description: "Eigenvalues, Cayley-Hamilton theorem, multivariable Taylor expansion, Jacobians, and vector calculus.",
    instructor: "Dr. B. Naga Malleswari"
  },
  {
    code: "25BS1CH101",
    title: "Chemistry for Engineers (CFE)",
    shortTitle: "CFE",
    category: "Theory",
    credits: 3,
    syllabusUrl: "https://drive.google.com/file/d/cse-sem1-eng-chem-syllabus/preview",
    pyqUrl: "https://drive.google.com/drive/folders/cse-pyq-25BS1CH101",
    description: "Thermodynamics, electrochemistry, polymer composites, battery chemistry, and engineering nanomaterials.",
    instructor: "Dr. S. Rambabu"
  },
  {
    code: "25ES1EE101",
    title: "Basic Electrical Engineering (BEE)",
    shortTitle: "BEE",
    category: "Theory",
    credits: 3,
    syllabusUrl: "https://drive.google.com/file/d/cse-sem1-bee-syllabus/preview",
    pyqUrl: "https://drive.google.com/drive/folders/cse-pyq-25ES1EE101",
    description: "DC & AC circuit analysis, Kirchhoff laws, Thevenin theorem, single-phase transformers, and 3-phase induction motors.",
    instructor: "Dr. K. Veeresham"
  },
  {
    code: "25ES1CS101",
    title: "Programming for Problem Solving (PPS)",
    shortTitle: "PPS",
    category: "Theory",
    credits: 3,
    syllabusUrl: "https://drive.google.com/file/d/cse-sem1-pps-syllabus/preview",
    pyqUrl: "https://drive.google.com/drive/folders/cse-pyq-25ES1CS101",
    description: "Structured programming in C, pointers, memory allocation, recursion, structures, and file handling.",
    instructor: "Dr. V. Baby"
  },
  {
    code: "25ES3ME101",
    title: "Engineering Drawing (ED)",
    shortTitle: "ED",
    category: "Drawing",
    credits: 3,
    syllabusUrl: "https://drive.google.com/file/d/cse-sem1-drawing-syllabus/preview",
    pyqUrl: "https://drive.google.com/drive/folders/cse-pyq-25ES3ME101",
    description: "Orthographic projections, isometric projections, sections of solids, development of surfaces, and CAD drafting.",
    instructor: "Mr. M. Krishna / Dr. GVL Prasad / Mr. Mohamad Aziz Athani"
  },
  {
    code: "25BS2CH101",
    title: "Engineering Chemistry Laboratory (EC LAB)",
    shortTitle: "EC LAB",
    category: "Lab",
    credits: 1,
    syllabusUrl: "https://drive.google.com/file/d/cse-sem1-chemlab-syllabus/preview",
    pyqUrl: "https://drive.google.com/drive/folders/cse-pyq-25BS2CH101",
    description: "Practical titrations, total hardness of water by EDTA, conductometric analysis, and Redwood viscometer experiments.",
    instructor: "Dr. S. Rambabu / Dr. S. Pratyusha / Dr. N. Mamatha"
  },
  {
    code: "25ES2CS101",
    title: "Programming for Problem Solving Laboratory (PPS LAB)",
    shortTitle: "PPS LAB",
    category: "Lab",
    credits: 1,
    syllabusUrl: "https://drive.google.com/file/d/cse-sem1-ppslab-syllabus/preview",
    pyqUrl: "https://drive.google.com/drive/folders/cse-pyq-25ES2CS101",
    description: "Hands-on programming in C: 12 syllabus experiments from control flow to pointers, file processing, and data structures.",
    instructor: "Dr. V. Baby / Ms. M. Mohana Deepthi / Ms. A. Sandhya Rani"
  },
  {
    code: "25ES2IT101",
    title: "IT Workshop (ITW)",
    shortTitle: "ITW",
    category: "Lab",
    credits: 1,
    syllabusUrl: "https://drive.google.com/file/d/cse-sem1-it-workshop-syllabus/preview",
    pyqUrl: "https://drive.google.com/drive/folders/cse-pyq-25ES2IT101",
    description: "PC assembly, Linux installation, dual-boot setups, Git version control workflows, and scientific documentation using LaTeX.",
    instructor: "Mr. K. Prathap Joshi / Ms. M. Srijitha / Ms. Sana Inayath"
  },
  {
    code: "25ES2EE101",
    title: "Basic Electrical Engineering Laboratory (BEE LAB)",
    shortTitle: "BEE LAB",
    category: "Lab",
    credits: 1,
    syllabusUrl: "https://drive.google.com/file/d/cse-sem1-beelab-syllabus/preview",
    pyqUrl: "https://drive.google.com/drive/folders/cse-pyq-25ES2EE101",
    description: "Hardware verification of Ohm and Kirchhoff laws, Superposition theorem, OC/SC tests on transformers, and power factor correction.",
    instructor: "Dr. O. Sobhana / Dr. E. Shiva Prasad"
  },
  {
    code: "25MN6HS101",
    title: "Induction Programme (IP)",
    shortTitle: "IP",
    category: "Theory",
    credits: 0,
    syllabusUrl: "https://drive.google.com/file/d/cse-sem1-induction-programme/preview",
    description: "Student orientation, universal human values, creative arts, and institute culture.",
    instructor: "Mrs. K. Jyothsna Latha"
  }
];
var memoryCourses = JSON.parse(JSON.stringify(SEED_COURSES));
var memoryNotices = [];
var INITIAL_TIMETABLE_CONFIG = {
  cohortName: "VNR VJIET \u2014 Dept of Computer Science & Engineering",
  section: "Section B (Class Room E-139)",
  academicYear: "2026-27 (w.e.f: 05/08/2026)",
  lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
  schedule: {
    Monday: [
      { id: "mon-1-2", time: "09:00 - 11:00", code: "25ES3ME101", subject: "Engineering Drawing (ED)", room: "E-030/031", instructor: "Mr. M. Krishna / Dr. GVL Prasad", type: "Drawing" },
      { id: "mon-3", time: "11:00 - 12:00", code: "STUDY", subject: "Self Study / Tutorial Preparation", room: "E-139", instructor: "Ms. M. Mohana Deepthi (Coordinator)", type: "Tutorial" },
      { id: "mon-lnc", time: "12:00 - 12:40", code: "LUNCH", subject: "Lunch Break", room: "Campus Food Court", type: "Break" },
      { id: "mon-4", time: "12:40 - 01:40", code: "25ES1CS101", subject: "Programming for Problem Solving (PPS)", room: "E-139", instructor: "Dr. V. Baby", type: "Theory" },
      { id: "mon-5", time: "01:40 - 02:40", code: "ECA", subject: "Extra Curricular Activities (Sports / ECA)", room: "Sports Complex / Activity Hall", type: "Tutorial" },
      { id: "mon-6", time: "02:40 - 03:40", code: "CCA", subject: "Co-Curricular Activities (CCA Club Sessions)", room: "E-139", type: "Tutorial" }
    ],
    Tuesday: [
      { id: "tue-1-2", time: "09:00 - 11:00", code: "25BS2CH101 / 25ES2EE101", subject: "EC Lab / BEE Lab (Batch 1: EC Lab | Batch 2: BEE Lab)", room: "B-308 / P-014", instructor: "Dr. S. Rambabu / Dr. O. Sobhana / Dr. E. Shiva Prasad", type: "Lab" },
      { id: "tue-3", time: "11:00 - 12:00", code: "25BS1CH101", subject: "Chemistry for Engineers (CFE)", room: "E-139", instructor: "Dr. S. Rambabu", type: "Theory" },
      { id: "tue-lnc", time: "12:00 - 12:40", code: "LUNCH", subject: "Lunch Break", room: "Campus Food Court", type: "Break" },
      { id: "tue-4", time: "12:40 - 01:40", code: "25ES1CS101", subject: "Programming for Problem Solving (PPS)", room: "E-139", instructor: "Dr. V. Baby", type: "Theory" },
      { id: "tue-5", time: "01:40 - 02:40", code: "MTP", subject: "Mentoring Training & Placements (MTP)", room: "E-139", instructor: "CSE Faculty Mentors", type: "Tutorial" },
      { id: "tue-6", time: "02:40 - 03:40", code: "SPORTS", subject: "Sports & Physical Conditioning", room: "College Grounds", type: "Tutorial" }
    ],
    Wednesday: [
      { id: "wed-1-2", time: "09:00 - 11:00", code: "25ES2CS101 / 25BS2CH101", subject: "PPS Lab / EC Lab (Batch 1: PPS Lab | Batch 2: EC Lab)", room: "E-103 / B-308", instructor: "Dr. V. Baby / Ms. M. Mohana Deepthi / Dr. S. Rambabu", type: "Lab" },
      { id: "wed-3", time: "11:00 - 12:00", code: "25BS1MT101", subject: "Matrices and Calculus (MAC)", room: "E-139", instructor: "Dr. B. Naga Malleswari", type: "Theory" },
      { id: "wed-lnc", time: "12:00 - 12:40", code: "LUNCH", subject: "Lunch Break", room: "Campus Food Court", type: "Break" },
      { id: "wed-4", time: "12:40 - 01:40", code: "STUDY", subject: "Self Study / Problem Walkthrough", room: "E-139", type: "Tutorial" },
      { id: "wed-5", time: "01:40 - 02:40", code: "25ES3ME101", subject: "Engineering Drawing (ED)", room: "E-030/031", instructor: "Mr. M. Krishna / Dr. GVL Prasad", type: "Drawing" },
      { id: "wed-6", time: "02:40 - 03:40", code: "STUDY", subject: "Revision & Peer Learning Hours", room: "E-139", type: "Tutorial" }
    ],
    Thursday: [
      { id: "thu-1", time: "09:00 - 10:00", code: "25BS1MT101", subject: "Matrices and Calculus (MAC)", room: "E-139", instructor: "Dr. B. Naga Malleswari", type: "Theory" },
      { id: "thu-2", time: "10:00 - 11:00", code: "25ES1CS101", subject: "Programming for Problem Solving (PPS)", room: "E-139", instructor: "Dr. V. Baby", type: "Theory" },
      { id: "thu-3", time: "11:00 - 12:00", code: "25ES1EE101", subject: "Basic Electrical Engineering (BEE)", room: "E-139", instructor: "Dr. K. Veeresham", type: "Theory" },
      { id: "thu-lnc", time: "12:00 - 12:40", code: "LUNCH", subject: "Lunch Break", room: "Campus Food Court", type: "Break" },
      { id: "thu-4", time: "12:40 - 01:40", code: "25BS1CH101", subject: "Chemistry for Engineers (CFE)", room: "E-139", instructor: "Dr. S. Rambabu", type: "Theory" },
      { id: "thu-5-6", time: "01:40 - 03:40", code: "LIBRARY", subject: "Central Library Reference & Research Hours", room: "Central Library", type: "Tutorial" }
    ],
    Friday: [
      { id: "fri-1", time: "09:00 - 10:00", code: "25ES1CS101", subject: "Programming for Problem Solving (PPS)", room: "E-139", instructor: "Dr. V. Baby", type: "Theory" },
      { id: "fri-2", time: "10:00 - 11:00", code: "25BS1CH101", subject: "Chemistry for Engineers (CFE)", room: "E-139", instructor: "Dr. S. Rambabu", type: "Theory" },
      { id: "fri-3", time: "11:00 - 12:00", code: "25BS1MT101", subject: "Matrices and Calculus (MAC)", room: "E-139", instructor: "Dr. B. Naga Malleswari", type: "Theory" },
      { id: "fri-lnc", time: "12:00 - 12:40", code: "LUNCH", subject: "Lunch Break", room: "Campus Food Court", type: "Break" },
      { id: "fri-4", time: "12:40 - 01:40", code: "25ES1EE101", subject: "Basic Electrical Engineering (BEE)", room: "E-139", instructor: "Dr. K. Veeresham", type: "Theory" },
      { id: "fri-5-6", time: "01:40 - 03:40", code: "25ES2EE101 / 25ES2CS101", subject: "BEE Lab / PPS Lab (Batch 1: BEE Lab | Batch 2: PPS Lab)", room: "P-014 / E-103", instructor: "Dr. O. Sobhana / Dr. E. Shiva Prasad / Dr. V. Baby", type: "Lab" }
    ],
    Saturday: [
      { id: "sat-1", time: "09:00 - 10:00", code: "25BS1CH101", subject: "Chemistry for Engineers (CFE)", room: "E-139", instructor: "Dr. S. Rambabu", type: "Theory" },
      { id: "sat-2", time: "10:00 - 11:00", code: "25BS1MT101", subject: "Matrices and Calculus (MAC)", room: "E-139", instructor: "Dr. B. Naga Malleswari", type: "Theory" },
      { id: "sat-3", time: "11:00 - 12:00", code: "25ES1EE101", subject: "Basic Electrical Engineering (BEE)", room: "E-139", instructor: "Dr. K. Veeresham", type: "Theory" },
      { id: "sat-lnc", time: "12:00 - 12:40", code: "LUNCH", subject: "Lunch Break", room: "Campus Food Court", type: "Break" },
      { id: "sat-4", time: "12:40 - 01:40", code: "STUDY", subject: "Self Study / Seminar Preparation", room: "E-139", type: "Tutorial" },
      { id: "sat-5", time: "01:40 - 02:40", code: "25ES2IT101", subject: "IT Workshop (ITW)", room: "E-115/116", instructor: "Mr. K. Prathap Joshi / Ms. M. Srijitha / Ms. Sana Inayath", type: "Lab" },
      { id: "sat-6", time: "02:40 - 03:40", code: "CVA-L1", subject: "Career Vision Approach - Level 1 (CVA-L1)", room: "E-139", instructor: "Mrs. P. Prasanna", type: "Tutorial" }
    ]
  }
};
var currentTimetable = JSON.parse(JSON.stringify(INITIAL_TIMETABLE_CONFIG));
if (MONGO_URI) {
  mongoose.connect(MONGO_URI).then(() => {
    console.log("Connected to MongoDB database successfully.");
  }).catch((err) => {
    console.warn("MongoDB connection fallback to in-memory store:", err.message);
  });
}
var currentAdminPassword = process.env.ADMIN_PASSWORD || "Admin@CSE2026#Live!";
var MASTER_RECOVERY_KEY = process.env.ADMIN_RECOVERY_KEY || "CSE2026-RECOVER-ROOT-ACCESS";
var isPasswordDefaultOrWeak = !process.env.ADMIN_PASSWORD;
var revokedTokens = /* @__PURE__ */ new Set();
var loginAttempts = /* @__PURE__ */ new Map();
var securityAuditLogs = [
  {
    id: "sec-" + Date.now(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    event: "PORTAL_BOOT",
    ip: "127.0.0.1",
    details: "Live Production Noticeboard Gateway initialized with anti-intrusion shields.",
    status: "info"
  }
];
function recordSecurityAudit(event, ip, details, status, userAgent) {
  const entry = {
    id: "sec-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    event,
    ip: ip.replace(/^.*:/, "") || "unknown",
    userAgent: userAgent ? userAgent.substring(0, 80) : void 0,
    details,
    status
  };
  securityAuditLogs.unshift(entry);
  if (securityAuditLogs.length > 100) {
    securityAuditLogs.pop();
  }
}
function safeCompare(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    const first = forwarded.split(",")[0].trim();
    return first.replace(/^::ffff:/, "") || "127.0.0.1";
  }
  const remote = req.socket.remoteAddress || "127.0.0.1";
  return remote.replace(/^::ffff:/, "") || "127.0.0.1";
}
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: "Authorization header missing" });
  }
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Invalid token format. Use Bearer <token>" });
  }
  if (revokedTokens.has(token)) {
    return res.status(401).json({ success: false, message: "Session terminated. Token has been revoked." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Administrator privileges required." });
    }
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Session expired or invalid token", error: err.message });
  }
}
app.get("/api/admin/security-info", (req, res) => {
  const clientIp = getClientIp(req);
  const record = loginAttempts.get(clientIp);
  const now = Date.now();
  const isLocked = Boolean(record && record.lockedUntil > now);
  const remainingMinutes = isLocked ? Math.ceil((record.lockedUntil - now) / 6e4) : 0;
  const attemptsRemaining = record ? Math.max(0, 5 - record.count) : 5;
  return res.json({
    success: true,
    isLocked,
    remainingMinutes,
    attemptsRemaining,
    maxAttempts: 5,
    isInitialSetup: isPasswordDefaultOrWeak,
    lockoutDurationMinutes: 15
  });
});
app.post("/api/admin/login", async (req, res) => {
  const { password } = req.body;
  const clientIp = getClientIp(req);
  const userAgent = req.headers["user-agent"];
  const now = Date.now();
  const record = loginAttempts.get(clientIp);
  if (record && record.lockedUntil > now) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / 6e4);
    recordSecurityAudit(
      "LOCKOUT_REJECTED",
      clientIp,
      `Rejected unauthorized request during active lockout. ${remainingMinutes}m left.`,
      "danger",
      userAgent
    );
    return res.status(429).json({
      success: false,
      isLocked: true,
      remainingMinutes,
      message: `Security Lockout Active: Too many failed login attempts. Access is locked for ${remainingMinutes} more minute(s).`
    });
  }
  const isMatch = safeCompare(password || "", currentAdminPassword);
  if (!isMatch) {
    await new Promise((r) => setTimeout(r, 600));
    const currentCount = (record ? record.count : 0) + 1;
    const isLockedNow = currentCount >= 5;
    const lockedUntil = isLockedNow ? now + 15 * 60 * 1e3 : 0;
    loginAttempts.set(clientIp, {
      count: currentCount,
      lastAttempt: now,
      lockedUntil
    });
    if (isLockedNow) {
      recordSecurityAudit(
        "LOCKOUT_TRIGGERED",
        clientIp,
        "Maximum 5 failed password attempts reached. IP locked for 15 minutes.",
        "danger",
        userAgent
      );
      return res.status(429).json({
        success: false,
        isLocked: true,
        remainingMinutes: 15,
        message: "Security Alert: Maximum login attempts (5/5) exceeded. Admin portal is locked for 15 minutes."
      });
    }
    const remaining = 5 - currentCount;
    recordSecurityAudit(
      "LOGIN_FAILED",
      clientIp,
      `Failed admin authentication attempt (${currentCount}/5).`,
      "warning",
      userAgent
    );
    return res.status(401).json({
      success: false,
      attemptsRemaining: remaining,
      message: `Access Denied: Invalid administrator credentials. ${remaining} attempt(s) remaining before automatic 15-minute security lockout.`
    });
  }
  loginAttempts.delete(clientIp);
  const token = jwt.sign(
    {
      role: "admin",
      user: "cohort_lead_admin",
      ip: clientIp,
      issuedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    JWT_SECRET,
    { expiresIn: "6h" }
    // 6 hour active window
  );
  recordSecurityAudit(
    "LOGIN_SUCCESS",
    clientIp,
    "Administrator successfully authenticated and issued secure JWT token.",
    "success",
    userAgent
  );
  return res.json({
    success: true,
    token,
    user: "cohort_lead_admin",
    isDefaultPassword: isPasswordDefaultOrWeak,
    message: "Administrator authentication verified."
  });
});
app.post("/api/admin/logout", authMiddleware, (req, res) => {
  const token = req.token;
  if (token) {
    revokedTokens.add(token);
  }
  const clientIp = getClientIp(req);
  recordSecurityAudit("LOGOUT", clientIp, "Admin ended session and revoked active token.", "info");
  return res.json({ success: true, message: "Logged out successfully. Token revoked." });
});
app.post("/api/admin/change-password", authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const clientIp = getClientIp(req);
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Current password and new password are required" });
  }
  if (!safeCompare(currentPassword, currentAdminPassword)) {
    recordSecurityAudit("PASSWORD_CHANGE_FAILED", clientIp, "Failed attempt to change admin password.", "warning");
    return res.status(401).json({ success: false, message: "Current administrator password verification failed." });
  }
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 8 characters long with numbers/symbols for security."
    });
  }
  currentAdminPassword = newPassword;
  isPasswordDefaultOrWeak = false;
  recordSecurityAudit(
    "PASSWORD_CHANGED",
    clientIp,
    "Master administrator password successfully updated and hardened.",
    "success"
  );
  return res.json({
    success: true,
    message: "Master admin password successfully changed! Ensure new credentials are saved in your password manager."
  });
});
app.post("/api/admin/emergency-reset", async (req, res) => {
  const { recoveryKey, newPassword } = req.body;
  const clientIp = getClientIp(req);
  const userAgent = req.headers["user-agent"];
  if (!recoveryKey || !newPassword) {
    return res.status(400).json({ success: false, message: "Recovery key and new password are required." });
  }
  if (!safeCompare(recoveryKey.trim(), MASTER_RECOVERY_KEY)) {
    await new Promise((r) => setTimeout(r, 800));
    recordSecurityAudit("EMERGENCY_RESET_FAILED", clientIp, "Invalid recovery key entered.", "danger", userAgent);
    return res.status(401).json({ success: false, message: "Invalid Emergency Master Recovery Key." });
  }
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: "New password must be at least 8 characters long." });
  }
  currentAdminPassword = newPassword;
  isPasswordDefaultOrWeak = false;
  loginAttempts.delete(clientIp);
  recordSecurityAudit(
    "EMERGENCY_RESET_SUCCESS",
    clientIp,
    "Master administrator password successfully reset using the Root Recovery Key.",
    "warning",
    userAgent
  );
  return res.json({
    success: true,
    message: "Master administrator password successfully reset! You can now log in with your new credentials."
  });
});
app.post("/api/admin/reset-to-default", async (req, res) => {
  try {
    const { recoveryKey } = req.body;
    const clientIp = getClientIp(req);
    const userAgent = req.headers["user-agent"];
    if (!recoveryKey || !safeCompare(recoveryKey.trim(), MASTER_RECOVERY_KEY)) {
      await new Promise((r) => setTimeout(r, 600));
      recordSecurityAudit("RESTORE_DEFAULT_FAILED", clientIp, "Invalid recovery key for default restore.", "danger", userAgent);
      return res.status(401).json({ success: false, message: "Invalid Emergency Recovery Key." });
    }
    currentAdminPassword = "Admin@CSE2026#Live!";
    isPasswordDefaultOrWeak = true;
    loginAttempts.delete(clientIp);
    recordSecurityAudit(
      "RESTORE_DEFAULT_SUCCESS",
      clientIp,
      "Master admin credentials restored to default password.",
      "warning",
      userAgent
    );
    return res.json({
      success: true,
      message: "Password restored to default: Admin@CSE2026#Live!",
      defaultPassword: "Admin@CSE2026#Live!"
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Reset error: " + err.message });
  }
});
app.get("/api/admin/audit-logs", authMiddleware, (_req, res) => {
  return res.json({
    success: true,
    logs: securityAuditLogs,
    activeLockouts: Array.from(loginAttempts.entries()).filter(([_, record]) => record.lockedUntil > Date.now()).map(([ip, record]) => ({
      ip: ip.replace(/^.*:/, ""),
      remainingMinutes: Math.ceil((record.lockedUntil - Date.now()) / 6e4)
    }))
  });
});
app.get("/api/admin/verify", authMiddleware, (req, res) => {
  return res.json({
    success: true,
    user: req.user,
    isDefaultPassword: isPasswordDefaultOrWeak
  });
});
app.get("/api/courses", (_req, res) => {
  return res.json({ success: true, count: memoryCourses.length, courses: memoryCourses });
});
app.get("/api/timetable", (_req, res) => {
  return res.json({ success: true, timetable: currentTimetable });
});
app.put("/api/timetable", authMiddleware, (req, res) => {
  const { schedule, cohortName, section, academicYear } = req.body;
  if (!schedule || typeof schedule !== "object") {
    return res.status(400).json({ success: false, message: "Invalid schedule format provided." });
  }
  currentTimetable = {
    cohortName: cohortName || currentTimetable.cohortName,
    section: section || currentTimetable.section,
    academicYear: academicYear || currentTimetable.academicYear,
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    schedule
  };
  recordSecurityAudit("TIMETABLE_UPDATED", getClientIp(req), `Timetable updated for ${currentTimetable.section}`, "success", req.headers["user-agent"]);
  return res.json({
    success: true,
    message: "Timetable updated successfully.",
    timetable: currentTimetable
  });
});
app.post("/api/timetable/reset", authMiddleware, (req, res) => {
  currentTimetable = JSON.parse(JSON.stringify(INITIAL_TIMETABLE_CONFIG));
  currentTimetable.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
  recordSecurityAudit("TIMETABLE_RESET", getClientIp(req), "Timetable reset to factory defaults", "warning", req.headers["user-agent"]);
  return res.json({
    success: true,
    message: "Timetable restored to factory defaults.",
    timetable: currentTimetable
  });
});
app.get("/api/notices", (req, res) => {
  const { category, courseCode, search } = req.query;
  let results = [...memoryNotices];
  if (category && category !== "All") {
    results = results.filter(
      (n) => n.category.toLowerCase() === String(category).toLowerCase()
    );
  }
  if (courseCode && courseCode !== "All") {
    results = results.filter(
      (n) => n.courseCode.toUpperCase() === String(courseCode).toUpperCase()
    );
  }
  if (search && typeof search === "string" && search.trim() !== "") {
    const query = search.trim().toLowerCase();
    results = results.filter(
      (n) => n.title.toLowerCase().includes(query) || n.description.toLowerCase().includes(query) || n.courseCode.toLowerCase().includes(query) || n.courseTitle && n.courseTitle.toLowerCase().includes(query) || Array.isArray(n.tags) && n.tags.some((t) => t.toLowerCase().includes(query))
    );
  }
  const currentTime = Date.now();
  results.sort((a, b) => {
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
app.get("/api/threats/urgent", (_req, res) => {
  const currentTime = Date.now();
  const futureDeadlines = memoryNotices.filter((n) => n.deadline && new Date(n.deadline).getTime() > currentTime).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  if (futureDeadlines.length > 0) {
    return res.json({
      success: true,
      urgentNotice: futureDeadlines[0],
      isAllCleared: false,
      upcomingCount: futureDeadlines.length
    });
  }
  return res.json({
    success: true,
    urgentNotice: null,
    isAllCleared: true,
    upcomingCount: 0
  });
});
app.post("/api/notices", authMiddleware, (req, res) => {
  const {
    title,
    description,
    category,
    courseCode,
    deadline,
    // For category === 'Exam', this represents the Date and Time of Exam
    resourceLink,
    resourceLabel,
    isUrgent,
    tags
  } = req.body;
  if (!title || !description || !courseCode || !category) {
    return res.status(400).json({
      success: false,
      message: "Notice title, description, course code, and category are required."
    });
  }
  if (category === "Exam" && !deadline) {
    return res.status(400).json({
      success: false,
      message: "Date and time of exam is required for Exam broadcasts."
    });
  }
  const course = memoryCourses.find((c) => c.code.toUpperCase() === courseCode.toUpperCase());
  const courseTitle = course ? course.title : courseCode;
  const newNotice = {
    id: "n-" + Date.now(),
    title: title.trim(),
    description: description.trim(),
    category,
    courseCode: courseCode.trim().toUpperCase(),
    courseTitle,
    deadline: deadline ? new Date(deadline).toISOString() : null,
    resourceLink: resourceLink ? resourceLink.trim() : "",
    resourceLabel: resourceLabel ? resourceLabel.trim() : category === "Exam" ? "Exam Syllabus & PYQs" : "Resource Link",
    isUrgent: Boolean(isUrgent),
    tags: Array.isArray(tags) ? tags : [],
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  memoryNotices.unshift(newNotice);
  const clientIp = getClientIp(req);
  recordSecurityAudit(
    "NOTICE_BROADCAST",
    clientIp,
    `New ${category} broadcasted: "${newNotice.title}" [${newNotice.courseCode}]`,
    "info"
  );
  return res.status(201).json({
    success: true,
    message: category === "Exam" ? "Exam date scheduled and broadcasted successfully" : "Notice broadcasted successfully",
    notice: newNotice
  });
});
app.put("/api/notices/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const index = memoryNotices.findIndex((n) => n.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Notice not found" });
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
    tags
  } = req.body;
  const course = courseCode ? memoryCourses.find((c) => c.code.toUpperCase() === courseCode.toUpperCase()) : null;
  memoryNotices[index] = {
    ...memoryNotices[index],
    ...title && { title: title.trim() },
    ...description && { description: description.trim() },
    ...category && { category },
    ...courseCode && { courseCode: courseCode.trim().toUpperCase() },
    ...course && { courseTitle: course.title },
    deadline: deadline !== void 0 ? deadline ? new Date(deadline).toISOString() : null : memoryNotices[index].deadline,
    ...resourceLink !== void 0 && { resourceLink: resourceLink.trim() },
    ...resourceLabel !== void 0 && { resourceLabel: resourceLabel.trim() },
    ...isUrgent !== void 0 && { isUrgent: Boolean(isUrgent) },
    ...tags !== void 0 && { tags: Array.isArray(tags) ? tags : [] },
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  return res.json({
    success: true,
    message: "Notice updated successfully",
    notice: memoryNotices[index]
  });
});
app.delete("/api/notices/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const initialLen = memoryNotices.length;
  const removed = memoryNotices.find((n) => n.id === id);
  memoryNotices = memoryNotices.filter((n) => n.id !== id);
  if (memoryNotices.length === initialLen) {
    return res.status(404).json({ success: false, message: "Notice not found" });
  }
  const clientIp = getClientIp(req);
  recordSecurityAudit(
    "NOTICE_DELETED",
    clientIp,
    `Notice removed: "${removed?.title || id}"`,
    "info"
  );
  return res.json({
    success: true,
    message: "Notice deleted successfully"
  });
});
app.post("/api/admin/purge-notices", authMiddleware, (req, res) => {
  const count = memoryNotices.length;
  memoryNotices = [];
  const clientIp = getClientIp(req);
  recordSecurityAudit(
    "ALL_NOTICES_PURGED",
    clientIp,
    `Administrator purged all ${count} notice records for live production cleanliness.`,
    "warning"
  );
  return res.json({
    success: true,
    message: `All ${count} notice records purged. Noticeboard is now completely clean and live.`,
    remainingCount: 0
  });
});
app.post("/api/admin/reset-lockouts", authMiddleware, (req, res) => {
  const count = loginAttempts.size;
  loginAttempts.clear();
  return res.json({
    success: true,
    message: `Cleared ${count} IP rate-limiting records.`
  });
});
app.all("/api/*", (req, res) => {
  return res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
});
app.use((err, _req, res, _next) => {
  console.error("Unhandled API Error:", err);
  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    success: false,
    message: err.message || "Internal server error occurred. Please try again."
  });
});
app.use(express.static(path.resolve(__dirname, "public")));
async function startServer() {
  const isDev = process.env.NODE_ENV === "development";
  const distPath = path.resolve(__dirname, "dist");
  const distExists = fs.existsSync(path.resolve(distPath, "index.html"));
  if (isDev) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: PORT
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else if (distExists) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: PORT
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CSE Sem 1 Full-Stack Server running on port ${PORT}`);
    console.log(`Security: Strict Brute-Force Shield Active. Live Mode: 0 Demo Notices.`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
var server_default = app;
export {
  SEED_COURSES,
  server_default as default
};
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
