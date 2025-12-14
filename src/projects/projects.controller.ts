import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post()
  create(@Req() req, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(req.user.userId, createProjectDto);
  }

  @Get()
  findAll(@Req() req) {
    return this.projectsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.projectsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req
  ) {
    return this.projectsService.update(id, req.user.userId, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.projectsService.remove(id, req.user.userId);
  }

  @Post(':id/members')
  addMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { email: string; roleId: number },
    @Req() req
  ) {
    return this.projectsService.addMember(id, body.email, body.roleId, req.user.userId);
  }

  @Get(':id/tasks')
  getProjectTasks(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.getTasksByProject(id);
  }

  @Get(':id/users')
  getProjectUsers(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.getProjectUsers(id);
  }
}