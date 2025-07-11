import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../entities/skill.entity';
import { Project } from '../entities/project.entity';
import { ProjectCategory } from '../entities/project-category.entity';
import { HomeResponseDto, SkillDto, ProjectCategoryDto, ProjectDto } from '../dto/home.dto';

const MAX_CATEGORIES = 6;
const MAX_PROJECTS_ALL_VIEW = 6;

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectCategory)
    private projectCategoryRepository: Repository<ProjectCategory>,
  ) {}

  async getHomeData(): Promise<HomeResponseDto> {
    // Get all skills
    const skills = await this.skillRepository.find();

    // Get project categories with project count using raw query
    const projectCategoriesWithCount = await this.projectCategoryRepository
      .createQueryBuilder('pc')
      .select([
        'pc.id',
        'pc.name',
        'pc.slug',
        'pc.isActive',
        'COUNT(ppc.project_id) as projectsCount'
      ])
      .leftJoin('project_project_categories', 'ppc', 'pc.id = ppc.project_category_id')
      .leftJoin('projects', 'p', 'p.id = ppc.project_id AND p.status = :status AND p.published_at <= :now AND p.deleted_at IS NULL', {
        status: 'published',
        now: new Date()
      })
      .where('pc.isActive = :isActive AND pc.deletedAt IS NULL', { isActive: true })
      .groupBy('pc.id')
      .orderBy('projectsCount', 'DESC')
      .limit(MAX_CATEGORIES)
      .getRawAndEntities();

    // Extract category IDs
    const topCategoryIds = projectCategoriesWithCount.entities.map(cat => cat.id);

    // Get projects with relations
    let projects: Project[] = [];
    if (topCategoryIds.length > 0) {
      projects = await this.projectRepository.find({
        where: {
          status: 'published',
          publishedAt: new Date(),
        },
        relations: ['skills', 'categories'],
        order: { publishedAt: 'DESC' },
        take: MAX_PROJECTS_ALL_VIEW
      });

      // Filter projects that have categories in topCategoryIds
      projects = projects.filter(project => 
        project.categories.some(category => topCategoryIds.includes(category.id))
      );
    }

    // Convert to DTOs
    const skillsDto: SkillDto[] = skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      image: skill.image
    }));

    const projectCategoriesDto: ProjectCategoryDto[] = projectCategoriesWithCount.entities.map((cat, index) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      isActive: cat.isActive,
      projectsCount: parseInt(projectCategoriesWithCount.raw[index].projectsCount) || 0
    }));

    const projectsDto: ProjectDto[] = projects.map(project => ({
      id: project.id,
      title: project.title,
      slug: project.slug,
      image: project.image,
      status: project.status,
      publishedAt: project.publishedAt,
      skills: project.skills.map(skill => ({
        id: skill.id,
        name: skill.name,
        slug: skill.slug,
        image: skill.image
      })),
      categories: project.categories.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        isActive: category.isActive
      }))
    }));

    return {
      skills: skillsDto,
      projectCategories: projectCategoriesDto,
      projects: projectsDto
    };
  }
} 