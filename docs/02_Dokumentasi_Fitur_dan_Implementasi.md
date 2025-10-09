# 📱 Dokumentasi Fitur dan Implementasi: RekamedChain

**Versi Dokumen:** 1.0  
**Tanggal:** 9 Oktober 2025  

Dokumen ini merincikan daftar fitur utama yang telah dikembangkan untuk Minimum Viable Product (MVP) dari sistem **RekamedChain**, beserta status implementasi dan deskripsi antarmuka terkait.

---

## 1. Autentikasi & Manajemen Peran

Fondasi sistem yang mengatur identitas, akses, dan hak pengguna.

| **Fitur** | **Deskripsi** | **Status** | **Antarmuka Terkait** |
|------------|----------------|-------------|-------------------------|
| **1.1. Registrasi Pengguna** | Pengguna dapat membuat akun baru. Sistem secara otomatis membuat identitas digital dan membedakan peran antara *patient* (via aplikasi mobile) dan *doctor* (via portal web). | ✅ Sudah diimplementasikan | Halaman *Daftar Akun Baru* di Aplikasi Mobile & Portal Web. |
| **1.2. Login Pengguna** | Pengguna dapat masuk ke sistem menggunakan kredensial (email dan password). Sistem memanfaatkan JSON Web Token (JWT) untuk manajemen sesi yang aman. | ✅ Sudah diimplementasikan | Halaman *Login* di Aplikasi Mobile & Portal Web. |
| **1.3. Kontrol Akses Berbasis Peran** | Sistem membedakan hak akses. Fitur kritis seperti pencatatan rekam medis hanya dapat diakses oleh pengguna dengan peran *doctor*. | ✅ Sudah diimplementasikan | Terimplementasi di backend (*middleware*) dan logika UI. |

📸 **Screenshot (dummy):**
![Halaman Login Mobile](images/login-mobile.png)
![Halaman Registrasi Portal](images/register-portal.png)

---

## 2. Alur Rekam Medis & Data

Fitur inti yang berkaitan dengan pengelolaan dan visualisasi data kesehatan.

| **Fitur** | **Deskripsi** | **Status** | **Antarmuka Terkait** |
|------------|----------------|-------------|-------------------------|
| **2.1. Pembuatan Rekam Medis** | Tenaga medis (*doctor*) dapat membuat catatan rekam medis baru untuk pasien, mencakup diagnosis dan observasi. | ✅ Sudah diimplementasikan | Form *Tambah Rekam Medis Baru* di Portal Web. |
| **2.2. Penyimpanan Lampiran (IPFS)** | File lampiran (misal hasil lab) diunggah ke jaringan IPFS. Alamat unik file (CID) disimpan di database. | ✅ Sudah diimplementasikan | Input file di form *Tambah Rekam Medis* dan link *Lihat Lampiran*. |
| **2.3. Visualisasi Riwayat Medis** | Pasien dan Dokter (dengan izin) dapat melihat riwayat rekam medis secara kronologis. | ✅ Sudah diimplementasikan | Tab *Riwayat Medis* di Aplikasi Mobile dan halaman *Detail Pasien* di Portal Web. |

📸 **Screenshot (dummy):**
![Riwayat Medis](images/riwayat-medis.png)
![Tambah Rekam Medis](images/tambah-rekam.png)

---

## 3. Kedaulatan Pasien & Keamanan Data

Fitur inovatif yang menjadi pilar utama RekamedChain.

| **Fitur** | **Deskripsi** | **Status** | **Antarmuka Terkait** |
|------------|----------------|-------------|-------------------------|
| **3.1. Fondasi Self-Sovereign Identity (SSI)** | Saat registrasi, setiap pasien dibuatkan pasangan kunci publik & privat (ECDSA). Kunci privat disimpan aman di perangkat pasien. | ✅ Sudah diimplementasikan | Proses otomatis di backend, penyimpanan kunci di AsyncStorage. |
| **3.2. Manajemen Izin Akses (Consent)** | Pasien dapat menyetujui/menolak permintaan akses data dari dokter. Validasi menggunakan tanda tangan digital pasien. | ✅ Sudah diimplementasikan | Tab *Manajemen Izin* di Aplikasi Mobile. |
| **3.3. Enkripsi Data At-Rest (AES)** | Data rekam medis dienkripsi AES-256 sebelum disimpan di database untuk menjaga kerahasiaan. | ✅ Sudah diimplementasikan | Proses transparan di backend. |

📸 **Screenshot (dummy):**
![Manajemen Izin](images/consent-mobile.png)
![Tanda Tangan Digital](images/signature-process.png)

---

## 4. Transparansi & Jejak Audit

Menjamin aktivitas sistem dapat diverifikasi dengan transparan.

| **Fitur** | **Deskripsi** | **Status** | **Antarmuka Terkait** |
|------------|----------------|-------------|-------------------------|
| **4.1. Pencatatan ke Blockchain (Simulasi)** | Setiap pembuatan rekam medis mencatat *hash* ke Smart Contract di jaringan Ethereum lokal (Hardhat). | ✅ Sudah diimplementasikan | Halaman *Lihat Ledger* di Portal Web. |
| **4.2. Log Akses untuk Pasien** | Pasien dapat melihat aktivitas akses terhadap data medis mereka (permintaan, persetujuan, pencatatan baru). | ✅ Sudah diimplementasikan | Tab *Log Akses* di Aplikasi Mobile. |

📸 **Screenshot (dummy):**
![Ledger Blockchain](images/ledger.png)
![Log Akses Pasien](images/log-akses.png)

---

## 5. Fitur yang Direncanakan (Menuju Skala Penuh)

Langkah-langkah strategis untuk melengkapi MVP dan mempersiapkan pilot project.

| **Fitur** | **Deskripsi** | **Status** | **Antarmuka Terkait** |
|------------|----------------|-------------|-------------------------|
| **5.1. Bukti Konsep Integrasi** | Implementasi mock API untuk simulasi integrasi eksternal (SATUSEHAT). | 🔄 Direncanakan | Tombol *Tarik Data* di halaman *Detail Pasien*. |
| **5.2. Login Tanpa Password (SSI Penuh)** | Login sepenuhnya berbasis tanda tangan digital pasien. | 🔄 Direncanakan | Alur login baru di Aplikasi Mobile & Portal Web. |
| **5.3. Notifikasi Real-time** | Sistem push notification untuk permintaan izin akses baru. | 🔄 Direncanakan | Fitur notifikasi di Aplikasi Mobile. |
| **5.4. Refactoring Arsitektur Backend** | Pemecahan `main.go` ke package terstruktur (api, storage, domain, dll.) untuk skalabilitas. | 🔄 Direncanakan | Perubahan struktur folder backend. |

📸 **Screenshot (dummy):**
![Mock Integrasi SATUSEHAT](images/integrasi.png)
![Notifikasi Mobile](images/notifikasi.png)

---

## 🧩 Kesimpulan

Seluruh fitur utama yang direncanakan untuk MVP telah berhasil diimplementasikan dan terintegrasi dengan baik antara komponen frontend (React Native & Next.js), backend (Golang), serta blockchain (Hardhat + Solidity).  
Dokumentasi ini menjadi dasar bagi pengembangan tahap berikutnya — menuju versi **pilot project skala penuh** yang siap diujicobakan pada lingkungan kesehatan nyata.

---
