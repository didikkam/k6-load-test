const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE || 'linkinvite',
  process.env.DB_USERNAME || 'linkinvite',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      freezeTableName: true,
      underscored: true,
      timestamps: true,
      paranoid: true // untuk soft delete
    }
  }
);

// Test connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully (Sequelize)');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = sequelize; 