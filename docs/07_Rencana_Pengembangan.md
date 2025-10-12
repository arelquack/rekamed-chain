# Rencana Pengembangan: RekamedChain

**Versi Dokumen:** 1.0  
**Tanggal:** 9 Oktober 2025  

Dokumen ini bertujuan untuk mengevaluasi status Minimum Viable Product (MVP) RekamedChain saat ini, mengidentifikasi pencapaian dan kendala, serta merumuskan roadmap pengembangan strategis untuk evolusi produk menuju skala penuh yang siap untuk pilot project.

---

## 1. Evaluasi Versi MVP

Versi MVP saat ini telah membuktikan kelayakan teknis dari konsep inti proyek. Alur kerja utama, dari pembuatan identitas digital pasien hingga pencatatan data medis yang diamankan oleh simulasi blockchain, telah berhasil diimplementasikan.

### **Kelebihan & Pencapaian Utama**
- **Validasi Konsep:** Arsitektur tiga lapis—penyimpanan off-chain (PostgreSQL & IPFS), lapisan kedaulatan pasien (SSI), dan lapisan integritas (blockchain ledger)—telah terbukti dapat diimplementasikan secara sinergis.
- **Prototipe Fungsional:** Dua antarmuka utama (Aplikasi Pasien Mobile & Portal Tenaga Medis Web) dibangun dengan alur fitur esensial yang berfungsi penuh.
- **Alur Pengguna Lengkap:**  
  Registrasi Pasien (SSI) → Login → Permintaan Izin oleh Dokter → Persetujuan Izin oleh Pasien (tanda tangan digital) → Dokter Melihat & Menambah Rekam Medis → Data Baru Tercatat di Blockchain Ledger.
- **Fondasi Teknologi Solid:** Infrastruktur berbasis Docker → lingkungan konsisten, portabel, mudah dikelola.

### **Kendala & Area Peningkatan**
- **UX Belum Optimal:** Beberapa antarmuka mobile masih menggunakan data dummy (nama pasien & detail dokter) karena keterbatasan endpoint API.
- **Implementasi SSI Belum Penuh:** Login masih menggunakan email/password → sistem passwordless belum diterapkan.
- **Proses Manual:** Migrasi database & pembuatan Go binding smart contract masih manual → rawan human error.

---

## 2. Daftar Fitur Lanjutan yang Direncanakan

Untuk evolusi dari MVP ke produk skala penuh:

- **Arsitektur Backend Modular:** Refactoring total backend ke struktur package (api, storage, domain, utils, dll.).
- **Manajemen Profil Pengguna:** Endpoint untuk mengambil detail profil pengguna sendiri & pengguna lain berdasarkan ID.
- **Login Tanpa Password (Passwordless):** Otentikasi berbasis SSI dengan tanda tangan digital "pesan tantangan".
- **Manajemen Izin Penuh:** Fitur menolak & mencabut izin, durasi izin (misal 24 jam vs permanen).
- **Notifikasi Real-time:** Push notification untuk permintaan izin baru di aplikasi mobile.
- **Enkripsi Tingkat Lanjut (CP-ABE):** Implementasi Ciphertext-Policy Attribute-Based Encryption untuk kontrol akses granular.
- **Proof-of-Concept Integrasi Eksternal:** Simulasi tarik data dari API eksternal (misal SATUSEHAT) → uji interoperabilitas.

---

## 3. & 4. Roadmap Pengembangan dan Prioritas

Pengembangan dibagi tiga tahap dengan fokus berbeda.

### **Tahap 1: Penguatan Fondasi & UX**  
**Prioritas Utama | Estimasi: 3-4 Minggu**  
Tujuan: Lunasi utang teknis, hilangkan data dummy, aplikasi terasa lengkap bagi pengguna.

- **P1:** Refactor Backend → Pecah `main.go` menjadi struktur modular (krusial, blocker pengembangan paralel).  
- **P1:** Endpoint Profil & Detail Pengguna → GET /users/me & GET /users/{id}  
- **P2:** Upgrade Endpoint Consent → GET /consent/requests/me → sertakan detail dokter  
- **P2:** Endpoint Tolak/Cabut Izin → POST /consent/deny/{id} & POST /consent/revoke/{id}

### **Tahap 2: Implementasi Kedaulatan Penuh & Interaktivitas**  
**Prioritas Tinggi | Estimasi: 4-6 Minggu**  
Tujuan: Wujudkan visi SSI penuh & interaktivitas lebih hidup.

- **P1:** Implementasi Login Tanpa Password (Passwordless)  
- **P2:** Implementasi Notifikasi Real-time permintaan izin  
- **P3:** Sempurnakan Detail Izin → logika durasi & lingkup data

### **Tahap 3: Keamanan Lanjutan & Visi Jangka Panjang**  
**Prioritas Menengah | Estimasi: >8 Minggu**  
Tujuan: Implementasi fitur paling canggih.

- **P1:** Riset & Implementasi Awal CP-ABE  
- **P2:** Proof-of-Concept Integrasi SATUSEHAT  
- **P3:** Migrasi Smart Contract ke Testnet Publik (misal: Sepolia)

---

## 5. Potensi Ekspansi

Setelah MVP skala penuh, potensi ekspansi sangat luas:

- **Integrasi Penuh dengan API Nasional:** SATUSEHAT, BPJS, SIMRS  
- **Modul Tambahan:** Peran lain → Apotek (validasi resep), Laboratorium (hasil tes)  
- **Migrasi ke Hyperledger Fabric:** Dari Ethereum MVP → Hyperledger enterprise-grade  
- **Implementasi Verifiable Credentials (VCs):** Upgrade model SSI menggunakan W3C VCs, pasien memegang sertifikat digital terpercaya (misal bukti vaksinasi)