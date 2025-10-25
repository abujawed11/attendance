const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuplicatePhones() {
  try {
    // Find all phone numbers that appear more than once
    const duplicates = await prisma.$queryRaw`
      SELECT phone, COUNT(*) as count
      FROM User
      WHERE phone IS NOT NULL
      GROUP BY phone
      HAVING count > 1
    `;

    if (duplicates.length === 0) {
      console.log('✅ No duplicate phone numbers found! Safe to add unique constraint.');
    } else {
      console.log(`⚠️  Found ${duplicates.length} duplicate phone number(s):`);
      duplicates.forEach((dup) => {
        console.log(`  - Phone: ${dup.phone}, Count: ${dup.count}`);
      });

      // Show users with duplicate phones
      for (const dup of duplicates) {
        const users = await prisma.user.findMany({
          where: { phone: dup.phone },
          select: { id: true, publicId: true, fullName: true, email: true, roleType: true, phone: true }
        });
        console.log(`\n  Users with phone ${dup.phone}:`);
        users.forEach(u => {
          console.log(`    - ID: ${u.id}, ${u.fullName} (${u.email}), Role: ${u.roleType}`);
        });
      }
    }
  } catch (error) {
    console.error('Error checking duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicatePhones();
