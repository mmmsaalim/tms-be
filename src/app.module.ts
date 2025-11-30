import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { PrismaService } from './prisma.service'; 

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}