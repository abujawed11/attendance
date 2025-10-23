/**
 * Seed script for attendance system demo data
 * Creates: 1 school institution, 1 faculty, 1 section, 5 students, and sample attendance
 *
 * Usage: node scripts/seed-attendance.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function getNextSequenceId(modelName) {
  const prefixes = {
    user: 'USR',
    institution: 'INS',
    invite: 'INV',
    section: 'SEC',
    attendance_session: 'ATT',
  };

  const prefix = prefixes[modelName.toLowerCase()] || 'GEN';

  const sequence = await prisma.$transaction(async (tx) => {
    let seq = await tx.sequence.findUnique({
      where: { model: modelName.toLowerCase() },
    });

    if (!seq) {
      seq = await tx.sequence.create({
        data: {
          model: modelName.toLowerCase(),
          next: 2,
        },
      });
      return 1;
    }

    const currentValue = seq.next;
    await tx.sequence.update({
      where: { model: modelName.toLowerCase() },
      data: { next: currentValue + 1 },
    });

    return currentValue;
  });

  return `${prefix}${sequence.toString().padStart(6, '0')}`;
}

async function main() {
  console.log('🌱 Starting attendance system seed...\n');

  try {
    // 1. Create Institution
    console.log('📚 Creating institution...');
    const institutionPublicId = await getNextSequenceId('institution');
    const institution = await prisma.institution.create({
      data: {
        publicId: institutionPublicId,
        name: 'Springfield High School',
        type: 'SCHOOL',
        city: 'Springfield, USA',
        board: 'CBSE',
      },
    });
    console.log(`   ✓ Institution created: ${institution.name} (${institution.publicId})\n`);

    // 2. Create Faculty User
    console.log('👨‍🏫 Creating faculty user...');
    const facultyPublicId = await getNextSequenceId('user');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const faculty = await prisma.user.create({
      data: {
        publicId: facultyPublicId,
        email: 'john.doe@springfield.edu',
        fullName: 'John Doe',
        password: hashedPassword,
        roleType: 'FACULTY',
        phone: '+1234567890',
        institutionId: institution.id,
        facultySchoolProfile: {
          create: {
            institutionType: 'SCHOOL',
            schoolName: 'Springfield High School',
            department: 'Mathematics',
            employeeId: 'FAC001',
          },
        },
      },
    });
    console.log(`   ✓ Faculty created: ${faculty.fullName} (${faculty.email})`);
    console.log(`   ✓ Password: password123\n`);

    // 3. Create Section
    console.log('📖 Creating section...');
    const sectionPublicId = await getNextSequenceId('section');
    const section = await prisma.section.create({
      data: {
        publicId: sectionPublicId,
        name: 'Class 10 A',
        institutionId: institution.id,
        schoolClass: '10',
        schoolSection: 'A',
        board: 'CBSE',
      },
    });
    console.log(`   ✓ Section created: ${section.name} (${section.publicId})\n`);

    // 4. Assign Faculty to Section
    console.log('🔗 Assigning faculty to section...');
    const facultySection = await prisma.facultySection.create({
      data: {
        facultyUserId: faculty.id,
        sectionId: section.id,
        subject: 'Mathematics',
        isActive: true,
      },
    });
    console.log(`   ✓ Faculty assigned to section with subject: ${facultySection.subject}\n`);

    // 5. Create Students
    console.log('👨‍🎓 Creating students...');
    const students = [];
    const studentNames = [
      'Alice Johnson',
      'Bob Smith',
      'Charlie Brown',
      'Diana Prince',
      'Edward Norton',
    ];

    for (let i = 0; i < studentNames.length; i++) {
      const studentPublicId = await getNextSequenceId('user');
      const email = studentNames[i].toLowerCase().replace(' ', '.') + '@student.springfield.edu';

      const student = await prisma.user.create({
        data: {
          publicId: studentPublicId,
          email: email,
          fullName: studentNames[i],
          password: hashedPassword,
          roleType: 'STUDENT',
          institutionId: institution.id,
          studentSchoolProfile: {
            create: {
              institutionType: 'SCHOOL',
              schoolName: 'Springfield High School',
              board: 'CBSE',
              class: '10',
              section: 'A',
              rollNo: `10A${(i + 1).toString().padStart(3, '0')}`,
              dob: new Date('2008-01-15'),
            },
          },
        },
      });

      students.push(student);
      console.log(`   ✓ Student ${i + 1}: ${student.fullName} (${student.email})`);
    }
    console.log(`   ✓ Password for all students: password123\n`);

    // 6. Enroll Students in Section
    console.log('📝 Enrolling students in section...');
    for (const student of students) {
      await prisma.enrollment.create({
        data: {
          studentUserId: student.id,
          sectionId: section.id,
          isActive: true,
        },
      });
    }
    console.log(`   ✓ ${students.length} students enrolled in ${section.name}\n`);

    // 7. Create Sample Attendance Sessions
    console.log('📅 Creating sample attendance sessions...');

    // Session 1 - 3 days ago
    const session1PublicId = await getNextSequenceId('attendance_session');
    const session1Date = new Date();
    session1Date.setDate(session1Date.getDate() - 3);

    const session1 = await prisma.attendanceSession.create({
      data: {
        publicId: session1PublicId,
        sectionId: section.id,
        facultyUserId: faculty.id,
        date: session1Date,
        subject: 'Mathematics',
        notes: 'Algebra - Quadratic Equations',
      },
    });
    console.log(`   ✓ Session 1 created: ${session1.subject} (${session1Date.toDateString()})`);

    // Mark attendance for session 1 - All present
    for (let i = 0; i < students.length; i++) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          studentUserId: students[i].id,
          sectionId: section.id,
        },
      });

      await prisma.attendancePunch.create({
        data: {
          sessionId: session1.id,
          enrollmentId: enrollment.id,
          status: 'PRESENT',
        },
      });
    }
    console.log('     → All students marked PRESENT\n');

    // Session 2 - 2 days ago
    const session2PublicId = await getNextSequenceId('attendance_session');
    const session2Date = new Date();
    session2Date.setDate(session2Date.getDate() - 2);

    const session2 = await prisma.attendanceSession.create({
      data: {
        publicId: session2PublicId,
        sectionId: section.id,
        facultyUserId: faculty.id,
        date: session2Date,
        subject: 'Mathematics',
        notes: 'Geometry - Triangles',
      },
    });
    console.log(`   ✓ Session 2 created: ${session2.subject} (${session2Date.toDateString()})`);

    // Mark attendance for session 2 - Mix of present, absent, late
    const statuses = ['PRESENT', 'PRESENT', 'ABSENT', 'PRESENT', 'LATE'];
    for (let i = 0; i < students.length; i++) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          studentUserId: students[i].id,
          sectionId: section.id,
        },
      });

      await prisma.attendancePunch.create({
        data: {
          sessionId: session2.id,
          enrollmentId: enrollment.id,
          status: statuses[i],
          remarks: statuses[i] === 'ABSENT' ? 'Medical leave' : null,
        },
      });
    }
    console.log('     → Mixed attendance: 3 Present, 1 Absent, 1 Late\n');

    // Session 3 - Yesterday
    const session3PublicId = await getNextSequenceId('attendance_session');
    const session3Date = new Date();
    session3Date.setDate(session3Date.getDate() - 1);

    const session3 = await prisma.attendanceSession.create({
      data: {
        publicId: session3PublicId,
        sectionId: section.id,
        facultyUserId: faculty.id,
        date: session3Date,
        subject: 'Mathematics',
        notes: 'Trigonometry - Basic Ratios',
      },
    });
    console.log(`   ✓ Session 3 created: ${session3.subject} (${session3Date.toDateString()})`);

    // Mark attendance for session 3 - All present
    for (let i = 0; i < students.length; i++) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          studentUserId: students[i].id,
          sectionId: section.id,
        },
      });

      await prisma.attendancePunch.create({
        data: {
          sessionId: session3.id,
          enrollmentId: enrollment.id,
          status: 'PRESENT',
        },
      });
    }
    console.log('     → All students marked PRESENT\n');

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • Institution: ${institution.name}`);
    console.log(`   • Faculty: ${faculty.fullName} (${faculty.email})`);
    console.log(`   • Section: ${section.name}`);
    console.log(`   • Students: ${students.length} enrolled`);
    console.log(`   • Attendance Sessions: 3 sessions created`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Faculty:');
    console.log(`     Email: ${faculty.email}`);
    console.log('     Password: password123');
    console.log('\n   Students (all use password: password123):');
    students.forEach((s, i) => {
      console.log(`     ${i + 1}. ${s.email}`);
    });
    console.log('\n═══════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
