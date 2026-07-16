const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Connected!');
    
    console.log('Fetching team members...');
    const members = await prisma.teamMember.findMany();
    console.log(`Found ${members.length} records:`);
    members.forEach(m => console.log(` - ID: ${m.id}, Name: ${m.name}`));
    
    if (members.length > 0) {
      const firstId = members[0].id;
      console.log(`\nTesting update for first ID: ${firstId}`);
      const updated = await prisma.teamMember.update({
        where: { id: firstId },
        data: { order: 1 }
      });
      console.log('Update success!', updated.id);
    }
  } catch (err) {
    console.error('Database query failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
