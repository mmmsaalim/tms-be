import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; // <--- 1. Uncomment this

@Controller('tasks')
@UseGuards(JwtAuthGuard) // <--- 2. Add JwtAuthGuard inside the parentheses
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Req() req, @Body() createTaskDto: any) {
    return this.tasksService.create(req.user.userId, createTaskDto);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}