import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) { }

  // 1. Create Project
  async create(userId: number, data: CreateProjectDto) {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          title: data.title,
          description: data.description,
          projectOwnerId: userId,
          createdById: userId,
          status: data.status !== undefined ? data.status : 1,
        },
      });

      await tx.projectUser.create({
        data: { projectId: project.id, userId: userId, roleId: 1 },
      });

      return project;
    });
  }

  // 2. Find All
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
        }
      }
    });

    return projects.map(p => ({
      ...p,
      currentUserRole: p.members[0]?.roleId || 3
    }));
  }

  // 3. Find One
  async findOne(id: number, userId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) throw new NotFoundException('Project not found');

    const membership = await this.prisma.projectUser.findFirst({
      where: { projectId: id, userId: userId },
    });

    if (!membership) throw new ForbiddenException('Access to project denied');

    return { ...project, currentUserRole: membership.roleId };
  }

  // 4. Add Member
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

  async update(id: number, userId: number, data: UpdateProjectDto) {
    const membership = await this.prisma.projectUser.findFirst({
      where: { projectId: id, userId }
    });

    if (!membership || membership.roleId !== 1) {
      throw new ForbiddenException('Only Admins can update project details');
    }

    return this.prisma.$transaction(async (tx) => {

      if (data.projectOwnerId) {
        const currentProject = await tx.project.findUnique({ where: { id } });

        if (!currentProject) {
          throw new NotFoundException('Project not found');
        }

        if (currentProject.projectOwnerId !== data.projectOwnerId) {

          const newOwnerMember = await tx.projectUser.findFirst({
            where: { projectId: id, userId: data.projectOwnerId }
          });

          if (newOwnerMember) {
            await tx.projectUser.update({
              where: { id: newOwnerMember.id },
              data: { roleId: 1 }
            });
          } else {
            await tx.projectUser.create({
              data: { projectId: id, userId: data.projectOwnerId, roleId: 1 }
            });
          }

          const oldOwnerMember = await tx.projectUser.findFirst({
            where: { projectId: id, userId: currentProject.projectOwnerId }
          });

          if (oldOwnerMember) {
            await tx.projectUser.update({
              where: { id: oldOwnerMember.id },
              data: { roleId: 2 }
            });
          }
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
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }
}