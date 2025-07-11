export class SkillDto {
  id: number;
  name: string;
  slug: string;
  image: string;
}

export class ProjectCategoryDto {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  projectsCount?: number;
}

export class ProjectDto {
  id: number;
  title: string;
  slug: string;
  image: string;
  status: string;
  publishedAt: Date;
  skills: SkillDto[];
  categories: ProjectCategoryDto[];
}

export class HomeResponseDto {
  skills: SkillDto[];
  projectCategories: ProjectCategoryDto[];
  projects: ProjectDto[];
} 