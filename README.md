# CATERING MANAGEMENT & RECIPE FOOD COST SYSTEM
Proyek Vokasi SMK - Manajemen Katering, Standarisasi SOP Resep, dan Pengendalian Food Cost

Aplikasi web profesional siap pakai dan siap deploy ke **Netlify** atau **Vercel** yang dirancang untuk pengujian proyek kejuruan / evaluasi guru.

---

## 1. Kredensial Pengujian Demo (Untuk Guru & Penguji)

* **Username:** `admin` (atau `admin@vokasi.sch.id`)
* **Password:** `Admin123!`

Aplikasi telah dilengkapi sesi aktif otomatis serta tombol *Quick Demo Login* di halaman autentikasi untuk kemudahan presentasi.

---

## 2. Fitur Utama yang Telah Diimplementasikan

### Modul A: Catering Management
* **Dashboard Katering:** Kartu statistik real-time (Total Pesanan, Hari Ini, Sedang Diproses, Selesai, Pendapatan, Sisa Tagihan) & Jadwal terdekat.
* **Data Pelanggan:** CRUD lengkap pelanggan (SMAK Mater Dei, Budi Santoso, Maria), pencarian instan, dan riwayat pesanan.
* **Pesanan Katering:** Input pesanan multi-menu, kalkulasi otomatis Subtotal, Diskon, Biaya Kirim, Total Tagihan, DP, dan Sisa Saldo. Dilengkapi cetak invoice nota.
* **Rekap Produksi Dapur:** Akumulasi porsi masakan terpusat berdasarkan tanggal (misal total Nasi Box Ayam = 150 porsi, Snack Box = 100 box).
* **Bahan Baku & Stok:** Peringatan stok menipis (*low stock indicator*), harga beli, dan konversi ke biaya dasar per gram/ml.
* **Pengiriman & Surat Jalan:** Pengaturan kurir katering, waktu keberangkatan, alamat tujuan, dan cetak lembar surat jalan.
* **Pembayaran:** Multi-transaksi pembayaran (DP, Pelunasan, Cicilan) via Cash, Transfer Bank, atau QRIS dengan pelacakan sisa piutang.

### Modul B: Recipe & Food Cost Management
* **Dashboard Recipe:** Metrik HPP rata-rata, persentase Food Cost keseluruhan, Margin keuntungan, dan alarm menu dengan food cost di atas 40%.
* **Bank Resep:** SOP resep standar, hasil porsi (yield), foto hidangan, dan rincian kontribusi biaya setiap bahan ke HPP porsi.
* **Sub-Recipe:** Modul bumbu dasar (contoh: Sambal Bawang Spesial) yang dihitung otomatis dan dapat disematkan ke resep utama tanpa duplikasi.
* **Menu Jual:** Sinkronisasi resep masakan ke menu komersial dengan perhitungan target Food Cost (%) dan Gross Margin (%).
* **Master Kategori & Satuan:** Standardisasi konversi 1 Kg = 1.000 gram, 1 Liter = 1.000 ml.
* **Riwayat Perubahan Harga:** Log kenaikan/penurunan harga beli bahan baku.
* **Versi Resep:** Audit perbandingan formulasi (v1.0 vs v2.0).

### Modul C: Laporan & Integrasi
* **Pusat Laporan:** 8 jenis laporan terintegrasi dengan filter dan fitur **Export CSV / Excel** serta cetak printer.
* **Notifikasi Email Google Apps Script:** Pengiriman webhook email konfirmasi pesanan dan pengingat pembayaran ke Gmail via Web App GAS (`gas/Code.gs`).
* **Pengaturan & DB:** Status koneksi Supabase dan panduan instalasi.

---

## 3. Langkah Menjalankan Aplikasi & Setup Database

### A. Setup Supabase Database (PostgreSQL)
1. Buat akun dan proyek gratis di [Supabase](https://supabase.com).
2. Buka **SQL Editor** pada project Supabase Anda.
3. Buka file `supabase/schema.sql` di repository ini, salin seluruh kodenya, dan tekan **Run**.
4. Buka file `supabase/seed.sql`, salin kodenya, dan tekan **Run** untuk memasukkan data sampel vokasi awal.
5. Buka **Project Settings → API** di Supabase, salin **Project URL** dan **anon public key**.
6. Masukkan ke file `.env`:
   ```bash
   VITE_SUPABASE_URL="https://xxxxxxxx.supabase.co"
   VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
   ```

### B. Setup Notifikasi Google Apps Script (Gmail)
1. Buka [Google Apps Script](https://script.google.com).
2. Salin kode dari file `gas/Code.gs` ke editor Google Apps Script.
3. Klik **Deploy → New Deployment**.
4. Pilih **Web App**, atur *Execute as: Me*, dan *Who has access: Anyone*.
5. Salin URL Web App yang dihasilkan ke menu Pengaturan Sistem atau variabel `VITE_GAS_WEBHOOK_URL`.

---

## 4. Panduan Deploy ke Netlify atau Vercel

### Deploy ke Vercel:
1. Hubungkan repository GitHub ke Vercel.
2. Atur **Framework Preset:** Vite.
3. Atur **Build Command:** `npm run build` dan **Output Directory:** `dist`.
4. Masukkan Environment Variables:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
5. Klik **Deploy**.

### Deploy ke Netlify:
1. Hubungkan repository ke Netlify (*New site from Git*).
2. Atur **Build command:** `npm run build`.
3. Atur **Publish directory:** `dist`.
4. Tambahkan environment variables pada menu *Site configuration → Environment variables*.
5. Klik **Deploy site**.
