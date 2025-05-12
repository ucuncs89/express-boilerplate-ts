# Node.js Backend Application

Aplikasi backend berbasis Node.js dengan Express, TypeScript, dan MySQL. Dilengkapi dengan sistem logging, validasi, dan keamanan.

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Penggunaan](#penggunaan)
- [Struktur Proyek](#struktur-proyek)
- [Dokumentasi API](#dokumentasi-api)
- [Tools](#tools)
- [Logger](#logger)
- [Kontribusi](#kontribusi)

## ✨ Fitur

- **TypeScript** - Pemrograman dengan static typing
- **Express** - Framework web yang cepat dan fleksibel
- **MySQL** dengan Knex.js - Query builder SQL yang powerful
- **JWT Authentication** - Autentikasi dan otorisasi dengan JSON Web Token
- **Logging** - Sistem logging komprehensif dengan Winston
- **Validasi** - Validasi request dengan express-validator
- **Security** - Headers keamanan dengan Helmet
- **Error Handling** - Pengelolaan error yang komprehensif
- **Migrations & Seeds** - Database migrations dan seeding
- **Auto Router** - Routing otomatis berdasarkan struktur folder
- **Code Quality** - ESLint, Husky, dan lint-staged

## 🔧 Prasyarat

- Node.js (versi 18 atau lebih baru)
- MySQL (atau database yang didukung Knex.js)
- pnpm (direkomendasikan) atau npm

## 📥 Instalasi

### Menggunakan pnpm (direkomendasikan)

```bash
# Install pnpm secara global jika belum
npm install -g pnpm

# Clone repositori
git clone https://github.com/ucuncs89/express-boilerplate-ts.git
cd express-boilerplate-ts

# Install dependensi
pnpm install

# Setup environment
cp .env.example .env
# Sesuaikan konfigurasi di file .env

# Jalankan migrasi database
pnpm migrate
```

## ⚙️ Konfigurasi

Aplikasi ini menggunakan file `.env` untuk konfigurasi. Salin `.env.example` ke `.env` dan sesuaikan nilainya:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_CLIENT=mysql2
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_db_name

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_DIRECTORY=logs
LOG_MAX_SIZE=20m
LOG_MAX_FILES=14d
LOG_COLORIZE=true
```

## 🚀 Penggunaan

### Mode Development

```bash
# Menjalankan aplikasi dengan auto-reload
pnpm dev
```

### Mode Production

```bash
# Build aplikasi
pnpm build

# Jalankan aplikasi
pnpm start
```

### Database Management

```bash
# Menjalankan migrasi terbaru
pnpm migrate

# Rollback migrasi terakhir
pnpm migrate:rollback

# Membuat file migrasi baru
pnpm migrate:make nama_migrasi

# Menjalankan seed
pnpm seed

# Membuat file seed baru
pnpm seed:make nama_seed
```

## 📁 Struktur Proyek

```
.
├── dist/                  # Output build TypeScript
├── logs/                  # File log aplikasi
├── node_modules/          # Dependensi
├── routes/                # Output JSON dari routes yang terdaftar
├── src/
│   ├── config/            # Konfigurasi aplikasi
│   ├── http/              # Controller dan route
│   ├── lib/               # Library dan utility
│   ├── middlewares/       # Middleware Express
│   ├── migrations/        # Migrasi database
│   ├── repositories/      # Data access layer
│   ├── seeders/           # Seed database
│   ├── services/          # Business logic
│   ├── utils/             # Fungsi utilitas
│   └── index.ts           # Entry point aplikasi
├── .env                   # Environment variables
├── .eslintrc.json         # Konfigurasi ESLint
├── .gitignore             # File yang diabaikan Git
├── .husky/                # Git hooks
├── package.json           # Metadata dan dependensi proyek
├── pnpm-lock.yaml         # Lock file untuk pnpm
├── README.md              # Dokumentasi proyek
└── tsconfig.json          # Konfigurasi TypeScript
```

## 📚 Dokumentasi API

API endpoints tersedia di:

- **API Welcome**: `GET /api`
- **Health Check**: `GET /health`
- **All Routes**: `GET /api/routes`

Dokumentasi API lengkap akan tersedia di: `/api-docs` (jika Swagger diaktifkan)

## 🛠️ Tools

### Package Manager (pnpm)

Proyek ini menggunakan pnpm sebagai package manager. Keuntungan pnpm:

- Lebih cepat dibandingkan npm
- Efisien dalam penggunaan disk space
- Instalasi dependensi yang konsisten

### Git Hooks dengan Husky

Proyek menggunakan Husky untuk menjalankan script sebelum git commit dan push:

- **pre-commit**: Menjalankan linter pada file TypeScript yang berubah
- **pre-push**: Memeriksa kesalahan TypeScript tanpa full build

### ESLint

ESLint digunakan untuk menjaga kualitas kode. Jalankan pemeriksaan linting dengan:

```bash
# Memeriksa kesalahan
pnpm lint

# Memperbaiki kesalahan secara otomatis
pnpm lint:fix
```

## 📝 Logger

Aplikasi menggunakan Winston untuk logging yang mendukung berbagai format dan tipe data.

### Contoh Penggunaan Logger

```typescript
import logger from "./utils/logger";

// Log pesan informasi
logger.info("Server started successfully");

// Log pesan dengan data tambahan
logger.info("User logged in", { userId: 123, username: "john_doe" });

// Log warning
logger.warn("Rate limit approaching", { ip: "192.168.1.1", rate: "95%" });

// Log error dengan detail
try {
  // kode yang mungkin throw error
} catch (error) {
  logger.error("Failed to process payment", error);
}

// Log error dengan stack trace lengkap
try {
  // kode yang mungkin throw error
} catch (error) {
  logger.exception(error, { orderId: "12345" });
}

// Log objek langsung
const userData = { id: 1, name: "John", email: "john@example.com" };
logger.object("info", userData, "User data:");

// Log request HTTP
logger.http("GET", "/api/users", 200, 45); // method, path, status, time in ms
```

### Fitur Logger

- **Multiple Log Levels** - error, warn, info, http, debug
- **Colorized Output** - Warna berbeda untuk setiap level log
- **JSON Parsing** - Stringify objects secara otomatis
- **Error Handling** - Support untuk stack trace dan error objects
- **File Rotation** - Rotasi log berdasarkan ukuran/waktu
- **Production Ready** - Konfigurasi berbeda untuk development dan production

## 👥 Kontribusi

Kontribusi sangat diterima! Untuk berkontribusi pada proyek ini:

1. Fork repositori
2. Buat branch untuk fitur: `git checkout -b feature/fitur-baru`
3. Commit perubahan: `git commit -m 'Menambahkan fitur baru'`
4. Push ke branch: `git push origin feature/fitur-baru`
5. Submit pull request

## 📄 Lisensi

[ISC](LICENSE)
