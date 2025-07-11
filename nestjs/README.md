# NestJS REST API

Implementasi REST API menggunakan NestJS dengan TypeORM dan MySQL, yang setara dengan implementasi Express.js dan Golang.

## Fitur

- **Framework**: NestJS dengan TypeScript
- **Database**: MySQL dengan TypeORM
- **API Endpoint**: `/api/home` - Mengambil data skills, project categories, dan projects
- **CORS**: Enabled untuk semua origin
- **Port**: 3001 (default)

## Struktur Proyek

```
nestjs/
├── src/
│   ├── entities/           # TypeORM entities
│   │   ├── skill.entity.ts
│   │   ├── project.entity.ts
│   │   └── project-category.entity.ts
│   ├── dto/               # Data Transfer Objects
│   │   └── home.dto.ts
│   ├── services/          # Business logic
│   │   └── home.service.ts
│   ├── controllers/       # API controllers
│   │   └── home.controller.ts
│   ├── app.module.ts      # Main module
│   └── main.ts           # Application bootstrap
├── .env                   # Environment variables
└── package.json
```

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Konfigurasi database di file `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=didikam
PORT=3001
```

3. Jalankan aplikasi:
```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

## API Endpoints

### GET /api/home

Mengambil data untuk halaman home:
- Skills (semua skills)
- Project Categories (kategori aktif dengan jumlah project terbanyak, maksimal 6)
- Projects (project published dengan kategori teratas, maksimal 6)

**Response:**
```json
{
  "skills": [
    {
      "id": 1,
      "name": "JavaScript",
      "slug": "javascript",
      "image": "js.png"
    }
  ],
  "projectCategories": [
    {
      "id": 1,
      "name": "Web Development",
      "slug": "web-development",
      "isActive": true,
      "projectsCount": 5
    }
  ],
  "projects": [
    {
      "id": 1,
      "title": "Project Title",
      "slug": "project-title",
      "image": "project.jpg",
      "status": "published",
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "skills": [...],
      "categories": [...]
    }
  ]
}
```

## Perbandingan dengan Express.js dan Golang

### Express.js
- Menggunakan Sequelize ORM
- Cluster mode untuk multi-threading
- Port: 3000

### Golang
- Menggunakan GORM
- Gin framework
- Port: 4000

### NestJS
- Menggunakan TypeORM
- Built-in dependency injection
- Port: 3001

## Scripts

- `npm run start:dev` - Development mode dengan hot reload
- `npm run start:prod` - Production mode
- `npm run build` - Build aplikasi
- `npm run test` - Run tests
- `npm run test:e2e` - Run end-to-end tests
