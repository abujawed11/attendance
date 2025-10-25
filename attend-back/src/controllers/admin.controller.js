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
      institutionId,
      schoolClass,
      schoolSection,
      board,
      department,
      yearOfStudy,
      semester,
    } = req.body;

    if (!name || !institutionId) {
      return res.status(400).json({
        success: false,
        message: 'Name and institution ID are required',
      });
    }

    // Verify institution exists
    const institution = await prisma.institution.findUnique({
      where: { id: parseInt(institutionId) },
    });

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found',
      });
    }

    const publicId = await getNextSequenceId('section');

    const section = await prisma.section.create({
      data: {
        publicId,
        name,
        institutionId: parseInt(institutionId),
        schoolClass: schoolClass || null,
        schoolSection: schoolSection || null,
        board: board || null,
        department: department || null,
        yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : null,
        semester: semester ? parseInt(semester) : null,
      },
      include: {
        institution: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: section,
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
 * Get all sections for an institution
 * GET /api/admin/sections?institutionId=1
 */
async function getSections(req, res) {
  try {
    const { institutionId } = req.query;

    const where = {};
    if (institutionId) {
      where.institutionId = parseInt(institutionId);
    }

    const sections = await prisma.section.findMany({
      where,
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
      orderBy: {
        name: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      data: sections,
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

module.exports = {
  createSection,
  getSections,
  enrollStudent,
  assignFacultyToSection,
  getSectionEnrollments,
  getSectionFaculty,
  getFaculty,
  getStudents,
};
