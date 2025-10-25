const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupDuplicatePhones() {
  try {
    console.log('🔍 Finding duplicate phone numbers...\n');

    // Find all duplicate phone numbers
    const duplicates = await prisma.$queryRaw`
      SELECT phone, COUNT(*) as count
      FROM User
      WHERE phone IS NOT NULL
      GROUP BY phone
      HAVING count > 1
    `;

    console.log(`Found ${duplicates.length} duplicate phone numbers\n`);

    for (const dup of duplicates) {
      const phone = dup.phone;
      console.log(`\n📞 Processing phone: ${phone}`);

      // Get all users with this phone
      const users = await prisma.user.findMany({
        where: { phone },
        orderBy: { id: 'asc' },
        select: { id: true, publicId: true, fullName: true, email: true, roleType: true }
      });

      console.log(`  Found ${users.length} users with this phone:`);
      users.forEach(u => console.log(`    - ${u.fullName} (${u.roleType})`));

      // Strategy: Keep the FIRST PARENT user, remove phone from others
      const parentUser = users.find(u => u.roleType === 'PARENT');
      const firstUser = users[0];

      const keepUser = parentUser || firstUser; // Keep parent if exists, otherwise keep first user

      console.log(`  ✅ Keeping phone for: ${keepUser.fullName} (ID: ${keepUser.id})`);

      // Remove phone from all other users
      const usersToUpdate = users.filter(u => u.id !== keepUser.id);

      for (const user of usersToUpdate) {
        await prisma.user.update({
          where: { id: user.id },
          data: { phone: null }
        });
        console.log(`  🔄 Removed phone from: ${user.fullName} (ID: ${user.id})`);
      }
    }

    console.log('\n\n✅ Cleanup completed! You can now run the migration.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicatePhones();
