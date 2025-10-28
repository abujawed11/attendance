# Student Import Testing Suite

This directory contains comprehensive test cases and automated testing tools for the student import/add functionality.

## 📋 Contents

1. **student-import-test-cases.md** - Detailed documentation of all test scenarios
2. **student-import-test-runner.js** - Automated validation test runner
3. **generate-test-excel-files.js** - Excel file generator for manual testing
4. **test-excel-files/** - Directory with generated test Excel files

---

## 🚀 Quick Start

### Step 1: Run Automated Validation Tests

```bash
cd attend-back
node tests/student-import-test-runner.js
```

This will test all validation functions with various edge cases and display results.

### Step 2: Generate Test Excel Files

```bash
node tests/generate-test-excel-files.js
```

This creates 11 Excel files in `tests/test-excel-files/` directory with different test scenarios.

### Step 3: Manual Testing with Excel Files

Upload each generated Excel file through the admin panel import wizard to verify:
- Validation error detection
- Error messages are clear
- Duplicate detection works
- Various date formats are handled

---

## 📁 Generated Test Excel Files

### School Students

1. **1_valid_school_students.xlsx**
   - Status: ✅ All rows should pass
   - Contains: 4 students including siblings with shared parent

2. **2_school_missing_fields.xlsx**
   - Status: ❌ 8 errors expected
   - Tests: Missing required fields (name, roll, DOB, class, section, parent info)

3. **3_school_invalid_formats.xlsx**
   - Status: ❌ 5 errors expected
   - Tests: Invalid date, email, and phone formats

4. **4_school_duplicates.xlsx**
   - Status: ❌ 3 errors expected
   - Tests: Duplicate roll numbers, parent email/phone mismatches

5. **5_school_various_date_formats.xlsx**
   - Status: ✅ All rows should pass
   - Tests: DD-MM-YYYY, D/M/YYYY, YYYY-MM-DD, DD/MM/YYYY, D-M-YY

### College Students

6. **6_valid_college_students.xlsx**
   - Status: ✅ All rows should pass
   - Contains: 3 valid college students

7. **7_college_missing_fields.xlsx**
   - Status: ❌ 7 errors expected
   - Tests: Missing email, phone, DOB, reg no, department, year, semester

8. **8_college_invalid_formats.xlsx**
   - Status: ❌ 3 errors expected
   - Tests: Invalid email, phone, and date formats

9. **9_college_duplicates.xlsx**
   - Status: ❌ 3 errors expected
   - Tests: Duplicate emails, phones, and registration numbers

### Edge Cases

10. **10_edge_cases.xlsx**
    - Status: ✅ All rows should pass
    - Tests: Very long names, special characters, titles (Mr., Dr.), phone with spaces

11. **11_mixed_valid_invalid.xlsx**
    - Status: ⚠️ Mixed (4 valid, 4 errors)
    - Tests: Real-world scenario with mix of valid and invalid data

---

## 🧪 Test Scenarios Coverage

### P0 - Critical Tests (Must Pass)

✅ Required field validation (name, roll, DOB, etc.)
✅ Email format validation
✅ Phone format validation (10 digits)
✅ Duplicate detection within database
✅ Duplicate detection within Excel file

### P1 - High Priority

✅ Date format handling (DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, etc.)
✅ Parent account linking for siblings (school students)
✅ Parent email/phone consistency validation
✅ Roll number uniqueness (class + section for school)
✅ Cross-institution uniqueness (email, phone)

### P2 - Medium Priority

✅ Name edge cases (titles, special characters, long names)
✅ Empty row filtering
✅ Update vs create behavior (Excel vs manual add)
✅ Error message accuracy and clarity
✅ Phone number with spaces/special characters

### P3 - Nice to Have

✅ Various date formats (including Excel serial dates)
✅ Password generation correctness
✅ Email generation for school students

---

## 🔍 How to Test in Production-like Environment

### 1. Database State Testing

Before running tests, create test data in your database:

```bash
# Run seed script to create test institution and users
node scripts/seed-test-data.js
```

### 2. Upload Test Files

1. Login as admin
2. Go to Admin Panel → Import Students
3. Upload each test Excel file
4. Verify expected errors are shown
5. Fix errors and re-upload
6. Verify successful import

### 3. Manual Add Testing

Use the "Add Manually" feature to test:
- Duplicate prevention (stricter than Excel import)
- Field validation
- Error message display
- Success feedback

---

## 📊 Expected Test Results

### Automated Tests (student-import-test-runner.js)

```
=== SCHOOL STUDENT VALIDATION TESTS ===
✓ Valid school student data
✓ Missing full name detected
✓ Missing roll number detected
✓ Invalid date format detected
...

=== COLLEGE STUDENT VALIDATION TESTS ===
✓ Valid college student data
✓ Missing email detected
...

TEST SUMMARY
Total Tests: 45
Passed: 45
Failed: 0
Success Rate: 100.00%
```

### Excel File Tests

| File | Valid Rows | Error Rows | Total |
|------|------------|------------|-------|
| 1_valid_school_students | 4 | 0 | 4 |
| 2_school_missing_fields | 0 | 8 | 8 |
| 3_school_invalid_formats | 0 | 5 | 5 |
| 4_school_duplicates | 1 | 4 | 5 |
| 5_school_various_date_formats | 5 | 0 | 5 |
| 6_valid_college_students | 3 | 0 | 3 |
| 7_college_missing_fields | 0 | 7 | 7 |
| 8_college_invalid_formats | 0 | 3 | 3 |
| 9_college_duplicates | 1 | 3 | 4 |
| 10_edge_cases | 7 | 0 | 7 |
| 11_mixed_valid_invalid | 4 | 4 | 8 |

---

## 🐛 Common Issues & Solutions

### Issue 1: Date Format Errors

**Problem:** Users enter dates in various formats, causing validation failures.

**Solution:**
- Document supports DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD
- Excel serial dates automatically handled
- Two-digit years assumed as 20xx

**Test:** Use file #5 (various date formats)

### Issue 2: Parent Data Mismatch (School Students)

**Problem:** Same parent email with different phone numbers.

**Solution:**
- Validation checks email→phone and phone→email consistency
- Error message clearly states the conflict

**Test:** Use file #4 (duplicates)

### Issue 3: Duplicate Roll Numbers

**Problem:** Confusion about uniqueness scope for school students.

**Solution:**
- School: Roll number unique within class+section
- College: Registration number unique across institution
- Clear error messages explain the scope

**Test:** Use file #4 (duplicates)

### Issue 4: Phone Number Formats

**Problem:** Users add spaces, dashes, country codes.

**Solution:**
- System removes spaces before validation
- Requires exactly 10 digits
- Automatic cleanup applied

**Test:** Use file #10 (edge cases)

---

## 📈 Adding New Test Cases

### 1. Add to test-runner.js

```javascript
async function testNewScenario() {
  log('\n=== NEW SCENARIO TESTS ===', 'cyan');

  let result = await validateStudentRow(testData, 1, TEST_INSTITUTION_ID, 'SCHOOL');
  logTest('Test description', result.errors.length === 0);
}

// Add to runAllTests()
await testNewScenario();
```

### 2. Add to generate-test-excel-files.js

```javascript
function createNewTestFile() {
  const data = [
    // headers
    ['Full Name*', 'Roll Number*', ...],
    // test data rows
    ['Test Name', 'TEST001', ...],
  ];

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, 'Student Data');
  xlsx.writeFile(wb, path.join(outputDir, '12_new_test.xlsx'));
  console.log('✓ Created: 12_new_test.xlsx');
}

// Add to main execution
createNewTestFile();
```

### 3. Document in test-cases.md

Add the new test case to the appropriate section with expected behavior.

---

## 🎯 Regression Testing Checklist

Before deploying changes to import functionality:

- [ ] Run automated tests (`student-import-test-runner.js`)
- [ ] Generate fresh test files (`generate-test-excel-files.js`)
- [ ] Upload all test files and verify expected results
- [ ] Test manual add functionality
- [ ] Test update behavior (re-upload same data)
- [ ] Test sibling linking (school students)
- [ ] Test cross-institution uniqueness
- [ ] Test error message clarity
- [ ] Test success feedback
- [ ] Test with real production-like data volume

---

## 📝 Maintenance

### Update Tests When:

1. **Adding new required fields**
   - Update validation tests
   - Add to test Excel files
   - Update documentation

2. **Changing validation rules**
   - Update expected results
   - Regenerate test files
   - Re-run all tests

3. **Adding new institution types**
   - Create new test scenarios
   - Add validation tests
   - Generate new Excel templates

---

## 🤝 Contributing

When fixing bugs or adding features:

1. Add test case that reproduces the bug
2. Fix the bug
3. Verify test now passes
4. Update documentation
5. Run full regression suite

---

## 📞 Support

If tests fail unexpectedly:

1. Check database state (test institution exists)
2. Verify prisma schema is up to date
3. Check import.controller.js for recent changes
4. Review error logs in console
5. Compare with test-cases.md documentation

---

## 🎓 Learning Resources

- **Validation Logic:** `src/controllers/import.controller.js`
- **Test Documentation:** `student-import-test-cases.md`
- **Prisma Schema:** `prisma/schema.prisma`
- **Frontend Validation:** `attend-front/src/components/ImportWizard.jsx`
