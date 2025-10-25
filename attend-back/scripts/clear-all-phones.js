const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAllPhones() {
  try {
    console.log('🔄 Clearing all phone numbers from User table...\n');

    const result = await prisma.user.updateMany({
      data: { phone: null }
    });

    console.log(`✅ Cleared phone numbers from ${result.count} users\n`);

    // Verify
    const usersWithPhone = await prisma.user.count({
      where: { phone: { not: null } }
    });

    const totalUsers = await prisma.user.count();

    console.log(`📊 Summary:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with phone: ${usersWithPhone}`);
    console.log(`\n✅ Ready for migration! Run: npx prisma migrate dev\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllPhones();
