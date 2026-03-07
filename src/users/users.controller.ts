import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UserRole } from './user.entity';

class CreateUserDto {
  login: string;
  password: string;
  role: UserRole;
  name?: string;
  phone?: string;
}

class BlockUserDto {
  isBlocked: boolean;
}

interface JwtUser {
  userId: string;
  login: string;
  role: UserRole;
}

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(@Req() req: any) {
    const user = req.user as JwtUser;
    if (user.role !== 'manager' && user.role !== 'foreman') {
      return [];
    }
    return this.usersService.findAll();
  }

  @Post()
  async createUser(@Req() req: any, @Body() body: CreateUserDto) {
    const user = req.user as JwtUser;
    return this.usersService.createUser(
      { role: user.role },
      {
        login: body.login,
        password: body.password,
        role: body.role,
        name: body.name,
        phone: body.phone,
      },
    );
  }

  @Patch(':id/block')
  async blockUser(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: BlockUserDto,
  ) {
    const user = req.user as JwtUser;
    return this.usersService.setBlocked(
      { role: user.role },
      id,
      body.isBlocked,
    );
  }
}