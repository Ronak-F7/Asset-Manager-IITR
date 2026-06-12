const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash('ronak123', 10);
  
  // Delete old admins
  await prisma.user.deleteMany({ where: { role: 'ADMIN' } });
  
  // Create fresh admin
  await prisma.user.create({
    data: { name: 'Ronak Das', email: 'ronak@cult.com', password: pass, role: 'ADMIN' }
  });
  
  console.log('✅ Admin reset successfully');
  console.log('Email: ronak@cult.com');
  console.log('Password: ronak123');
}

main().catch(console.error).finally(() => prisma.$disconnect());