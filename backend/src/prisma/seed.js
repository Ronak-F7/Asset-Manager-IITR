const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin with new credentials
  const adminPass = await bcrypt.hash('ronak123', 10);
  await prisma.user.upsert({
    where: { email: 'ronakdas@iitr.ac.in' },
    update: { password: adminPass },
    create: { name: 'Ronak Das', email: 'ronakdas@iitr.ac.in', password: adminPass, role: 'ADMIN' },
  });

  // Remove old admin if exists
  await prisma.user.deleteMany({ where: { email: 'admin@cult.iitroorkee.ac.in' } }).catch(() => {});
  await prisma.user.deleteMany({ where: { email: 'user@iitroorkee.ac.in' } }).catch(() => {});

  // Create assets
  const assets = [
    { name: 'Canon EOS 5D Mark IV', category: 'DSLR Cameras', description: 'Professional DSLR camera with 4K video', totalQuantity: 5, availableQuantity: 5, condition: 'Excellent' },
    { name: 'Nikon D7500', category: 'DSLR Cameras', description: 'Mid-range DSLR camera', totalQuantity: 3, availableQuantity: 3, condition: 'Good' },
    { name: 'Godox SL-60W LED Light', category: 'Studio Lighting', description: '60W continuous LED studio light', totalQuantity: 8, availableQuantity: 8, condition: 'Good' },
    { name: 'Softbox Kit 90x90cm', category: 'Studio Lighting', description: 'Diffused studio lighting kit', totalQuantity: 4, availableQuantity: 4, condition: 'Good' },
    { name: 'Bose PA System', category: 'Audio Systems', description: 'Portable PA system for events', totalQuantity: 2, availableQuantity: 2, condition: 'Excellent' },
    { name: 'Shure SM58 Microphone', category: 'Audio Systems', description: 'Dynamic vocal microphone', totalQuantity: 10, availableQuantity: 10, condition: 'Good' },
    { name: 'Traditional Costume Set A', category: 'Costumes', description: 'Set of 10 traditional Indian costumes', totalQuantity: 3, availableQuantity: 3, condition: 'Good' },
    { name: 'Western Costume Set', category: 'Costumes', description: 'Assorted western stage costumes', totalQuantity: 5, availableQuantity: 5, condition: 'Fair' },
    { name: 'Stage Backdrop 12x8ft', category: 'Stage Props', description: 'Black velvet stage backdrop', totalQuantity: 2, availableQuantity: 2, condition: 'Good' },
    { name: 'Portable LED Stage Lights', category: 'Stage Props', description: 'RGB LED stage lighting set', totalQuantity: 6, availableQuantity: 6, condition: 'Excellent' },
    { name: 'Zoom H5 Audio Recorder', category: 'Recording Equipment', description: 'Handy recorder for field recording', totalQuantity: 4, availableQuantity: 4, condition: 'Good' },
    { name: 'GoPro Hero 11', category: 'Recording Equipment', description: 'Action camera for events', totalQuantity: 3, availableQuantity: 3, condition: 'Good' },
    { name: 'Folding Table Set (10)', category: 'Event Infrastructure', description: 'Set of 10 folding tables', totalQuantity: 5, availableQuantity: 5, condition: 'Good' },
    { name: 'Plastic Chairs (50 pack)', category: 'Event Infrastructure', description: 'Stackable event chairs', totalQuantity: 10, availableQuantity: 10, condition: 'Fair' },
  ];

  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { id: asset.name },
      update: {},
      create: asset,
    }).catch(() => prisma.asset.create({ data: asset }));
  }

  console.log('✅ Database seeded successfully');
  console.log('Admin: ronakdas@iitr.ac.in / ronak123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
