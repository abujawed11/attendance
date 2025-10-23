const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

// Faculty routes - Get sections assigned to faculty
router.get(
  '/faculty/sections',
  authenticate,
  requireRole('FACULTY'),
  attendanceController.getFacultySections
);

// Get students in a section
router.get(
  '/sections/:sectionId/students',
  authenticate,
  requireRole('FACULTY', 'ADMIN'),
  attendanceController.getSectionStudents
);

// Attendance session management
router.post(
  '/sessions',
  authenticate,
  requireRole('FACULTY'),
  attendanceController.createAttendanceSession
);

router.get(
  '/sessions',
  authenticate,
  requireRole('FACULTY', 'ADMIN'),
  attendanceController.getAttendanceSessions
);

router.get(
  '/sessions/:sessionId',
  authenticate,
  requireRole('FACULTY', 'ADMIN'),
  attendanceController.getSessionDetail
);

// Mark attendance (batch)
router.post(
  '/sessions/:sessionId/punches',
  authenticate,
  requireRole('FACULTY'),
  attendanceController.markAttendance
);

// Student routes - View own attendance
router.get(
  '/my',
  authenticate,
  requireRole('STUDENT'),
  attendanceController.getMyAttendance
);

module.exports = router;
