const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Skill extends Model {}

Skill.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
}, {
  sequelize,
  modelName: 'Skill',
  tableName: 'skills',
  timestamps: true,
  paranoid: false,
  defaultScope: {},
  getterMethods: {
    image_preview() {
      return this.image ? this.image : null;
    }
  }
});

module.exports = Skill; 