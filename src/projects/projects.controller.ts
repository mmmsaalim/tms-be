import { Controller, Get, Post, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; 

@Controller('projects')
@UseGuards(JwtAuthGuard) 
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Req() req, @Body() body: { title: string; description?: string }) {
    return this.projectsService.create(req.user.userId, body);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id/tasks')
  getProjectTasks(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.getTasksByProject(id);
  }
}