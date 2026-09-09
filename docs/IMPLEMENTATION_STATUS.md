# SALUT Arek Malang — Implementation Status

Updated: 2026-09-09

## CMS Pages Completed

The current Supabase CMS content includes the following core pages:

- `/kuliah-di-ut` — Kuliah di Universitas Terbuka
- `/cari-jurusan` — Cari Jurusan
- `/sistem-kuliah` — Sistem Kuliah
- `/program-studi` — Program Studi
- `/biaya` — Biaya Kuliah
- `/konsultasi` — Konsultasi
- `/ruang-calon-mahasiswa` — Ruang Calon Mahasiswa
- `/daftar` — Pendaftaran

## Content Strategy

The page journey is designed around:

**Explore → Cari Jurusan → Konsultasi → Pendaftaran**

The CMS uses reusable section types rather than hard-coded page-specific layouts where possible.

## Data Integrity

Program-study lists, current tuition figures, WhatsApp destinations, and quiz scoring data are intentionally not fabricated. They should be connected only after authoritative/current source data is available.

## Production

The application is deployed from the `main` branch to the Vercel production project. The latest production deployment associated with the previous frontend upgrade was reported as READY, with no runtime errors in the selected monitoring window.
