# Express REST API dengan Sequelize

REST API menggunakan Express.js dan Sequelize ORM dengan koneksi MySQL.

## Fitur

- Express.js sebagai web framework
- Sequelize ORM untuk database operations
- MySQL sebagai database
- CORS enabled
- Helmet untuk security headers
- Environment variables support
- Stress testing dengan k6

## Struktur Database

### Tabel yang digunakan:
- `skills` - Data skill/teknologi
- `project_categories` - Kategori project
- `projects` - Data project
- `project_skills` - Relasi many-to-many project dan skill
- `project_project_categories` - Relasi many-to-many project dan kategori

## Instalasi

1. Clone repository ini
2. Install dependencies:
```bash
npm install
```

3. Buat file `.env` di root directory:
```env
# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=linkinvite
DB_USERNAME=linkinvite
DB_PASSWORD=root

# Server Configuration
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your-secret-key-here
```

4. Pastikan database MySQL sudah dibuat dan tabel-tabel sudah ada sesuai struktur di atas.

## Development

Jalankan server dalam mode development dengan auto-reload:

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## Production

### Build dan Deploy

1. Install dependencies production:
```bash
npm install --production
```

2. Set environment variable untuk production:
```bash
export NODE_ENV=production
```

3. Jalankan server production:
```bash
npm start
```

### Menggunakan PM2 (Recommended)

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Start aplikasi dengan PM2:
```bash
pm2 start server.js --name "express-rest-api"
```

3. Monitor aplikasi:
```bash
pm2 monit
```

4. Restart aplikasi:
```bash
pm2 restart express-rest-api
```

5. Stop aplikasi:
```bash
pm2 stop express-rest-api
```

## Stress Testing

### Install k6

```bash
# Ubuntu/Debian
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# macOS
brew install k6

# Windows
choco install k6
```

### Jalankan Stress Test

```bash
npm run stress-test
```

Atau langsung dengan k6:
```bash
k6 run stress-test.js
```

### Konfigurasi Stress Test

File `stress-test.js` berisi:
- **Ramping Arrival Rate**: Mulai dari 50 RPS, naik bertahap ke 1000 RPS
- **Duration**: 12 menit total (6 stages × 2 menit)
- **Thresholds**: 
  - 95% request < 2 detik
  - Error rate < 5%
- **Checks**: Validasi response status, waktu, dan struktur data

## API Endpoints

### GET /api/home
Mengembalikan data gabungan untuk halaman utama:

```json
{
  "skills": [...],
  "projectCategories": [...],
  "projects": [...]
}
```

Response berisi:
- `skills`: Semua skill yang tersedia
- `projectCategories`: Kategori project teratas (max 6) berdasarkan jumlah project published
- `projects`: Project published terbaru (max 6) dengan relasi skills dan categories

## Struktur Project

```
express-rest-api/
├── config/
│   └── database.js          # Konfigurasi Sequelize
├── models/
│   ├── Skill.js            # Model Skill
│   ├── Project.js          # Model Project
│   ├── ProjectCategory.js  # Model ProjectCategory
│   └── index.js            # Relasi antar model
├── server.js               # Entry point aplikasi
├── stress-test.js          # Stress testing dengan k6
├── package.json
└── README.md
```

## Troubleshooting

### Database Connection Error
- Pastikan MySQL server berjalan
- Periksa konfigurasi database di file `.env`
- Pastikan database dan user sudah dibuat

### Port Already in Use
- Ganti port di file `.env` atau gunakan port lain
- Kill process yang menggunakan port tersebut

### k6 Installation Issues
- Pastikan k6 terinstall dengan benar
- Untuk Ubuntu/Debian, pastikan repository k6 sudah ditambahkan
- Cek versi k6 dengan `k6 version`

## Dependencies

- `express`: Web framework
- `sequelize`: ORM untuk database
- `mysql2`: Driver MySQL untuk Sequelize
- `cors`: Middleware untuk CORS
- `helmet`: Security headers
- `dotenv`: Environment variables
- `nodemon`: Auto-reload untuk development 

 k6 run k6-tests/rps-stress-test.js