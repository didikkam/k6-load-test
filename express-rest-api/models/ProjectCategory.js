const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ProjectCategory extends Model {
  static active() {
    return this.findAll({ where: { is_active: true } });
  }
}

ProjectCategory.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  modelName: 'ProjectCategory',
  tableName: 'project_categories',
  timestamps: true,
  paranoid: true,
});

module.exports = ProjectCategory; 