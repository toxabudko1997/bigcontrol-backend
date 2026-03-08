import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { TaskStatus } from './task.entity';
import { UserRole } from '../users/user.entity';

interface JwtUser {
  userId: string;
  login: string;
  role: UserRole;
}

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getTasks(@Req() req: any) {
    const user = req.user as JwtUser;
    return this.tasksService.findForUser(user);
  }

  @Post()
  async createTask(@Req() req: any, @Body() body: any) {
    const user = req.user as JwtUser;
    return this.tasksService.createTask(user, body);
  }

  @Patch(':id/assign')
  async assignToSelf(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtUser;
    return this.tasksService.assignToSelf(user, id);
  }

  @Patch(':id/status')
  async changeStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { status: TaskStatus },
  ) {
    const user = req.user as JwtUser;
    return this.tasksService.changeStatus(user, id, body.status);
  }

  @Delete(':id')
  async deleteTask(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtUser;
    return this.tasksService.deleteTask(user, id);
  }
    @Post(':id/photos')
  async addPhoto(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { url: string; type: 'work' | 'reclamation' },
  ) {
    const user = req.user as JwtUser;
    return this.tasksService.addPhoto(user, id, body.url, body.type);
  }
    @Post(':id/reclamation')
  async sendToReclamation(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { description: string },
  ) {
    const user = req.user as JwtUser;
    return this.tasksService.sendToReclamation(user, id, body.description);
  }
    @Post(':id/reclamation-complete')
  async completeReclamation(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtUser;
    return this.tasksService.completeReclamation(user, id);
  }
  
}