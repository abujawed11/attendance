# Attendance Module Documentation

## Overview

The attendance module provides a comprehensive system for managing attendance in educational institutions (schools and colleges). It supports:

- **Faculty**: View assigned sections, create attendance sessions, mark student attendance
- **Students**: View their own attendance records and statistics
- **Admin**: Create sections, enroll students, assign faculty to sections

## Database Schema

### Core Models

#### 1. Section
Represents a class/section (e.g., "Class 10 A" for schools, "CSE 3rd Year A" for colleges)

```prisma
model Section {
  id              Int
  publicId        String          // SEC000001
  name            String          // "Class 10 A" or "CSE 3rd Year A"
  institutionId   Int

  // For schools
  schoolClass     String?         // "10", "11", "12"
  schoolSection   String?         // "A", "B", "C"
  board           String?         // "CBSE", "ICSE", "State"

  // For colleges
  department      String?         // "CSE", "Mechanical"
  yearOfStudy     Int?            // 1, 2, 3, 4
  semester        Int?            // 1-8
}
```

#### 2. Enrollment
Many-to-many relationship between Students and Sections

```prisma
model Enrollment {
  id              Int
  studentUserId   Int
  sectionId       Int
  enrolledAt      DateTime
  isActive        Boolean
}
```

#### 3. FacultySection
Many-to-many relationship between Faculty and Sections

```prisma
model FacultySection {
  id              Int
  facultyUserId   Int
  sectionId       Int
  subject         String?         // "Mathematics", "Physics"
  assignedAt      DateTime
  isActive        Boolean
}
```

#### 4. AttendanceSession
A specific attendance-taking session created by faculty

```prisma
model AttendanceSession {
  id              Int
  publicId        String          // ATT000001
  sectionId       Int
  facultyUserId   Int
  date            DateTime
  subject         String?
  notes           String?
}
```

#### 5. AttendancePunch
Individual attendance record for a student in a session

```prisma
model AttendancePunch {
  id              Int
  sessionId       Int
  enrollmentId    Int
  status          AttendanceStatus  // PRESENT, ABSENT, LATE
  remarks         String?
  markedAt        DateTime
}
```

## API Endpoints

### Authentication

All endpoints (except auth endpoints) require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Faculty Endpoints

#### 1. Get Faculty's Assigned Sections
```http
GET /api/attendance/faculty/sections
Authorization: Bearer <faculty_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "publicId": "SEC000001",
      "name": "Class 10 A",
      "subject": "Mathematics",
      "institution": {
        "name": "Springfield High School",
        "type": "SCHOOL"
      },
      "schoolClass": "10",
      "schoolSection": "A",
      "board": "CBSE",
      "studentCount": 5,
      "assignedAt": "2025-10-23T07:30:00.000Z"
    }
  ]
}
```

#### 2. Get Students in a Section
```http
GET /api/attendance/sections/:sectionId/students
Authorization: Bearer <faculty_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "section": {
      "name": "Class 10 A",
      "publicId": "SEC000001"
    },
    "students": [
      {
        "enrollmentId": 1,
        "studentId": 5,
        "publicId": "USR000005",
        "fullName": "Alice Johnson",
        "email": "alice.johnson@student.springfield.edu",
        "phone": null,
        "rollNo": "10A001",
        "class": "10",
        "section": "A",
        "enrolledAt": "2025-10-23T07:30:00.000Z"
      }
    ]
  }
}
```

#### 3. Create Attendance Session
```http
POST /api/attendance/sessions
Authorization: Bearer <faculty_token>
Content-Type: application/json

{
  "sectionId": 1,
  "date": "2025-10-23",
  "subject": "Mathematics",
  "notes": "Algebra - Quadratic Equations"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance session created successfully",
  "data": {
    "id": 1,
    "publicId": "ATT000001",
    "sectionId": 1,
    "facultyUserId": 2,
    "date": "2025-10-23T00:00:00.000Z",
    "subject": "Mathematics",
    "notes": "Algebra - Quadratic Equations",
    "section": {
      "name": "Class 10 A",
      "publicId": "SEC000001"
    },
    "faculty": {
      "fullName": "John Doe",
      "email": "john.doe@springfield.edu"
    }
  }
}
```

#### 4. Mark Attendance (Batch)
```http
POST /api/attendance/sessions/:sessionId/punches
Authorization: Bearer <faculty_token>
Content-Type: application/json

{
  "punches": [
    {
      "enrollmentId": 1,
      "status": "PRESENT",
      "remarks": null
    },
    {
      "enrollmentId": 2,
      "status": "ABSENT",
      "remarks": "Medical leave"
    },
    {
      "enrollmentId": 3,
      "status": "LATE",
      "remarks": null
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "sessionId": 1,
    "markedCount": 3,
    "punches": [...]
  }
}
```

#### 5. Get Attendance Sessions
```http
GET /api/attendance/sessions?sectionId=1&startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer <faculty_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "publicId": "ATT000001",
      "date": "2025-10-23T00:00:00.000Z",
      "subject": "Mathematics",
      "notes": "Algebra - Quadratic Equations",
      "_count": {
        "punches": 5
      },
      "section": {
        "name": "Class 10 A",
        "publicId": "SEC000001"
      },
      "faculty": {
        "fullName": "John Doe"
      }
    }
  ]
}
```

#### 6. Get Session Details
```http
GET /api/attendance/sessions/:sessionId
Authorization: Bearer <faculty_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "publicId": "ATT000001",
    "date": "2025-10-23T00:00:00.000Z",
    "subject": "Mathematics",
    "section": {...},
    "faculty": {...},
    "punches": [
      {
        "id": 1,
        "status": "PRESENT",
        "remarks": null,
        "markedAt": "2025-10-23T07:30:00.000Z",
        "enrollment": {
          "student": {
            "publicId": "USR000005",
            "fullName": "Alice Johnson",
            "email": "alice.johnson@student.springfield.edu"
          }
        }
      }
    ]
  }
}
```

### Student Endpoints

#### Get My Attendance
```http
GET /api/attendance/my?startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer <student_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sections": [
      {
        "section": {
          "id": 1,
          "publicId": "SEC000001",
          "name": "Class 10 A",
          "schoolClass": "10",
          "schoolSection": "A"
        },
        "enrollmentId": 1,
        "enrolledAt": "2025-10-23T07:30:00.000Z",
        "statistics": {
          "totalSessions": 3,
          "presentCount": 2,
          "absentCount": 0,
          "lateCount": 1,
          "attendancePercentage": 100.0
        },
        "records": [
          {
            "id": 1,
            "date": "2025-10-23T00:00:00.000Z",
            "subject": "Mathematics",
            "status": "PRESENT",
            "remarks": null,
            "markedAt": "2025-10-23T07:30:00.000Z",
            "faculty": "John Doe",
            "sessionId": 1
          }
        ]
      }
    ],
    "summary": {
      "totalSections": 1,
      "overallAttendance": 100.0
    }
  }
}
```

### Admin Endpoints

#### 1. Create Section
```http
POST /api/admin/sections
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Class 10 B",
  "institutionId": 1,
  "schoolClass": "10",
  "schoolSection": "B",
  "board": "CBSE"
}
```

#### 2. Get All Sections
```http
GET /api/admin/sections?institutionId=1
Authorization: Bearer <admin_token>
```

#### 3. Enroll Student
```http
POST /api/admin/enrollments
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "studentUserId": 5,
  "sectionId": 1
}
```

#### 4. Assign Faculty to Section
```http
POST /api/admin/faculty-assignments
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "facultyUserId": 2,
  "sectionId": 1,
  "subject": "Mathematics"
}
```

#### 5. Get Section Enrollments
```http
GET /api/admin/sections/:sectionId/enrollments
Authorization: Bearer <admin_token>
```

#### 6. Get Section Faculty
```http
GET /api/admin/sections/:sectionId/faculty
Authorization: Bearer <admin_token>
```

## Implementation Flow

### 1. Faculty Assignment & Student Enrollment

**During Signup:**
- Students provide their class/section information during signup
- Faculty provide their department/subject information
- **However**, enrollment and faculty assignments are NOT automatic

**Admin Actions Required:**
1. Admin creates Sections using `POST /api/admin/sections`
2. Admin enrolls students in sections using `POST /api/admin/enrollments`
3. Admin assigns faculty to sections using `POST /api/admin/faculty-assignments`

**Why separate?**
- Gives admin full control over class composition
- Allows for mid-year changes
- Supports multiple sections per student (different subjects)
- Supports multiple faculty per section (team teaching)

### 2. Attendance Marking Workflow

1. **Faculty logs in** → Receives JWT token
2. **Faculty views assigned sections** → `GET /api/attendance/faculty/sections`
3. **Faculty selects a section** → Views students via `GET /api/attendance/sections/:id/students`
4. **Faculty creates attendance session** → `POST /api/attendance/sessions`
5. **Faculty marks attendance** → `POST /api/attendance/sessions/:id/punches` (batch operation)
6. **Student views attendance** → `GET /api/attendance/my`

### 3. Student Attendance View

1. **Student logs in** → Receives JWT token
2. **Student views attendance** → `GET /api/attendance/my`
3. **Response includes:**
   - All sections the student is enrolled in
   - Statistics (total sessions, present/absent/late counts, percentage)
   - Detailed records for each session

## Demo Data

Run the seed script to create demo data:

```bash
node scripts/seed-attendance.js
```

This creates:
- 1 Institution: Springfield High School
- 1 Faculty: John Doe (john.doe@springfield.edu)
- 1 Section: Class 10 A
- 5 Students (alice.johnson@..., bob.smith@..., etc.)
- 3 Attendance Sessions with mixed attendance records

**Login Credentials:**
- Faculty: `john.doe@springfield.edu` / `password123`
- Students: `alice.johnson@student.springfield.edu` / `password123` (and 4 others)

## Best Practices

### Security
- All endpoints require JWT authentication
- Role-based access control enforced via middleware
- Faculty can only access their assigned sections
- Students can only view their own attendance

### Data Integrity
- Use transactions for batch operations (marking attendance)
- Unique constraints prevent duplicate enrollments/assignments
- Cascade deletes ensure data consistency

### Performance
- Indexes on foreign keys and frequently queried fields
- Batch operations for marking attendance (not one-by-one)
- Pagination recommended for large result sets (not implemented in demo)

### Error Handling
- Consistent error response format
- Validation of required fields
- Permission checks before data access
- Descriptive error messages

## Testing the API

### Using cURL

**1. Faculty Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@springfield.edu","password":"password123"}'
```

**2. Get Faculty Sections:**
```bash
curl -X GET http://localhost:5000/api/attendance/faculty/sections \
  -H "Authorization: Bearer <token>"
```

**3. Create Attendance Session:**
```bash
curl -X POST http://localhost:5000/api/attendance/sessions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"sectionId":1,"subject":"Mathematics","notes":"Test session"}'
```

**4. Mark Attendance:**
```bash
curl -X POST http://localhost:5000/api/attendance/sessions/1/punches \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"punches":[{"enrollmentId":1,"status":"PRESENT"},{"enrollmentId":2,"status":"ABSENT","remarks":"Sick"}]}'
```

**5. Student Login and View Attendance:**
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice.johnson@student.springfield.edu","password":"password123"}'

# View attendance
curl -X GET http://localhost:5000/api/attendance/my \
  -H "Authorization: Bearer <student_token>"
```

## Next Steps

### Recommended Enhancements

1. **Bulk Enrollment**: Allow admin to upload CSV of students to enroll
2. **Attendance Reports**: Generate PDF/Excel reports for attendance
3. **Notifications**: Email/SMS alerts for low attendance
4. **Parents Access**: Allow parents to view their child's attendance
5. **Attendance Policies**: Configurable rules (min % required, etc.)
6. **Leave Management**: Students can apply for leave, faculty can approve
7. **QR Code Attendance**: Generate QR codes for quick attendance marking
8. **Geolocation**: Verify faculty is on campus when marking attendance
9. **Analytics Dashboard**: Visualizations and trends
10. **Automatic Section Creation**: During signup, auto-create sections if needed

## File Structure

```
attend-back/
├── prisma/
│   ├── schema.prisma                    # Updated with attendance models
│   └── migrations/
│       └── 20251023072929_add_attendance_system/
├── src/
│   ├── config/
│   │   └── prisma.js
│   ├── controllers/
│   │   ├── auth.controller.js           # Existing
│   │   ├── attendance.controller.js     # NEW - Attendance operations
│   │   └── admin.controller.js          # NEW - Admin operations
│   ├── middleware/
│   │   └── auth.middleware.js           # NEW - JWT auth & role check
│   ├── routes/
│   │   ├── auth.routes.js               # Existing
│   │   ├── attendance.routes.js         # NEW - Attendance routes
│   │   └── admin.routes.js              # NEW - Admin routes
│   ├── services/
│   │   └── email.service.js
│   ├── utils/
│   │   └── helpers.js                   # Updated with new sequence types
│   └── server.js                        # Updated with new routes
├── scripts/
│   ├── create-test-invite.js            # Existing
│   └── seed-attendance.js               # NEW - Demo data
└── ATTENDANCE_MODULE.md                 # This file
```

## Support

For issues or questions:
1. Check this documentation
2. Review the Prisma schema in `prisma/schema.prisma`
3. Examine the seed script for examples
4. Review controller implementations for business logic
