const xlsx = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Field Mapping Configuration
 */
const FACULTY_FIELD_MAP = {
  'Full Name*': 'fullName',
  'fullname': 'fullName',
  'name': 'fullName',
  'Email*': 'email',
  'email': 'email',
  'Phone*': 'phone',
  'phone': 'phone',
  'contact': 'phone',
  'Employee ID*': 'employeeId',
  'employeeid': 'employeeId',
  'empid': 'employeeId',
  'Department*': 'department',
  'department': 'department',
  'dept': 'department',
  'Designation*': 'designation',
  'designation': 'designation',
  'position': 'designation',
  'Subject': 'subject',
  'subject': 'subject',
  'subjects': 'subject',
  'Joining Date': 'joiningDate',
  'joiningdate': 'joiningDate',
  'joindate': 'joiningDate',
};

const STUDENT_FIELD_MAP = {
  'Full Name*': 'fullName',
  'fullname': 'fullName',
  'name': 'fullName',
  'Email*': 'email',
  'email': 'email',
  'Phone*': 'phone',
  'phone': 'phone',
  'contact': 'phone',
  'Roll Number*': 'rollNumber',
  'rollnumber': 'rollNumber',
  'roll': 'rollNumber',
  'Date of Birth*': 'dateOfBirth',
  'dateofbirth': 'dateOfBirth',
  'dob': 'dateOfBirth',
  'Class*': 'class',
  'class': 'class',
  'Section*': 'section',
  'section': 'section',
  'Department': 'department',
  'department': 'department',
  'dept': 'department',
  'Year of Study': 'yearOfStudy',
  'yearofstudy': 'yearOfStudy',
  'year': 'yearOfStudy',
  'Semester': 'semester',
  'semester': 'semester',
  'sem': 'semester',
  'Guardian Name': 'guardianName',
  'guardianname': 'guardianName',
  'Guardian Phone': 'guardianPhone',
  'guardianphone': 'guardianPhone',
  'Guardian Relation': 'guardianRelation',
  'guardianrelation': 'guardianRelation',
  'relation': 'guardianRelation',
};

/**
 * Faculty Template Structure
 */
const FACULTY_TEMPLATE = {
  headers: [
    'Full Name*',
    'Email*',
    'Phone*',
    'Employee ID*',
    'Department*',
    'Designation*',
    'Subject',
    'Joining Date',
  ],
  example: [
    'John Doe',
    'john.doe@school.edu',
    '9876543210',
    'FAC001',
    'Mathematics',
    'Assistant Professor',
    'Algebra, Geometry',
    '15-01-2020',
  ],
  instructions: [
    '⚠️ INSTRUCTIONS - READ CAREFULLY',
    '',
    '1. Do not modify column headers (first row)',
    '2. Fill data starting from row 3 (remove this example row)',
    '3. Fields marked with * are mandatory',
    '4. Date format: DD-MM-YYYY (e.g., 15-01-2020)',
    '5. Phone: 10 digits without spaces',
    '6. Email must be unique',
    '7. Employee ID must be unique within your institution',
    '',
    'For School: Department = Subject (English, Math, Science, etc.)',
    'For College: Department = CSE, Mechanical, Civil, etc.',
    'Designation: Professor, Assistant Professor, Lecturer, etc.',
    'Subject: Can list multiple separated by comma',
  ],
};

/**
 * Student Template Structure
 */
const STUDENT_TEMPLATE = {
  headers: [
    'Full Name*',
    'Email*',
    'Phone*',
    'Roll Number*',
    'Date of Birth*',
    'Class*',
    'Section*',
    'Department',
    'Year of Study',
    'Semester',
    'Guardian Name',
    'Guardian Phone',
    'Guardian Relation',
  ],
  example: [
    'Alice Johnson',
    'alice.j@student.school.edu',
    '9876543210',
    '10A001',
    '15-01-2008',
    '10',
    'A',
    '',
    '',
    '',
    'Robert Johnson',
    '9876543211',
    'Father',
  ],
  instructions: [
    '⚠️ INSTRUCTIONS - READ CAREFULLY',
    '',
    '1. Do not modify column headers (first row)',
    '2. Fill data starting from row 3 (remove this example row)',
    '3. Fields marked with * are mandatory',
    '4. Date format: DD-MM-YYYY (e.g., 15-01-2008)',
    '5. Phone: 10 digits without spaces',
    '6. Email must be unique',
    '7. Roll Number must be unique within your institution',
    '',
    'For School Students:',
    '- Class: 1-12',
    '- Section: A, B, C, etc.',
    '- Leave Department, Year, Semester empty',
    '',
    'For College Students:',
    '- Class: Leave empty or use year name',
    '- Department: CSE, Mechanical, Civil, etc.',
    '- Year of Study: 1-4',
    '- Semester: 1-8',
    '',
    'Guardian Information (optional but recommended):',
    '- Guardian Name, Phone, Relation (Father/Mother/Guardian)',
  ],
};

/**
 * Generate Faculty Template
 * GET /api/admin/template/faculty
 */
async function generateFacultyTemplate(req, res) {
  try {
    // Create workbook
    const wb = xlsx.utils.book_new();

    // Create worksheet with headers
    const wsData = [
      FACULTY_TEMPLATE.headers,
      FACULTY_TEMPLATE.example,
    ];

    const ws = xlsx.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Full Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 15 }, // Employee ID
      { wch: 25 }, // Department
      { wch: 25 }, // Designation
      { wch: 30 }, // Subject
      { wch: 15 }, // Joining Date
    ];

    // Add to workbook
    xlsx.utils.book_append_sheet(wb, ws, 'Faculty Data');

    // Create instructions sheet
    const instructionsWs = xlsx.utils.aoa_to_sheet(
      FACULTY_TEMPLATE.instructions.map(line => [line])
    );
    instructionsWs['!cols'] = [{ wch: 80 }];
    xlsx.utils.book_append_sheet(wb, instructionsWs, 'Instructions');

    // Generate buffer
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Set headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=faculty_import_template.xlsx');

    res.send(buffer);
  } catch (error) {
    console.error('Generate faculty template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate template',
      error: error.message,
    });
  }
}

/**
 * Generate Student Template
 * GET /api/admin/template/student
 */
async function generateStudentTemplate(req, res) {
  try {
    // Create workbook
    const wb = xlsx.utils.book_new();

    // Create worksheet with headers
    const wsData = [
      STUDENT_TEMPLATE.headers,
      STUDENT_TEMPLATE.example,
    ];

    const ws = xlsx.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Full Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 15 }, // Roll Number
      { wch: 15 }, // Date of Birth
      { wch: 10 }, // Class
      { wch: 10 }, // Section
      { wch: 25 }, // Department
      { wch: 15 }, // Year of Study
      { wch: 10 }, // Semester
      { wch: 20 }, // Guardian Name
      { wch: 15 }, // Guardian Phone
      { wch: 15 }, // Guardian Relation
    ];

    // Add to workbook
    xlsx.utils.book_append_sheet(wb, ws, 'Student Data');

    // Create instructions sheet
    const instructionsWs = xlsx.utils.aoa_to_sheet(
      STUDENT_TEMPLATE.instructions.map(line => [line])
    );
    instructionsWs['!cols'] = [{ wch: 80 }];
    xlsx.utils.book_append_sheet(wb, instructionsWs, 'Instructions');

    // Generate buffer
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Set headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=student_import_template.xlsx');

    res.send(buffer);
  } catch (error) {
    console.error('Generate student template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate template',
      error: error.message,
    });
  }
}

/**
 * Validation Helper Functions
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneStr = String(phone).replace(/\s/g, '');
  return /^\d{10}$/.test(phoneStr);
}

function validateDate(dateStr) {
  if (!dateStr) return null;

  // Parse DD-MM-YYYY format
  const parts = String(dateStr).split(/[-\/]/);
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (year < 1900 || year > 2100) return null;

  return new Date(year, month - 1, day);
}

/**
 * Auto-detect column mapping
 */
function detectColumnMapping(headers, fieldMap) {
  const mapping = {};
  const unmapped = [];

  headers.forEach((header, index) => {
    if (!header) return;

    const headerLower = String(header).toLowerCase().trim().replace(/\*/g, '');
    const mappedField = fieldMap[header] || fieldMap[headerLower];

    if (mappedField) {
      mapping[index] = {
        excelColumn: header,
        mappedField: mappedField,
        confidence: 'high'
      };
    } else {
      unmapped.push({ index, header });
    }
  });

  return { mapping, unmapped };
}

/**
 * Validate a single row of faculty data
 */
async function validateFacultyRow(rowData, rowIndex, institutionId) {
  const errors = [];
  const warnings = [];

  // Required field validation
  if (!rowData.fullName || String(rowData.fullName).trim() === '') {
    errors.push({ field: 'fullName', message: 'Full Name is required' });
  }

  if (!rowData.email || String(rowData.email).trim() === '') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(rowData.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!rowData.phone) {
    errors.push({ field: 'phone', message: 'Phone is required' });
  } else if (!validatePhone(rowData.phone)) {
    errors.push({ field: 'phone', message: 'Phone must be 10 digits' });
  }

  if (!rowData.employeeId || String(rowData.employeeId).trim() === '') {
    errors.push({ field: 'employeeId', message: 'Employee ID is required' });
  }

  if (!rowData.department || String(rowData.department).trim() === '') {
    errors.push({ field: 'department', message: 'Department is required' });
  }

  if (!rowData.designation || String(rowData.designation).trim() === '') {
    errors.push({ field: 'designation', message: 'Designation is required' });
  }

  // Date validation
  if (rowData.joiningDate) {
    const parsedDate = validateDate(rowData.joiningDate);
    if (!parsedDate) {
      warnings.push({ field: 'joiningDate', message: 'Invalid date format. Use DD-MM-YYYY' });
    }
  }

  // Database validations (check duplicates)
  if (rowData.email && validateEmail(rowData.email)) {
    const existingUser = await prisma.user.findUnique({
      where: { email: rowData.email }
    });
    if (existingUser) {
      warnings.push({ field: 'email', message: 'Email already exists - will be updated' });
    }
  }

  if (rowData.employeeId) {
    const existingFaculty = await prisma.facultyProfile.findFirst({
      where: {
        employeeId: String(rowData.employeeId).trim(),
        user: { institutionId }
      }
    });
    if (existingFaculty) {
      warnings.push({ field: 'employeeId', message: 'Employee ID exists - will be updated' });
    }
  }

  return { errors, warnings };
}

/**
 * Validate a single row of student data
 */
async function validateStudentRow(rowData, rowIndex, institutionId) {
  const errors = [];
  const warnings = [];

  // Required field validation
  if (!rowData.fullName || String(rowData.fullName).trim() === '') {
    errors.push({ field: 'fullName', message: 'Full Name is required' });
  }

  if (!rowData.email || String(rowData.email).trim() === '') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(rowData.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!rowData.phone) {
    errors.push({ field: 'phone', message: 'Phone is required' });
  } else if (!validatePhone(rowData.phone)) {
    errors.push({ field: 'phone', message: 'Phone must be 10 digits' });
  }

  if (!rowData.rollNumber || String(rowData.rollNumber).trim() === '') {
    errors.push({ field: 'rollNumber', message: 'Roll Number is required' });
  }

  if (!rowData.dateOfBirth || String(rowData.dateOfBirth).trim() === '') {
    errors.push({ field: 'dateOfBirth', message: 'Date of Birth is required' });
  } else {
    const parsedDate = validateDate(rowData.dateOfBirth);
    if (!parsedDate) {
      errors.push({ field: 'dateOfBirth', message: 'Invalid date format. Use DD-MM-YYYY' });
    }
  }

  if (!rowData.class || String(rowData.class).trim() === '') {
    errors.push({ field: 'class', message: 'Class is required' });
  }

  if (!rowData.section || String(rowData.section).trim() === '') {
    errors.push({ field: 'section', message: 'Section is required' });
  }

  // Optional guardian phone validation
  if (rowData.guardianPhone && !validatePhone(rowData.guardianPhone)) {
    warnings.push({ field: 'guardianPhone', message: 'Guardian phone must be 10 digits' });
  }

  // Database validations
  if (rowData.email && validateEmail(rowData.email)) {
    const existingUser = await prisma.user.findUnique({
      where: { email: rowData.email }
    });
    if (existingUser) {
      warnings.push({ field: 'email', message: 'Email already exists - will be updated' });
    }
  }

  if (rowData.rollNumber) {
    const existingStudent = await prisma.studentProfile.findFirst({
      where: {
        rollNumber: String(rowData.rollNumber).trim(),
        user: { institutionId }
      }
    });
    if (existingStudent) {
      warnings.push({ field: 'rollNumber', message: 'Roll Number exists - will be updated' });
    }
  }

  return { errors, warnings };
}

/**
 * Parse and Validate Excel File
 * POST /api/admin/import/parse
 */
async function parseAndValidateFile(req, res) {
  try {
    const { type } = req.body; // 'faculty' or 'student'
    const institutionId = req.user.institutionId;

    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const file = req.files.file;

    // Parse Excel file
    const workbook = xlsx.read(file.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    if (rawData.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'File must contain at least header row and one data row'
      });
    }

    // Extract headers and data rows
    const headers = rawData[0];
    const dataRows = rawData.slice(1).filter(row => {
      // Filter out empty rows
      return row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '');
    });

    // Auto-detect column mapping
    const fieldMap = type === 'faculty' ? FACULTY_FIELD_MAP : STUDENT_FIELD_MAP;
    const { mapping, unmapped } = detectColumnMapping(headers, fieldMap);

    // Parse and validate each row
    const parsedRows = [];
    const validationResults = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowIndex = i + 2; // +2 because of header row and 0-based index

      // Map row data to fields
      const rowData = {};
      Object.keys(mapping).forEach(colIndex => {
        const fieldName = mapping[colIndex].mappedField;
        rowData[fieldName] = row[colIndex];
      });

      // Validate row
      const validation = type === 'faculty'
        ? await validateFacultyRow(rowData, rowIndex, institutionId)
        : await validateStudentRow(rowData, rowIndex, institutionId);

      parsedRows.push({
        rowIndex,
        data: rowData,
        hasErrors: validation.errors.length > 0,
        hasWarnings: validation.warnings.length > 0
      });

      validationResults.push({
        rowIndex,
        errors: validation.errors,
        warnings: validation.warnings
      });
    }

    // Calculate statistics
    const stats = {
      total: parsedRows.length,
      valid: parsedRows.filter(r => !r.hasErrors).length,
      withWarnings: parsedRows.filter(r => r.hasWarnings && !r.hasErrors).length,
      withErrors: parsedRows.filter(r => r.hasErrors).length
    };

    res.json({
      success: true,
      data: {
        headers,
        mapping,
        unmapped,
        rows: parsedRows,
        validationResults,
        stats
      }
    });

  } catch (error) {
    console.error('Parse file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to parse file',
      error: error.message
    });
  }
}

module.exports = {
  generateFacultyTemplate,
  generateStudentTemplate,
  parseAndValidateFile,
};
