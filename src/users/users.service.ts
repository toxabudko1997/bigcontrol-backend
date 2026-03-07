import {
  Injectable,
  OnModuleInit,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  // Этот метод выполнится один раз при запуске приложения
  async onModuleInit() {
    await this.ensureInitialManagers();
  }

  private async ensureInitialManagers() {
    // 1) Стандартный админ
    await this.ensureUser({
      login: 'admin',
      password: 'admin',
      role: 'manager',
      name: 'Администратор',
    });

    // 2) Руководитель с вашим логином
    await this.ensureUser({
      login: '+79281955550',
      password: 'Toxa1997!',
      role: 'manager',
      name: 'Руководитель',
    });
  }

  private async ensureUser(opts: {
    login: string;
    password: string;
    role: UserRole;
    name?: string;
  }) {
    const existing = await this.usersRepo.findOne({
      where: { login: opts.login },
    });
    if (existing) {
      return;
    }

    const passwordHash = await bcrypt.hash(opts.password, 10);
    const user = this.usersRepo.create({
      login: opts.login,
      passwordHash,
      role: opts.role,
      name: opts.name,
      isBlocked: false,
    });
    await this.usersRepo.save(user);
    console.log(
      `Создан пользователь: ${opts.login} / ${opts.password} (роль: ${opts.role})`,
    );
  }

  findByLogin(login: string) {
    return this.usersRepo.findOne({ where: { login } });
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }
async findAll(): Promise<User[]> {
  return this.usersRepo.find({ order: { createdAt: 'DESC' } });
}

async createUser(
  creator: { role: UserRole },
  data: { login: string; password: string; role: UserRole; name?: string; phone?: string },
) {
  if (creator.role === 'foreman') {
    if (data.role !== 'installer') {
      throw new ForbiddenException('Прораб может создавать только монтажников');
    }
  } else if (creator.role !== 'manager') {
    throw new ForbiddenException('Нет прав создавать пользователей');
  }

  const exists = await this.usersRepo.findOne({ where: { login: data.login } });
  if (exists) {
    throw new BadRequestException('Пользователь с таким логином уже существует');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = this.usersRepo.create({
    login: data.login,
    passwordHash,
    role: data.role,
    name: data.name,
    phone: data.phone,
    isBlocked: false,
  });

  return this.usersRepo.save(user);
}

async setBlocked(
  actor: { role: UserRole },
  userId: string,
  isBlocked: boolean,
) {
  if (actor.role !== 'manager' && actor.role !== 'foreman') {
    throw new ForbiddenException('Нет прав блокировать пользователей');
  }

  const user = await this.usersRepo.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('Пользователь не найден');
  }

  user.isBlocked = isBlocked;
  return this.usersRepo.save(user);
}
  // Здесь позже добавим методы: список пользователей, создание нового, блокировка и т.п.
}