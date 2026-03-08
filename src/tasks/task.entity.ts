import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,          // ← добавить
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { TaskPhoto } from './task-photo.entity'; // ← добавить

export type TaskStatus =
  | 'free'
  | 'in_progress'
  | 'in_reclamation'
  | 'in_review'
  | 'done';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  complexName: string;

  @Column({ nullable: true })
  workType: string;

  @Column({ nullable: true })
  cost: string;

  @Column({ nullable: true })
  foremanPhone: string;

  @Column({ type: 'varchar', default: 'free' })
  status: TaskStatus;

  @ManyToOne(() => User, { nullable: true })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  executor: User;

  @Column({ type: 'timestamptz', nullable: true })
  deadline: Date | null;

  @Column({ default: false })
reclamationRequired: boolean;

@Column({ type: 'text', nullable: true })
reclamationDescription?: string;

@Column({ default: false })
lockedForInstaller: boolean;

@OneToMany(() => TaskPhoto, (photo) => photo.task, { eager: true })
photos: TaskPhoto[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}