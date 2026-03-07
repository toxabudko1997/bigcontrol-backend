import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './task.entity';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/user.entity';

interface JwtUser {
  userId: string;
  login: string;
  role: UserRole;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepo: Repository<Task>,
    private readonly usersService: UsersService,
  ) {}

  async findForUser(user: JwtUser) {
    if (user.role === 'manager' || user.role === 'foreman') {
      return this.tasksRepo.find({
        relations: ['createdBy', 'executor'],
        order: { createdAt: 'DESC' },
      });
    }

    if (user.role === 'installer') {
      return this.tasksRepo.find({
        where: [
          { status: 'free' },
          { executor: { id: user.userId } },
        ],
        relations: ['createdBy', 'executor'],
        order: { createdAt: 'DESC' },
      });
    }

    return [];
  }

  async createTask(creator: JwtUser, data: Partial<Task>) {
    if (creator.role !== 'manager' && creator.role !== 'foreman') {
      throw new ForbiddenException('Нет прав создавать заказы');
    }

    const user = await this.usersService.findById(creator.userId);
    if (!user) {
      throw new ForbiddenException('Пользователь не найден');
    }

    const task = this.tasksRepo.create({
      title: data.title || 'Новый заказ',
      description: data.description || '',
      address: data.address || '',
      complexName: data.complexName || '',
      workType: data.workType || '',
      cost: data.cost || '',
      foremanPhone: data.foremanPhone || '',
      deadline: data.deadline || null,
      status: 'free',
      createdBy: user,
      reclamationRequired: false,
      reclamationDescription: null,
      lockedForInstaller: false,
    });

    return this.tasksRepo.save(task);
  }

  async assignToSelf(user: JwtUser, taskId: string) {
    if (user.role !== 'installer') {
      throw new ForbiddenException('Только монтажник может взять заказ');
    }

    const task = await this.tasksRepo.findOne({
      where: { id: taskId },
      relations: ['executor'],
    });
    if (!task) throw new NotFoundException('Задача не найдена');

    if (task.status !== 'free') {
      throw new ForbiddenException('Задача уже занята');
    }

    const installer = (await this.usersService.findById(
      user.userId,
    )) as User;

    task.executor = installer;
    task.status = 'in_progress';

    return this.tasksRepo.save(task);
  }

  async changeStatus(
    user: JwtUser,
    taskId: string,
    status: TaskStatus,
  ) {
    const task = await this.tasksRepo.findOne({
      where: { id: taskId },
      relations: ['executor', 'createdBy'],
    });
    if (!task) throw new NotFoundException('Задача не найдена');

    if (user.role === 'installer') {
      if (!task.executor || task.executor.id !== user.userId) {
        throw new ForbiddenException('Это не ваша задача');
      }
      if (status !== 'in_review') {
        throw new ForbiddenException('Монтажник может только сдавать на проверку');
      }
      // Здесь можно добавить проверку количества фото
      task.status = 'in_review';
    } else if (user.role === 'manager' || user.role === 'foreman') {
      task.status = status;
      if (status === 'done') {
        task.reclamationRequired = false;
        task.lockedForInstaller = false;
      }
    } else {
      throw new ForbiddenException('Нет прав менять статус');
    }

    return this.tasksRepo.save(task);
  }

  async deleteTask(user: JwtUser, taskId: string) {
    if (user.role !== 'manager' && user.role !== 'foreman') {
      throw new ForbiddenException('Нет прав на удаление задач');
    }
    const task = await this.tasksRepo.findOne({ where: { id: taskId } });
    if (!task) return;

    await this.tasksRepo.remove(task);
    return { success: true };
  }
}