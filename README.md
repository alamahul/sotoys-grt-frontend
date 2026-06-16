# SOTOYS GARUT - E-Commerce Platform Frontend

A modern, responsive, and feature-rich e-commerce frontend built for **SOTOYS GARUT** (toko online mainan anak) using React, Vite, TypeScript, and Tailwind CSS.

---

## 🚀 Fitur Utama

### 🛒 Belanja & Transaksi (Guest & Customer)
- **Katalog & Filter Produk**: Pencarian mainan, filter kategori, dan pengurutan (paling sesuai, terpopuler, harga terendah/tertinggi).
- **Keranjang & Wishlist**: Manajemen keranjang belanja dan wishlist dinamis berbasis Context.
- **Checkout Dinamis (Midtrans Ready)**:
  - Step 1: Pilihan alamat pengiriman dinamis dari profil.
  - Step 2: Pilihan kurir dengan estimasi waktu dan biaya kirim.
  - Step 3: Konfirmasi detail pesanan yang lengkap (siap diintegrasikan dengan Midtrans Snap).

### 👤 Dashboard & Akun Pelanggan (Customer Session)
- **Dashboard Pelanggan**: Akses cepat ke pesanan saya, wishlist, riwayat pengembalian, notifikasi, dan profil.
- **Pengaturan Profil & Keamanan**: Pembaruan nama, email, dan penggantian kata sandi.
- **Buku Alamat Pengiriman**: Pengelolaan buku alamat lengkap (tambah, edit, hapus, atur alamat utama) secara persisten di `localStorage`.
- **Lacak Pesanan & Pengembalian**: Lacak proses pengiriman barang atau proses pengembalian produk dengan visual timeline interaktif.

### 🛡️ Dashboard Panel Admin (Admin Session)
- **Analisis & Laporan**: Grafik pendapatan bulanan dan tren penjualan interaktif.
- **Manajemen Pesanan**: Verifikasi pembayaran dan pembaruan status pengiriman.
- **Manajemen Produk**: Kelola katalog produk, stok barang, deskripsi, dan ulasan.
- **Database & System Logs**: Pantau catatan log sistem basis data secara berkala.

---

## 🛠️ Tech Stack

- **Framework Utama**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Desain & Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Ikonografi**: [Lucide React](https://lucide.dev/)
- **Notifikasi**: [SweetAlert2](https://sweetalert2.github.io/) (Tema oranye khas SOTOYS `#ea580c`)
- **Grafik Analitis**: [Recharts](https://recharts.org/)

---

## 💻 Cara Menjalankan Project Secara Lokal

### Prasyarat
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) di perangkat Anda.

### Langkah-langkah
1. **Masuk ke folder frontend**:
   ```bash
   cd frontend
   ```

2. **Instal dependensi**:
   ```bash
   npm install
   ```

3. **Salin atau buat file Environment Variables**:
   Salin berkas `.env.example` menjadi `.env.local` dan atur kunci API jika dibutuhkan:
   ```bash
   cp .env.example .env.local
   ```

4. **Jalankan server pengembangan**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan secara lokal di [http://localhost:5173](http://localhost:5173).

5. **Pemeriksaan Tipe Kode (Type Check)**:
   Untuk memvalidasi integritas TypeScript di seluruh proyek sebelum proses build:
   ```bash
   npx tsc --noEmit
   ```
