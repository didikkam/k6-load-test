const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cluster = require('cluster');
const os = require('os');
require('dotenv').config();
const sequelize = require('./config/database');
const { Skill, Project, ProjectCategory } = require('./models');

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

const MAX_CATEGORIES = 6;
const MAX_PROJECTS_ALL_VIEW = 6;

app.get('/api/home', async (req, res) => {
  try {
    // console.log('Home API called');
    // Ambil semua skills
    const skills = await Skill.findAll();

    // Ambil kategori aktif dengan jumlah project published terbanyak
    const [projectCategories] = await sequelize.query(`
      SELECT pc.*, COUNT(ppc.project_id) AS projects_count
      FROM project_categories pc
      LEFT JOIN project_project_categories ppc ON pc.id = ppc.project_category_id
      LEFT JOIN projects p ON p.id = ppc.project_id 
        AND p.status = 'published' 
        AND p.published_at IS NOT NULL 
        AND p.published_at <= NOW()
        AND p.deleted_at IS NULL
      WHERE pc.is_active = 1 AND pc.deleted_at IS NULL
      GROUP BY pc.id
      ORDER BY projects_count DESC
      LIMIT ?
    `, {
      replacements: [MAX_CATEGORIES],
      type: sequelize.QueryTypes.SELECT
    });

    // Ambil id kategori teratas
    const topCategoryIds = projectCategories ? projectCategories.map(cat => cat.id) : [];

    // Ambil projects published, yang punya kategori di atas, beserta relasi skills dan categories
    let projects = [];
    if (topCategoryIds.length > 0) {
      projects = await Project.findAll({
        where: {
          status: 'published',
          published_at: { [sequelize.Sequelize.Op.lte]: new Date() },
        },
        include: [
          { model: Skill },
          { model: ProjectCategory, where: { id: topCategoryIds }, required: true }
        ],
        order: [['published_at', 'DESC']],
        limit: MAX_PROJECTS_ALL_VIEW
      });
    }

    res.json({
      skills,
      projectCategories,
      projects
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  console.log(`Using ${numCPUs} CPU cores`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Replace the dead worker
    cluster.fork();
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
  });

} else {
  // Workers can share any TCP connection
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started on port ${PORT}`);
  });
} 