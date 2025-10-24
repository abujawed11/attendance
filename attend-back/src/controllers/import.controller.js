const xlsx = require('xlsx');
const prisma = require('../config/prisma');
const { getNextSequenceId } = require('../utils/helpers');

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
  'Qualification*': 'qualification',
  'Qualification': 'qualification',
  'qualification': 'qualification',
  'qualifications': 'qualification',
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
    'Qualification*',
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
    'M.Sc, B.Ed',
    'Algebra, Geometry',
    '15-01-2020',
  ],
  instructions: [
    '⚠️ INSTRUCTIONS - READ CAREFULLY',
    '',
    '1. Do not modify column headers (first row)',
    '2. Fill data starting from row 3 (remove this example row)',
    '3. Fields marked with * are mandatory',
    '4. Date format: DD-MM-YYYY or DD/MM/YYYY (e.g., 15-01-2020, 15/01/2020, 5-9-2022)',
    '5. Phone: 10 digits without spaces',
    '6. Email must be unique',
    '7. Employee ID must be unique within your institution',
    '',
    'For School: Department = Subject (English, Math, Science, etc.)',
    'For College: Department = CSE, Mechanical, Civil, etc.',
    'Designation: Professor, Assistant Professor, Lecturer, etc.',
    'Qualification: B.Ed, M.Ed, Ph.D, B.Tech, M.Tech, etc.',
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
    '4. Date format: DD-MM-YYYY or DD/MM/YYYY (e.g., 15-01-2008, 15/01/2008, 5-9-2008)',
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
      { wch: 20 }, // Qualification
      { wch: 30 }, // Subject
      { wch: 15 }, // Joining Date
    ];

    // Format date columns as Text to preserve DD-MM-YYYY format
    // Column H is Joining Date (index 8, 0-based)
    const range = xlsx.utils.decode_range(ws['!ref']);
    for (let row = 1; row <= range.e.r; row++) {
      const cellAddress = xlsx.utils.encode_cell({ r: row, c: 8 }); // Column H (Joining Date)
      if (ws[cellAddress]) {
        ws[cellAddress].z = '@'; // Text format
      }
    }

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

    // Format date columns as Text to preserve DD-MM-YYYY format
    // Column E is Date of Birth (index 4, 0-based)
    const range = xlsx.utils.decode_range(ws['!ref']);
    for (let row = 1; row <= range.e.r; row++) {
      const cellAddress = xlsx.utils.encode_cell({ r: row, c: 4 }); // Column E (Date of Birth)
      if (ws[cellAddress]) {
        ws[cellAddress].z = '@'; // Text format
      }
    }

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

  // Handle Excel serial date numbers (days since 1900-01-01)
  if (typeof dateStr === 'number') {
    // Excel date serial number
    const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
    const date = new Date(excelEpoch.getTime() + dateStr * 24 * 60 * 60 * 1000);
    return date;
  }

  // Convert to string and trim
  const dateString = String(dateStr).trim();

  // Try to parse DD-MM-YYYY or DD/MM/YYYY format (with or without leading zeros)
  // Accepts: 05-09-2022, 5-9-2022, 05/09/2022, 5/9/2022
  const parts = dateString.split(/[-\/]/);
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  // Validate parsed numbers
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  // Handle 2-digit years (assume 20xx for 00-99)
  let fullYear = year;
  if (year < 100) {
    fullYear = 2000 + year;
  }

  if (fullYear < 1900 || fullYear > 2100) return null;

  // Create date and validate it's a real date (handles feb 30, etc)
  const date = new Date(fullYear, month - 1, day);
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== fullYear) {
    return null; // Invalid date like Feb 30
  }

  return date;
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
 * Generate default password from name and phone
 * Removes titles (Mr., Ms., Dr., etc.) and uses first name
 */
function generateDefaultPassword(fullName, phone) {
  // List of common titles/initials to remove
  const titles = ['mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'sir', 'madam', 'master'];

  // Clean and split the name
  let nameParts = fullName.trim().toLowerCase().split(/\s+/);

  // Remove titles from the beginning
  while (nameParts.length > 0 && (titles.includes(nameParts[0].replace('.', '')) || nameParts[0].length <= 2)) {
    nameParts.shift();
  }

  // If no name parts left (edge case), use original name
  if (nameParts.length === 0) {
    nameParts = fullName.trim().toLowerCase().split(/\s+/);
  }

  // Get first name (first part after removing titles)
  const firstName = nameParts[0];

  // Take first 4 letters of first name (or all if less than 4)
  const namePart = firstName.substring(0, 4);

  // Take last 4 digits of phone
  const phonePart = String(phone).replace(/\D/g, '').slice(-4);

  return namePart + phonePart;
}

/**
 * Validate a single row of faculty data
 */
async function validateFacultyRow(rowData, rowIndex, institutionId, institutionType) {
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

  if (!rowData.qualification || String(rowData.qualification).trim() === '') {
    errors.push({ field: 'qualification', message: 'Qualification is required' });
  }

  // Date validation
  if (rowData.joiningDate) {
    const parsedDate = validateDate(rowData.joiningDate);
    if (!parsedDate) {
      warnings.push({ field: 'joiningDate', message: 'Invalid date format. Use DD-MM-YYYY' });
    }
  }

  // Database validations (check duplicates) - ALL ARE ERRORS NOW
  if (rowData.email && validateEmail(rowData.email)) {
    const existingUser = await prisma.user.findUnique({
      where: { email: rowData.email }
    });
    if (existingUser) {
      errors.push({ field: 'email', message: 'Email already exists in database' });
    }
  }

  if (rowData.phone) {
    const existingPhone = await prisma.user.findFirst({
      where: {
        phone: String(rowData.phone).trim(),
        institutionId: institutionId
      }
    });
    if (existingPhone) {
      errors.push({ field: 'phone', message: 'Phone number already exists in database' });
    }
  }

  if (rowData.employeeId) {
    // Check the appropriate faculty profile model based on institution type
    let existingFaculty = null;
    if (institutionType === 'SCHOOL') {
      existingFaculty = await prisma.facultySchoolProfile.findFirst({
        where: {
          employeeId: String(rowData.employeeId).trim(),
          user: { institutionId }
        }
      });
    } else if (institutionType === 'COLLEGE') {
      existingFaculty = await prisma.facultyCollegeProfile.findFirst({
        where: {
          employeeId: String(rowData.employeeId).trim(),
          user: { institutionId }
        }
      });
    }

    if (existingFaculty) {
      errors.push({ field: 'employeeId', message: 'Employee ID already exists in database' });
    }
  }

  return { errors, warnings };
}

/**
 * Validate a single row of student data
 */
async function validateStudentRow(rowData, rowIndex, institutionId, institutionType) {
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

  // Database validations - ALL ARE ERRORS NOW
  if (rowData.email && validateEmail(rowData.email)) {
    const existingUser = await prisma.user.findUnique({
      where: { email: rowData.email }
    });
    if (existingUser) {
      errors.push({ field: 'email', message: 'Email already exists in database' });
    }
  }

  if (rowData.phone) {
    const existingPhone = await prisma.user.findFirst({
      where: {
        phone: String(rowData.phone).trim(),
        institutionId: institutionId
      }
    });
    if (existingPhone) {
      errors.push({ field: 'phone', message: 'Phone number already exists in database' });
    }
  }

  if (rowData.rollNumber) {
    // Check the appropriate student profile model based on institution type
    let existingStudent = null;
    if (institutionType === 'SCHOOL') {
      existingStudent = await prisma.studentSchoolProfile.findFirst({
        where: {
          rollNo: String(rowData.rollNumber).trim(),
          user: { institutionId }
        }
      });
    } else if (institutionType === 'COLLEGE') {
      existingStudent = await prisma.studentCollegeProfile.findFirst({
        where: {
          regNo: String(rowData.rollNumber).trim(),
          user: { institutionId }
        }
      });
    }

    if (existingStudent) {
      errors.push({ field: 'rollNumber', message: 'Roll Number already exists in database' });
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
    const institutionType = req.user.institution?.type;

    if (!institutionId || !institutionType) {
      return res.status(400).json({
        success: false,
        message: 'Institution information not found. Please ensure you are logged in as an admin.'
      });
    }

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
        ? await validateFacultyRow(rowData, rowIndex, institutionId, institutionType)
        : await validateStudentRow(rowData, rowIndex, institutionId, institutionType);

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

    // Check for duplicates within the Excel file
    const emailMap = new Map();
    const phoneMap = new Map();
    const employeeIdMap = new Map();
    const rollNumberMap = new Map();

    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      const validation = validationResults[i];

      // Check duplicate emails within file
      if (row.data.email) {
        const email = row.data.email.toLowerCase().trim();
        if (emailMap.has(email)) {
          const duplicateRows = emailMap.get(email);
          duplicateRows.push(row.rowIndex);
          emailMap.set(email, duplicateRows);

          // Add error to current row and all previous duplicates
          validation.errors.push({
            field: 'email',
            message: `Duplicate email in Excel file (also in rows: ${duplicateRows.filter(r => r !== row.rowIndex).join(', ')})`
          });
          row.hasErrors = true;

          // Also update previous rows with same email
          for (const prevRowIndex of duplicateRows.filter(r => r !== row.rowIndex)) {
            const prevIdx = parsedRows.findIndex(r => r.rowIndex === prevRowIndex);
            if (prevIdx >= 0) {
              const prevValidation = validationResults[prevIdx];
              // Check if error already exists
              const hasError = prevValidation.errors.some(e => e.field === 'email' && e.message.includes('Duplicate email'));
              if (!hasError) {
                prevValidation.errors.push({
                  field: 'email',
                  message: `Duplicate email in Excel file (also in rows: ${duplicateRows.filter(r => r !== prevRowIndex).join(', ')})`
                });
                parsedRows[prevIdx].hasErrors = true;
              }
            }
          }
        } else {
          emailMap.set(email, [row.rowIndex]);
        }
      }

      // Check duplicate phone numbers within file
      if (row.data.phone) {
        const phone = String(row.data.phone).trim();
        if (phoneMap.has(phone)) {
          const duplicateRows = phoneMap.get(phone);
          duplicateRows.push(row.rowIndex);
          phoneMap.set(phone, duplicateRows);

          validation.errors.push({
            field: 'phone',
            message: `Duplicate phone number in Excel file (also in rows: ${duplicateRows.filter(r => r !== row.rowIndex).join(', ')})`
          });
          row.hasErrors = true;

          // Also update previous rows
          for (const prevRowIndex of duplicateRows.filter(r => r !== row.rowIndex)) {
            const prevIdx = parsedRows.findIndex(r => r.rowIndex === prevRowIndex);
            if (prevIdx >= 0) {
              const prevValidation = validationResults[prevIdx];
              const hasError = prevValidation.errors.some(e => e.field === 'phone' && e.message.includes('Duplicate phone'));
              if (!hasError) {
                prevValidation.errors.push({
                  field: 'phone',
                  message: `Duplicate phone number in Excel file (also in rows: ${duplicateRows.filter(r => r !== prevRowIndex).join(', ')})`
                });
                parsedRows[prevIdx].hasErrors = true;
              }
            }
          }
        } else {
          phoneMap.set(phone, [row.rowIndex]);
        }
      }

      // Check duplicate employee IDs within file (for faculty)
      if (type === 'faculty' && row.data.employeeId) {
        const employeeId = String(row.data.employeeId).trim();
        if (employeeIdMap.has(employeeId)) {
          const duplicateRows = employeeIdMap.get(employeeId);
          duplicateRows.push(row.rowIndex);
          employeeIdMap.set(employeeId, duplicateRows);

          validation.errors.push({
            field: 'employeeId',
            message: `Duplicate employee ID in Excel file (also in rows: ${duplicateRows.filter(r => r !== row.rowIndex).join(', ')})`
          });
          row.hasErrors = true;

          // Also update previous rows
          for (const prevRowIndex of duplicateRows.filter(r => r !== row.rowIndex)) {
            const prevIdx = parsedRows.findIndex(r => r.rowIndex === prevRowIndex);
            if (prevIdx >= 0) {
              const prevValidation = validationResults[prevIdx];
              const hasError = prevValidation.errors.some(e => e.field === 'employeeId' && e.message.includes('Duplicate employee ID'));
              if (!hasError) {
                prevValidation.errors.push({
                  field: 'employeeId',
                  message: `Duplicate employee ID in Excel file (also in rows: ${duplicateRows.filter(r => r !== prevRowIndex).join(', ')})`
                });
                parsedRows[prevIdx].hasErrors = true;
              }
            }
          }
        } else {
          employeeIdMap.set(employeeId, [row.rowIndex]);
        }
      }

      // Check duplicate roll numbers within file (for students)
      if (type === 'student' && row.data.rollNumber) {
        const rollNumber = String(row.data.rollNumber).trim();
        if (rollNumberMap.has(rollNumber)) {
          const duplicateRows = rollNumberMap.get(rollNumber);
          duplicateRows.push(row.rowIndex);
          rollNumberMap.set(rollNumber, duplicateRows);

          validation.errors.push({
            field: 'rollNumber',
            message: `Duplicate roll number in Excel file (also in rows: ${duplicateRows.filter(r => r !== row.rowIndex).join(', ')})`
          });
          row.hasErrors = true;

          // Also update previous rows
          for (const prevRowIndex of duplicateRows.filter(r => r !== row.rowIndex)) {
            const prevIdx = parsedRows.findIndex(r => r.rowIndex === prevRowIndex);
            if (prevIdx >= 0) {
              const prevValidation = validationResults[prevIdx];
              const hasError = prevValidation.errors.some(e => e.field === 'rollNumber' && e.message.includes('Duplicate roll number'));
              if (!hasError) {
                prevValidation.errors.push({
                  field: 'rollNumber',
                  message: `Duplicate roll number in Excel file (also in rows: ${duplicateRows.filter(r => r !== prevRowIndex).join(', ')})`
                });
                parsedRows[prevIdx].hasErrors = true;
              }
            }
          }
        } else {
          rollNumberMap.set(rollNumber, [row.rowIndex]);
        }
      }
    }

    // Recalculate statistics after duplicate check
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

/**
 * Import Faculty/Students to Database
 * POST /api/admin/import/save
 */
async function saveImportData(req, res) {
  try {
    const { type, rows } = req.body; // rows = array of valid row data
    const institutionId = req.user.institutionId;
    const institutionType = req.user.institution?.type;

    if (!institutionId || !institutionType) {
      return res.status(400).json({
        success: false,
        message: 'Institution information not found'
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No data provided for import'
      });
    }

    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: []
    };

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const rowData = rows[i];

      try {
        if (type === 'faculty') {
          await importFacultyRecord(rowData, institutionId, institutionType, req.user.institution, results);
        } else if (type === 'student') {
          await importStudentRecord(rowData, institutionId, institutionType, req.user.institution, results);
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          data: rowData,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Import completed: ${results.created} created, ${results.updated} updated, ${results.failed} failed`,
      results
    });

  } catch (error) {
    console.error('Save import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save import data',
      error: error.message
    });
  }
}

/**
 * Import a single faculty record (upsert)
 */
async function importFacultyRecord(rowData, institutionId, institutionType, institution, results) {
  const bcrypt = require('bcrypt');

  // Generate default password using helper function
  const defaultPassword = generateDefaultPassword(rowData.fullName, rowData.phone);
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Parse joining date if provided
  let joiningDate = null;
  if (rowData.joiningDate) {
    const parsed = validateDate(rowData.joiningDate);
    if (parsed) {
      joiningDate = parsed;
    }
  }

  // Check if user exists by email
  const existingUser = await prisma.user.findUnique({
    where: { email: rowData.email },
    include: {
      facultySchoolProfile: true,
      facultyCollegeProfile: true
    }
  });

  if (existingUser) {
    // Update existing user
    const updateData = {
      fullName: rowData.fullName,
      phone: String(rowData.phone),
    };

    // Update the appropriate faculty profile based on institution type
    if (institutionType === 'SCHOOL') {
      updateData.facultySchoolProfile = {
        upsert: {
          create: {
            institutionType: 'SCHOOL',
            schoolName: institution.name,
            employeeId: String(rowData.employeeId),
            department: rowData.department,
            qualification: rowData.qualification,
          },
          update: {
            employeeId: String(rowData.employeeId),
            department: rowData.department,
            qualification: rowData.qualification,
          }
        }
      };
    } else {
      updateData.facultyCollegeProfile = {
        upsert: {
          create: {
            institutionType: 'COLLEGE',
            collegeName: institution.name,
            employeeId: String(rowData.employeeId),
            department: rowData.department,
            designation: rowData.designation,
            qualification: rowData.qualification,
          },
          update: {
            employeeId: String(rowData.employeeId),
            department: rowData.department,
            designation: rowData.designation,
            qualification: rowData.qualification,
          }
        }
      };
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: updateData
    });
    results.updated++;
  } else {
    // Create new user
    // Generate public ID
    const publicId = await getNextSequenceId('user');

    const createData = {
      publicId,
      email: rowData.email,
      password: hashedPassword,
      fullName: rowData.fullName,
      phone: String(rowData.phone),
      roleType: 'FACULTY',
      institutionId: institutionId,
    };

    // Create the appropriate faculty profile based on institution type
    if (institutionType === 'SCHOOL') {
      createData.facultySchoolProfile = {
        create: {
          institutionType: 'SCHOOL',
          schoolName: institution.name,
          employeeId: String(rowData.employeeId),
          department: rowData.department,
          qualification: rowData.qualification,
        }
      };
    } else {
      createData.facultyCollegeProfile = {
        create: {
          institutionType: 'COLLEGE',
          collegeName: institution.name,
          employeeId: String(rowData.employeeId),
          department: rowData.department,
          designation: rowData.designation,
          qualification: rowData.qualification,
        }
      };
    }

    await prisma.user.create({
      data: createData
    });
    results.created++;
  }
}

/**
 * Import a single student record (upsert)
 */
async function importStudentRecord(rowData, institutionId, institutionType, institution, results) {
  const bcrypt = require('bcrypt');

  // Generate default password using helper function
  const defaultPassword = generateDefaultPassword(rowData.fullName, rowData.phone);
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Parse date of birth
  const dob = validateDate(rowData.dateOfBirth);
  if (!dob) {
    throw new Error('Invalid date of birth format');
  }

  // Check if user exists by email
  const existingUser = await prisma.user.findUnique({
    where: { email: rowData.email },
    include: {
      studentSchoolProfile: true,
      studentCollegeProfile: true
    }
  });

  if (existingUser) {
    // Update existing user
    const updateData = {
      fullName: rowData.fullName,
      phone: String(rowData.phone),
    };

    // Update the appropriate student profile based on institution type
    if (institutionType === 'SCHOOL') {
      updateData.studentSchoolProfile = {
        upsert: {
          create: {
            institutionType: 'SCHOOL',
            schoolName: institution.name,
            board: rowData.board || 'Not Specified',
            class: rowData.class,
            section: rowData.section,
            rollNo: String(rowData.rollNumber),
            dob: dob,
          },
          update: {
            board: rowData.board || 'Not Specified',
            class: rowData.class,
            section: rowData.section,
            rollNo: String(rowData.rollNumber),
            dob: dob,
          }
        }
      };
    } else {
      updateData.studentCollegeProfile = {
        upsert: {
          create: {
            institutionType: 'COLLEGE',
            collegeName: institution.name,
            department: rowData.department || 'General',
            yearOfStudy: rowData.yearOfStudy ? parseInt(rowData.yearOfStudy) : 1,
            semester: rowData.semester ? parseInt(rowData.semester) : 1,
            regNo: String(rowData.rollNumber),
          },
          update: {
            department: rowData.department || 'General',
            yearOfStudy: rowData.yearOfStudy ? parseInt(rowData.yearOfStudy) : 1,
            semester: rowData.semester ? parseInt(rowData.semester) : 1,
            regNo: String(rowData.rollNumber),
          }
        }
      };
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: updateData
    });
    results.updated++;
  } else {
    // Create new user
    // Generate public ID
    const publicId = await getNextSequenceId('user');

    const createData = {
      publicId,
      email: rowData.email,
      password: hashedPassword,
      fullName: rowData.fullName,
      phone: String(rowData.phone),
      roleType: 'STUDENT',
      institutionId: institutionId,
    };

    // Create the appropriate student profile based on institution type
    if (institutionType === 'SCHOOL') {
      createData.studentSchoolProfile = {
        create: {
          institutionType: 'SCHOOL',
          schoolName: institution.name,
          board: rowData.board || 'Not Specified',
          class: rowData.class,
          section: rowData.section,
          rollNo: String(rowData.rollNumber),
          dob: dob,
        }
      };
    } else {
      createData.studentCollegeProfile = {
        create: {
          institutionType: 'COLLEGE',
          collegeName: institution.name,
          department: rowData.department || 'General',
          yearOfStudy: rowData.yearOfStudy ? parseInt(rowData.yearOfStudy) : 1,
          semester: rowData.semester ? parseInt(rowData.semester) : 1,
          regNo: String(rowData.rollNumber),
        }
      };
    }

    await prisma.user.create({
      data: createData
    });
    results.created++;
  }
}

module.exports = {
  generateFacultyTemplate,
  generateStudentTemplate,
  parseAndValidateFile,
  saveImportData,
};
