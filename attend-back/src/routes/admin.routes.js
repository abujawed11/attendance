const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

// All routes require authentication and ADMIN role
router.use(authenticate);
router.use(requireRole('ADMIN'));

// Dashboard stats
router.get('/stats', adminController.getStats);

// User listing
router.get('/faculty', adminController.getFaculty);
router.get('/students', adminController.getStudents);

// Update user
router.put('/users/:userId', adminController.updateUser);

// Section management
router.post('/sections', adminController.createSection);
router.get('/sections', adminController.getSections);
router.post('/sections/:sectionId/sync-enrollments', adminController.syncSectionEnrollments);
router.get('/sections/:sectionId/enrollments', adminController.getSectionEnrollments);
router.get('/sections/:sectionId/faculty', adminController.getSectionFaculty);

// Enrollment management
router.post('/enrollments', adminController.enrollStudent);

// Faculty assignment management
router.post('/faculty-assignments', adminController.assignFacultyToSection);

module.exports = router;
