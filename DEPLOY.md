# Sinkronisasi Lovable ↔ GitHub ↔ Supabase (Lovable Cloud) ↔ Vercel

Alur akhir:

```text
Lovable (edit)  ->  GitHub (repo)  ->  Vercel (build + custom domain)
                             \
                              -> Supabase / Lovable Cloud (database, auth, storage)
```

Satu database yang sama dipakai oleh pratinjau Lovable maupun situs di
`salutearekmalang.com`, jadi konten yang diubah dari panel admin langsung tampil
di kedua tempat.

## 1. Variabel lingkungan di Vercel

Project Settings -> Environment Variables, isi untuk Production, Preview, dan
Development:

| Nama                            | Nilai                                            |
| ------------------------------- | ------------------------------------------------ |
| `VITE_SUPABASE_URL`             | `https://djgdagvufphuuojougla.supabase.co`       |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_5o3YSzWXFj8VZ749MJVDrQ_TfLbW-Va` |
| `VITE_SUPABASE_PROJECT_ID`      | `djgdagvufphuuojougla`                           |
| `SUPABASE_URL`                  | sama dengan `VITE_SUPABASE_URL`                  |
| `SUPABASE_PUBLISHABLE_KEY`      | sama dengan `VITE_SUPABASE_PUBLISHABLE_KEY`      |

Kunci publishable memang aman dipakai di sisi browser. Kunci service role tidak
dibutuhkan: semua akses tulis lewat sesi login admin dan aturan RLS.

## 2. Build di Vercel

- Framework Preset: **Other**
- Build Command: `npm run build`
- Install Command: `npm install`
- Output: otomatis (`.vercel/output`, dihasilkan preset `vercel`)

`vite.config.ts` otomatis memakai target Vercel saat variabel `VERCEL` ada.

## 3. Auth (login admin)

Tambahkan URL berikut pada daftar Redirect URL project auth:

- `https://salutearekmalang.com/**`
- `https://www.salutearekmalang.com/**`

Untuk login Google, tambahkan juga kedua domain di Authorized redirect URIs pada
Google Cloud Console. Tanpa itu, login Google hanya bekerja di domain Lovable
sementara login email + kata sandi tetap jalan di semua domain.

## 4. Alur kerja harian

1. Ubah di Lovable -> otomatis ter-push ke GitHub.
2. Vercel membangun ulang dan menerbitkan ke `salutearekmalang.com`.
3. Perubahan konten (halaman, menu, media, pendaftar) tidak perlu deploy —
   tersimpan di database dan langsung tampil.
