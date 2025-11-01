  const { PrismaClient } = require('@prisma/client');

  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  // Handle graceful shutdown on proper signals
  const gracefulShutdown = async (signal) => {
    console.log(`${signal} received, shutting down gracefully...`);
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  module.exports = prisma;