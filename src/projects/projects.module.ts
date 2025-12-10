import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaService } from '../prisma.service'; // <--- 1. Import this

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService, 
    PrismaService  // <--- 2. Add this
  ],
})
export class ProjectsModule {}