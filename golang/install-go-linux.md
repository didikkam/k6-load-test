# Install Go di Linux Mint

## Metode 1: Download dari Official Website (Recommended)

### 1. Download Go
```bash
# Buat folder untuk Go
sudo mkdir -p /usr/local/go

# Download Go (versi terbaru)
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz

# Extract ke /usr/local
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
```

### 2. Set Environment Variables
```bash
# Edit .bashrc
nano ~/.bashrc

# Tambahkan di akhir file:
export PATH=$PATH:/usr/local/go/bin
export GOPATH=$HOME/go
export GOROOT=/usr/local/go

# Reload .bashrc
source ~/.bashrc
```

### 3. Verifikasi Instalasi
```bash
go version
# Output: go version go1.21.5 linux/amd64
```

## Metode 2: Menggunakan Package Manager

### Snap (jika tersedia)
```bash
sudo snap install go --classic
```

### APT (jika ada di repository)
```bash
sudo apt update
sudo apt install golang-go
```

## Metode 3: Menggunakan g (Go Version Manager)

### 1. Install g
```bash
curl -sSL https://git.io/g-install | sh -s
```

### 2. Restart terminal atau reload
```bash
source ~/.bashrc
```

### 3. Install Go
```bash
g install latest
```

## Setup Project

### 1. Masuk ke folder golang
```bash
cd golang
```

### 2. Initialize Go modules
```bash
go mod init express-rest-api
```

### 3. Install dependencies
```bash
go mod tidy
```

### 4. Test aplikasi
```bash
go run main.go
```

## Troubleshooting

### Jika go command not found:
```bash
# Cek PATH
echo $PATH

# Pastikan Go ada di PATH
which go

# Jika tidak ada, tambahkan manual
export PATH=$PATH:/usr/local/go/bin
```

### Jika permission denied:
```bash
# Cek ownership
ls -la /usr/local/go

# Fix permission jika perlu
sudo chown -R $USER:$USER /usr/local/go
```

### Jika port 3000 sudah digunakan:
```bash
# Cek process yang menggunakan port 3000
sudo lsof -i :3000

# Kill process jika perlu
sudo kill -9 <PID>
```

## Verifikasi Lengkap

```bash
# Cek Go version
go version

# Cek Go environment
go env

# Cek Go modules
go mod verify

# Test build
go build -o app main.go
```

## Tips

1. **GOPATH**: Default workspace Go ada di `$HOME/go`
2. **GOROOT**: Lokasi instalasi Go (biasanya `/usr/local/go`)
3. **GOPROXY**: Untuk download modules (default: proxy.golang.org)
4. **GO111MODULE**: Set ke `on` untuk menggunakan Go modules

## Update Go

```bash
# Download versi terbaru
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz

# Backup versi lama
sudo mv /usr/local/go /usr/local/go.old

# Install versi baru
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz

# Verifikasi
go version
``` 