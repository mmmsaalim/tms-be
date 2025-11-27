import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.task.create({
      data: {
        title: data.title,
        assignedTo: data.assignedTo,
        status: data.status,
      },
    });
  }

  async findAll() {
    return this.prisma.task.findMany({
      orderBy: { createdAt: 'desc' } // Sorts by newest first
    });
  }

  async update(id: number, data: any) {
    return this.prisma.task.update({
      where: { id: Number(id) },
      data: {
        title: data.title,
        assignedTo: data.assignedTo,
        status: data.status,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.task.delete({
      where: { id: Number(id) },
    });
  }
}