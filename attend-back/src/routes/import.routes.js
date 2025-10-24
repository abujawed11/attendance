const express = require('express');
const router = express.Router();
const importController = require('../controllers/import.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

// All routes require authentication and ADMIN role
router.use(authenticate);
router.use(requireRole('ADMIN'));

// Template generation
router.get('/template/faculty', importController.generateFacultyTemplate);
router.get('/template/student', importController.generateStudentTemplate);

// File parsing and validation
router.post('/import/parse', importController.parseAndValidateFile);

// Save imported data to database
router.post('/import/save', importController.saveImportData);

module.exports = router;
