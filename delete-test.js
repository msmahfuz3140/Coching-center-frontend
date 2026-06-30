const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetEmail = 'ashifulmia@gmail.com';
  console.log(`Searching for user: ${targetEmail}`);
  const user = await prisma.user.findUnique({ where: { email: targetEmail } });
  if (!user) {
    console.log('User not found.');
    return;
  }
  console.log('Found user:', user);
  try {
    console.log('Attempting delete...');
    const result = await prisma.user.delete({ where: { id: user.id } });
    console.log('Delete successful:', result);
  } catch (err) {
    console.error('Error during delete:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
