import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto'; 
import { UpdateProjectDto } from './dto/update-project.dto'; 

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) { }

  async create(userId: number, data: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        projectOwnerId: userId,
        createdById: userId,
        status: 1,
        createdOn: new Date(),
      },
    });
  }

  async findAll() {
    return this.prisma.project.findMany({
      orderBy: { createdOn: 'desc' },
      include: {
        _count: { select: { tasks: true } }
      }
    });
  }

  async getTasksByProject(projectId: number) {
    const tasks = await this.prisma.task.findMany({
      where: { projectId: projectId },
      include: { taskStatus: true, taskPriority: true, taskType: true, assignedTo: true },
      orderBy: { createdOn: 'desc' },
    });
    return tasks.map(task => ({
      id: task.id,
      summary: task.summary,
      description: task.description,
      projectId: task.projectId,
      dueDate: task.dueDate,
      status: task.taskStatus?.status || 'Unknown',
      priority: task.taskPriority?.priority || 'Medium',
      type: task.taskType?.type || 'Task',
      assignedTo: task.assignedTo?.name || 'Unassigned',
      updatedon:task.updatedOn,
    }));
  }

  async update(id: number, userId: number, data: UpdateProjectDto) {
    return this.prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,

        updatedBy: {
          connect: { id: userId }
        },

        updatedOn: new Date(),
      },
    });
  }

  async remove(id: number) {
    return this.prisma.project.delete({ where: { id } });
  }
}