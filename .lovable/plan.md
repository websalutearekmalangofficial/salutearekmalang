# Panduan Deploy + Hubungkan Custom Domain (Rumahweb) tanpa Mengganggu Email

## Konteks & prinsip utama

Domain Anda sudah dipakai untuk email bisnis di cPanel/Rumahweb (punya record MX, SPF, DKIM, DMARC). Lovable hanya butuh **record A** untuk mengarahkan website + **satu record TXT verifikasi** di subdomain `_lovable`. Karena email memakai MX sedangkan website memakai A, keduanya **tidak saling mengganggu** asalkan Anda:

- ✅ Tambah/ubah: hanya record **A** untuk `@` dan `www`, plus record **TXT** untuk `_lovable`
- ❌ JANGAN sentuh: record **MX**, **TXT SPF** (`@`), **TXT DKIM** (biasanya `default._domainkey`), dan **TXT DMARC** (`_dmarc`)

> Catatan: jika root `@` saat ini punya record A yang menunjuk ke hosting cPanel Rumahweb (situs lama), mengubahnya ke Lovable berarti situs lama di root akan digantikan oleh aplikasi Lovable ini. Email tetap aman karena tidak bergantung pada record A root.

Default yang dipakai: **root + www** keduanya mengarah ke Lovable (paling umum & SEO-friendly), tanpa Cloudflare proxy (DNS murni di Rumahweb → pakai A record standar).

---

## Langkah 1 — Publish aplikasi ke URL Lovable

Sebelum custom domain bisa live, proyek harus sudah ter-publish.

1. Bila belum, publish dari editor Lovable (tombol Publish, kanan atas) atau minta saya mempublishnya.
2. Aplikasi akan live di URL `https://<slug>.lovable.app`. Custom domain baru bisa dikenali setelah ini.

> Saya (agent) bisa memanggil publish untuk Anda bila Anda menyetujui rencana ini — sebut saja. Di mode plan ini saya tidak menjalankan deploy.

---

## Langkah 2 — Tambahkan domain di Lovable (dapat nilai record DNS)

1. Buka **Project Settings → Project section → Domains** (atau **Publish dialog → Add custom domain**).
2. Klik **Connect Domain**, masukkan **root domain** Anda, mis. `namadomain.com`.
3. Lovable akan menampilkan record yang harus ditambahkan:
   - **A record** — Name `@`, Value `185.158.133.1`
   - **TXT record** — Name `_lovable`, Value `lovable_verify=<kode unik>`
4. Ulangi langkah 2–3 untuk subdomain `www` (masukkan `www.namadomain.com` secara terpisah — Lovable tidak otomatis menambahkan www).

> Gunakan nilai persis yang ditampilkan Lovable (terutama kode `lovable_verify=`). Nilai di atas adalah acuan umum; UI adalah sumber kebenaran.

---

## Langkah 3 — Setting DNS di Rumahweb (cPanel / clientzone)

Login ke **clientzone.rumahweb.com** atau **cPanel** domain Anda, lalu buka **Zone Editor** (cPanel) / **DNS Management** (clientzone).

### 3a. Tambah/edit record A untuk root (@)

| Type | Name/Host | Value/Points to | TTL |
|------|----------|-----------------|-----|
| A    | `@` (atau `namadomain.com.`) | `185.158.133.1` | default / 3600 |

- Bila sudah ada record A `@` lama (menunjuk IP cPanel Rumahweb), **edit** nilainya ke `185.158.133.1` (jangan dibuat dua-duanya — hapus yang lama).
- Bila belum ada, **tambah baru**.

### 3b. Tambah record A untuk www

| Type | Name/Host | Value/Points to | TTL |
|------|----------|-----------------|-----|
| A    | `www` | `185.158.133.1` | default / 3600 |

- Bila sudah ada `www` sebagai CNAME ke `namadomain.com` (umum di cPanel), **hapus CNAME itu lalu buat A record** di atas. Campuran A + CNAME untuk nama yang sama menyebabkan konflik.

### 3c. Tambah record TXT verifikasi Lovable

| Type | Name/Host | Value | TTL |
|------|----------|-------|-----|
| TXT  | `_lovable` | `lovable_verify=<kode dari Lovable>` | default / 3600 |

- Subdomain `_lovable` terpisah dari `@`, jadi **tidak mengganggu** SPF (`@`) maupun DMARC (`_dmarc`).

### 3d. Periksa — jangan ubah record email

Pastikan record berikut **tetap utuh persis seperti awal** (jangan edit/hapus):

- **MX** — `@` (dan subdomain mail), mengarah ke mail server Rumahweb
- **TXT** `@` — record SPF (diawali `v=spf1 ...`)
- **TXT** `default._domainkey.*` atau `*._domainkey` — DKIM
- **TXT** `_dmarc` — record DMARC (`v=DMARC1; ...`)

Jika ragu, screenshot dulu seluruh Zone Editor sebelum mengubah apa pun.

---

## Langkah 4 — Pilih domain Primary

Di **Project Settings → Domains**, setelah kedua domain (`namadomain.com` + `www.namadomain.com`) terverifikasi, tandai salah satu sebagai **Primary**. Yang lain otomatis redirect ke primary. Umumnya jadikan `www.namadomain.com` atau `namadomain.com` sebagai primary sesuai preferensi SEO Anda.

---

## Langkah 5 — Tunggu propagasi & SSL

- Propagasi DNS biasa 5 menit – 72 jam (umumnya cepat di Rumahweb).
- Lovable otomatis memprovisi SSL/HTTPS (Let's Encrypt) begitu DNS terverifikasi.
- Cek status di **Project Settings → Domains**: dari *Verifying* → *Setting up* → *Active*.
- Bila setelah 72 jam masih *Failed*, periksa kembali: tidak ada record A ganda, tidak ada CNAME bentrok di `www`, CAA memperbolehkan Let's Encrypt.

---

## Langkah 6 — Verifikasi email tetap normal

Setelah DNS terpropagasi, lakukan tes sederhana:

1. Kirim email dari luar (Gmail) ke alamat bisnis Anda → pastikan masuk.
2. Kirim balik dari alamat bisnis → pastikan terkirim (tidak masuk spam).
3. Bila ada masalah, cek record SPF/DKIM/DMARC masih utuh (langkah 3d).

Karena Anda hanya menyentuh record A + `_lovable` TXT, seharusnya email tidak terpengaruh sama sekali.

---

## Catatan teknis

- **Cloudflare/proxy**: bila nantinya Anda mengaktifkan proxy Cloudflare untuk domain, setup beralih ke CNAME-based verifikasi. Untuk sekarang (DNS di Rumahweb, tanpa proxy) pakai A record standar seperti di atas.
- **Email tetap di Rumahweb**: Lovable tidak mengelola email. MX/SPF/DKIM/DMARC tetap di Rumahweb. Lovable hanya melayani website.
- **URL stabil untuk cron/external**: `project--{project-id}.lovable.app` tetap tersedia terlepas dari custom domain.

## Ringkasan yang akan saya kerjakan setelah disetujui

1. Mempublish aplikasi ke URL Lovable (jika belum).
2. Menampilkan kartu Connect Domain di chat untuk root + www (memberi nilai record DNS persis & alur konfirmasi).
3. Memberikan checklist verifikasi email pasca-setup.

Anda tinggal mempraktikkan langkah DNS di cPanel Rumahweb sesuai nilai yang muncul.
