const prisma = require('../config/prisma');
const { getNextSequenceId } = require('../utils/helpers');

/**
 * Create a new section
 * POST /api/admin/sections
 */
async function createSection(req, res) {
  try {
    const {
      name,
      schoolClass,
      schoolSection,
      board,
      department,
      yearOfStudy,
      semester,
      collegeSection,
      batch,
      sectionType,
      maxCapacity,
      roomNumber,
    } = req.body;

    const adminInstitutionId = req.user?.institutionId;

    if (!adminInstitutionId) {
      return res.status(403).json({
        success: false,
        message: 'Admin must be associated with an institution',
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Section name is required',
      });
    }

    const publicId = await getNextSequenceId('section');

    const section = await prisma.section.create({
      data: {
        publicId,
        name,
        institutionId: adminInstitutionId,
        schoolClass: schoolClass || null,
        schoolSection: schoolSection || null,
        board: board || null,
        department: department || null,
        yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : null,
        semester: semester ? parseInt(semester) : null,
        collegeSection: collegeSection || null,
        batch: batch || null,
        sectionType: sectionType || null,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
        roomNumber: roomNumber || null,
      },
      include: {
        institution: {
          select: {
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            facultySections: true,
          },
        },
      },
    });

    // Auto-enroll matching students
    let enrolledCount = 0;
    const institutionType = section.institution.type;

    if (institutionType === 'SCHOOL' && schoolClass && schoolSection) {
      // Find all students in this class and section
      const matchingStudents = await prisma.user.findMany({
        where: {
          institutionId: adminInstitutionId,
          roleType: 'STUDENT',
          studentSchoolProfile: {
            class: schoolClass,
            section: schoolSection,
          },
        },
        select: { id: true },
      });

      // Create enrollments for all matching students
      if (matchingStudents.length > 0) {
        await prisma.enrollment.createMany({
          data: matchingStudents.map(student => ({
            studentUserId: student.id,
            sectionId: section.id,
          })),
          skipDuplicates: true,
        });
        enrolledCount = matchingStudents.length;
      }
    } else if (institutionType === 'COLLEGE' && department && yearOfStudy && semester) {
      // Build the where clause for college students
      const collegeWhere = {
        department: department,
        yearOfStudy: parseInt(yearOfStudy),
        semester: parseInt(semester),
      };

      // Add section filter if specified
      if (collegeSection) {
        collegeWhere.section = collegeSection;
      }

      // Add batch filter if specified
      if (batch) {
        collegeWhere.batch = batch;
      }

      // Find matching students
      const matchingStudents = await prisma.user.findMany({
        where: {
          institutionId: adminInstitutionId,
          roleType: 'STUDENT',
          studentCollegeProfile: collegeWhere,
        },
        select: { id: true },
      });

      // Create enrollments for all matching students
      if (matchingStudents.length > 0) {
        await prisma.enrollment.createMany({
          data: matchingStudents.map(student => ({
            studentUserId: student.id,
            sectionId: section.id,
          })),
          skipDuplicates: true,
        });
        enrolledCount = matchingStudents.length;
      }
    }

    // Fetch updated section with correct enrollment count
    const updatedSection = await prisma.section.findUnique({
      where: { id: section.id },
      include: {
        institution: {
          select: {
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            facultySections: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: `Section created successfully${enrolledCount > 0 ? ` and ${enrolledCount} student(s) enrolled automatically` : ''}`,
      data: updatedSection,
    });
  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create section',
      error: error.message,
    });
  }
}

/**
 * Get all sections for admin's institution
 * GET /api/admin/sections
 */
async function getSections(req, res) {
  try {
    const adminInstitutionId = req.user?.institutionId;

    if (!adminInstitutionId) {
      return res.status(403).json({
        success: false,
        message: 'Admin must be associated with an institution',
      });
    }

    const sections = await prisma.section.findMany({
      where: {
        institutionId: adminInstitutionId,
      },
      include: {
        institution: {
          select: {
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            facultySections: true,
          },
        },
      },
      orderBy: [
        { schoolClass: 'asc' },
        { schoolSection: 'asc' },
        { department: 'asc' },
        { yearOfStudy: 'asc' },
        { semester: 'asc' },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        sections,
        institutionType: sections[0]?.institution?.type || null,
      },
    });
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sections',
      error: error.message,
    });
  }
}

/**
 * Backfill enrollments for a specific section
 * POST /api/admin/sections/:sectionId/sync-enrollments
 */
async function syncSectionEnrollments(req, res) {
  try {
    const { sectionId } = req.params;
    const adminInstitutionId = req.user?.institutionId;

    if (!adminInstitutionId) {
      return res.status(403).json({
        success: false,
        message: 'Admin must be associated with an institution',
      });
    }

    // Get section details
    const section = await prisma.section.findUnique({
      where: { id: parseInt(sectionId) },
      include: {
        institution: {
          select: { type: true },
        },
      },
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    if (section.institutionId !== adminInstitutionId) {
      return res.status(403).json({
        success: false,
        message: 'You can only sync sections from your institution',
      });
    }

    let enrolledCount = 0;
    const institutionType = section.institution.type;

    if (institutionType === 'SCHOOL' && section.schoolClass && section.schoolSection) {
      // Find all students in this class and section
      const matchingStudents = await prisma.user.findMany({
        where: {
          institutionId: adminInstitutionId,
          roleType: 'STUDENT',
          studentSchoolProfile: {
            class: section.schoolClass,
            section: section.schoolSection,
          },
        },
        select: { id: true },
      });

      if (matchingStudents.length > 0) {
        const result = await prisma.enrollment.createMany({
          data: matchingStudents.map(student => ({
            studentUserId: student.id,
            sectionId: section.id,
          })),
          skipDuplicates: true,
        });
        enrolledCount = result.count;
      }
    } else if (institutionType === 'COLLEGE' && section.department && section.yearOfStudy && section.semester) {
      // Build the where clause for college students
      const collegeWhere = {
        department: section.department,
        yearOfStudy: section.yearOfStudy,
        semester: section.semester,
      };

      // Add section filter if specified
      if (section.collegeSection) {
        collegeWhere.section = section.collegeSection;
      }

      // Add batch filter if specified
      if (section.batch) {
        collegeWhere.batch = section.batch;
      }

      // Find matching students
      const matchingStudents = await prisma.user.findMany({
        where: {
          institutionId: adminInstitutionId,
          roleType: 'STUDENT',
          studentCollegeProfile: collegeWhere,
        },
        select: { id: true },
      });

      if (matchingStudents.length > 0) {
        const result = await prisma.enrollment.createMany({
          data: matchingStudents.map(student => ({
            studentUserId: student.id,
            sectionId: section.id,
          })),
          skipDuplicates: true,
        });
        enrolledCount = result.count;
      }
    }

    // Get updated section with correct enrollment count
    const updatedSection = await prisma.section.findUnique({
      where: { id: section.id },
      include: {
        institution: {
          select: {
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            facultySections: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: `${enrolledCount} student(s) enrolled successfully`,
      data: updatedSection,
    });
  } catch (error) {
    console.error('Sync enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync enrollments',
      error: error.message,
    });
  }
}

/**
 * Enroll a student in a section
 * POST /api/admin/enrollments
 */
async function enrollStudent(req, res) {
  try {
    const { studentUserId, sectionId } = req.body;

    if (!studentUserId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: 'Student user ID and section ID are required',
      });
    }

    // Verify student exists and has STUDENT role
    const student = await prisma.user.findUnique({
      where: { id: parseInt(studentUserId) },
    });

    if (!student || student.roleType !== 'STUDENT') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student user',
      });
    }

    // Verify section exists
    const section = await prisma.section.findUnique({
      where: { id: parseInt(sectionId) },
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentUserId_sectionId: {
          studentUserId: parseInt(studentUserId),
          sectionId: parseInt(sectionId),
        },
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this section',
      });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentUserId: parseInt(studentUserId),
        sectionId: parseInt(sectionId),
        isActive: true,
      },
      include: {
        student: {
          select: {
            publicId: true,
            fullName: true,
            email: true,
          },
        },
        section: {
          select: {
            publicId: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      data: enrollment,
    });
  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll student',
      error: error.message,
    });
  }
}

/**
 * Assign faculty to a section
 * POST /api/admin/faculty-assignments
 */
async function assignFacultyToSection(req, res) {
  try {
    const { facultyUserId, sectionId, subject } = req.body;

    if (!facultyUserId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: 'Faculty user ID and section ID are required',
      });
    }

    // Verify faculty exists and has FACULTY role
    const faculty = await prisma.user.findUnique({
      where: { id: parseInt(facultyUserId) },
    });

    if (!faculty || faculty.roleType !== 'FACULTY') {
      return res.status(400).json({
        success: false,
        message: 'Invalid faculty user',
      });
    }

    // Verify section exists
    const section = await prisma.section.findUnique({
      where: { id: parseInt(sectionId) },
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    // Check if already assigned with the same subject
    const existingAssignment = await prisma.facultySection.findUnique({
      where: {
        facultyUserId_sectionId_subject: {
          facultyUserId: parseInt(facultyUserId),
          sectionId: parseInt(sectionId),
          subject: subject || null,
        },
      },
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Faculty is already assigned to this section with the same subject',
      });
    }

    const assignment = await prisma.facultySection.create({
      data: {
        facultyUserId: parseInt(facultyUserId),
        sectionId: parseInt(sectionId),
        subject: subject || null,
        isActive: true,
      },
      include: {
        faculty: {
          select: {
            publicId: true,
            fullName: true,
            email: true,
          },
        },
        section: {
          select: {
            publicId: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Faculty assigned to section successfully',
      data: assignment,
    });
  } catch (error) {
    console.error('Assign faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign faculty to section',
      error: error.message,
    });
  }
}

/**
 * Get all enrollments for a section
 * GET /api/admin/sections/:sectionId/enrollments
 */
async function getSectionEnrollments(req, res) {
  try {
    const { sectionId } = req.params;

    const enrollments = await prisma.enrollment.findMany({
      where: {
        sectionId: parseInt(sectionId),
      },
      include: {
        student: {
          select: {
            publicId: true,
            fullName: true,
            email: true,
            studentSchoolProfile: true,
            studentCollegeProfile: true,
          },
        },
        section: {
          select: {
            name: true,
            publicId: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error('Get section enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: error.message,
    });
  }
}

/**
 * Get all faculty assignments for a section
 * GET /api/admin/sections/:sectionId/faculty
 */
async function getSectionFaculty(req, res) {
  try {
    const { sectionId } = req.params;

    const assignments = await prisma.facultySection.findMany({
      where: {
        sectionId: parseInt(sectionId),
      },
      include: {
        faculty: {
          select: {
            publicId: true,
            fullName: true,
            email: true,
            facultySchoolProfile: true,
            facultyCollegeProfile: true,
          },
        },
        section: {
          select: {
            name: true,
            publicId: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error('Get section faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty assignments',
      error: error.message,
    });
  }
}

/**
 * Get all faculty with filters and pagination
 * GET /api/admin/faculty?institutionId=1&search=john&department=CS&page=1&limit=20
 */
async function getFaculty(req, res) {
  try {
    const {
      institutionId,
      search,
      department,
      designation,
      qualification,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get admin's institution ID from authenticated user
    const adminInstitutionId = req.user?.institutionId;

    if (!adminInstitutionId) {
      return res.status(403).json({
        success: false,
        message: 'Admin must be associated with an institution',
      });
    }

    // Build where clause - ALWAYS filter by admin's institution
    const where = {
      roleType: 'FACULTY',
      institutionId: adminInstitutionId,
    };

    // Search by name or email
    if (search && search.trim()) {
      where.OR = [
        { fullName: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    // Get institution type to determine which profile to filter
    const institution = await prisma.institution.findUnique({
      where: { id: adminInstitutionId },
      select: { type: true },
    });
    const institutionType = institution?.type;

    // Department, designation, qualification filters
    if (department || designation || qualification) {
      if (institutionType === 'SCHOOL') {
        where.facultySchoolProfile = {};
        if (department) where.facultySchoolProfile.department = { contains: department, mode: 'insensitive' };
        if (qualification) where.facultySchoolProfile.qualification = { contains: qualification, mode: 'insensitive' };
      } else if (institutionType === 'COLLEGE') {
        where.facultyCollegeProfile = {};
        if (department) where.facultyCollegeProfile.department = { contains: department, mode: 'insensitive' };
        if (designation) where.facultyCollegeProfile.designation = { contains: designation, mode: 'insensitive' };
        if (qualification) where.facultyCollegeProfile.qualification = { contains: qualification, mode: 'insensitive' };
      }
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get paginated results
    const faculty = await prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        facultySchoolProfile: true,
        facultyCollegeProfile: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        faculty,
        institutionType,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty',
      error: error.message,
    });
  }
}

/**
 * Get all students with filters and pagination
 * GET /api/admin/students?institutionId=1&search=john&class=10&section=A&page=1&limit=20
 */
async function getStudents(req, res) {
  try {
    const {
      institutionId,
      search,
      class: studentClass,
      section,
      department,
      yearOfStudy,
      parentPhone,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get admin's institution ID from authenticated user
    const adminInstitutionId = req.user?.institutionId;

    if (!adminInstitutionId) {
      return res.status(403).json({
        success: false,
        message: 'Admin must be associated with an institution',
      });
    }

    // Build where clause - ALWAYS filter by admin's institution
    const where = {
      roleType: 'STUDENT',
      institutionId: adminInstitutionId,
    };

    // Search by name or email
    if (search && search.trim()) {
      where.OR = [
        { fullName: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    // Get institution type
    const institution = await prisma.institution.findUnique({
      where: { id: adminInstitutionId },
      select: { type: true },
    });
    const institutionType = institution?.type;

    // School-specific filters
    if (institutionType === 'SCHOOL' && (studentClass || section || parentPhone)) {
      where.studentSchoolProfile = {};
      if (studentClass) where.studentSchoolProfile.class = studentClass;
      if (section) where.studentSchoolProfile.section = section;
      if (parentPhone) where.studentSchoolProfile.parentPhone = { contains: parentPhone };
    }

    // College-specific filters
    if (institutionType === 'COLLEGE' && (department || yearOfStudy)) {
      where.studentCollegeProfile = {};
      if (department) where.studentCollegeProfile.department = { contains: department, mode: 'insensitive' };
      if (yearOfStudy) where.studentCollegeProfile.yearOfStudy = parseInt(yearOfStudy);
    }

    // Handle search by roll number (check both school and college profiles)
    if (search && search.trim() && !isNaN(search.trim())) {
      const rollNo = search.trim();
      where.OR = [
        ...(where.OR || []),
        { studentSchoolProfile: { rollNo: rollNo } },
        { studentCollegeProfile: { regNo: rollNo } },
      ];
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get paginated results
    const students = await prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        studentSchoolProfile: true,
        studentCollegeProfile: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        students,
        institutionType,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message,
    });
  }
}

/**
 * Get admin dashboard statistics
 * GET /api/admin/stats
 */
async function getStats(req, res) {
  try {
    // Get admin's institution ID from authenticated user
    const adminInstitutionId = req.user?.institutionId;

    if (!adminInstitutionId) {
      return res.status(403).json({
        success: false,
        message: 'Admin must be associated with an institution',
      });
    }

    // Count total faculty
    const totalFaculty = await prisma.user.count({
      where: {
        roleType: 'FACULTY',
        institutionId: adminInstitutionId,
      },
    });

    // Count total students
    const totalStudents = await prisma.user.count({
      where: {
        roleType: 'STUDENT',
        institutionId: adminInstitutionId,
      },
    });

    // Count total sections
    const totalSections = await prisma.section.count({
      where: {
        institutionId: adminInstitutionId,
      },
    });

    // Count today's attendance sessions (sessions created today)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysSessions = await prisma.attendanceSession.count({
      where: {
        section: {
          institutionId: adminInstitutionId,
        },
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        totalFaculty,
        totalStudents,
        totalSections,
        todaysSessions,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
}

/**
 * Update user details (Faculty or Student)
 * PUT /api/admin/users/:userId
 */
async function updateUser(req, res) {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    const adminInstitutionId = req.user?.institutionId;

    if (!adminInstitutionId) {
      return res.status(403).json({
        success: false,
        message: 'Admin must be associated with an institution',
      });
    }

    // First, get the user to check if they belong to this institution
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        facultySchoolProfile: true,
        facultyCollegeProfile: true,
        studentSchoolProfile: true,
        studentCollegeProfile: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify the user belongs to the admin's institution
    if (existingUser.institutionId !== adminInstitutionId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit users from your institution',
      });
    }

    // Prepare update data for User table
    const userUpdateData = {
      fullName: updateData.fullName,
    };

    // Check for email uniqueness if being updated
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email },
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }
      userUpdateData.email = updateData.email;
    }

    // Check for phone uniqueness if being updated
    if (updateData.phone && updateData.phone !== existingUser.phone) {
      const phoneExists = await prisma.user.findUnique({
        where: { phone: updateData.phone },
      });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already exists',
        });
      }
      userUpdateData.phone = updateData.phone;
    }

    // Determine user type and update appropriate profile
    if (existingUser.roleType === 'FACULTY') {
      // Update faculty profile
      const profileUpdateData = {
        department: updateData.department,
        qualification: updateData.qualification,
      };

      if (existingUser.facultySchoolProfile) {
        profileUpdateData.employeeId = updateData.employeeId;

        // Check for employee ID uniqueness if being updated
        if (updateData.employeeId !== existingUser.facultySchoolProfile.employeeId) {
          const empIdExists = await prisma.facultySchoolProfile.findFirst({
            where: {
              employeeId: updateData.employeeId,
              user: {
                institutionId: adminInstitutionId,
              },
              userId: {
                not: parseInt(userId), // Exclude current user
              },
            },
          });

          if (empIdExists) {
            return res.status(400).json({
              success: false,
              message: `Employee ID ${updateData.employeeId} already exists`,
            });
          }
        }

        await prisma.user.update({
          where: { id: parseInt(userId) },
          data: {
            ...userUpdateData,
            facultySchoolProfile: {
              update: profileUpdateData,
            },
          },
        });
      } else if (existingUser.facultyCollegeProfile) {
        profileUpdateData.employeeId = updateData.employeeId;
        profileUpdateData.designation = updateData.designation;

        // Check for employee ID uniqueness if being updated
        if (updateData.employeeId !== existingUser.facultyCollegeProfile.employeeId) {
          const empIdExists = await prisma.facultyCollegeProfile.findFirst({
            where: {
              employeeId: updateData.employeeId,
              user: {
                institutionId: adminInstitutionId,
              },
              userId: {
                not: parseInt(userId), // Exclude current user
              },
            },
          });

          if (empIdExists) {
            return res.status(400).json({
              success: false,
              message: `Employee ID ${updateData.employeeId} already exists`,
            });
          }
        }

        await prisma.user.update({
          where: { id: parseInt(userId) },
          data: {
            ...userUpdateData,
            facultyCollegeProfile: {
              update: profileUpdateData,
            },
          },
        });
      }
    } else if (existingUser.roleType === 'STUDENT') {
      // Update student profile
      let profileUpdateData = {
        dob: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
      };

      if (existingUser.studentSchoolProfile) {
        // School student
        profileUpdateData = {
          ...profileUpdateData,
          class: updateData.class,
          section: updateData.section,
          rollNo: updateData.rollNumber,
          parentName: updateData.parentName,
          parentEmail: updateData.parentEmail,
          parentPhone: updateData.parentPhone,
        };

        // Check for roll number uniqueness within class/section
        if (updateData.rollNumber !== existingUser.studentSchoolProfile.rollNo ||
            updateData.class !== existingUser.studentSchoolProfile.class ||
            updateData.section !== existingUser.studentSchoolProfile.section) {
          const rollExists = await prisma.studentSchoolProfile.findFirst({
            where: {
              rollNo: updateData.rollNumber,
              class: updateData.class,
              section: updateData.section,
              user: {
                institutionId: adminInstitutionId,
              },
              userId: {
                not: parseInt(userId), // Exclude current user
              },
            },
          });

          if (rollExists) {
            return res.status(400).json({
              success: false,
              message: `Roll Number ${updateData.rollNumber} already exists in Class ${updateData.class}, Section ${updateData.section}`,
            });
          }
        }

        // Note: Student email is auto-generated, don't allow updates
        delete userUpdateData.email;

        await prisma.user.update({
          where: { id: parseInt(userId) },
          data: {
            ...userUpdateData,
            studentSchoolProfile: {
              update: profileUpdateData,
            },
          },
        });
      } else if (existingUser.studentCollegeProfile) {
        // College student
        profileUpdateData = {
          ...profileUpdateData,
          department: updateData.department,
          yearOfStudy: parseInt(updateData.yearOfStudy),
          semester: parseInt(updateData.semester),
          regNo: updateData.rollNumber,
        };

        // Check for registration number uniqueness within institution
        if (updateData.rollNumber !== existingUser.studentCollegeProfile.regNo) {
          const regExists = await prisma.studentCollegeProfile.findFirst({
            where: {
              regNo: updateData.rollNumber,
              user: {
                institutionId: adminInstitutionId,
              },
              userId: {
                not: parseInt(userId), // Exclude current user
              },
            },
          });

          if (regExists) {
            return res.status(400).json({
              success: false,
              message: `Registration Number ${updateData.rollNumber} already exists`,
            });
          }
        }

        await prisma.user.update({
          where: { id: parseInt(userId) },
          data: {
            ...userUpdateData,
            studentCollegeProfile: {
              update: profileUpdateData,
            },
          },
        });
      }
    }

    // Fetch updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        facultySchoolProfile: true,
        facultyCollegeProfile: true,
        studentSchoolProfile: true,
        studentCollegeProfile: true,
      },
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
}

module.exports = {
  createSection,
  getSections,
  syncSectionEnrollments,
  enrollStudent,
  assignFacultyToSection,
  getSectionEnrollments,
  getSectionFaculty,
  getFaculty,
  getStudents,
  getStats,
  updateUser,
};
