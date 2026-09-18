import { getPrismaMaster } from './dist/lib/prisma-master.js';
import { ROLES } from './dist/types/roles.js';

async function seed() {
  const prisma = getPrismaMaster();

  // Insert default tenant
  try {
    const now = new Date();
    await prisma.tenant.create({
      data: {
        slug: 'maiai-default',
        name: 'MaiAI Default Salon',
        databaseName: 'maiai_crm_1',
        tier: 'basic',
        maxUsers: 5,
        maxGuests: 1000,
        isActive: true,
        updatedAt: now,
      },
    });
    console.log('✅ Default tenant created');
  } catch (e: any) {
    if (e.code === 'P2002') {
      console.log('ℹ️ Default tenant already exists');
    } else {
      console.error('❌ Tenant error:', e.message);
    }
  }

  // Insert admin user
  try {
    const now = new Date();
    await prisma.user.create({
      data: {
        tenantId: 1,
        email: 'admin@maiai.com',
        passwordHash: '$2b$10$fbiQ0QjHgP09jhvzbgbwPuIuHAZckAILiYWW2U37fpLd4QfrZ4syK',
        name: 'Admin User',
        role: ROLES.ADMIN,
        isActive: true,
        updatedAt: now,
      },
    });
    console.log('✅ Admin user created (admin@maiai.com / Admin@123)');
  } catch (e: any) {
    if (e.code === 'P2002') {
      console.log('ℹ️ Admin user already exists');
    } else {
      console.error('❌ User error:', e.message);
    }
  }

  await prisma.$disconnect();
  console.log('\n🎉 Seed completed!');
}

seed().catch(console.error);
