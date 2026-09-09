# SALUT Arek Malang — Implementation Status

Updated: 2026-09-09

## CMS Pages Completed

The current Supabase CMS content includes the following 11 core frontend pages, all published:

1. `/` / `/beranda` — Beranda
2. `/kuliah-di-ut` — Kuliah di Universitas Terbuka
3. `/salut-arek-malang` — SALUT Arek Malang
4. `/panduan` — Panduan
5. `/cari-jurusan` — Cari Jurusan
6. `/sistem-kuliah` — Sistem Kuliah
7. `/program-studi` — Program Studi
8. `/biaya` — Biaya Kuliah
9. `/konsultasi` — Konsultasi
10. `/ruang-calon-mahasiswa` — Ruang Calon Mahasiswa
11. `/daftar` — Pendaftaran

## Frontend ↔ CMS Synchronization

The frontend CMS route reads published pages, published sections, section items, and active navigation data directly from Supabase through the server-side CMS functions. Navigation is synchronized through `nav_items` and the page visibility metadata is aligned with the 11 core pages.

The active navigation order is:

**Beranda → Kuliah di UT → SALUT Arek Malang → Panduan → Cari Jurusan → Sistem Kuliah → Program Studi → Biaya Kuliah → Konsultasi → Ruang Calon Mahasiswa → Daftar**

Legacy `Informasi` and `Kontak` navigation entries are inactive so they do not compete with the new acquisition-oriented information architecture.

## Content Strategy

The primary acquisition journey is designed around:

**Explore → Cari Jurusan → Konsultasi → Pendaftaran**

The CMS uses reusable section types rather than hard-coded page-specific layouts where possible.

## Backend & API Integration

The existing CMS server functions provide the public read path from Supabase and the registration write path into the `registrations` table. Published-state filtering is enforced in the server-side queries so unpublished CMS content is not rendered by the public route.

Program-study lists, current tuition figures, WhatsApp destinations, and quiz scoring data are intentionally not fabricated. They should be connected only after authoritative/current source data is available.

AI/API integrations should likewise be connected to an authoritative provider and explicit product requirement rather than introducing an unverified or placeholder AI service.

## Production

The application is deployed from the `main` branch to the Vercel production project. CMS navigation/content changes are database-driven and therefore do not require a code redeploy to become available to the frontend. Code/documentation changes on `main` continue through the Vercel deployment pipeline.
