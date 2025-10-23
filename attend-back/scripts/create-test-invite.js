const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestInvite() {
  try {
    console.log('Creating test invite code...');

    // Get next sequence for invite
    let sequence = await prisma.sequence.findUnique({
      where: { model: 'invite' },
    });

    if (!sequence) {
      sequence = await prisma.sequence.create({
        data: { model: 'invite', next: 2 },
      });
    } else {
      await prisma.sequence.update({
        where: { model: 'invite' },
        data: { next: sequence.next + 1 },
      });
    }

    const publicId = `INV${sequence.next.toString().padStart(6, '0')}`;

    // Create test invite
    const invite = await prisma.invite.create({
      data: {
        publicId,
        code: 'ADMIN123XYZ',
        allowedRoles: JSON.stringify(['STUDENT', 'FACULTY', 'ADMIN']),
        allowedDomains: null,
        maxUses: 100,
        usedCount: 0,
        expiresAt: new Date('2025-12-31'), // Valid until end of 2025
      },
    });

    console.log('✅ Test invite created successfully!');
    console.log('📋 Invite Code: TEST123');
    console.log('🎭 Allowed Roles: STUDENT, FACULTY, ADMIN');
    console.log('📊 Max Uses: 100');
    console.log('📅 Expires: 2025-12-31');
    console.log('\nYou can now use "TEST123" as invite code in the signup form!');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('✅ Invite code TEST123 already exists!');
      console.log('You can use "TEST123" as invite code in the signup form.');
    } else {
      console.error('❌ Error creating invite:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestInvite();
