import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Super Admin
  const superAdminPassword = await argon2.hash('SuperAdmin2024!');
  
  const superAdmin = await prisma.superAdmin.upsert({
    where: { email: 'superadmin@speakfree.com' },
    update: {},
    create: {
      email: 'superadmin@speakfree.com',
      passwordHash: superAdminPassword,
      code: '200700',
      isActive: true,
    },
  });

  console.log('✅ Super Admin created:', superAdmin.email);

  // Create demo schools
  const school1Password = await argon2.hash('EcoleDemo123!');
  
  const school1 = await prisma.school.upsert({
    where: { email: 'college.demo@example.com' },
    update: {},
    create: {
      name: 'Collège Jean Moulin',
      email: 'college.demo@example.com',
      phone: '+33123456789',
      address: '123 Rue de la République',
      city: 'Paris',
      type: 'COLLEGE',
      passwordHash: school1Password,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Demo school 1 created:', school1.name);

  const school2Password = await argon2.hash('LyceeDemo123!');
  
  const school2 = await prisma.school.upsert({
    where: { email: 'lycee.demo@example.com' },
    update: {},
    create: {
      name: 'Lycée Victor Hugo',
      email: 'lycee.demo@example.com',
      phone: '+33198765432',
      address: '456 Avenue des Champs',
      city: 'Lyon',
      type: 'LYCEE',
      passwordHash: school2Password,
      status: 'PENDING',
    },
  });

  console.log('✅ Demo school 2 created:', school2.name);

  // Create demo report for school 1
  const report = await prisma.report.create({
    data: {
      schoolId: school1.id,
      reportCode: 'RPT-DEMO1',
      discussionCode: 'DSC-DEMO1',
      type: 'HARCELEMENT_VERBAL',
      incidentDate: new Date('2024-12-01'),
      place: 'Cantine',
      description: 'Harcèlement verbal répété pendant la pause déjeuner.',
      witnesses: 'Plusieurs élèves présents',
      status: 'PENDING',
    },
  });

  console.log('✅ Demo report created:', report.reportCode);

  // Create demo messages
  await prisma.message.createMany({
    data: [
      {
        reportId: report.id,
        sender: 'STUDENT',
        content: 'Bonjour, je souhaite signaler un problème de harcèlement.',
        isRead: true,
      },
      {
        reportId: report.id,
        schoolId: school1.id,
        sender: 'SCHOOL',
        content: 'Merci pour votre signalement. Nous prenons cela très au sérieux et allons enquêter.',
        isRead: false,
      },
    ],
  });

  console.log('✅ Demo messages created');

  // Create audit log
  await prisma.auditLog.create({
    data: {
      actorType: 'SYSTEM',
      action: 'DATABASE_SEED',
      resource: 'DATABASE',
      metadata: {
        message: 'Database seeded with demo data',
      },
    },
  });

  console.log('✅ Audit log created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Demo accounts:');
  console.log('   Super Admin: superadmin@speakfree.com / SuperAdmin2024! / Code: 200700');
  console.log('   School 1 (Active): college.demo@example.com / EcoleDemo123!');
  console.log('   School 2 (Pending): lycee.demo@example.com / LyceeDemo123!');
  console.log('   Demo Report Code: RPT-DEMO1');
  console.log('   Demo Discussion Code: DSC-DEMO1');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
