-- Create the DB (feel free to rename attendance_db)
CREATE DATABASE IF NOT EXISTS attendance_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create a least-privilege user for local development
CREATE USER IF NOT EXISTS 'attend_user'@'localhost'
  IDENTIFIED BY 'Str0ng!Passw0rd#2025';

-- Grant permissions only on this database
GRANT ALL PRIVILEGES ON attendance_db.* TO 'attend_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;




# Attendance System - Backend API Documentation

## Setup Instructions

### 1. Environment Configuration

Update the `.env` file with your email configuration:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**For Gmail Users:**
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password (not your regular Gmail password) in `SMTP_PASS`

### 2. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

---

## Authentication API Endpoints

### 1. Signup (Step 1: Generate OTP)

**Endpoint:** `POST /api/auth/signup`

**Description:** Initiates the signup process by validating data and sending an OTP to the user's email.

**Request Body:**
```json
{
  "inviteCode": "ABC123",
  "user": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "roleType": "STUDENT",
    "phone": "1234567890"
  },
  "institution": {
    "type": "SCHOOL",
    "name": "Springfield High School"
  },
  "profile": {
    "kind": "studentSchool",
    "data": {
      "schoolName": "Springfield High School",
      "board": "CBSE",
      "class": "10",
      "section": "A",
      "rollNo": "101",
      "dob": "2008-05-15"
    }
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "email": "john@example.com",
    "expiresAt": "2024-01-22T10:25:00.000Z"
  }
}
```

**Notes:**
- OTP is valid for 10 minutes
- Invite code is NOT required for `roleType: "PARENT"`
- For other roles, invite code must be valid and allow the specified role

---

### 2. Verify OTP (Step 2: Create Account)

**Endpoint:** `POST /api/auth/verify-otp`

**Description:** Verifies the OTP and creates the user account with the specified profile.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "inviteCode": "ABC123",
  "user": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "roleType": "STUDENT",
    "phone": "1234567890"
  },
  "institution": {
    "type": "SCHOOL",
    "name": "Springfield High School"
  },
  "profile": {
    "kind": "studentSchool",
    "data": {
      "schoolName": "Springfield High School",
      "board": "CBSE",
      "class": "10",
      "section": "A",
      "rollNo": "101",
      "dob": "2008-05-15"
    }
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "publicId": "USR000001",
      "email": "john@example.com",
      "fullName": "John Doe",
      "roleType": "STUDENT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Resend OTP

**Endpoint:** `POST /api/auth/resend-otp`

**Description:** Resends a new OTP to the user's email if the previous one expired.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP resent to your email",
  "data": {
    "email": "john@example.com",
    "expiresAt": "2024-01-22T10:35:00.000Z"
  }
}
```

---

## Profile Types

### Student School Profile
```json
{
  "kind": "studentSchool",
  "data": {
    "schoolName": "Springfield High School",
    "board": "CBSE",
    "class": "10",
    "section": "A",
    "rollNo": "101",
    "dob": "2008-05-15"
  }
}
```

### Student College Profile
```json
{
  "kind": "studentCollege",
  "data": {
    "collegeName": "Tech University",
    "department": "Computer Science Engineering",
    "yearOfStudy": 2,
    "semester": 4,
    "regNo": "CS2023001"
  }
}
```

### Faculty School Profile
```json
{
  "kind": "facultySchool",
  "data": {
    "schoolName": "Springfield High School",
    "department": "Mathematics",
    "employeeId": "EMP12345"
  }
}
```

### Faculty College Profile
```json
{
  "kind": "facultyCollege",
  "data": {
    "collegeName": "Tech University",
    "department": "Computer Science Engineering",
    "designation": "Assistant Professor",
    "employeeId": "FAC98765"
  }
}
```

### Parent Profile
```json
{
  "kind": "parent",
  "data": {
    "phone": "9876543210",
    "provisionalStudentName": "Jane Doe",
    "provisionalStudentClass": "8",
    "provisionalStudentRollNo": "85",
    "provisionalStudentDob": "2010-03-20"
  }
}
```

### Admin Profile
```json
{
  "kind": "admin",
  "data": {
    "institutionType": "SCHOOL",
    "institutionName": "Springfield High School",
    "designation": "Principal",
    "department": null
  }
}
```

---

## Role Types

- `STUDENT` - Student users (school or college)
- `FACULTY` - Faculty/Teachers (school or college)
- `PARENT` - Parent/Guardian users
- `ADMIN` - Administrative users

---

## Institution Types

- `SCHOOL` - School institution
- `COLLEGE` - College/University institution

---

## Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to process signup",
  "error": "Error details..."
}
```

---

## Testing the API

### Using cURL

**1. Signup (Send OTP):**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "inviteCode": "ABC123",
    "user": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "password": "SecurePass123",
      "roleType": "STUDENT",
      "phone": "1234567890"
    },
    "institution": {
      "type": "SCHOOL",
      "name": "Springfield High School"
    },
    "profile": {
      "kind": "studentSchool",
      "data": {
        "schoolName": "Springfield High School",
        "board": "CBSE",
        "class": "10",
        "section": "A",
        "rollNo": "101",
        "dob": "2008-05-15"
      }
    }
  }'
```

**2. Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456",
    "inviteCode": "ABC123",
    "user": { ... },
    "institution": { ... },
    "profile": { ... }
  }'
```

---

## Database Schema Updates

The following fields have been updated in the Prisma schema:

### FacultySchoolProfile
- Removed: `subject`
- Added: `department` (String)
- Added: `employeeId` (String)

### FacultyCollegeProfile
- Added: `designation` (String)
- Added: `employeeId` (String)

### StudentSchoolProfile
- Changed: `board` from `String?` to `String` (now required)
- Changed: `section` from `String?` to `String` (now required)

### StudentCollegeProfile
- Changed: `semester` from `Int?` to `Int` (now required)

### New Model: OTP
- Stores OTP codes for email verification
- Includes expiry time and verification status
- Auto-cleanup can be implemented via cron job

---

## Next Steps

1. **Create Invite Codes:** Add API endpoints to generate and manage invite codes
2. **Login API:** Implement login with JWT authentication
3. **Password Reset:** Add password reset with OTP verification
4. **Profile Management:** CRUD operations for user profiles
5. **Institution Management:** Manage schools/colleges
6. **Attendance Features:** Core attendance tracking functionality

---

## Security Notes

⚠️ **Important:**
- Change `JWT_SECRET` in production to a strong, random value
- Never commit `.env` file to version control
- Use HTTPS in production
- Implement rate limiting for OTP endpoints
- Add CAPTCHA for signup to prevent abuse
- Consider implementing email verification token as alternative to OTP
