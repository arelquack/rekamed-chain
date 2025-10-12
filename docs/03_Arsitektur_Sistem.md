# Arsitektur Sistem: RekamedChain

**Versi Dokumen:** 1.0  
**Tanggal:** 9 Oktober 2025  

Dokumen ini memberikan gambaran umum mengenai arsitektur teknis dari sistem **RekamedChain**, menjelaskan alur kerja, komponen utama, dan teknologi yang digunakan dalam implementasi **Minimum Viable Product (MVP)**.

---

## 1. Penjelasan Singkat Alur Sistem

Arsitektur RekamedChain dirancang sebagai sistem multi-lapis yang memisahkan antarmuka pengguna, logika bisnis, dan lapisan data.  
Alur sistem secara umum adalah sebagai berikut:

1. **Interaksi Pengguna**  
   Pengguna (Pasien atau Dokter) berinteraksi melalui aplikasi antarmuka sesuai perannya:  
   - **Aplikasi Mobile (React Native)** untuk Pasien  
   - **Portal Web (Next.js)** untuk Dokter

2. **Permintaan ke Backend**  
   Setiap aksi pengguna diterjemahkan menjadi permintaan HTTPS ke **Backend API Gateway (Go)**.

3. **Proses di Backend**  
   Backend API memproses permintaan: validasi, otentikasi (JWT), otorisasi (role-based), enkripsi/dekripsi data, dan interaksi dengan database.

4. **Interaksi dengan Lapisan Data**  
   Backend berkomunikasi dengan tiga komponen penyimpanan:
   - **PostgreSQL:** menyimpan data terstruktur seperti profil dan metadata rekam medis  
   - **IPFS:** menyimpan file biner (lampiran medis)  
   - **Blockchain (Hardhat):** mencatat hash transaksi sebagai jejak audit yang kekal (immutable)

5. **Respon ke Frontend**  
   Hasil pemrosesan dikirim kembali ke frontend untuk ditampilkan kepada pengguna.

---

## 2. Daftar Teknologi dan Framework

Berikut rincian **tech stack** yang digunakan dalam proyek RekamedChain:

### 🔹 Frontend (Aplikasi Pasien)
- **Framework:** React Native (Expo)
- **Bahasa:** TypeScript
- **Navigasi:** Expo Router
- **Kriptografi:** Ethers.js
- **Penyimpanan Lokal:** AsyncStorage

### 🔹 Frontend (Portal Dokter)
- **Framework:** Next.js (App Router)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS
- **Komponen UI:** Shadcn/ui

### 🔹 Backend
- **Bahasa:** Go (Golang)
- **Framework:** net/http (Standard Library)
- **Dependensi Kunci:**  
  - `pgx` → PostgreSQL  
  - `go-ethereum` → Interaksi Blockchain  
  - `jwt-go` → Autentikasi  
  - `rs/cors` → CORS Handling

### 🔹 Database & Penyimpanan
- **Database Utama:** PostgreSQL  
- **Penyimpanan File:** InterPlanetary File System (IPFS / Kubo)

### 🔹 Blockchain
- **Jaringan Development:** Hardhat (Node Ethereum lokal)
- **Bahasa Smart Contract:** Solidity

### 🔹 Infrastruktur & DevOps
- **Containerization:** Docker & Docker Compose  
- **Tunneling (Development):** Ngrok

---

## 3. Diagram Arsitektur Sistem

Diagram berikut mengilustrasikan komponen-komponen utama dan alur interaksi sistem:

![Arsitektur Sistem (PlantUML)](images/architecture.png)


---

## 4. Penjelasan Hubungan Antar Komponen

### 🔸 Frontend → Backend
Seluruh interaksi (login, unggah, permintaan data) dari frontend diarahkan ke **Backend API Gateway**.  
Untuk versi pengembangan mobile, koneksi dijembatani melalui **Ngrok**.

### 🔸 Backend → PostgreSQL
Menggunakan **driver pgx** untuk operasi CRUD terhadap data terstruktur: profil pengguna, metadata rekam medis, status izin, dsb.

### 🔸 Backend → IPFS
- **Upload:** Dokter mengunggah file → backend kirim ke IPFS API (port 5001) → dapat CID.  
- **Download/View:** Permintaan ke `/ipfs/<CID>` diteruskan via reverse proxy ke IPFS Gateway (port 8080 internal).

### 🔸 Backend → Hardhat
Saat server dijalankan:
- Backend menginisialisasi koneksi ke **node Hardhat (port 8545)**  
- Deploy **smart contract Ledger.sol**
- Setiap pembuatan rekam medis baru → kirim transaksi ke blockchain → catat hash data.

---

## 5. Ringkasan Keamanan dan Otentikasi

Keamanan merupakan pilar utama sistem RekamedChain.

### 🛡️ Autentikasi Sesi
Menggunakan **JWT (JSON Web Token)**.  
Token dikirim di header `Authorization` untuk setiap request yang dilindungi.

### 🧩 Otorisasi Berbasis Peran (RBAC)
Middleware backend memeriksa `role` dalam JWT (`patient` / `doctor`).  
Endpoint tertentu seperti `POST /records` hanya dapat diakses oleh dokter.

### 🔐 Self-Sovereign Identity (SSI)
Persetujuan akses data (consent) divalidasi menggunakan **tanda tangan digital (ECDSA)**.  
Pasien menandatangani permintaan dengan `private_key` di perangkat; backend memverifikasi dengan `public_key` di database.

### 🧠 Enkripsi Data At-Rest
Data medis sensitif (diagnosis, notes) dienkripsi menggunakan **AES-256** sebelum disimpan di PostgreSQL.

### ⛓️ Integritas Data
Setiap penambahan rekam medis menghasilkan hash yang dicatat di **blockchain lokal (Hardhat)**.  
Hal ini menjamin **audit trail** yang immutable dan transparan.

---

**© Trifur Labs, 2025**