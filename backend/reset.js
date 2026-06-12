const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.booking.deleteMany();
  console.log('✅ All bookings and audit logs cleared');
}

main().catch(console.error).finally(() => prisma.$disconnect());

//To rest audit logs