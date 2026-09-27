-- Sync WhatsApp message templates with the Admin Settings center.
-- Applied after the admin_settings_center migration.

update public.whatsapp_templates
set
  description = case meta_template_name
    when 'pendaftaran_berhasil' then 'Pesan setelah pendaftaran berhasil diterima.'
    when 'greetings_admin' then 'Sapaan awal admin saat menghubungi pendaftar.'
    when 'pendaftaran_gagal_kendala' then 'Pemberitahuan ketika pendaftaran mengalami kendala.'
    when 'pengarahan_selanjutnya' then 'Pesan untuk memberikan arahan proses berikutnya.'
  end,
  body = case meta_template_name
    when 'pendaftaran_berhasil' then E'Halo {{nama}} 👋\n\nTerima kasih sudah melakukan pendaftaran di Salut Malang. Data pendaftaran kamu sudah kami terima dan berhasil tersimpan.\n\nTim Salut Malang akan menghubungi kamu untuk proses selanjutnya. Pastikan nomor WhatsApp ini tetap aktif ya.'
    when 'greetings_admin' then E'Halo {{nama}} 👋\n\nSaya Admin Sentra Layanan UT Salut Malang. Terima kasih sudah melakukan pendaftaran.\n\nSaya akan membantu memberikan pengarahan terkait proses selanjutnya.'
    when 'pendaftaran_gagal_kendala' then E'Halo {{nama}} 👋\n\nPendaftaran kamu belum dapat kami proses karena terdapat kendala pada data atau proses pengiriman. Tim Salut Malang akan membantu melakukan pengecekan. Silakan balas pesan ini agar kami dapat membantu.'
    when 'pengarahan_selanjutnya' then E'Halo {{nama}} 👋\n\nBerikut pengarahan selanjutnya dari Sentra Layanan UT Salut Malang. Silakan ikuti informasi yang kami sampaikan dan hubungi kami jika ada yang ingin ditanyakan.'
  end,
  is_active = true,
  is_auto_reply = (meta_template_name = 'pendaftaran_berhasil'),
  updated_at = now()
where meta_template_name in ('pendaftaran_berhasil','greetings_admin','pendaftaran_gagal_kendala','pengarahan_selanjutnya');

insert into public.whatsapp_templates
  (name, description, body, meta_template_name, meta_language_code, is_active, is_auto_reply)
select * from (values
  ('Data Belum Lengkap','Pemberitahuan ketika data pendaftaran belum lengkap.',E'Halo {{nama}} 👋\n\nKami sudah menerima pendaftaran kamu, tetapi masih ada data yang perlu dilengkapi. Silakan cek kembali data pendaftaran agar proses dapat dilanjutkan.\n\nJika mengalami kendala, silakan hubungi Admin Salut Malang.','data_belum_lengkap','id',true,false),
  ('Pendaftaran Diproses','Informasi bahwa pendaftaran sedang diproses.',E'Halo {{nama}} 👋\n\nPendaftaran kamu sedang kami proses. Tim Salut Malang sedang melakukan pengecekan terhadap data yang telah dikirimkan.\n\nMohon menunggu informasi selanjutnya.','pendaftaran_diproses','id',true,false),
  ('Informasi Pendaftaran','Pesan untuk memberikan informasi umum terkait pendaftaran.',E'Halo {{nama}} 👋\n\nBerikut informasi terkait pendaftaran kamu di Salut Malang. Silakan perhatikan informasi dan tahapan yang disampaikan agar proses pendaftaran dapat berjalan dengan lancar.\n\nJika ada yang ingin ditanyakan, silakan hubungi Admin Salut Malang.','informasi_pendaftaran','id',true,false),
  ('Follow Up Pendaftaran','Pesan tindak lanjut untuk pendaftar yang perlu dihubungi kembali.',E'Halo {{nama}} 👋\n\nKami ingin melakukan follow up terkait pendaftaran kamu di Salut Malang. Apakah kamu sudah siap melanjutkan proses pendaftaran?\n\nJika ada kendala atau membutuhkan bantuan, silakan balas pesan ini.','follow_up_pendaftaran','id',true,false),
  ('Pengingat Pendaftaran','Pengingat agar pendaftar melanjutkan proses.',E'Halo {{nama}} 👋\n\nIni pengingat dari Salut Malang terkait proses pendaftaran kamu. Jika masih ada tahapan yang belum diselesaikan, silakan segera dilanjutkan.\n\nKami siap membantu jika kamu mengalami kendala.','pengingat_pendaftaran','id',true,false)
) as v(name,description,body,meta_template_name,meta_language_code,is_active,is_auto_reply)
where not exists (
  select 1 from public.whatsapp_templates t
  where t.meta_template_name = v.meta_template_name
);

update public.whatsapp_templates
set is_auto_reply = false, updated_at = now()
where meta_template_name <> 'pendaftaran_berhasil';

update public.whatsapp_templates
set is_auto_reply = true, updated_at = now()
where meta_template_name = 'pendaftaran_berhasil';

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'whatsapp_templates'
  ) then
    alter publication supabase_realtime add table public.whatsapp_templates;
  end if;
end $$;
