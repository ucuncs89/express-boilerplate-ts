# Node.js Backend Application

## Package Manager (pnpm)

Proyek ini menggunakan pnpm sebagai package manager. Keuntungan menggunakan pnpm:

- Lebih cepat dibandingkan npm
- Efisien dalam penggunaan disk space
- Instalasi dependensi yang konsisten

### Instalasi pnpm

```bash
npm install -g pnpm
```

### Perintah Dasar

```bash
# Install dependencies
pnpm install

# Menjalankan aplikasi
pnpm dev

# Build aplikasi
pnpm build

# Menjalankan aplikasi production
pnpm start
```

## Git Hooks dengan Husky

Proyek ini menggunakan Husky untuk menjalankan script sebelum git commit dan push:

- **pre-commit**: Menjalankan lint-staged untuk memeriksa kode yang akan di-commit
- **pre-push**: Memastikan aplikasi dapat di-build dengan sukses sebelum push

## Logger Documentation

Aplikasi ini menggunakan Winston untuk logging yang mendukung penggunaan berbagai format dan tipe data.

### Konfigurasi Logger

Logger dapat dikonfigurasi menggunakan file `.env` dengan variabel berikut:

```
LOG_LEVEL=info          # error, warn, info, http, debug
LOG_FORMAT=dev          # Format output log
LOG_TO_FILE=true        # Apakah log disimpan ke file
LOG_DIRECTORY=logs      # Direktori untuk menyimpan file log
LOG_MAX_SIZE=20m        # Ukuran maksimum file log sebelum rotasi
LOG_MAX_FILES=14d       # Berapa lama file log disimpan
LOG_COLORIZE=true       # Apakah output log berwarna
```

### Penggunaan Logger

Logger dapat digunakan seperti contoh berikut:

```typescript
import logger from "./utils/logger";

// Log pesan informasi
logger.info("Server started successfully");

// Log pesan dengan data tambahan
logger.info("User logged in", { userId: 123, username: "john_doe" });

// Log pesan warning
logger.warn("Rate limit approaching", { ip: "192.168.1.1", rate: "95%" });

// Log error dengan detail
try {
  // some code that might throw
} catch (error) {
  logger.error("Failed to process payment", error);
}

// Log error dengan stack trace lengkap
try {
  // some code that might throw
} catch (error) {
  logger.exception(error, { orderId: "12345" });
}

// Log objek langsung (JSON, dll)
const userData = { id: 1, name: "John", email: "john@example.com" };
logger.object("info", userData, "User data:");

// Log request HTTP
logger.http("GET", "/api/users", 200, 45); // method, path, status, time in ms
```

### Fitur

Logger yang diimplementasikan mendukung:

1. **Multiple Log Levels** - error, warn, info, http, debug
2. **Colorized Output** - Warna berbeda untuk setiap level log
3. **JSON Parsing** - Dapat melakukan stringify objects secara otomatis
4. **Error Handling** - Support untuk full stack trace dan error objects
5. **File Rotation** - Log dapat dirotasi berdasarkan ukuran atau waktu
6. **Production Ready** - Konfigurasi berbeda untuk development dan production

### Format Log

Format log console:

```
[2023-07-21 15:30:45:123] [INFO]: Server started successfully
```

Format log file (JSON):

```json
{
  "timestamp": "2023-07-21 15:30:45:123",
  "level": "info",
  "message": "Server started successfully"
}
```

Untuk error, termasuk stack trace lengkap jika tersedia.
