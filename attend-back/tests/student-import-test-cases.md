# Student Import Test Cases Documentation

This document outlines all possible error scenarios and test cases for student import/add functionality.

## 🏫 School Student Test Cases

### 1. Required Field Validations
- ❌ Missing Full Name
- ❌ Missing Roll Number
- ❌ Missing Date of Birth
- ❌ Missing Class
- ❌ Missing Section
- ❌ Missing Parent Name
- ❌ Missing Parent Email
- ❌ Missing Parent Phone

### 2. Format Validations
- ❌ Invalid date format (not DD-MM-YYYY or DD/MM/YYYY)
- ❌ Invalid parent email format
- ❌ Invalid parent phone (not 10 digits)
- ❌ Parent phone with spaces/special characters

### 3. Date Edge Cases
- ✅ Various date formats: DD-MM-YYYY, DD/MM/YYYY, D-M-YYYY
- ✅ Excel serial date numbers
- ✅ Two-digit years (e.g., 08 = 2008)
- ❌ Invalid dates (e.g., Feb 30, 13th month)
- ❌ Future dates
- ❌ Dates before 1900

### 4. Database Uniqueness - Within Institution
- ❌ Roll number duplicate in SAME class and section
- ✅ Same roll number in DIFFERENT sections (allowed)
- ❌ Parent email exists with DIFFERENT phone number
- ❌ Parent phone exists with DIFFERENT email address

### 5. Excel File Duplicate Detection
- ❌ Duplicate roll numbers in same class/section within Excel
- ❌ Parent email/phone inconsistency within Excel file
- ✅ Same parent email/phone for siblings (allowed - shared parent)

### 6. Parent Account Handling
- ✅ Parent already exists - link to existing parent account
- ✅ Multiple siblings - share same parent account
- ✅ Parent name update when adding more children
- ❌ Parent data mismatch (different email for same phone)

### 7. Student Email Generation
- ✅ Auto-generated email format: firstname_stu{id}@school.student.in
- ✅ Handles special characters in names
- ✅ Unique student ID ensures no email conflicts

### 8. Edge Cases
- ✅ Names with titles (Mr., Ms., Dr.) - removed for password
- ✅ Very long names (truncated to first 4 chars for password)
- ✅ Names with multiple spaces
- ✅ Single-character first names
- ❌ Empty rows in Excel (should be filtered)
- ❌ Header row not matching template

---

## 🎓 College Student Test Cases

### 1. Required Field Validations
- ❌ Missing Full Name
- ❌ Missing Email
- ❌ Missing Phone
- ❌ Missing Date of Birth
- ❌ Missing Roll No/Reg No
- ❌ Missing Department
- ❌ Missing Year of Study
- ❌ Missing Semester

### 2. Format Validations
- ❌ Invalid email format
- ❌ Invalid phone (not 10 digits)
- ❌ Invalid date format
- ❌ Invalid year of study (not 1-4)
- ❌ Invalid semester (not 1-8)

### 3. Database Uniqueness
- ❌ Email already exists in database
- ❌ Phone already exists in database
- ❌ Registration number already exists in institution

### 4. Excel File Duplicate Detection
- ❌ Duplicate emails within Excel file
- ❌ Duplicate phones within Excel file
- ❌ Duplicate registration numbers within Excel file

### 5. Cross-Institution Conflicts
- ❌ Email exists in another institution
- ❌ Phone exists (globally unique across all institutions)

### 6. Password Generation
- ✅ Format: first 4 letters of first name + last 4 digits of phone
- ✅ Handles titles (Mr., Ms., Dr.)
- ✅ Case-insensitive (converted to lowercase)

### 7. Edge Cases
- ✅ Department names with special characters
- ✅ Year of Study as text or number
- ✅ Various phone formats (with/without spaces)
- ❌ Invalid registration number formats

---

## 📤 Manual Add Specific Cases

### School Students
- ❌ Duplicate roll number in same class/section (strict - no updates)
- ✅ Validates all fields before submission
- ❌ Parent data mismatch detected immediately

### College Students
- ❌ Duplicate email (strict - no updates)
- ❌ Duplicate phone (strict - no updates)
- ❌ Duplicate registration number (strict - no updates)

### Key Differences from Excel Import
- Manual add: **Rejects all duplicates** with error
- Excel import: **Updates existing records** silently

---

## 🔄 Update vs Create Behavior

### Excel Import Mode
- **Faculty**: Updates existing by email
- **School Students**: Updates existing by roll+class+section
- **College Students**: Updates existing by email

### Manual Add Mode
- **All Types**: Strict duplicate prevention - throws error

---

## 🧪 Test Priority Levels

### P0 - Critical (Must Pass)
1. Required field validation
2. Email/Phone format validation
3. Duplicate detection within database
4. Duplicate detection within Excel file

### P1 - High Priority
1. Date format handling (all formats)
2. Parent account linking for siblings
3. Password generation correctness
4. Cross-institution uniqueness

### P2 - Medium Priority
1. Name edge cases (titles, special chars)
2. Empty row filtering
3. Update behavior in Excel import
4. Error message accuracy

### P3 - Low Priority
1. Column width in templates
2. Template download functionality
3. Instruction sheet formatting

---

## 📊 Test Data Sets Needed

### Set 1: Valid Data - Should Pass
- Perfect school students (siblings included)
- Perfect college students
- Various date formats
- Mixed case names

### Set 2: Format Errors - Should Fail
- Invalid emails
- Invalid phones
- Invalid dates
- Missing required fields

### Set 3: Duplicate Detection - Should Fail
- Duplicate emails in Excel
- Duplicate phones in Excel
- Duplicate roll numbers in same class/section
- Parent data inconsistencies

### Set 4: Database Conflicts - Should Fail
- Email exists in DB
- Phone exists in DB
- Roll number exists
- Parent email/phone mismatch

### Set 5: Edge Cases - Should Pass
- Names with titles
- Single char names
- Special characters
- Various date formats
- Siblings with same parent

### Set 6: Cross-Institution - Should Fail
- Email exists in different institution
- Phone exists globally

---

## 🚨 Common Production Issues

Based on validation logic, these are likely production errors:

1. **Parent Data Mismatch** (School)
   - Same parent email with different phones
   - Same parent phone with different emails
   - Occurs when data entry has typos

2. **Date Format Confusion**
   - Users enter dates in wrong format
   - Excel auto-formats dates
   - Timezone issues

3. **Phone Number Formats**
   - Users add spaces, dashes, country codes
   - Copy-paste from different sources

4. **Duplicate Roll Numbers**
   - Same roll number in different sections (allowed)
   - Same roll number in same section (error)
   - Confusion about uniqueness scope

5. **Email Typos**
   - Minor typos create "new" users
   - Case sensitivity issues

6. **Within-File Duplicates**
   - Users copy-paste rows accidentally
   - Sort/filter causes duplicate entries
