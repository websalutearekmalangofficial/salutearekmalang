# Sentra UT Landing

Act as an expert frontend developer. Buatkan saya halaman Landing Page yang modern dan responsif untuk "Sentra Layanan UT", dengan mereplika secara *persis* desain, warna, teks (Indonesian verbatim), dan layout yang ada pada gambar `image_0.png` yang saya unggah. Halaman ini harus dibuat menggunakan React, Tailwind CSS, dan Lucide Icons.

Gunakan skema warna berikut secara konsisten sesuai gambar:

- Primary Color: Biru Tua / Navy (seperti #003B73 dan gradasi biru pada header/hero)

- Accent Color: Kuning Cerah (seperti #FFD700)

- Background: Putih bersih dan aksen biru muda melengkung.

Halaman harus responsif dan memiliki struktur berurutan dari atas ke bawah seperti ini:

1. HEADER (Navbar)

- Layout: Flexbox space-between dengan padding yang lega, sesuai gambar `image_0.png`. Background biru dengan gradasi.

- Kiri: Teks/Logo "UNIVERSITAS TERBUKA | Sentra Layanan UT" warna putih.

- Tengah (Navigasi): Tombol "Beranda" (badge kuning, teks biru tua, icon Home), dan link "Informasi", "Panduan", "Kontak" (teks putih).

- Kanan: Tombol "Masuk / Daftar" (outline putih, rounded-full, icon User).

2. HERO SECTION & FORM PENDAFTARAN

- Layout: Grid 2 kolom, persis seperti gambar `image_0.png`. Background section menggunakan gambar gedung kampus dengan overlay warna biru gradasi agar teks terbaca.

- Kolom Kiri (Banner): Teks Heading berukuran besar, multi-line, dan sangat tebal "SENTRA LAYANAN UNIVERSITAS TERBUKA ADA DI MPP MERDEKA MALANG LHO YUK KEPOIN !!!" (Warna teks putih). Sertakan deretan logo kecil di atas teks dan tombol navigasi slider (panah kiri/kanan, dots indicator) di bagian bawah.

- Kolom Kanan (Card Form): Buat Card putih solid, shadow-lg, rounded-xl.

  - Header Card: Background biru tua, icon User-Plus, teks "Pendaftaran Sentra Layanan UT" warna putih.

  - Subtitle: "Silakan isi data diri Anda..." (text-gray-500).

  - Form Input (Full width, gunakan icon Lucide di sebelah kiri tiap input): Nama Lengkap, Nama Sekolah, Asal Kota Sekolah, Alamat Email, Nomor HP, Jalur Pendaftaran (Dropdown/Select).

  - Footer Form (2 tombol sejajar): Kiri "Daftar" (Background Kuning, icon Send). Kanan "Clear Data" (Background Putih, border abu-abu, icon Refresh).

3. ALUR PENDAFTARAN (Registration Process)

- Background: Putih.

- Heading: "Alur Pendaftaran Sentra Layanan UT" (Teks biru tua, berikan garis bawah aksen kuning), persis seperti gambar `image_0.png`.

- Layout: Grid 6 kolom horizontal. Letakkan icon panah (chevron-right) di antara setiap langkah.

- Styling tiap langkah: Angka (1-6) di dalam lingkaran kuning (badge), Icon ilustrasi besar di tengah, Judul Bold biru tua, Deskripsi pendek abu-abu.

- **Copy Teks Langkah 1-6 Secara Verbatim:**

  1. Isi Formulir di Website (Icon Form/Edit, teks sesuai gambar)

  2. Pilih Jalur Pendaftaran (Icon Checkbox/Toggle, sertakan badge SIPAS/Non SIPAS, teks sesuai gambar)

  3. Pilih Jurusan (Icon Graduation Cap, teks sesuai gambar)

  4. Unggah Dokumen (Icon Cloud Upload, list dokumen sesuai gambar)

  5. Verifikasi oleh Admin (Icon Monitor/Desktop, teks sesuai gambar)

  6. Dapat Nomor Akun Pendaftaran (Icon ID Card/User Info, teks sesuai gambar)

4. **[NEW SECTION] KELEBIHAN (Why Join Us)**

- Tambahkan section ini segera setelah "Alur Pendaftaran".

- Background: Biru sangat muda (light blue) agar kontras dari section atasnya.

- Heading: "Kenapa Memilih Salute Arek Malang?" (Posisi Center, biru tua, tebal).

- Layout: Grid 4 kolom.

- Styling Card: Background putih, shadow-md, rounded-xl, text-center, padding yang lega. Efek hover (card terangkat/hover:-translate-y-1). Icon besar dibungkus lingkaran kuning. Teks judul bold biru tua, deskripsi abu-abu.

- **Isi 4 Card (gunakan konten realistis):** Layanan Pendaftaran Gratis, Pendampingan Akademik, Informasi Cepat & Akurat, Waktu & Tempat Fleksibel.

5. **[NEW SECTION] TESTIMONI MAHASISWA & ALUMNI**

- Tambahkan section ini setelah "Kelebihan".

- Background: Putih.

- Heading: "Apa Kata Mereka?" (Posisi Center, biru tua).

- Layout: Grid 3 kolom.

- Styling Card: Kotak dengan border tipis abu-abu, rounded-2xl, background putih. Letakkan Icon Quote (tanda kutip) warna kuning di pojok kiri atas. Teks ulasan menggunakan font italic (text-gray-700). 

- Profil (di bawah ulasan): Layout flex-row, justify-start, padding yang cukup. Foto profil bulat (placeholder), Nama Lengkap (Bold, biru tua), dan Badge status. Gunakan badge warna kuning untuk "Alumni" dan badge biru muda untuk "Mahasiswa Aktif". Berikan dummy content yang realistis.

6. FOOTER BANNER (Contact Info)

- Layout: Baris panjang membentang di paling bawah. Background biru.

- Kiri/Tengah: Icon WhatsApp warna hijau, teks "Informasi Pendaftaran", nomor telepon "0812-3002-4264" di dalam kotak border biru muda (bentuk pill shape).

- Kanan: Teks "Kuliah Fleksibel Raih Masa Depan" (font italic elegan).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sentra-layanan-ut.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1eada5f9-fcc3-4cf2-a0b7-1edefdb97496).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
