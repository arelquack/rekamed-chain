# Desain UI/UX: RekamedChain

**Versi Dokumen:** 1.0  
**Tanggal:** 9 Oktober 2025  

Dokumen ini menguraikan prinsip-prinsip desain, gaya visual, dan alur pengalaman pengguna (UX) yang menjadi landasan bagi pengembangan antarmuka (UI) aplikasi RekamedChain.

---

## 1. Makna Logo

Logo RekamedChain adalah fondasi dari identitas visual dan filosofi proyek. Setiap elemen dirancang untuk menceritakan sebuah narasi:

- **Bentuk Hati:** Melambangkan pilar utama yaitu kesehatan, kepedulian, dan fokus pada kemanusiaan (pasien).  
- **Jalinan di Dalam Hati:** Merepresentasikan tiga konsep inti:  
  - **Rantai (Chain):** Simbol dari keamanan dan integritas yang dibawa oleh teknologi Blockchain.  
  - **Integrasi:** Visualisasi dari solusi atas masalah data yang terfragmentasi, di mana RekamedChain menyatukan riwayat medis dari berbagai faskes.  
  - **Hubungan Kepercayaan:** Menggambarkan hubungan berbasis persetujuan (consent) antara pasien dan tenaga medis.  
- **Garis Kontinu:** Melambangkan kesinambungan perawatan (continuity of care), di mana data pasien mengalir utuh dan tanpa putus sepanjang hidup mereka.  
- **Gradasi Warna (Hijau ke Biru):** Menunjukkan sinergi yang harmonis antara dunia kesehatan (hijau) dan teknologi/kepercayaan (biru).  

> Secara keseluruhan, logo ini bermakna: "Sebuah sistem yang berpusat pada kepedulian terhadap pasien (hati), dengan mengintegrasikan teknologi blockchain yang aman (jalinan rantai) untuk menciptakan alur riwayat medis yang berkelanjutan (garis kontinu)."

---

## 2. Prinsip Desain dan Gaya Visual

Desain RekamedChain dibangun di atas tiga pilar utama: **Kepercayaan, Kejelasan, dan Kedaulatan.**

- **Palet Warna Utama:**  
  - **Biru Utama (#007AFF):** Kepercayaan, teknologi, stabilitas. Digunakan untuk aksi primer (tombol utama, tautan, ikon aktif).  
  - **Hijau Sekunder (#34D399):** Kesehatan, persetujuan, status "Aktif". Digunakan untuk badge status positif.  
  - **Merah Aksen (#EF4444):** Peringatan, penolakan, aksi "Cabut". Digunakan terbatas untuk menarik perhatian tindakan penting.  
  - **Netral:** Abu-abu (#f0f4f8 untuk latar) & putih (#ffffff untuk kartu) untuk tampilan bersih, minimalis, fokus konten.  

- **Tipografi:**  
  Menggunakan font sans-serif modern & mudah dibaca (System UI di mobile, Inter di web).  

- **Gaya Ikon:**  
  Library **Feather Icons**: outline, modern, minimalis, selaras dengan prinsip desain fungsional.

---

## 3. Alur Navigasi (Flow)

- **Alur Pasien (Aplikasi Mobile):**  
  1. Buka Aplikasi → diarahkan ke Login  
  2. Login/Register → Pengguna membuat akun (menyimpan private key)  
  3. Dasbor Utama (Tab Navigator: Dasbor, Riwayat, Izin Akses, Log Akses)  
  4. Logout → Tombol di halaman profil (fitur direncanakan)  

- **Alur Tenaga Medis (Portal Web):**  
  1. Buka Portal → diarahkan ke Login  
  2. Login → Dokter masuk ke sistem  
  3. Navigasi via Navbar → Pencarian Pasien, Ledger Blockchain, Logout  
  4. Alur Inti: Pencarian Pasien → Detail Pasien → Meminta Izin / Melihat Audit Log / Menambah Rekam Medis Baru

---

## 4. Deskripsi Halaman Utama dan Komponennya

### **Aplikasi Mobile (Pasien)**

- **Halaman Login & Registrasi:** Layout berbasis kartu, logo, input dengan ikon, show/hide password, modal animasi Lottie untuk feedback.  
- **Halaman Dasbor:** Header profil, kartu notifikasi "Permintaan Akses Baru", kartu "Ringkasan Kesehatan", kartu aksi navigasi.  
- **Halaman Riwayat, Izin, Log Akses:** Layout linimasa atau SectionList, data kronologis, badge warna untuk status.

### **Portal Web (Dokter)**

- **Layout Utama:** Navbar persisten untuk navigasi konsisten  
- **Halaman Pencarian & Detail:** Layout kartu, informasi kondisional berdasarkan status izin  
- **Komponen:** Menggunakan **shadcn/ui** untuk konsistensi dan aksesibilitas

---

## 5. Screenshot / Wireframe (Dummy)

### Aplikasi Mobile (Pasien)
![Dummy Login](images/login.png)  
![Dummy Dashboard](images/dashboard.png)  
![Dummy Detail Riwayat](images/dummy_detail.png)  

### Portal Web (Dokter)
![Dummy Web Dashboard](images/web_dashboard.png)  
![Dummy Detail Pasien](images_web_detail.png)  

---

## 6. Bagaimana UI Mendukung UX

Desain UI RekamedChain mendukung pengalaman pengguna (UX) dengan menerapkan prinsip heuristik Jakob Nielsen:

- **Visibility of System Status:** Feedback loading, error jelas, modal animasi Lottie untuk status sukses/gagal.  
- **User Control and Freedom:** Show/hide password, tombol kembali, tombol "Cabut Izin" → kendali penuh pengguna.  
- **Consistency and Standards:** Tab navigator di mobile & navbar di web konsisten, ikonografi standar → mengurangi beban kognitif.  
- **Aesthetic and Minimalist Design:** Layout bersih, fokus konten, penggunaan whitespace & kartu memudahkan pencarian informasi.  
- **Branding & Logo:** Memperkuat identitas aplikasi dan meningkatkan kepercayaan pengguna.