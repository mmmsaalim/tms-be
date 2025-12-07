// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Seed Lookups (Keep existing logic)
  await prisma.projectRole.createMany({
    data: [{ role: 'Admin' }, { role: 'User' }, { role: 'Viewer' }],
    skipDuplicates: true,
  });

  await prisma.taskType.createMany({
    data: [{ type: 'Epic' }, { type: 'Story' }, { type: 'Task' }, { type: 'Sub-task' }],
    skipDuplicates: true,
  });

  await prisma.taskPriority.createMany({
    data: [{ priority: 'Lower' }, { priority: 'Medium' }, { priority: 'High' }, { priority: 'Highest' }],
    skipDuplicates: true,
  });

  await prisma.taskStatus.createMany({
    data: [
      { status: 'To Do' },
      { status: 'In Progress' }, 
      { status: 'Blocked' },
      { status: 'Done' }         
    ],
    skipDuplicates: true,
  });

  // 2. Create Admin User
  const passwordRaw = '12345';
  const hashedPassword = await bcrypt.hash(passwordRaw, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'abc@gmail.com' },
    update: {},
    create: {
      email: 'abc@gmail.com',
      name: 'Admin User',
      password: hashedPassword,
      status: 1,
    },
  });

  const passwordRaw1 = 'admin@123';
  const hashedPassword1 = await bcrypt.hash(passwordRaw1, 10);

  const User1 = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      name: 'Admin User',
      password: hashedPassword1,
      status: 1,
    },
  });

  const p1 = await prisma.project.create({
    data: {
      title: "Website Redesign",
      description: "Overhaul the company website with React",
      status: 1,
      projectOwnerId: adminUser.id,
      createdById: adminUser.id,
    }
  });

  const p2 = await prisma.project.create({
    data: {
      title: "Mobile App Development",
      description: "Flutter app for Android and iOS",
      status: 1,
      projectOwnerId: adminUser.id,
      createdById: adminUser.id,
    }
  });

  await prisma.task.createMany({
    data: [
      {
        summary: "Setup React Repo",
        description: "Initialize Vite and install dependencies",
        typeId: 3, // Task
        projectId: p1.id,
        priorityId: 3, // High
        statusId: 4, // Done
        createdById: adminUser.id,
        assignedToId: adminUser.id,
      },
      {
        summary: "Design Homepage",
        description: "Figma designs for landing page",
        typeId: 2, // Story
        projectId: p1.id,
        priorityId: 2, // Medium
        statusId: 2, // In Progress
        createdById: adminUser.id,
        assignedToId: adminUser.id,
      },
      {
        summary: "Backend Integration",
        typeId: 3,
        projectId: p1.id,
        priorityId: 4, // Highest
        statusId: 1, // To Do
        createdById: adminUser.id,
        assignedToId: adminUser.id,
      }
    ]
  });

  // Tasks for Mobile App (p2)
  await prisma.task.create({
    data: {
      summary: "Setup Flutter Environment",
      typeId: 3,
      projectId: p2.id,
      priorityId: 2,
      statusId: 1,
      createdById: adminUser.id,
    }
  });

  console.log('Tasks created');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });