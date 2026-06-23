const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Connecting...');
  try {
    const users = await prisma.user.findMany();
    console.log('Successfully connected! Users count:', users.length);
  } catch (err) {
    console.error('Error connecting to database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
