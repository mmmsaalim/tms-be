import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':projectId/users')
  async getProjectUsers(@Param('projectId') projectId: number) {
    return this.prisma.projectUser.findMany({
      where: { projectId: Number(projectId) },
      select: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }
}
