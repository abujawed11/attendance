# Admin Setup & Institution Management Guide

## 🎯 Overview

This guide explains how the **Admin-driven institution management** works in the attendance system. When an admin signs up, they create the **master institution profile** that faculty and students will be linked to.

---

## 📋 How It Works

### **Step 1: Admin Creates Invite Code**

First, the admin needs an invite code with ADMIN role permission.

```bash
cd attend-back
node scripts/create-invite.js ADMIN123XYZ ADMIN 10 2025-12-31
```

This creates:
- **Code:** `ADMIN123XYZ`
- **Allowed Role:** `ADMIN` only
- **Max Uses:** 10
- **Expires:** Dec 31, 2025

---

### **Step 2: Admin Signs Up (Creates Master Institution)**

When the admin signs up using the invite code, they must provide:

#### **Required Fields:**
1. **Institution Type**: School or College
2. **Institution Name**: e.g., "Springfield High School"
3. **City/Location**: e.g., "Mumbai, Maharashtra"
4. **Designation**: Principal, Director, Dean, Registrar, etc.
5. **Phone Number**: Admin's contact number
6. **Email & Password**: Standard account fields

#### **Optional Fields:**
- **Department**: If the admin is from a specific department (college only)

#### **What Happens During Admin Signup:**

```javascript
// Backend creates:
1. User account with role ADMIN
2. Institution record (if new)
3. AdminProfile with all institution details

// Database Structure:
Institution {
  id: 1,
  name: "Springfield High School",
  type: "SCHOOL",
  board: "CBSE"
}

AdminProfile {
  userId: 1,
  institutionType: "SCHOOL",
  institutionName: "Springfield High School",
  institutionCity: "Mumbai, Maharashtra", // NEW!
  designation: "Principal",
  department: null
}
```

---

### **Step 3: Admin Creates Invite Codes for Faculty & Students**

After signing up, the admin creates invite codes for their institution:

```bash
# For Students
node scripts/create-invite.js STUDENT2025 STUDENT 100 2025-12-31

# For Faculty
node scripts/create-invite.js FACULTY2025 FACULTY 50 2025-12-31

# For Both
node scripts/create-invite.js BOTH2025 "STUDENT,FACULTY" 100 2025-12-31
```

**Important:** These invite codes are **not automatically linked** to the admin's institution. The invite system doesn't have institution-specific invites yet.

---

### **Step 4: Faculty & Students Sign Up**

When faculty/students sign up:
1. They use an invite code (e.g., `FACULTY2025`)
2. They fill their role-specific details
3. During signup, they provide their **institution name** (which should match what admin created)
4. Backend finds or creates the institution based on name

#### **Current Flow:**
```javascript
// Student/Faculty provides:
{
  schoolName: "Springfield High School",  // OR collegeName
  // ... other details
}

// Backend logic (auth.controller.js:208-226):
1. Looks for existing institution with matching name and type
2. If found: Links user to that institution
3. If not found: Creates NEW institution
4. Creates user profile with institution link
```

---

## 🔧 How Admin Links Faculty & Students to Sections

After faculty and students sign up and are linked to the institution:

### **Admin Actions (via API):**

#### **1. Create Sections**
```http
POST /api/admin/sections
Headers: Authorization: Bearer <admin_token>
Body:
{
  "name": "Class 10 A",
  "institutionId": 1,
  "schoolClass": "10",
  "schoolSection": "A",
  "board": "CBSE"
}
```

#### **2. Enroll Students**
```http
POST /api/admin/enrollments
Body:
{
  "studentUserId": 5,    // Student's user ID
  "sectionId": 1         // Section ID
}
```

#### **3. Assign Faculty**
```http
POST /api/admin/faculty-assignments
Body:
{
  "facultyUserId": 2,    // Faculty's user ID
  "sectionId": 1,        // Section ID
  "subject": "Mathematics"
}
```

---

## 🎨 Frontend Changes (What You See Now)

### **Admin Signup Form - New Fields:**

When you select "Admin" role:

```
┌─────────────────────────────────────────────────────────┐
│ ℹ️ Admin Setup: These details will be used to create   │
│    your institution profile. Faculty and students who   │
│    join using your invite will be automatically linked  │
│    to this institution.                                 │
└─────────────────────────────────────────────────────────┘

Institution Name * : [Springfield High School          ]
City/Location *    : [Mumbai, Maharashtra              ]

Your Designation * : [Select Designation ▼             ]
Phone Number *     : [9876543210                       ]

Department         : [Computer Science (optional)      ]
```

All fields marked with `*` are **required** for admin signup.

---

## 📊 Database Schema

### **Institution Table**
```prisma
model Institution {
  id         Int
  publicId   String
  name       String            // From admin signup
  type       InstitutionType   // SCHOOL or COLLEGE
  board      String?           // For schools

  users      User[]
  sections   Section[]
}
```

### **AdminProfile Table** (Updated)
```prisma
model AdminProfile {
  userId           Int
  institutionType  InstitutionType?
  institutionName  String?           // Institution name
  institutionCity  String?           // NEW: City/Location
  designation      String?           // Principal, Dean, etc.
  department       String?           // Optional
}
```

---

## 🔄 Complete Workflow

### **Scenario: New School Setup**

1. **Admin (Principal) Signs Up:**
   - Uses invite code `ADMIN123XYZ`
   - Fills form:
     - Institution Type: School
     - Institution Name: "Springfield High School"
     - City: "Mumbai, Maharashtra"
     - Designation: "Principal"
     - Phone: 9876543210
   - Institution created in database

2. **Admin Creates Invite Codes:**
   ```bash
   node scripts/create-invite.js STAFF2025 FACULTY 50 2025-12-31
   node scripts/create-invite.js STU2025 STUDENT 500 2025-12-31
   ```

3. **Faculty Join:**
   - Use `STAFF2025` code
   - Fill details including "Springfield High School" as school name
   - Get linked to same institution (matched by name)

4. **Students Join:**
   - Use `STU2025` code
   - Fill details including "Springfield High School"
   - Get linked to same institution

5. **Admin Creates Structure (via API/Admin Panel):**
   - Creates sections (Class 10 A, Class 10 B, etc.)
   - Enrolls students in sections
   - Assigns faculty to sections with subjects

6. **Faculty & Students Use Attendance System:**
   - Faculty marks attendance for assigned sections
   - Students view their attendance records

---

## ⚠️ Current Limitations

1. **No Admin UI Yet:**
   - Admin must use API calls (Postman/cURL) to create sections, enroll students, assign faculty
   - Frontend admin panel is needed

2. **Institution Matching by Name:**
   - If faculty/student types institution name with typo, new institution created
   - Solution: Dropdown of existing institutions OR strict matching

3. **Invite Codes Not Institution-Specific:**
   - Any invite code can be used for any institution
   - Admin can't restrict invites to their specific institution
   - Solution: Link invites to institutionId during creation

---

## 🚀 Future Enhancements

### **Recommended Improvements:**

1. **Admin Dashboard (Frontend):**
   - Create sections UI
   - Bulk student enrollment (CSV upload)
   - Faculty assignment interface
   - View all users in institution

2. **Institution-Specific Invites:**
   ```javascript
   // Link invite to institution during creation
   POST /api/admin/invites
   {
     "code": "STAFF2025",
     "institutionId": 1,  // Admin's institution
     "allowedRoles": ["FACULTY"],
     "maxUses": 50
   }
   ```

3. **Institution Selection Dropdown:**
   - During signup, show dropdown of existing institutions
   - Prevent duplicate institutions with different names

4. **Auto-Enrollment Rules:**
   - Admin sets rules: "All Class 10 students auto-enroll in Math section"
   - Reduces manual work

5. **Bulk Operations:**
   - Upload CSV to enroll 100 students at once
   - Bulk assign faculty to multiple sections

---

## 📝 Testing the Admin Flow

### **1. Create Admin Invite:**
```bash
cd attend-back
node scripts/create-invite.js TESTADMIN ADMIN 5 2025-12-31
```

### **2. Sign Up as Admin:**
1. Go to signup page
2. Select "Admin" role
3. Select institution type (School or College)
4. Fill all required fields:
   - Institution Name: "Test School"
   - City: "Test City"
   - Designation: "Principal"
   - Phone: 1234567890
5. Complete signup with OTP

### **3. Verify in Database:**
```bash
cd attend-back
npx prisma studio
```

Check:
- `User` table: New admin user
- `Institution` table: New institution
- `AdminProfile` table: Profile with institution details including city

### **4. Create Faculty/Student Invites:**
```bash
node scripts/create-invite.js TESTFAC FACULTY 10 2025-12-31
node scripts/create-invite.js TESTSTU STUDENT 50 2025-12-31
```

### **5. Test Faculty Signup:**
- Use `TESTFAC` code
- Provide "Test School" as school name
- Verify they get linked to same institution ID

---

## 🎓 Summary

**Key Points:**
- ✅ Admin signup now requires full institution details (name, city, designation)
- ✅ Institution city/location field added to database
- ✅ All admin fields are now mandatory
- ✅ Frontend shows helpful message about admin's role
- ✅ Backend updated to store institutionCity
- ❌ Admin UI for section/enrollment management still needed
- ❌ Institution-specific invite codes not implemented yet

**Next Steps:**
1. Build admin dashboard frontend pages
2. Implement institution-specific invite system
3. Add institution dropdown during signup
4. Create bulk enrollment features

---

**Questions?** Check the main ATTENDANCE_MODULE.md for API documentation.
