const Skill = require('./Skill');
const Project = require('./Project');
const ProjectCategory = require('./ProjectCategory');

// Relasi many-to-many
Project.belongsToMany(Skill, { through: 'project_skills', foreignKey: 'project_id', otherKey: 'skill_id' });
Skill.belongsToMany(Project, { through: 'project_skills', foreignKey: 'skill_id', otherKey: 'project_id' });

Project.belongsToMany(ProjectCategory, { through: 'project_project_categories', foreignKey: 'project_id', otherKey: 'project_category_id' });
ProjectCategory.belongsToMany(Project, { through: 'project_project_categories', foreignKey: 'project_category_id', otherKey: 'project_id' });

module.exports = {
  Skill,
  Project,
  ProjectCategory
}; 