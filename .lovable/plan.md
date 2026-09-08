# Panduan Deploy Website Sentra Layanan UT (Paket Free)

## Konteks

Workspace Anda berada di paket **Free**. Pada paket Free:

- ✅ **Bisa publish & live** — website tersedia publik di URL bawaan `https://<slug>.lovable.app`
- ❌ **Custom domain TIDAK tersedia** — menghubungkan domain sendiri (mis. dari Rumahweb) butuh paket **Pro atau lebih**

Artinya, di paket Free sekarang, website bisa di-deploy dan diakses publik, **tapi tidak bisa pakai domain rumahweb sendiri**. Email bisnis di Rumahweb pun tidak ada yang berubah karena Lovable tidak menyentuh DNS domain Anda sama sekali — domain tetap utuh di Rumahweb.

---

## Opsi A — Tetap di paket Free (yang kamu pilih sekarang)

### Langkah 1 — Publish ke URL Lovable

1. Pastikan aplikasi siap (sudah ada konten — landing page Sentra Layanan UT sudah jadi).
2. Publish dari editor: tombol **Publish** kanan-atas, atau minta saya mempublish-nya.
3. Aplikasi live di `https://<slug>.lovable.app` (publik, siap dibagikan).

> URL slug bisa diganti dari Project Settings bila ingin nama yang lebih deskriptif (mis. `sentra-ut-malang`).

### Langkah 2 — Bagikan URL

- URL `.lovable.app` langsung bisa diakses publik di paket Free — bagikan ke calon pendaftar.
- Email bisnis Rumahweb tetap jalan seperti biasa; tidak ada DNS yang berubah.

### Catatan paket Free

- Tidak ada custom domain → pengunjung mengakses via `*.lovable.app`.
- Badge "Edit in Lovable" tetap muncul (untuk menghilangkan butuh Pro+).
- Tidak bisa hapus badge atau ganti domain tanpa upgrade.

---

## Opsi B — Bila nanti ingin pakai domain rumahweb (butuh upgrade ke Pro)

Jika di kemudian hari Anda ingin benar-benar memakai `namadomain.com` dari Rumahweb, upgrade ke **Pro** dulu, lalu ikut langkah berikut. Ini hanya referensi masa depan — **tidak dikerjakan sekarang**.

### Prinsip keamanan email

Lovable hanya butuh **record A** untuk website + **satu TXT verifikasi** di subdomain `_lovable`. Email memakai MX, jadi keduanya tidak saling mengganggu asalkan:

- ✅ Tambah/ubah: hanya record **A** (`@` & `www`) + **TXT** `_lovable`
- ❌ Jangan sentuh: **MX**, **TXT SPF** (`@`), **DKIM** (`*._domainkey`), **DMARC** (`_dmarc`)

### Langkah DNS (di cPanel / clientzone Rumahweb, setelah upgrade Pro)

1. Publish aplikasi dulu (sudah ada di Opsi A).
2. Di **Project Settings → Domains → Connect Domain**, masukkan root domain → Lovable menampilkan:
   - A record: Name `@` → Value `185.158.133.1`
   - TXT record: Name `_lovable` → Value `lovable_verify=<kode unik>`
3. Ulangi untuk `www.namadomain.com` (ditambah terpisah).
4. Di Zone Editor Rumahweb:
   - Edit/tambah A `@` → `185.158.133.1` (hapus A lama ke IP cPanel bila ada)
   - Hapus CNAME `www` bila ada, ganti dengan A `www` → `185.158.133.1`
   - Tambah TXT `_lovable` → `lovable_verify=<kode>`
   - **Jangan ubah** MX / SPF / DKIM / DMARC
5. Set primary domain (root atau www) di Project Settings.
6. Tunggu propagasi + SSL (otomatis, Let's Encrypt).
7. Tes email bisnis: kirim masuk & keluar → pastikan normal.

> Gunakan nilai record persis yang ditampilkan UI Lovable; `185.158.133.1` di atas adalah acuan umum.

---

## Yang akan saya kerjakan setelah disetujui (Opsi A — Free)

1. Mempublish aplikasi ke URL Lovable (publik).
2. Memberi tahu URL live-nya agar bisa dibagikan.
3. Tidak menyentuh DNS Rumahweb sama sekali — email bisnis aman.

Bila Anda berubah ingin pakai domain sendiri, sebut saja dan saya akan bahas opsi upgrade Pro.
