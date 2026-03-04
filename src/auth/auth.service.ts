import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Проверка логин/пароль
  async validateUser(login: string, password: string): Promise<User> {
    const user = await this.usersService.findByLogin(login);
    if (!user) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }
    if (user.isBlocked) {
      throw new UnauthorizedException('Пользователь заблокирован');
    }
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }
    return user;
  }

  // Логин: выдаём JWT
  async login(login: string, password: string) {
    const user = await this.validateUser(login, password);

    const payload = {
      sub: user.id,
      login: user.login,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        login: user.login,
        role: user.role,
        name: user.name,
        isBlocked: user.isBlocked,
      },
    };
  }
}