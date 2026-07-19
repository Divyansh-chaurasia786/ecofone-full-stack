const { execSync } = require('child_process');

// Map environment variable for Vercel Serverless Build
if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
} else if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_URL;
}

console.log('Using DATABASE_URL:', process.env.DATABASE_URL ? 'PRESENT (hidden)' : 'MISSING');

// Run prisma generate
console.log('Running prisma generate...');
execSync('npx prisma generate', { stdio: 'inherit', env: process.env });

// Run nest build
console.log('Running nest build...');
execSync('npx nest build', { stdio: 'inherit', env: process.env });
