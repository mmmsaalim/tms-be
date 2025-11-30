import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // 1. Create a Project
  async create(userId: number, data: any) {
    return this.prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        projectOwnerId: userId,
        createdById: userId,
        status: 1,
      },
    });
  }

  // 2. Get All Projects (For the dashboard)
  async findAll() {
    return this.prisma.project.findMany({
      orderBy: { createdOn: 'desc' },
      include: {
        _count: { select: { tasks: true } } // Include task count for the UI
      }
    });
  }

  // 3. Get Tasks for a specific Project
  // This flattens the data so the Frontend receives "In Progress" instead of { taskStatus: { status: "In Progress" } }
  async getTasksByProject(projectId: number) {
    const tasks = await this.prisma.task.findMany({
      where: { projectId: projectId },
      include: {
        taskStatus: true,
        taskPriority: true,
        taskType: true,
        assignedTo: true,
      },
      orderBy: { createdOn: 'desc' },
    });

    // Transform data for easier Frontend use
    return tasks.map((task) => ({
      id: task.id,
      summary: task.summary,
      description: task.description,
      projectId: task.projectId,
      // Flatten relations
      status: task.taskStatus?.status || 'Unknown',
      priority: task.taskPriority?.priority || 'Medium',
      type: task.taskType?.type || 'Task',
      assignedTo: task.assignedTo?.name || 'Unassigned',
    }));
  }
}