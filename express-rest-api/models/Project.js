const { DataTypes, Model, Op } = require('sequelize');
const sequelize = require('../config/database');

class Project extends Model {
  static published() {
    return this.findAll({
      where: {
        status: 'published',
        published_at: { [Op.lte]: new Date() },
        published_at: { [Op.ne]: null }
      }
    });
  }
}

Project.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING },
  published_at: { type: DataTypes.DATE },
}, {
  sequelize,
  modelName: 'Project',
  tableName: 'projects',
  timestamps: true,
  paranoid: true,
  getterMethods: {
    image_preview() {
      return this.image ? this.image : null;
    }
  }
});

module.exports = Project; 