import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Project } from './project.entity';

@Entity('project_categories')
export class ProjectCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ name: 'is_active' })
  isActive: boolean;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToMany(() => Project, project => project.categories)
  @JoinTable({
    name: 'project_project_categories',
    joinColumn: { name: 'project_category_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'project_id', referencedColumnName: 'id' }
  })
  projects: Project[];
} 