import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) { }

  async create(userId: number, data: CreateTaskDto) {

    if (data.assignedToId) {
      const isMember = await this.prisma.projectUser.findFirst({
        where: {
          projectId: data.projectId,
          userId: Number(data.assignedToId),
        },
      });

      if (!isMember) {
        await this.prisma.projectUser.create({
          data: {
            projectId: data.projectId,
            userId: Number(data.assignedToId),
            roleId: 2,
          },
        });
        console.log(`User ${data.assignedToId} automatically added to Project ${data.projectId}`);
      }
    }

    const newTask = await this.prisma.task.create({
      data: {
        summary: data.summary,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        projectId: data.projectId,
        typeId: data.typeId || 3,
        priorityId: data.priorityId || 2,
        statusId: data.statusId || 1,
        assignedToId: data.assignedToId || null,
        createdById: userId,
      },
    });
    return { message: "Task created successfully", task: newTask };
  }

  async update(id: number, userId: number, data: UpdateTaskDto) {
    try {
      await this.prisma.task.update({
        where: { id },
        data: {
          summary: data.summary,
          description: data.description,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          typeId: data.typeId,
          priorityId: data.priorityId,
          statusId: data.statusId,
          assignedToId: data.assignedToId,

          updatedById: userId,
          updatedOn: new Date(),
        },
      });
      return { message: "Task updated successfully" };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException("Failed to update task");
    }
  }

  async remove(id: number) {
    try {
      const deleted = await this.prisma.task.delete({
        where: { id },
      });

      return { message: "Task deleted successfully", deleted };
    } catch (error) {
      console.error(error);

      if (error.code === 'P2025') {
        throw new NotFoundException("Task not found");
      }

      throw new InternalServerErrorException("Failed to delete task");
    }
  }

}