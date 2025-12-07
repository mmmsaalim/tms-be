import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; 
import { CreateProjectDto } from './dto/create-project.dto'; // Import DTO
import { UpdateProjectDto } from './dto/update-project.dto'; // Import DTO

@Controller('projects')
@UseGuards(JwtAuthGuard) 
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  // 1. Use CreateProjectDto instead of manual object
  create(@Req() req, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(req.user.userId, createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id/tasks')
  getProjectTasks(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.getTasksByProject(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number, 
    // 2. Use UpdateProjectDto instead of manual object
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req 
  ) {
    const userId = req.user.userId; 
    const project = await this.projectsService.update(id, userId, updateProjectDto);
    return { message: "Project updated successfully", project };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.projectsService.remove(id);
    return { message: "Project deleted successfully" };
  }
}