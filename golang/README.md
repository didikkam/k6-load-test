# Express REST API - Go Version

REST API menggunakan Go, Gin framework, dan GORM dengan koneksi MySQL.

## Fitur

- **Gin** sebagai web framework (equivalent Express.js)
- **GORM** sebagai ORM (equivalent Sequelize)
- **MySQL** sebagai database
- **CORS** enabled
- **Environment variables** support
- **Concurrent handling** (Go goroutines)

## Struktur Database

### Tabel yang digunakan:
- `skills` - Data skill/teknologi
- `project_categories` - Kategori project
- `projects` - Data project
- `project_skills` - Relasi many-to-many project dan skill
- `project_project_categories` - Relasi many-to-many project dan kategori

## Instalasi

1. Pastikan Go 1.21+ terinstall
2. Masuk ke folder golang:
```bash
cd golang
```

3. Install dependencies:
```bash
go mod tidy
```

4. Buat file `.env` di root directory (sama dengan Express.js):
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
```

5. Pastikan database MySQL sudah dibuat dan tabel-tabel sudah ada.

## Development

Jalankan server dalam mode development:

```bash
go run main.go
```

Server akan berjalan di `http://localhost:3000`

## Production

### Build

```bash
# Build untuk Linux
GOOS=linux GOARCH=amd64 go build -o app main.go

# Build untuk macOS
GOOS=darwin GOARCH=amd64 go build -o app main.go

# Build untuk Windows
GOOS=windows GOARCH=amd64 go build -o app.exe main.go
```

### Jalankan Production

```bash
./app
```

## Perbandingan dengan Express.js

| Feature | Express.js | Go (Gin) |
|---------|------------|----------|
| Framework | Express.js | Gin |
| ORM | Sequelize | GORM |
| Concurrency | Cluster (manual) | Goroutines (automatic) |
| Performance | Good | Excellent |
| Memory Usage | Higher | Lower |
| Type Safety | JavaScript | Strong typing |

## API Endpoints

### GET /api/home
Mengembalikan data gabungan untuk halaman utama:

```json
{
  "skills": [...], go run main.go 
# command-line-arguments
./main.go:5:2: "database/sql" imported and not used
./main.go:6:2: "encoding/json" imported and not used
./main.go:145:2: ctx declared and not used
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
golang/
├── main.go              # Entry point aplikasi
├── go.mod               # Go modules
└── README.md
```

## Keuntungan Go vs Node.js

### **Performance:**
- **Compiled language**: Lebih cepat dari interpreted
- **Goroutines**: Concurrency built-in
- **Memory efficiency**: Lebih hemat memory

### **Concurrency:**
- **Automatic**: Tidak perlu manual cluster
- **Goroutines**: Lightweight threads
- **Channels**: Safe communication

### **Type Safety:**
- **Static typing**: Compile-time error checking
- **No runtime errors**: Lebih reliable

## Stress Testing

Gunakan k6 yang sama:

```bash
k6 run ../k6-tests/rps-stress-test.js
```

## Dependencies

- `gin-gonic/gin`: Web framework
- `gorm.io/gorm`: ORM untuk database
- `gorm.io/driver/mysql`: Driver MySQL untuk GORM
- `go-sql-driver/mysql`: MySQL driver
- `joho/godotenv`: Environment variables 