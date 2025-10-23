/**
 * Create a custom invite code
 * Usage: node scripts/create-invite.js <CODE> <ROLES> <MAX_USES> <EXPIRY_DATE>
 *
 * Examples:
 * - node scripts/create-invite.js ADMIN123XYZ ADMIN 10 2025-12-31
 * - node scripts/create-invite.js FACULTY2025 FACULTY 50 2025-12-31
 * - node scripts/create-invite.js STUDENT2025 STUDENT 100 2025-12-31
 * - node scripts/create-invite.js ALLROLES "STUDENT,FACULTY,ADMIN" 100 2025-12-31
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createInvite() {
  // Parse command line arguments
  const args = process.argv.slice(2);

  try {

    if (args.length < 1) {
      console.log('❌ Error: Invite code is required!\n');
      console.log('Usage: node scripts/create-invite.js <CODE> [ROLES] [MAX_USES] [EXPIRY_DATE]\n');
      console.log('Examples:');
      console.log('  node scripts/create-invite.js ADMIN123XYZ ADMIN 10 2025-12-31');
      console.log('  node scripts/create-invite.js FACULTY2025 FACULTY 50 2025-12-31');
      console.log('  node scripts/create-invite.js STUDENT2025 STUDENT 100 2025-12-31');
      console.log('  node scripts/create-invite.js ALLROLES "STUDENT,FACULTY,ADMIN" 100 2025-12-31');
      process.exit(1);
    }

    const code = args[0];
    const rolesInput = args[1] || 'STUDENT,FACULTY,ADMIN';
    const maxUses = parseInt(args[2]) || 100;
    const expiryDate = args[3] || '2025-12-31';

    // Parse roles
    const roles = rolesInput.split(',').map(r => r.trim());
    const validRoles = ['STUDENT', 'FACULTY', 'PARENT', 'ADMIN'];

    // Validate roles
    const invalidRoles = roles.filter(r => !validRoles.includes(r));
    if (invalidRoles.length > 0) {
      console.log(`❌ Invalid roles: ${invalidRoles.join(', ')}`);
      console.log(`Valid roles are: ${validRoles.join(', ')}`);
      process.exit(1);
    }

    console.log('Creating invite code...\n');

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

    const publicId = `INV${(sequence.next || 1).toString().padStart(6, '0')}`;

    // Create invite
    const invite = await prisma.invite.create({
      data: {
        publicId,
        code: code,
        allowedRoles: JSON.stringify(roles),
        allowedDomains: null,
        maxUses: maxUses,
        usedCount: 0,
        expiresAt: new Date(expiryDate),
      },
    });

    console.log('✅ Invite created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log(`📋 Invite Code:    ${invite.code}`);
    console.log(`🆔 Public ID:      ${invite.publicId}`);
    console.log(`🎭 Allowed Roles:  ${roles.join(', ')}`);
    console.log(`📊 Max Uses:       ${invite.maxUses}`);
    console.log(`📈 Used Count:     ${invite.usedCount}`);
    console.log(`📅 Expires:        ${invite.expiresAt.toDateString()}`);
    console.log('═══════════════════════════════════════\n');
    console.log(`✓ You can now use "${invite.code}" as invite code in the signup form!`);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log(`\n❌ Error: Invite code "${args[0]}" already exists!`);
      console.log('\nTip: Try a different code or delete the existing one from the database.');
      console.log('To see existing invites, run: npx prisma studio\n');
    } else {
      console.error('❌ Error creating invite:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createInvite();
