const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning all tables in database...');
  
  const tablenames = [
    'OrderItem', 'Order', 'InventoryItem', 'SKU', 'DeviceVariant', 
    'DeviceModel', 'Brand', 'TradeInQuote', 'BlogPost', 'JobApplication', 
    'JobListing', 'Review', 'Store', 'SubAdmin', 'SystemLog', 
    'OtpRecord', 'WebhookConfig', 'TeamMember', 'FranchiseApplication', 'User'
  ];

  for (const name of tablenames) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${name}" CASCADE;`);
      console.log(`Truncated table: ${name}`);
    } catch (e) {
      console.warn(`Could not truncate table ${name}:`, e.message);
    }
  }

  console.log('Database cleaned successfully!');
}

main()
  .catch(err => {
    console.error('Failed to clean database:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
