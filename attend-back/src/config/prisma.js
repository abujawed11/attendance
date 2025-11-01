const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Export disconnect function for server to call during shutdown
prisma.gracefulDisconnect = async () => {
  console.log('Disconnecting Prisma...');
  await prisma.$disconnect();
  console.log('Prisma disconnected');
};

module.exports = prisma;