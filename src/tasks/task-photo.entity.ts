import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from '../users/user.entity';

export type PhotoType = 'work' | 'reclamation';

@Entity('task_photos')
export class TaskPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, (task) => task.photos, { onDelete: 'CASCADE' })
  task: Task;

  @ManyToOne(() => User, { eager: true })
  uploader: User;

  @Column()
  url: string;

  @Column({ type: 'varchar' })
  type: PhotoType;

  @CreateDateColumn()
  createdAt: Date;
}