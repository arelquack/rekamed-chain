# 🏥 Deskripsi Proyek: RekamedChain

**Versi:** 1.0 (MVP)  
**Tanggal:** 9 Oktober 2025  

---

## 1. Latar Belakang

Sistem kesehatan digital di Indonesia menghadapi tiga tantangan sistemik yang krusial: **fragmentasi data antar fasilitas kesehatan (faskes)**, **kerentanan keamanan siber terhadap data medis yang sensitif**, dan **ketiadaan kedaulatan pasien atas data kesehatan pribadi mereka**.

Meskipun regulasi seperti *Permenkes No. 24 Tahun 2022 tentang Rekam Medis Elektronik (RME)* dan platform **SATUSEHAT** telah mendorong digitalisasi, fondasi teknis yang ada masih berbasis arsitektur **terpusat** yang rapuh. Hal ini menghambat interoperabilitas data, menurunkan kepercayaan publik, dan menempatkan pasien pada posisi yang lemah dalam mengontrol data mereka sendiri.

Proyek **RekamedChain** dikembangkan untuk menjawab tantangan fundamental ini dengan merombak paradigma pengelolaan rekam medis.

---

## 2. Tujuan Pengembangan Aplikasi

Pengembangan RekamedChain bertujuan untuk menghasilkan sebuah **Minimum Viable Product (MVP)** yang fungsional dengan tujuan strategis sebagai berikut:

1. **Membangun Arsitektur Terdesentralisasi**  
   Menciptakan purwarupa sistem rekam medis yang menjamin keamanan, integritas, dan interoperabilitas data dengan memanfaatkan teknologi **blockchain** dan **penyimpanan terdistribusi**.

2. **Mewujudkan Kedaulatan Pasien (Self-Sovereign Identity - SSI)**  
   Mengimplementasikan model SSI untuk memberikan pasien **kontrol penuh** dalam mengelola dan memberikan persetujuan akses terhadap data medis pribadi mereka secara kriptografis.

3. **Membuktikan Kelayakan Konsep (Proof-of-Concept)**  
   Menyediakan bukti konsep yang solid bahwa **arsitektur hibrida (on-chain dan off-chain)** dapat diimplementasikan secara efektif untuk kasus penggunaan rekam medis.

4. **Menyiapkan Fondasi untuk Interoperabilitas Nasional**  
   Membangun fondasi sistem yang dirancang untuk dapat diintegrasikan dengan ekosistem kesehatan nasional seperti **platform SATUSEHAT**.

---

## 3. Solusi yang Ditawarkan

RekamedChain menawarkan solusi inovatif melalui **arsitektur tiga lapis** yang bekerja secara sinergis:

### 🧩 Lapisan Data & Skalabilitas (Off-Chain Storage)
- Data rekam medis aktual (diagnosis, catatan) dienkripsi dengan **AES-256** sebelum disimpan di **PostgreSQL**.  
- File lampiran (hasil lab, radiologi, dll) disimpan secara **terdesentralisasi** di **IPFS**.  
- Pendekatan ini menjamin **kerahasiaan data at-rest** sekaligus menjaga **skalabilitas** sistem.

### 🧠 Lapisan Kedaulatan Pasien (Self-Sovereign Identity - SSI)
- Saat registrasi, setiap pasien dibuatkan **pasangan kunci kriptografi ECDSA** (kunci publik & privat).  
- Kunci privat disimpan aman di perangkat pasien dan digunakan sebagai **tanda tangan digital**.  
- Pasien menggunakan kunci ini untuk menyetujui setiap permintaan akses data, menciptakan **bukti persetujuan yang tak terbantahkan** secara matematis.

### 🔗 Lapisan Konsensus & Integritas (Blockchain)
- Blockchain **tidak menyimpan data medis**, melainkan mencatat **sidik jari digital (hash)** dari transaksi penting.  
- Hash disimpan ke dalam **Smart Contract** di jaringan Ethereum (disimulasikan dengan **Hardhat**).  
- Hasilnya adalah **jejak audit transparan** yang tidak dapat dimanipulasi, menjamin integritas dan kepercayaan.

---

## 4. Target Pengguna

MVP RekamedChain dirancang untuk melayani dua kelompok pengguna utama:

### 👤 Pasien
- Mendaftar dan membuat identitas digital (SSI)
- Melihat riwayat medis pribadi
- Mengelola permintaan izin akses dari tenaga medis
- Melihat log audit akses data mereka

### ⚕️ Tenaga Medis (Dokter)
- Mencari data pasien melalui portal web
- Mengirim permintaan izin akses
- Melihat riwayat medis pasien (setelah izin diberikan)
- Mencatat rekam medis baru dan mengunggah lampiran

---

## 5. Ringkasan Teknologi yang Digunakan

### 💻 Frontend (Aplikasi Pasien)
- **Framework:** React Native (Expo)  
- **Bahasa:** TypeScript  
- **Navigasi:** Expo Router (Tab & Stack Navigation)  
- **Styling:** React Native StyleSheet  
- **Kriptografi:** Ethers.js (pembuatan tanda tangan digital)

### 🧭 Frontend (Portal Dokter)
- **Framework:** Next.js (App Router)  
- **Bahasa:** TypeScript  
- **Styling:** Tailwind CSS  
- **UI Components:** Shadcn/ui  

### ⚙️ Backend
- **Bahasa:** Go (Golang)  
- **Framework:** net/http (standard library)  
- **Routing:** ServeMux (awalnya gorilla/mux)  
- **Database Driver:** pgx (PostgreSQL)  
- **Blockchain Interaction:** go-ethereum (Geth)  
- **Autentikasi:** jwt-go  
- **CORS Handling:** rs/cors  

### 🗄️ Database & Penyimpanan
- **Database Utama:** PostgreSQL (Dockerized)  
- **Penyimpanan File:** IPFS (Kubo, Dockerized)

### ⛓️ Blockchain
- **Jaringan Lokal:** Hardhat (Node Ethereum lokal)  
- **Bahasa Smart Contract:** Solidity  

### 🧰 Infrastruktur & DevOps
- **Containerization:** Docker & Docker Compose  
- **CI/CD:** GitHub Actions  
- **Development Tunneling:** Ngrok  

---

## 6. Kesimpulan Singkat

Proyek **RekamedChain** berhasil mengembangkan sebuah **Minimum Viable Product (MVP)** yang membuktikan kelayakan konsep rekam medis berbasis blockchain dan SSI.

Melalui arsitektur tiga lapis yang solid, aplikasi ini menunjukkan bahwa:
- Teknologi **blockchain** dapat menjamin integritas data medis,  
- **SSI** mampu memberi pasien kendali penuh atas data mereka, dan  
- **Penyimpanan terdesentralisasi** dapat menjaga keamanan sekaligus efisiensi sistem.

Walau masih tahap awal, fondasi teknis dan arsitektur yang dibangun **sudah sangat kokoh** untuk dikembangkan menjadi **pilot project skala penuh** di masa mendatang.

---

> 📘 *Dokumen ini merupakan bagian dari paket dokumentasi MVP RekamedChain (v1.0) — Deskripsi Proyek.*
