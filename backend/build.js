const { execSync } = require('child_process');

// Map environment variable for Vercel Serverless Build / Local Fallbacks
if (!process.env.POSTGRES_PRISMA_URL) {
  process.env.POSTGRES_PRISMA_URL = process.env.DATABASE_URL || '';
}

console.log('Using POSTGRES_PRISMA_URL:', process.env.POSTGRES_PRISMA_URL ? 'PRESENT (hidden)' : 'MISSING');

// Run prisma generate
console.log('Running prisma generate...');
execSync('npx prisma generate', { stdio: 'inherit', env: process.env });

// Run nest build
console.log('Running nest build...');
execSync('npx nest build', { stdio: 'inherit', env: process.env });
