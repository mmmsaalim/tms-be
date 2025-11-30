import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaService } from '../prisma.service'; // <--- 1. Import this

@Module({
  controllers: [TasksController],
  providers: [
    TasksService, 
    PrismaService // <--- 2. Add this
  ],
})
export class TasksModule {}