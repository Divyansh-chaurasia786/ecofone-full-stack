const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  console.log('Seeding database with default records...');

  // 1. Create sub-admin testsub
  const username = 'testsub';
  const password = 'password123';
  const permissions = ['franchise', 'contact', 'reviews', 'stores', 'team', 'logs'];

  try {
    await prisma.subAdmin.delete({ where: { username } }).catch(() => {});
    const passwordHash = await bcrypt.hash(password, 10);
    const subAdmin = await prisma.subAdmin.create({
      data: {
        username,
        password: passwordHash,
        permissions,
      }
    });
    console.log('Created sub-admin:', subAdmin.username);
  } catch (e) {
    console.error('Failed to create sub-admin:', e.message);
  }

  // 2. Create sample reviews
  const reviews = [
    {
      authorName: 'Aarav Sharma',
      rating: 5,
      comment: 'Bought an iPhone 13 in pristine condition. Battery health was 96% and doorstep delivery was super fast. Highly recommended!',
      verifiedProduct: 'iPhone 13 (128GB)',
      isVerified: true,
      status: 'APPROVED',
    },
    {
      authorName: 'Priya Verma',
      rating: 5,
      comment: 'Sold my old OnePlus phone for instant cash. The evaluation was transparent and amount credited within 5 minutes.',
      verifiedProduct: 'OnePlus 9 Pro',
      isVerified: true,
      status: 'APPROVED',
    },
    {
      authorName: 'Rohan Mehta',
      rating: 5,
      comment: 'Great service and authentic warranty coverage! The device came with official accessories and full 6-month EcoFone seal.',
      verifiedProduct: 'Samsung Galaxy S22',
      isVerified: true,
      status: 'PENDING',
    }
  ];

  for (const rev of reviews) {
    try {
      const created = await prisma.review.create({
        data: rev
      });
      console.log('Created review for:', created.authorName);
    } catch (e) {
      console.error('Failed to create review:', e.message);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch(err => {
    console.error('Error during seeding:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
