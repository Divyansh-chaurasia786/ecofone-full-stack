const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  const username = 'testsub';
  const password = 'password123';
  const permissions = ['franchise', 'contact'];

  // Delete existing if any
  try {
    await prisma.subAdmin.delete({ where: { username } });
  } catch (e) {}

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await prisma.subAdmin.create({
    data: {
      username,
      password: passwordHash,
      permissions,
    }
  });
  console.log('Created sub-admin:', created);
}

main().catch(err => {
  console.error(err);
}).finally(() => {
  prisma.$disconnect();
});
