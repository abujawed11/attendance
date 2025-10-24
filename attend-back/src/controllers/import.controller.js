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
};

const STUDENT_FIELD_MAP = {
  // Common fields
  'Full Name*': 'fullName',
  'fullname': 'fullName',
  'name': 'fullName',
  'Date of Birth*': 'dateOfBirth',
  'dateofbirth': 'dateOfBirth',
  'dob': 'dateOfBirth',

  // College student fields
  'Email*': 'email',
  'email': 'email',
  'Phone*': 'phone',
  'phone': 'phone',
  'contact': 'phone',
  'Roll No/Reg No*': 'rollNumber',
  'rollno': 'rollNumber',
  'regno': 'rollNumber',
  'registration': 'rollNumber',
  'Department*': 'department',
  'department': 'department',
  'dept': 'department',
  'Year of Study*': 'yearOfStudy',
  'yearofstudy': 'yearOfStudy',
  'year': 'yearOfStudy',
  'Semester*': 'semester',
  'semester': 'semester',
  'sem': 'semester',

  // School student fields
  'Roll Number*': 'rollNumber',
  'rollnumber': 'rollNumber',
  'roll number': 'rollNumber',
  'roll': 'rollNumber',
  'Class*': 'class',
  'class': 'class',
  'Section*': 'section',
  'section': 'section',
  'Parent Name*': 'parentName',
  'parentname': 'parentName',
  'parent name': 'parentName',
  'guardian': 'parentName',
  'Parent Email*': 'parentEmail',
  'parentemail': 'parentEmail',
  'parent email': 'parentEmail',
  'Parent Phone*': 'parentPhone',
  'parentphone': 'parentPhone',
  'parent phone': 'parentPhone',

  // Legacy guardian fields (for backwards compatibility)
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
  ],
  instructions: [
    '⚠️ INSTRUCTIONS - READ CAREFULLY',
    '',
    '1. Do not modify column headers (first row)',
    '2. Fill data starting from row 3 (remove this example row)',
    '3. Fields marked with * are mandatory',
    '4. Phone: 10 digits without spaces',
    '5. Email must be unique',
    '6. Employee ID must be unique within your institution',
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
const STUDENT_SCHOOL_TEMPLATE = {
  headers: [
    'Full Name*',
    'Roll Number*',
    'Date of Birth*',
    'Class*',
    'Section*',
    'Parent Name*',
    'Parent Email*',
    'Parent Phone*',
  ],
  example: [
    'Alice Johnson',
    '10A001',
    '15-01-2008',
    '10',
    'A',
    'Robert Johnson',
    'robert.j@parent.com',
    '9876543211',
  ],
  instructions: [
    '⚠️ SCHOOL STUDENT IMPORT - INSTRUCTIONS',
    '',
    '1. Do not modify column headers (first row)',
    '2. Fill data starting from row 3 (remove this example row)',
    '3. Fields marked with * are mandatory',
    '4. Date format: DD-MM-YYYY or DD/MM/YYYY (e.g., 15-01-2008, 15/01/2008, 5-9-2008)',
    '5. Phone: 10 digits without spaces',
    '6. Roll Number must be unique within your school',
    '',
    'Field Guidelines:',
    '- Full Name: Student\'s complete name',
    '- Roll Number: Unique identifier (e.g., 10A001, 12B015)',
    '- Date of Birth: Student\'s DOB in DD-MM-YYYY format',
    '- Class: 1 to 12',
    '- Section: A, B, C, etc.',
    '- Parent Name: Primary guardian\'s full name',
    '- Parent Email: Parent/Guardian email (unique)',
    '- Parent Phone: 10-digit mobile number',
    '',
    'Note: Students will NOT have email/phone. Only parent details are required.',
    'Parent accounts will be automatically created and linked to students.',
  ],
};

const STUDENT_COLLEGE_TEMPLATE = {
  headers: [
    'Full Name*',
    'Email*',
    'Phone*',
    'Date of Birth*',
    'Roll No/Reg No*',
    'Department*',
    'Year of Study*',
    'Semester*',
  ],
  example: [
    'Raj Kumar',
    'raj.kumar@student.college.edu',
    '9876543210',
    '10-03-2003',
    'CSE2023001',
    'Computer Science',
    '2',
    '4',
  ],
  instructions: [
    '⚠️ COLLEGE STUDENT IMPORT - INSTRUCTIONS',
    '',
    '1. Do not modify column headers (first row)',
    '2. Fill data starting from row 3 (remove this example row)',
    '3. Fields marked with * are mandatory',
    '4. Date format: DD-MM-YYYY or DD/MM/YYYY (e.g., 10-03-2003, 10/03/2003)',
    '5. Phone: 10 digits without spaces',
    '6. Email must be unique',
    '7. Roll No/Reg No must be unique within your college',
    '',
    'Field Guidelines:',
    '- Full Name: Student\'s complete name',
    '- Email: Student\'s email address (will be used for login)',
    '- Phone: Student\'s 10-digit mobile number',
    '- Date of Birth: Student\'s DOB in DD-MM-YYYY format',
    '- Roll No/Reg No: University registration/roll number (unique)',
    '- Department: CSE, Mechanical, Civil, EEE, ECE, etc.',
    '- Year of Study: 1, 2, 3, or 4',
    '- Semester: 1 to 8',
    '',
    'Password Generation:',
    '- First 4 letters of FIRST NAME + Last 4 digits of phone',
    '- Example: "Raj Kumar" + "9876543210" = Password: "raj-3210"',
    '- Students should change password after first login',
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
    // Get admin's institution to determine type
    const adminUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        institution: true,
      },
    });

    if (!adminUser || !adminUser.institution) {
      return res.status(400).json({
        success: false,
        message: 'Admin institution not found',
      });
    }

    const institutionType = adminUser.institution.type; // SCHOOL or COLLEGE
    const template = institutionType === 'SCHOOL' ? STUDENT_SCHOOL_TEMPLATE : STUDENT_COLLEGE_TEMPLATE;

    // Create workbook
    const wb = xlsx.utils.book_new();

    // Create worksheet with headers
    const wsData = [
      template.headers,
      template.example,
    ];

    const ws = xlsx.utils.aoa_to_sheet(wsData);

    // Set column widths based on institution type
    if (institutionType === 'SCHOOL') {
      ws['!cols'] = [
        { wch: 20 }, // Full Name
        { wch: 15 }, // Roll Number
        { wch: 15 }, // Date of Birth
        { wch: 10 }, // Class
        { wch: 10 }, // Section
        { wch: 20 }, // Parent Name
        { wch: 30 }, // Parent Email
        { wch: 15 }, // Parent Phone
      ];

      // Format date column (column C - index 2)
      const range = xlsx.utils.decode_range(ws['!ref']);
      for (let row = 1; row <= range.e.r; row++) {
        const cellAddress = xlsx.utils.encode_cell({ r: row, c: 2 });
        if (ws[cellAddress]) {
          ws[cellAddress].z = '@'; // Text format
        }
      }
    } else {
      ws['!cols'] = [
        { wch: 20 }, // Full Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 15 }, // Date of Birth
        { wch: 20 }, // Roll No/Reg No
        { wch: 25 }, // Department
        { wch: 15 }, // Year of Study
        { wch: 10 }, // Semester
      ];

      // Format date column (column D - index 3)
      const range = xlsx.utils.decode_range(ws['!ref']);
      for (let row = 1; row <= range.e.r; row++) {
        const cellAddress = xlsx.utils.encode_cell({ r: row, c: 3 });
        if (ws[cellAddress]) {
          ws[cellAddress].z = '@'; // Text format
        }
      }
    }

    // Add to workbook
    xlsx.utils.book_append_sheet(wb, ws, 'Student Data');

    // Create instructions sheet
    const instructionsWs = xlsx.utils.aoa_to_sheet(
      template.instructions.map(line => [line])
    );
    instructionsWs['!cols'] = [{ wch: 80 }];
    xlsx.utils.book_append_sheet(wb, instructionsWs, 'Instructions');

    // Generate buffer
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Set headers
    const filename = institutionType === 'SCHOOL'
      ? 'school_student_import_template.xlsx'
      : 'college_student_import_template.xlsx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

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
    // Set time to noon to avoid timezone issues
    date.setHours(12, 0, 0, 0);
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

  // Create date at noon (12:00) to avoid timezone conversion issues
  // This prevents the date from shifting to previous day when converted to UTC
  const date = new Date(fullYear, month - 1, day, 12, 0, 0, 0);
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
 * Generate email for school student
 * Format: rollnumber@schooldomain.student.in
 * Example: 10A001@xyz.student.in (if school name is "XYZ Public School")
 */
function generateSchoolStudentEmail(rollNumber, institutionName) {
  // Clean roll number - remove spaces and special characters
  const cleanRollNo = String(rollNumber).toLowerCase().replace(/[^a-z0-9]/g, '');

  // Extract domain from institution name
  // Remove common school suffixes and get first meaningful word
  const schoolWords = institutionName
    .toLowerCase()
    .replace(/\b(public|private|school|high|senior|secondary|convent|academy|international|vidyalaya|vidyapeeth)\b/g, '')
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 2);

  // Use first word or fallback to 'school'
  const domain = schoolWords.length > 0 ? schoolWords[0] : 'school';

  // Format: rollnumber@domain.student.in
  return `${cleanRollNo}@${domain}.student.in`;
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

  // Common required fields
  if (!rowData.fullName || String(rowData.fullName).trim() === '') {
    errors.push({ field: 'fullName', message: 'Full Name is required' });
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

  if (institutionType === 'SCHOOL') {
    // School-specific validations
    if (!rowData.class || String(rowData.class).trim() === '') {
      errors.push({ field: 'class', message: 'Class is required' });
    }

    if (!rowData.section || String(rowData.section).trim() === '') {
      errors.push({ field: 'section', message: 'Section is required' });
    }

    // Parent info required for school students
    if (!rowData.parentName || String(rowData.parentName).trim() === '') {
      errors.push({ field: 'parentName', message: 'Parent Name is required' });
    }

    if (!rowData.parentEmail || String(rowData.parentEmail).trim() === '') {
      errors.push({ field: 'parentEmail', message: 'Parent Email is required' });
    } else if (!validateEmail(rowData.parentEmail)) {
      errors.push({ field: 'parentEmail', message: 'Invalid parent email format' });
    }

    if (!rowData.parentPhone) {
      errors.push({ field: 'parentPhone', message: 'Parent Phone is required' });
    } else if (!validatePhone(rowData.parentPhone)) {
      errors.push({ field: 'parentPhone', message: 'Parent phone must be 10 digits' });
    }

    // Note: Parent email and phone can be same for multiple students (siblings)
    // So we don't check for duplicates

  } else if (institutionType === 'COLLEGE') {
    // College-specific validations
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

    if (!rowData.department || String(rowData.department).trim() === '') {
      errors.push({ field: 'department', message: 'Department is required' });
    }

    if (!rowData.yearOfStudy) {
      errors.push({ field: 'yearOfStudy', message: 'Year of Study is required' });
    }

    if (!rowData.semester) {
      errors.push({ field: 'semester', message: 'Semester is required' });
    }

    // Database validations for college students
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
  }

  // Check roll number in appropriate profile
  if (rowData.rollNumber) {
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
        stats,
        institutionType: institutionType // Send institution type to frontend
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

  // Parse date of birth
  const dob = validateDate(rowData.dateOfBirth);
  if (!dob) {
    throw new Error('Invalid date of birth format');
  }

  if (institutionType === 'SCHOOL') {
    // For SCHOOL students: Create parent account and link student
    // Parent uses their email for login, student gets a generated email

    // Check if parent already exists (same parent can have multiple children)
    let parentUser = await prisma.user.findUnique({
      where: { email: rowData.parentEmail },
      include: { parentProfile: true }
    });

    if (!parentUser) {
      // Create parent user account
      const parentPassword = generateDefaultPassword(rowData.parentName, rowData.parentPhone);
      const hashedParentPassword = await bcrypt.hash(parentPassword, 10);
      const parentPublicId = await getNextSequenceId('user');

      parentUser = await prisma.user.create({
        data: {
          publicId: parentPublicId,
          email: rowData.parentEmail,
          password: hashedParentPassword,
          fullName: rowData.parentName,
          phone: String(rowData.parentPhone),
          roleType: 'PARENT',
          institutionId: institutionId,
          parentProfile: {
            create: {}
          }
        },
        include: { parentProfile: true }
      });
    }

    // Now create/update the student record (student gets auto-generated email)
    // Check if student exists by roll number
    const existingStudent = await prisma.studentSchoolProfile.findFirst({
      where: {
        rollNo: String(rowData.rollNumber),
        user: { institutionId }
      },
      include: { user: true }
    });

    if (existingStudent) {
      // Update existing student
      await prisma.user.update({
        where: { id: existingStudent.user.id },
        data: {
          fullName: rowData.fullName,
          studentSchoolProfile: {
            update: {
              board: institution.board || 'Not Specified',
              class: String(rowData.class),
              section: String(rowData.section),
              rollNo: String(rowData.rollNumber),
              dob: dob,
            }
          }
        }
      });

      // Ensure parent-student link exists
      const existingLink = await prisma.studentGuardian.findUnique({
        where: {
          parentUserId_studentUserId: {
            parentUserId: parentUser.id,
            studentUserId: existingStudent.user.id
          }
        }
      });

      if (!existingLink) {
        await prisma.studentGuardian.create({
          data: {
            parentUserId: parentUser.id,
            studentUserId: existingStudent.user.id,
            relation: 'Parent'
          }
        });
      }

      results.updated++;
    } else {
      // Create new student with generated email
      const studentPublicId = await getNextSequenceId('user');

      // Generate email for school student: rollnumber@schooldomain.student.in
      const generatedEmail = generateSchoolStudentEmail(rowData.rollNumber, institution.name);

      // Generate a default password (though school students typically won't login)
      const studentPassword = generateDefaultPassword(rowData.fullName, rowData.parentPhone);
      const hashedStudentPassword = await bcrypt.hash(studentPassword, 10);

      const studentUser = await prisma.user.create({
        data: {
          publicId: studentPublicId,
          email: generatedEmail,
          password: hashedStudentPassword,
          fullName: rowData.fullName,
          roleType: 'STUDENT',
          institutionId: institutionId,
          studentSchoolProfile: {
            create: {
              institutionType: 'SCHOOL',
              schoolName: institution.name,
              board: institution.board || 'Not Specified',
              class: String(rowData.class),
              section: String(rowData.section),
              rollNo: String(rowData.rollNumber),
              dob: dob,
            }
          }
        }
      });

      // Link student to parent
      await prisma.studentGuardian.create({
        data: {
          parentUserId: parentUser.id,
          studentUserId: studentUser.id,
          relation: 'Parent'
        }
      });

      results.created++;
    }

  } else if (institutionType === 'COLLEGE') {
    // For COLLEGE students: Create their own account with email/password
    const defaultPassword = generateDefaultPassword(rowData.fullName, rowData.phone);
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Check if user exists by email
    const existingUser = await prisma.user.findUnique({
      where: { email: rowData.email },
      include: { studentCollegeProfile: true }
    });

    if (existingUser) {
      // Update existing user
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          fullName: rowData.fullName,
          phone: String(rowData.phone),
          studentCollegeProfile: {
            upsert: {
              create: {
                institutionType: 'COLLEGE',
                collegeName: institution.name,
                department: rowData.department,
                yearOfStudy: parseInt(rowData.yearOfStudy),
                semester: parseInt(rowData.semester),
                regNo: String(rowData.rollNumber),
              },
              update: {
                department: rowData.department,
                yearOfStudy: parseInt(rowData.yearOfStudy),
                semester: parseInt(rowData.semester),
                regNo: String(rowData.rollNumber),
              }
            }
          }
        }
      });
      results.updated++;
    } else {
      // Create new college student
      const publicId = await getNextSequenceId('user');

      await prisma.user.create({
        data: {
          publicId,
          email: rowData.email,
          password: hashedPassword,
          fullName: rowData.fullName,
          phone: String(rowData.phone),
          roleType: 'STUDENT',
          institutionId: institutionId,
          studentCollegeProfile: {
            create: {
              institutionType: 'COLLEGE',
              collegeName: institution.name,
              department: rowData.department,
              yearOfStudy: parseInt(rowData.yearOfStudy),
              semester: parseInt(rowData.semester),
              regNo: String(rowData.rollNumber),
            }
          }
        }
      });
      results.created++;
    }
  }
}

module.exports = {
  generateFacultyTemplate,
  generateStudentTemplate,
  parseAndValidateFile,
  saveImportData,
};
