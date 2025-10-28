/**
 * Generate Test Excel Files for Student Import Testing
 *
 * This script creates various Excel files with different test scenarios
 * Run: node tests/generate-test-excel-files.js
 */

const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Create tests output directory
const outputDir = path.join(__dirname, 'test-excel-files');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('📂 Creating test Excel files in:', outputDir);

// Helper function to generate unique phone numbers with a prefix
// Using 7XXXXX prefix for test data to avoid conflicts
const phoneCounter = { value: 1000 };
function generateTestPhone() {
  return `7${String(phoneCounter.value++).padStart(9, '0')}`;
}

// Helper to generate unique test email
function generateTestEmail(name, suffix = '') {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  const timestamp = Date.now();
  return `${cleanName}.test${suffix}${timestamp}@testdata.com`;
}

// ========================
// SCHOOL STUDENT TEST FILES
// ========================

function createValidSchoolStudents() {
  const parentPhone1 = generateTestPhone();
  const parentPhone2 = generateTestPhone();
  const parentPhone3 = generateTestPhone();

  const data = [
    ['Full Name*', 'Roll Number*', 'Date of Birth*', 'Class*', 'Section*', 'Parent Name*', 'Parent Email*', 'Parent Phone*'],
    ['Alice Johnson', '10A001', '15-01-2008', '10', 'A', 'Robert Johnson', generateTestEmail('robert.johnson', '1'), parentPhone1],
    ['Bob Smith', '10A002', '20-02-2008', '10', 'A', 'Mary Smith', generateTestEmail('mary.smith', '2'), parentPhone2],
    ['Charlie Brown', '10B001', '10-03-2008', '10', 'B', 'David Brown', generateTestEmail('david.brown', '3'), parentPhone3],
    // Siblings with same parent (same email and phone as row 1)
    ['Diana Johnson', '10A003', '15-01-2009', '10', 'A', 'Robert Johnson', generateTestEmail('robert.johnson', '1'), parentPhone1],
  ];

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, 'Student Data');
  xlsx.writeFile(wb, path.join(outputDir, '1_valid_school_students.xlsx'));
  console.log('✓ Created: 1_valid_school_students.xlsx');
}

function createSchoolStudentsMissingFields() {
  const data = [
    ['Full Name*', 'Roll Number*', 'Date of Birth*', 'Class*', 'Section*', 'Parent Name*', 'Parent Email*', 'Parent Phone*'],
    ['Alice Johnson', '', '15-01-2008', '10', 'A', 'Robert Johnson', generateTestEmail('missing.test', '1'), generateTestPhone()], // Missing roll
    ['', '10A002', '20-02-2008', '10', 'A', 'Mary Smith', generateTestEmail('missing.test', '2'), generateTestPhone()], // Missing name
    ['Charlie Brown', '10B001', '', '10', 'B', 'David Brown', generateTestEmail('missing.test', '3'), generateTestPhone()], // Missing DOB
    ['Diana Test', '10A003', '15-01-2009', '', 'A', 'Test Parent', generateTestEmail('missing.test', '4'), generateTestPhone()], // Missing class
    ['Emma Test', '10A004', '15-01-2009', '10', '', 'Test Parent 2', generateTestEmail('missing.test', '5'), generateTestPhone()], // Missing section
    ['Frank Test', '10A005', '15-01-2009', '10', 'A', '', generateTestEmail('missing.test', '6'), generateTestPhone()], // Missing parent name
    ['George Test', '10A006', '15-01-2009', '10', 'A', 'Test Parent 4', '', generateTestPhone()], // Missing parent email
    ['Henry Test', '10A007', '15-01-2009', '10', 'A', 'Test Parent 5', generateTestEmail('missing.test', '8'), ''], // Missing parent phone
  ];

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, 'Student Data');
  xlsx.writeFile(wb, path.join(outputDir, '2_school_missing_fields.xlsx'));
  console.log('✓ Created: 2_school_missing_fields.xlsx (8 errors expected)');
}

function createSchoolStudentsInvalidFormats() {
  const data = [
    ['Full Name*', 'Roll Number*', 'Date of Birth*', 'Class*', 'Section*', 'Parent Name*', 'Parent Email*', 'Parent Phone*'],
    ['Alice Johnson', '10A001', 'invalid-date', '10', 'A', 'Robert Johnson', 'robert.j@parent.com', '9876543210'], // Invalid date
    ['Bob Smith', '10A002', '20-02-2008', '10', 'A', 'Mary Smith', 'invalid-email', '9876543211'], // Invalid email
    ['Charlie Brown', '10B001', '10-03-2008', '10', 'B', 'David Brown', 'david.b@parent.com', '12345'], // Invalid phone (5 digits)
    ['Diana Test', '10A003', '30-02-2008', '10', 'A', 'Test Parent', 'test@parent.com', '98765432101'], // Invalid date (Feb 30), invalid phone (11 digits)
  ];

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, 'Student Data');
  xlsx.writeFile(wb, path.join(outputDir, '3_school_invalid_formats.xlsx'));
  console.log('✓ Created: 3_school_invalid_formats.xlsx (5 errors expected)');
}

function createSchoolStudentsDuplicates() {
  const data = [
    ['Full Name*', 'Roll Number*', 'Date of Birth*', 'Class*', 'Section*', 'Parent Name*', 'Parent Email*', 'Parent Phone*'],
    ['Alice Johnson', '10A001', '15-01-2008', '10', 'A', 'Robert Johnson', 'robert.j@parent.com', '9876543210'],
    ['Bob Smith', '10A001', '20-02-2008', '10', 'A', 'Mary Smith', 'mary.s@parent.com', '9876543211'], // Duplicate roll in same class/section
    ['Charlie Brown', '10A001', '10-03-2008', '10', 'B', 'David Brown', 'david.b@parent.com', '9876543212'], // Same roll but different section (SHOULD PASS)
    ['Diana Test', '10A002', '15-01-2009', '10', 'A', 'Test Parent', 'robert.j@parent.com', '9999999999'], // Same parent email, different phone
    ['Emma Test', '10A003', '15-01-2009', '10', 'A', 'Test Parent 2', 'different@email.com', '9876543210'], // Same parent phone, different email
  ];

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, 'Student Data');
  xlsx.writeFile(wb, path.join(outputDir, '4_school_duplicates.xlsx'));
  console.log('✓ Created: 4_school_duplicates.xlsx (3 errors expected)');
}

function createSchoolStudentsVariousDates() {
  const data = [
    ['Full Name*', 'Roll Number*', 'Date of Birth*', 'Class*', 'Section*', 'Parent Name*', 'Parent Email*', 'Parent Phone*'],
    ['Alice Test', '10A001', '15-01-2008', '10', 'A', 'Parent A', 'parenta@test.com', '9876543210'], // DD-MM-YYYY
    ['Bob Test', '10A002', '5/9/2008', '10', 'A', 'Parent B', 'parentb@test.com', '9876543211'], // D/M/YYYY
    ['Charlie Test', '10A003', '2008-03-15', '10', 'A', 'Parent C', 'parentc@test.com', '9876543212'], // YYYY-MM-DD
    ['Diana Test', '10A004', '09/05/2008', '10', 'A', 'Parent D', 'parentd@test.com', '9876543213'], // DD/MM/YYYY with leading zeros
    ['Emma Test', '10A005', '5-9-08', '10', 'A', 'Parent E', 'parente@test.com', '9876543214'], // D-M-YY (two-digit year)
  ];

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, 'Student Data');
  xlsx.writeFile(wb, path.join(outputDir, '5_school_various_date_formats.xlsx'));
  console.log('✓ Created: 5_school_various_date_formats.xlsx (all should pass)');
}

// ========================
// COLLEGE STUDENT TEST FILES
// ========================

function createValidCollegeStudents() {
  const data = [
    ['Full Name*', 'Email*', 'Phone*', 'Date of Birth*', 'Roll No/Reg No*', 'Department*', 'Year of Study*', 'Semester*'],
    ['Raj Kumar', generateTestEmail('raj.kumar'), generateTestPhone(), '10-03-2003', 'CSE2023001', 'Computer Science', '2', '4'],
    ['Priya Sharma', generateTestEmail('priya.sharma'), generateTestPhone(), '15-05-2003', 'CSE2023002', 'Computer Science', '2', '4'],
    ['Amit Patel', generateTestEmail('amit.patel'), generateTestPhone(), '20-06-2004', 'ECE2023001', 'Electronics', '1', '2'],
  ];

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, 'Student Data');
  xlsx.writeFile(wb, path.join(outputDir, '6_valid_college_students.xlsx'));
  console.log('✓ Created: 6_valid_college_students.xlsx');
}

function createCollegeStudentsMissingFields() {
  const data = [
    ['Full Name*', 'Email*', 'Phone*', 'Date of Birth*', 'Roll No/Reg No*', 'Department*', 'Year of Study*', 'Semester*'],
    ['Raj Kumar', '', generateTestPhone(), '10-03-2003', 'CSE2023TEST01', 'Computer Science', '2', '4'], // Missing email
    ['Priya Sharma', generateTestEmail('missing.college', '1'), '', '15-05-2003', 'CSE2023TEST02', 'Computer Science', '2', '4'], // Missing phone
    ['Amit Patel', generateTestEmail('missing.college', '2'), generateTestPhone(), '', 'ECE2023TEST01', 'Electronics', '1', '2'], // Missing DOB
    ['Test Student', generateTestEmail('missing.college', '3'), generateTestPhone(), '20-06-2004', '', 'ECE', '1', '2'], // Missing reg no
    ['Test Student 2', generateTestEmail('missing.college', '4'), generateTestPhone(), '20-06-2004', 'ECE2023TEST02', '', '1', '2'], // Missing department
    ['Test Student 3', generateTestEmail('missing.college', '5'), generateTestPhone(), '20-06-2004', 'ECE2023TEST03', 'ECE', '', '2'], // Missing year
    ['Test Student 4', generateTestEmail('missing.college', '6'), generateTestPhone(), '20-06-2004', 'ECE2023TEST04', 'ECE', '1', ''], // Missing semester
  ];

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, 'Student Data');
  xlsx.writeFile(wb, path.join(outputDir, '7_college_missing_fields.xlsx'));
  console.log('✓ Created: 7_college_missing_fields.xlsx (7 errors expected)');
}

function createCollegeStudentsInvalidFormats() {
  const data = [
    ['Full Name*', 'Email*', 'Phone*', 'Date of Birth*', 'Roll No/Reg No*', 'Department*', 'Year of Study*', 'Semester*'],
    ['Raj Kumar', 'invalid-email', generateTestPhone(), '10-03-2003', 'CSE2023INVALID01', 'Computer Science', '2', '4'], // Invalid email
    ['Priya Sharma', generateTestEmail('invalid.college', '1'), '12345', '15-05-2003', 'CSE2023INVALID02', 'Computer Science', '2', '4'], // Invalid phone
    ['Amit Patel', generateTestEmail('invalid.college', '2'), generateTestPhone(), 'invalid-date', 'ECE2023INVALID01', 'Electronics', '1', '2'], // Invalid date
  ];

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, 'Student Data');
  xlsx.writeFile(wb, path.join(outputDir, '8_college_invalid_formats.xlsx'));
  console.log('✓ Created: 8_college_invalid_formats.xlsx (3 errors expected)');
}

function createCollegeStudentsDuplicates() {
  const email1 = generateTestEmail('dup.college', '1');
  const phone1 = generateTestPhone();

  const data = [
    ['Full Name*', 'Email*', 'Phone*', 'Date of Birth*', 'Roll No/Reg No*', 'Department*', 'Year of Study*', 'Semester*'],
    ['Raj Kumar', email1, phone1, '10-03-2003', 'CSE2023DUP01', 'Computer Science', '2', '4'],
    ['Priya Sharma', email1, generateTestPhone(), '15-05-2003', 'CSE2023DUP02', 'Computer Science', '2', '4'], // Duplicate email
    ['Amit Patel', generateTestEmail('dup.college', '2'), phone1, '20-06-2004', 'ECE2023DUP01', 'Electronics', '1', '2'], // Duplicate phone
    ['Test Student', generateTestEmail('dup.college', '3'), generateTestPhone(), '20-06-2004', 'CSE2023DUP01', 'CSE', '1', '2'], // Duplicate reg no
  ];

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, 'Student Data');
  xlsx.writeFile(wb, path.join(outputDir, '9_college_duplicates.xlsx'));
  console.log('✓ Created: 9_college_duplicates.xlsx (3 errors expected)');
}

// ========================
// EDGE CASE TEST FILES
// ========================

function createEdgeCases() {
  const data = [
    ['Full Name*', 'Roll Number*', 'Date of Birth*', 'Class*', 'Section*', 'Parent Name*', 'Parent Email*', 'Parent Phone*'],
    // Very long name
    ['A'.repeat(100) + ' Test Student', '10A001', '15-01-2008', '10', 'A', 'Robert Johnson', 'robert.j@parent.com', '9876543210'],
    // Name with special characters
    ["O'Brien-Smith Jr.", '10A002', '20-02-2008', '10', 'A', 'Mary Smith', 'mary.s@parent.com', '9876543211'],
    // Single character name
    ['A', '10A003', '10-03-2008', '10', 'A', 'David Brown', 'david.b@parent.com', '9876543212'],
    // Name with titles that should be removed for password
    ['Mr. John Doe', '10A004', '15-01-2009', '10', 'A', 'Test Parent', 'test@parent.com', '9876543213'],
    ['Dr. Jane Smith', '10A005', '15-01-2009', '10', 'A', 'Test Parent 2', 'test2@parent.com', '9876543214'],
    // Roll number with special characters
    ['Test Student', '10A-001/2024', '15-01-2009', '10', 'A', 'Test Parent 3', 'test3@parent.com', '9876543215'],
    // Phone with spaces (should be cleaned)
    ['Test Student 2', '10A006', '15-01-2009', '10', 'A', 'Test Parent 4', 'test4@parent.com', '98765 43216'],
  ];

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, 'Student Data');
  xlsx.writeFile(wb, path.join(outputDir, '10_edge_cases.xlsx'));
  console.log('✓ Created: 10_edge_cases.xlsx (all should pass)');
}

function createMixedScenarios() {
  const data = [
    ['Full Name*', 'Roll Number*', 'Date of Birth*', 'Class*', 'Section*', 'Parent Name*', 'Parent Email*', 'Parent Phone*'],
    // Row 1: Valid
    ['Valid Student 1', '10A001', '15-01-2008', '10', 'A', 'Parent One', 'parent1@test.com', '9876543210'],
    // Row 2: Missing name (ERROR)
    ['', '10A002', '20-02-2008', '10', 'A', 'Parent Two', 'parent2@test.com', '9876543211'],
    // Row 3: Valid
    ['Valid Student 2', '10A003', '10-03-2008', '10', 'A', 'Parent Three', 'parent3@test.com', '9876543212'],
    // Row 4: Invalid date (ERROR)
    ['Invalid Date Student', '10A004', 'not-a-date', '10', 'A', 'Parent Four', 'parent4@test.com', '9876543213'],
    // Row 5: Valid sibling (same parent as row 1)
    ['Valid Student 3', '10A005', '15-01-2009', '10', 'A', 'Parent One', 'parent1@test.com', '9876543210'],
    // Row 6: Invalid parent email (ERROR)
    ['Invalid Email Student', '10A006', '15-01-2008', '10', 'A', 'Parent Five', 'invalid-email', '9876543214'],
    // Row 7: Valid (same roll but different section)
    ['Valid Student 4', '10A001', '15-01-2008', '10', 'B', 'Parent Six', 'parent6@test.com', '9876543215'],
    // Row 8: Invalid phone (ERROR)
    ['Invalid Phone Student', '10A007', '15-01-2008', '10', 'A', 'Parent Seven', 'parent7@test.com', '123'],
  ];

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, 'Student Data');
  xlsx.writeFile(wb, path.join(outputDir, '11_mixed_valid_invalid.xlsx'));
  console.log('✓ Created: 11_mixed_valid_invalid.xlsx (4 errors, 4 valid rows expected)');
}

// ========================
// MAIN EXECUTION
// ========================

console.log('\n🚀 Generating test Excel files...\n');

try {
  // School student tests
  createValidSchoolStudents();
  createSchoolStudentsMissingFields();
  createSchoolStudentsInvalidFormats();
  createSchoolStudentsDuplicates();
  createSchoolStudentsVariousDates();

  // College student tests
  createValidCollegeStudents();
  createCollegeStudentsMissingFields();
  createCollegeStudentsInvalidFormats();
  createCollegeStudentsDuplicates();

  // Edge cases
  createEdgeCases();
  createMixedScenarios();

  console.log('\n✅ Successfully created all test Excel files!');
  console.log(`📁 Files saved in: ${outputDir}`);
  console.log('\n📖 Test these files by uploading them through the import wizard');

} catch (error) {
  console.error('\n❌ Error generating test files:', error);
}
