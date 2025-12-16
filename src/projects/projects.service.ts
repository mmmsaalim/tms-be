import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: CreateProjectDto) {
    return this.prisma.$transaction(async (tx) => {
      
      // Determine the Owner (Default to Creator if not selected)
      const ownerId = data.projectOwnerId ? data.projectOwnerId : userId;

      const project = await tx.project.create({
        data: {
          title: data.title,
          description: data.description,
          projectOwnerId: ownerId,
          createdById: userId,    
          status: data.status !== undefined ? data.status : 1,
        },
      });

      await tx.projectUser.create({
        data: { projectId: project.id, userId: userId, roleId: 1 },
      });

      if (ownerId !== userId) {
        const exists = await tx.projectUser.findFirst({
            where: { projectId: project.id, userId: ownerId }
        });
        
        if (!exists) {
            await tx.projectUser.create({
                data: { projectId: project.id, userId: ownerId, roleId: 3 }, 
            });
        }
      }

      return project;
    });
  }

  async findAll(userId: number) {
    const projects = await this.prisma.project.findMany({
      where: {
        members: { some: { userId: userId } }
      },
      orderBy: { createdOn: 'desc' },
      include: {
        _count: { select: { tasks: true } },
        members: { 
           where: { userId: userId },
           select: { roleId: true }
        },
        owner: {
            select: { id: true, name: true }
        }
      }
    });

    return projects.map(p => ({
        ...p,
        currentUserRole: p.members[0]?.roleId || 3
    }));
  }

  async findOne(id: number, userId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true } }
      }
    });

    if (!project) throw new NotFoundException('Project not found');

    const membership = await this.prisma.projectUser.findFirst({
      where: { projectId: id, userId: userId },
    });

    if (!membership) throw new ForbiddenException('Access to project denied');

    return { ...project, currentUserRole: membership.roleId };
  }

  async update(id: number, userId: number, data: UpdateProjectDto) {
    const membership = await this.prisma.projectUser.findFirst({
      where: { projectId: id, userId }
    });

    if (!membership || membership.roleId !== 1) {
      throw new ForbiddenException('Only Admins can update project details');
    }

    return this.prisma.$transaction(async (tx) => {
      
      if (data.projectOwnerId) {
        const newOwnerMember = await tx.projectUser.findFirst({
            where: { projectId: id, userId: data.projectOwnerId }
        });

        if (!newOwnerMember) {
            await tx.projectUser.create({
                data: { projectId: id, userId: data.projectOwnerId, roleId: 3 }
            });
        }
      }

      return tx.project.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          status: data.status,
          projectOwnerId: data.projectOwnerId, 
          updatedById: userId, 
          updatedOn: new Date(),
        },
      });
    });
  }

  async addMember(projectId: number, email: string, roleId: number, currentUserId: number) {
    const membership = await this.prisma.projectUser.findFirst({
      where: { projectId, userId: currentUserId }
    });

    if (!membership || membership.roleId !== 1) {
      throw new ForbiddenException('Only Project Admins can add members');
    }

    const userToAdd = await this.prisma.user.findUnique({ where: { email } });
    if (!userToAdd) throw new NotFoundException('User with this email not found');

    const existingMember = await this.prisma.projectUser.findFirst({
      where: { projectId, userId: userToAdd.id }
    });

    if (existingMember) throw new ForbiddenException('User is already a member');

    return this.prisma.projectUser.create({
      data: { projectId, userId: userToAdd.id, roleId },
    });
  }

  async remove(id: number, userId: number) {
    const membership = await this.prisma.projectUser.findFirst({
      where: { projectId: id, userId }
    });
    if (!membership || membership.roleId !== 1) {
      throw new ForbiddenException('Only Admins can delete projects');
    }
    return this.prisma.project.delete({ where: { id } });
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
      updatedOn: task.updatedOn,
      assignedToId: task.assignedToId
    }));
  }

  async getProjectUsers(projectId: number) {
    return this.prisma.projectUser.findMany({
      where: { projectId: projectId },
      select: {
        user: { select: { id: true, name: true, email: true } }
      }
    });
  }
}