import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  // Create Task
  async create(userId: number, data: any) {
    return this.prisma.task.create({
      data: {
        summary: data.summary,
        description: data.description,
        projectId: data.projectId, 
        
        typeId: data.typeId || 3,      
        priorityId: data.priorityId || 2, 
        statusId: data.statusId || 1,    
        
        assignedToId: userId, 
        createdById: userId,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.task.delete({
      where: { id },
    });
  }

  async findAll() {
    return this.prisma.task.findMany();
  }
}