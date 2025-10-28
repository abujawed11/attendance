/**
 * Comprehensive Test Runner for Student Import/Add Functionality
 *
 * This script tests all possible error scenarios and edge cases
 * Run: node tests/student-import-test-runner.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function logTest(testName, passed, details = '') {
  if (passed) {
    testResults.passed++;
    log(`✓ ${testName}`, 'green');
  } else {
    testResults.failed++;
    log(`✗ ${testName}`, 'red');
    if (details) log(`  ${details}`, 'yellow');
    testResults.errors.push({ test: testName, details });
  }
}

// ========================
// VALIDATION FUNCTIONS (from import.controller.js)
// ========================

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

  if (typeof dateStr === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + dateStr * 24 * 60 * 60 * 1000);
    date.setHours(12, 0, 0, 0);
    return date;
  }

  const dateString = String(dateStr).trim();
  const parts = dateString.split(/[-\/]/);
  if (parts.length !== 3) return null;

  let day, month, year;
  const part0 = parseInt(parts[0], 10);
  const part1 = parseInt(parts[1], 10);
  const part2 = parseInt(parts[2], 10);

  if (isNaN(part0) || isNaN(part1) || isNaN(part2)) return null;

  if (part0 > 31 || part0.toString().length === 4) {
    year = part0;
    month = part1;
    day = part2;
  } else if (part2 > 31 || part2.toString().length === 4) {
    day = part0;
    month = part1;
    year = part2;
  } else {
    day = part0;
    month = part1;
    year = part2;
  }

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  let fullYear = year;
  if (year < 100) {
    fullYear = 2000 + year;
  }

  if (fullYear < 1900 || fullYear > 2100) return null;

  const date = new Date(fullYear, month - 1, day, 12, 0, 0, 0);
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== fullYear) {
    return null;
  }

  return date;
}

async function validateStudentRow(rowData, rowIndex, institutionId, institutionType) {
  const errors = [];
  const warnings = [];

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
    if (!rowData.class || String(rowData.class).trim() === '') {
      errors.push({ field: 'class', message: 'Class is required' });
    }

    if (!rowData.section || String(rowData.section).trim() === '') {
      errors.push({ field: 'section', message: 'Section is required' });
    }

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

    // Database checks
    if (rowData.parentEmail && validateEmail(rowData.parentEmail)) {
      const existingParentByEmail = await prisma.user.findUnique({
        where: { email: rowData.parentEmail }
      });

      if (existingParentByEmail) {
        if (existingParentByEmail.phone && existingParentByEmail.phone !== String(rowData.parentPhone).trim()) {
          errors.push({
            field: 'parentEmail',
            message: `Parent email already exists with different phone number (${existingParentByEmail.phone})`
          });
        }
      }
    }

    if (rowData.parentPhone && validatePhone(rowData.parentPhone)) {
      const existingParentByPhone = await prisma.user.findUnique({
        where: { phone: String(rowData.parentPhone).trim() }
      });

      if (existingParentByPhone) {
        if (existingParentByPhone.email && existingParentByPhone.email !== rowData.parentEmail.trim()) {
          errors.push({
            field: 'parentPhone',
            message: `Parent phone already exists with different email (${existingParentByPhone.email})`
          });
        }
      }
    }

  } else if (institutionType === 'COLLEGE') {
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

    // Database checks
    if (rowData.email && validateEmail(rowData.email)) {
      const existingUser = await prisma.user.findUnique({
        where: { email: rowData.email }
      });
      if (existingUser) {
        errors.push({ field: 'email', message: 'Email already exists in database' });
      }
    }

    if (rowData.phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: String(rowData.phone).trim() }
      });
      if (existingPhone) {
        errors.push({ field: 'phone', message: 'Phone number already exists in database' });
      }
    }
  }

  // Check roll number
  if (rowData.rollNumber) {
    let existingStudent = null;
    if (institutionType === 'SCHOOL') {
      const whereCondition = {
        rollNo: String(rowData.rollNumber).trim(),
        user: { institutionId }
      };

      if (rowData.class && rowData.section) {
        whereCondition.class = String(rowData.class).trim();
        whereCondition.section = String(rowData.section).trim();
      }

      existingStudent = await prisma.studentSchoolProfile.findFirst({
        where: whereCondition
      });

      if (existingStudent) {
        errors.push({ field: 'rollNumber', message: `Roll Number ${rowData.rollNumber} already exists in Class ${rowData.class}, Section ${rowData.section}` });
      }
    } else if (institutionType === 'COLLEGE') {
      existingStudent = await prisma.studentCollegeProfile.findFirst({
        where: {
          regNo: String(rowData.rollNumber).trim(),
          user: { institutionId }
        }
      });

      if (existingStudent) {
        errors.push({ field: 'rollNumber', message: 'Registration Number already exists in database' });
      }
    }
  }

  return { errors, warnings };
}

// ========================
// TEST DATA
// ========================

const TEST_INSTITUTION_ID = 8; // Update with your test institution ID

const validSchoolStudent = {
  fullName: 'Test Student One',
  rollNumber: 'TEST001',
  dateOfBirth: '15-01-2008',
  class: '10',
  section: 'A',
  parentName: 'Test Parent',
  parentEmail: 'testparent@test.com',
  parentPhone: '9876543210'
};

const validCollegeStudent = {
  fullName: 'Test College Student',
  email: 'testcollege@student.com',
  phone: '9876543211',
  dateOfBirth: '10-03-2003',
  rollNumber: 'CSE2023TEST',
  department: 'Computer Science',
  yearOfStudy: '2',
  semester: '4'
};

// ========================
// TEST SUITES
// ========================

async function testSchoolStudentValidation() {
  log('\n=== SCHOOL STUDENT VALIDATION TESTS ===', 'cyan');

  // Test 1: Valid student
  let result = await validateStudentRow(validSchoolStudent, 1, TEST_INSTITUTION_ID, 'SCHOOL');
  logTest('Valid school student data', result.errors.length === 0);

  // Test 2: Missing full name
  result = await validateStudentRow({ ...validSchoolStudent, fullName: '' }, 1, TEST_INSTITUTION_ID, 'SCHOOL');
  logTest('Missing full name detected', result.errors.some(e => e.field === 'fullName'));

  // Test 3: Missing roll number
  result = await validateStudentRow({ ...validSchoolStudent, rollNumber: '' }, 1, TEST_INSTITUTION_ID, 'SCHOOL');
  logTest('Missing roll number detected', result.errors.some(e => e.field === 'rollNumber'));

  // Test 4: Invalid date format
  result = await validateStudentRow({ ...validSchoolStudent, dateOfBirth: 'invalid' }, 1, TEST_INSTITUTION_ID, 'SCHOOL');
  logTest('Invalid date format detected', result.errors.some(e => e.field === 'dateOfBirth'));

  // Test 5: Missing class
  result = await validateStudentRow({ ...validSchoolStudent, class: '' }, 1, TEST_INSTITUTION_ID, 'SCHOOL');
  logTest('Missing class detected', result.errors.some(e => e.field === 'class'));

  // Test 6: Missing section
  result = await validateStudentRow({ ...validSchoolStudent, section: '' }, 1, TEST_INSTITUTION_ID, 'SCHOOL');
  logTest('Missing section detected', result.errors.some(e => e.field === 'section'));

  // Test 7: Invalid parent email
  result = await validateStudentRow({ ...validSchoolStudent, parentEmail: 'invalid-email' }, 1, TEST_INSTITUTION_ID, 'SCHOOL');
  logTest('Invalid parent email detected', result.errors.some(e => e.field === 'parentEmail'));

  // Test 8: Invalid parent phone
  result = await validateStudentRow({ ...validSchoolStudent, parentPhone: '123' }, 1, TEST_INSTITUTION_ID, 'SCHOOL');
  logTest('Invalid parent phone detected', result.errors.some(e => e.field === 'parentPhone'));

  // Test 9: Parent phone with spaces (should pass after trimming)
  result = await validateStudentRow({ ...validSchoolStudent, parentPhone: '98765 43210' }, 1, TEST_INSTITUTION_ID, 'SCHOOL');
  logTest('Parent phone with spaces handled', result.errors.length === 0);
}

async function testCollegeStudentValidation() {
  log('\n=== COLLEGE STUDENT VALIDATION TESTS ===', 'cyan');

  // Test 1: Valid student
  let result = await validateStudentRow(validCollegeStudent, 1, TEST_INSTITUTION_ID, 'COLLEGE');
  logTest('Valid college student data', result.errors.length === 0);

  // Test 2: Missing email
  result = await validateStudentRow({ ...validCollegeStudent, email: '' }, 1, TEST_INSTITUTION_ID, 'COLLEGE');
  logTest('Missing email detected', result.errors.some(e => e.field === 'email'));

  // Test 3: Invalid email format
  result = await validateStudentRow({ ...validCollegeStudent, email: 'invalid@' }, 1, TEST_INSTITUTION_ID, 'COLLEGE');
  logTest('Invalid email format detected', result.errors.some(e => e.field === 'email'));

  // Test 4: Missing phone
  result = await validateStudentRow({ ...validCollegeStudent, phone: '' }, 1, TEST_INSTITUTION_ID, 'COLLEGE');
  logTest('Missing phone detected', result.errors.some(e => e.field === 'phone'));

  // Test 5: Invalid phone
  result = await validateStudentRow({ ...validCollegeStudent, phone: '12345' }, 1, TEST_INSTITUTION_ID, 'COLLEGE');
  logTest('Invalid phone detected', result.errors.some(e => e.field === 'phone'));

  // Test 6: Missing department
  result = await validateStudentRow({ ...validCollegeStudent, department: '' }, 1, TEST_INSTITUTION_ID, 'COLLEGE');
  logTest('Missing department detected', result.errors.some(e => e.field === 'department'));

  // Test 7: Missing year of study
  result = await validateStudentRow({ ...validCollegeStudent, yearOfStudy: '' }, 1, TEST_INSTITUTION_ID, 'COLLEGE');
  logTest('Missing year of study detected', result.errors.some(e => e.field === 'yearOfStudy'));

  // Test 8: Missing semester
  result = await validateStudentRow({ ...validCollegeStudent, semester: '' }, 1, TEST_INSTITUTION_ID, 'COLLEGE');
  logTest('Missing semester detected', result.errors.some(e => e.field === 'semester'));
}

async function testDateValidation() {
  log('\n=== DATE FORMAT VALIDATION TESTS ===', 'cyan');

  // Test various valid date formats
  const validFormats = [
    '15-01-2008',
    '15/01/2008',
    '5-9-2008',
    '09-05-2008',
    '2008-01-15'
  ];

  for (const dateStr of validFormats) {
    const parsed = validateDate(dateStr);
    logTest(`Date format "${dateStr}" parsed correctly`, parsed !== null, parsed ? parsed.toDateString() : 'Failed');
  }

  // Test invalid date formats
  const invalidFormats = [
    'invalid',
    '30-02-2008', // Feb 30 doesn't exist
    '13-15-2008', // Month 13 doesn't exist
    '32-01-2008', // Day 32 doesn't exist
    '',
    null
  ];

  for (const dateStr of invalidFormats) {
    const parsed = validateDate(dateStr);
    logTest(`Invalid date "${dateStr}" rejected`, parsed === null);
  }

  // Test Excel serial dates
  const excelDate = 39448; // Excel serial for 2008-01-01
  const parsed = validateDate(excelDate);
  logTest('Excel serial date parsed correctly', parsed !== null);
}

async function testEmailValidation() {
  log('\n=== EMAIL VALIDATION TESTS ===', 'cyan');

  const validEmails = [
    'test@example.com',
    'user.name@example.co.uk',
    'user+tag@example.com',
    'test123@test-domain.com'
  ];

  const invalidEmails = [
    'invalid',
    'invalid@',
    '@invalid.com',
    'invalid@.com',
    'invalid.com',
    ''
  ];

  for (const email of validEmails) {
    logTest(`Valid email "${email}" accepted`, validateEmail(email));
  }

  for (const email of invalidEmails) {
    logTest(`Invalid email "${email}" rejected`, !validateEmail(email));
  }
}

async function testPhoneValidation() {
  log('\n=== PHONE VALIDATION TESTS ===', 'cyan');

  const validPhones = [
    '9876543210',
    '1234567890',
    ' 9876543210 ', // with spaces (should pass after trim)
    '98765 43210' // with space in middle (should pass after removing spaces)
  ];

  const invalidPhones = [
    '123',
    '12345678901', // 11 digits
    'abcdefghij',
    '',
    '987654321' // 9 digits
  ];

  for (const phone of validPhones) {
    logTest(`Valid phone "${phone}" accepted`, validatePhone(phone));
  }

  for (const phone of invalidPhones) {
    logTest(`Invalid phone "${phone}" rejected`, !validatePhone(phone));
  }
}

async function testEdgeCases() {
  log('\n=== EDGE CASE TESTS ===', 'cyan');

  // Test 1: Very long name
  let result = await validateStudentRow(
    { ...validSchoolStudent, fullName: 'A'.repeat(200) },
    1,
    TEST_INSTITUTION_ID,
    'SCHOOL'
  );
  logTest('Very long name accepted', result.errors.length === 0);

  // Test 2: Name with special characters
  result = await validateStudentRow(
    { ...validSchoolStudent, fullName: "O'Brien-Smith Jr." },
    1,
    TEST_INSTITUTION_ID,
    'SCHOOL'
  );
  logTest('Name with special characters accepted', result.errors.length === 0);

  // Test 3: Single character name
  result = await validateStudentRow(
    { ...validSchoolStudent, fullName: 'A' },
    1,
    TEST_INSTITUTION_ID,
    'SCHOOL'
  );
  logTest('Single character name accepted', result.errors.length === 0);

  // Test 4: Name with multiple spaces
  result = await validateStudentRow(
    { ...validSchoolStudent, fullName: 'First   Middle   Last' },
    1,
    TEST_INSTITUTION_ID,
    'SCHOOL'
  );
  logTest('Name with multiple spaces accepted', result.errors.length === 0);

  // Test 5: Roll number with special characters
  result = await validateStudentRow(
    { ...validSchoolStudent, rollNumber: '10A-001/2024' },
    1,
    TEST_INSTITUTION_ID,
    'SCHOOL'
  );
  logTest('Roll number with special characters accepted', result.errors.length === 0);
}

// ========================
// MAIN TEST RUNNER
// ========================

async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║   STUDENT IMPORT COMPREHENSIVE TEST SUITE             ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  try {
    await testSchoolStudentValidation();
    await testCollegeStudentValidation();
    await testDateValidation();
    await testEmailValidation();
    await testPhoneValidation();
    await testEdgeCases();

    // Summary
    log('\n' + '═'.repeat(60), 'blue');
    log('TEST SUMMARY', 'blue');
    log('═'.repeat(60), 'blue');
    log(`Total Tests: ${testResults.passed + testResults.failed}`);
    log(`Passed: ${testResults.passed}`, 'green');
    log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
    log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`,
      testResults.failed === 0 ? 'green' : 'yellow');

    if (testResults.failed > 0) {
      log('\n❌ FAILED TESTS:', 'red');
      testResults.errors.forEach((err, i) => {
        log(`${i + 1}. ${err.test}`, 'red');
        if (err.details) log(`   ${err.details}`, 'yellow');
      });
    } else {
      log('\n✅ ALL TESTS PASSED!', 'green');
    }

  } catch (error) {
    log('\n❌ ERROR RUNNING TESTS:', 'red');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
runAllTests();
