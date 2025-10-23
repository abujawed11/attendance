const prisma = require('../config/prisma');
const { getNextSequenceId } = require('../utils/helpers');

/**
 * Get all sections assigned to the logged-in faculty
 * GET /api/faculty/sections
 */
async function getFacultySections(req, res) {
  try {
    const facultyUserId = req.user.id;

    const facultySections = await prisma.facultySection.findMany({
      where: {
        facultyUserId,
        isActive: true,
      },
      include: {
        section: {
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
              },
            },
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    const sections = facultySections.map((fs) => ({
      id: fs.section.id,
      publicId: fs.section.publicId,
      name: fs.section.name,
      subject: fs.subject,
      institution: fs.section.institution,
      schoolClass: fs.section.schoolClass,
      schoolSection: fs.section.schoolSection,
      board: fs.section.board,
      department: fs.section.department,
      yearOfStudy: fs.section.yearOfStudy,
      semester: fs.section.semester,
      studentCount: fs.section._count.enrollments,
      assignedAt: fs.assignedAt,
    }));

    res.status(200).json({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error('Get faculty sections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sections',
      error: error.message,
    });
  }
}

/**
 * Get all students enrolled in a specific section
 * GET /api/sections/:sectionId/students
 */
async function getSectionStudents(req, res) {
  try {
    const { sectionId } = req.params;
    const facultyUserId = req.user.id;

    // Verify faculty has access to this section
    const facultySection = await prisma.facultySection.findFirst({
      where: {
        facultyUserId,
        sectionId: parseInt(sectionId),
        isActive: true,
      },
    });

    if (!facultySection) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this section',
      });
    }

    // Get all enrolled students
    const enrollments = await prisma.enrollment.findMany({
      where: {
        sectionId: parseInt(sectionId),
        isActive: true,
      },
      include: {
        student: {
          select: {
            id: true,
            publicId: true,
            email: true,
            fullName: true,
            phone: true,
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
        student: {
          fullName: 'asc',
        },
      },
    });

    const students = enrollments.map((enrollment) => ({
      enrollmentId: enrollment.id,
      studentId: enrollment.student.id,
      publicId: enrollment.student.publicId,
      fullName: enrollment.student.fullName,
      email: enrollment.student.email,
      phone: enrollment.student.phone,
      rollNo: enrollment.student.studentSchoolProfile?.rollNo ||
              enrollment.student.studentCollegeProfile?.regNo || null,
      class: enrollment.student.studentSchoolProfile?.class || null,
      section: enrollment.student.studentSchoolProfile?.section || null,
      department: enrollment.student.studentCollegeProfile?.department || null,
      yearOfStudy: enrollment.student.studentCollegeProfile?.yearOfStudy || null,
      semester: enrollment.student.studentCollegeProfile?.semester || null,
      enrolledAt: enrollment.enrolledAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        section: enrollments[0]?.section,
        students,
      },
    });
  } catch (error) {
    console.error('Get section students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message,
    });
  }
}

/**
 * Create a new attendance session
 * POST /api/attendance/sessions
 * Body: { sectionId, date, subject, notes }
 */
async function createAttendanceSession(req, res) {
  try {
    const { sectionId, date, subject, notes } = req.body;
    const facultyUserId = req.user.id;

    // Validate required fields
    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: 'Section ID is required',
      });
    }

    // Verify faculty has access to this section
    const facultySection = await prisma.facultySection.findFirst({
      where: {
        facultyUserId,
        sectionId: parseInt(sectionId),
        isActive: true,
      },
    });

    if (!facultySection) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this section',
      });
    }

    // Generate public ID for the session
    const publicId = await getNextSequenceId('attendance_session');

    // Create attendance session
    const session = await prisma.attendanceSession.create({
      data: {
        publicId,
        sectionId: parseInt(sectionId),
        facultyUserId,
        date: date ? new Date(date) : new Date(),
        subject: subject || null,
        notes: notes || null,
      },
      include: {
        section: {
          select: {
            name: true,
            publicId: true,
          },
        },
        faculty: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Attendance session created successfully',
      data: session,
    });
  } catch (error) {
    console.error('Create attendance session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create attendance session',
      error: error.message,
    });
  }
}

/**
 * Mark attendance for students in a session (batch)
 * POST /api/attendance/sessions/:sessionId/punches
 * Body: { punches: [{ enrollmentId, status, remarks }] }
 */
async function markAttendance(req, res) {
  try {
    const { sessionId } = req.params;
    const { punches } = req.body;
    const facultyUserId = req.user.id;

    // Validate required fields
    if (!punches || !Array.isArray(punches) || punches.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Punches array is required and must not be empty',
      });
    }

    // Verify session exists and belongs to this faculty
    const session = await prisma.attendanceSession.findUnique({
      where: { id: parseInt(sessionId) },
      include: {
        section: true,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Attendance session not found',
      });
    }

    if (session.facultyUserId !== facultyUserId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to mark attendance for this session',
      });
    }

    // Validate all enrollments belong to the session's section
    const enrollmentIds = punches.map((p) => p.enrollmentId);
    const enrollments = await prisma.enrollment.findMany({
      where: {
        id: { in: enrollmentIds },
        sectionId: session.sectionId,
        isActive: true,
      },
    });

    if (enrollments.length !== enrollmentIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some enrollments are invalid or do not belong to this section',
      });
    }

    // Use transaction to create/update all attendance punches
    const result = await prisma.$transaction(async (tx) => {
      const createdPunches = [];

      for (const punch of punches) {
        const { enrollmentId, status, remarks } = punch;

        // Validate status
        if (!['PRESENT', 'ABSENT', 'LATE'].includes(status)) {
          throw new Error(`Invalid attendance status: ${status}`);
        }

        // Upsert attendance punch (create or update if exists)
        const attendancePunch = await tx.attendancePunch.upsert({
          where: {
            sessionId_enrollmentId: {
              sessionId: parseInt(sessionId),
              enrollmentId: parseInt(enrollmentId),
            },
          },
          update: {
            status,
            remarks: remarks || null,
            markedAt: new Date(),
          },
          create: {
            sessionId: parseInt(sessionId),
            enrollmentId: parseInt(enrollmentId),
            status,
            remarks: remarks || null,
          },
          include: {
            enrollment: {
              include: {
                student: {
                  select: {
                    fullName: true,
                    publicId: true,
                  },
                },
              },
            },
          },
        });

        createdPunches.push(attendancePunch);
      }

      return createdPunches;
    });

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        sessionId: parseInt(sessionId),
        markedCount: result.length,
        punches: result,
      },
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: error.message,
    });
  }
}

/**
 * Get attendance sessions for a section
 * GET /api/attendance/sessions?sectionId=1&startDate=2024-01-01&endDate=2024-12-31
 */
async function getAttendanceSessions(req, res) {
  try {
    const { sectionId, startDate, endDate } = req.query;
    const facultyUserId = req.user.id;

    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: 'Section ID is required',
      });
    }

    // Verify faculty has access to this section
    const facultySection = await prisma.facultySection.findFirst({
      where: {
        facultyUserId,
        sectionId: parseInt(sectionId),
        isActive: true,
      },
    });

    if (!facultySection) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this section',
      });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    const sessions = await prisma.attendanceSession.findMany({
      where: {
        sectionId: parseInt(sectionId),
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      include: {
        _count: {
          select: {
            punches: true,
          },
        },
        section: {
          select: {
            name: true,
            publicId: true,
          },
        },
        faculty: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('Get attendance sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance sessions',
      error: error.message,
    });
  }
}

/**
 * Get detailed attendance for a specific session
 * GET /api/attendance/sessions/:sessionId
 */
async function getSessionDetail(req, res) {
  try {
    const { sessionId } = req.params;
    const facultyUserId = req.user.id;

    const session = await prisma.attendanceSession.findUnique({
      where: { id: parseInt(sessionId) },
      include: {
        section: true,
        faculty: {
          select: {
            fullName: true,
            email: true,
          },
        },
        punches: {
          include: {
            enrollment: {
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
              },
            },
          },
          orderBy: {
            enrollment: {
              student: {
                fullName: 'asc',
              },
            },
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Attendance session not found',
      });
    }

    // Verify faculty has access
    const facultySection = await prisma.facultySection.findFirst({
      where: {
        facultyUserId,
        sectionId: session.sectionId,
        isActive: true,
      },
    });

    if (!facultySection) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this session',
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Get session detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session details',
      error: error.message,
    });
  }
}

/**
 * Get student's own attendance records
 * GET /api/attendance/my?startDate=2024-01-01&endDate=2024-12-31
 */
async function getMyAttendance(req, res) {
  try {
    const studentUserId = req.user.id;
    const { startDate, endDate } = req.query;

    // Get student's enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentUserId,
        isActive: true,
      },
      include: {
        section: {
          select: {
            id: true,
            publicId: true,
            name: true,
            schoolClass: true,
            schoolSection: true,
            department: true,
            yearOfStudy: true,
            semester: true,
          },
        },
      },
    });

    if (enrollments.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          sections: [],
          message: 'You are not enrolled in any sections yet',
        },
      });
    }

    // Build date filter for sessions
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Get attendance records for each enrollment
    const attendanceData = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Get all attendance punches for this enrollment
        const punches = await prisma.attendancePunch.findMany({
          where: {
            enrollmentId: enrollment.id,
            ...(Object.keys(dateFilter).length > 0 && {
              session: {
                date: dateFilter,
              },
            }),
          },
          include: {
            session: {
              select: {
                id: true,
                publicId: true,
                date: true,
                subject: true,
                notes: true,
                faculty: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
          orderBy: {
            session: {
              date: 'desc',
            },
          },
        });

        // Calculate statistics
        const totalSessions = punches.length;
        const presentCount = punches.filter((p) => p.status === 'PRESENT').length;
        const absentCount = punches.filter((p) => p.status === 'ABSENT').length;
        const lateCount = punches.filter((p) => p.status === 'LATE').length;
        const attendancePercentage =
          totalSessions > 0 ? ((presentCount + lateCount) / totalSessions) * 100 : 0;

        return {
          section: enrollment.section,
          enrollmentId: enrollment.id,
          enrolledAt: enrollment.enrolledAt,
          statistics: {
            totalSessions,
            presentCount,
            absentCount,
            lateCount,
            attendancePercentage: parseFloat(attendancePercentage.toFixed(2)),
          },
          records: punches.map((punch) => ({
            id: punch.id,
            date: punch.session.date,
            subject: punch.session.subject,
            status: punch.status,
            remarks: punch.remarks,
            markedAt: punch.markedAt,
            faculty: punch.session.faculty.fullName,
            sessionId: punch.session.id,
          })),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        sections: attendanceData,
        summary: {
          totalSections: enrollments.length,
          overallAttendance: attendanceData.reduce((sum, section) =>
            sum + section.statistics.attendancePercentage, 0) / enrollments.length || 0,
        },
      },
    });
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: error.message,
    });
  }
}

module.exports = {
  getFacultySections,
  getSectionStudents,
  createAttendanceSession,
  markAttendance,
  getAttendanceSessions,
  getSessionDetail,
  getMyAttendance,
};
