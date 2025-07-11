import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Skill } from './skill.entity';
import { ProjectCategory } from './project-category.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column()
  image: string;

  @Column()
  status: string;

  @Column({ name: 'published_at', nullable: true })
  publishedAt: Date;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToMany(() => Skill, skill => skill.projects)
  @JoinTable({
    name: 'project_skills',
    joinColumn: { name: 'project_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skill_id', referencedColumnName: 'id' }
  })
  skills: Skill[];

  @ManyToMany(() => ProjectCategory, category => category.projects)
  @JoinTable({
    name: 'project_project_categories',
    joinColumn: { name: 'project_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'project_category_id', referencedColumnName: 'id' }
  })
  categories: ProjectCategory[];
} 