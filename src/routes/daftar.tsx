import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { 
  ArrowRight, Phone, Building2, Camera, IdCard, 
  Users, FileText, ClipboardList, Activity, 
  CheckCircle2, XCircle, Trash2, Upload, Calendar, Mail, CheckSquare, Globe, Share2
} from "lucide-react";

export const Route = createFileRoute("/daftar")({
  head: () => ({
    meta: [{ title: "Pendaftaran - Sentra Layanan UT Arek Malang" }],
  }),
  component: RegistrationPage,
});

function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State data teks Step 1 yang diperbarui & diperlengkap
  const [formData, setFormData] = useState({
    // 1. Data Diri Calon Mahasiswa
    namaLengkap: "",
    tempatLahir: "",
    tanggalLahir: "",
    agama: "",
    jenisKelamin: "",
    kewarganegaraan: "WNI",
    namaIbuKandung: "",

    // 2. Informasi Kontak
    alamatLengkap: "",
    telpRumah: "",
    nomorHp: "",
    nomorHp2: "",
    email: "",
    sosialMedia: {
      instagram: "",
      tiktok: "",
      facebook: "",
      x: "",
    },

    // Step 2: Jalur & Jurusan
    jalurPendaftaran: "Reguler",
    jurusan: "S1 Manajemen",
  });

  // State data dokumen
  const [documents, setDocuments] = useState<Record<string, File | null>>({
    pasFoto: null,
    ktp: null,
    kk: null,
    ijazah: null,
    transkrip: null,
    suratSehat: null,
  });

  // State persetujuan Step 4
  const [agreements, setAgreements] = useState({
    dataBenar: false,
    setujuKetentuan: false,
  });

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jumpToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    if (!agreements.dataBenar || !agreements.setujuKetentuan) {
      alert("Harap centang semua pernyataan persetujuan sebelum mengirim.");
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1500);
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setDocuments(prev => ({ ...prev, [id]: file }));
  };

  const handleRemoveFile = (id: string) => {
    setDocuments(prev => ({ ...prev, [id]: null }));
  };

  const steps = [
    { id: 1, label: "1. Data Diri" },
    { id: 2, label: "2. Jalur & Jurusan" },
    { id: 3, label: "3. Unggah Dokumen" },
    { id: 4, label: "4. Tinjau & Kirim" },
  ];

  const requiredDocs = [
    { id: "pasFoto", label: "1. Pas Foto (Background Merah/Biru)*", icon: Camera },
    { id: "ktp", label: "2. Kartu Tanda Penduduk (KTP)*", icon: IdCard },
    { id: "kk", label: "3. Kartu Keluarga (KK)*", icon: Users },
    { id: "ijazah", label: "4. Ijazah Terakhir (Asli)*", icon: FileText },
    { id: "transkrip", label: "5. Transkrip Nilai (Asli)*", icon: ClipboardList },
    { id: "suratSehat", label: "6. Surat Keterangan Sehat*", icon: Activity },
  ];

  // Komponen Halaman Sukses
  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] font-sans pb-12">
        <header className="bg-white shadow-sm px-6 py-4 mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-800 font-bold hover:text-blue-700 transition">
            <Building2 className="w-6 h-6" />
            <span>SALUT UT Arek Malang</span>
          </Link>
        </header>

        <div className="max-w-4xl mx-auto px-4 md:px-6 animate-in zoom-in-95 duration-500">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-3xl font-extrabold text-yellow-500 mb-2">Pendaftaran Berhasil Dikirim!</h1>
            <p className="text-slate-700 font-medium mb-8">Terima kasih atas pendaftaran Anda. Informasi pendaftaran Anda telah kami terima dan akan segera diproses.</p>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl mb-8">
              <p className="text-lg text-slate-800 font-bold mb-2">Nomor Referensi Pendaftaran: <span className="text-black">SALUT-2024-{Math.floor(10000000 + Math.random() * 90000000)}</span></p>
              <p className="text-slate-800 font-bold">Status Pendaftaran: <span className="bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full text-sm ml-2">Menunggu Verifikasi</span></p>
            </div>

            <h3 className="font-extrabold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600"/> Langkah Selanjutnya
            </h3>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-4 items-start">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0"><ClipboardList className="w-5 h-5"/></div>
                <p className="text-slate-700 font-medium pt-1">1. Tim Admin kami akan memverifikasi dokumen Anda dalam waktu 3-5 hari kerja.</p>
              </li>
              <li className="flex gap-4 items-start">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0"><Mail className="w-5 h-5"/></div>
                <p className="text-slate-700 font-medium pt-1">2. Nomor Induk Mahasiswa (NIM) sementara dan panduan pembayaran akan dikirimkan ke email pendaftar: <strong>'{formData.email || "email Anda"}'</strong>.</p>
              </li>
              <li className="flex gap-4 items-start">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0"><CheckSquare className="w-5 h-5"/></div>
                <p className="text-slate-700 font-medium pt-1">3. Mohon cek email Anda secara berkala, termasuk folder spam.</p>
              </li>
            </ul>

            <h4 className="font-bold text-slate-900 mb-5">Periksa email Anda secara berkala.</h4>

            <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-8">
              <button className="bg-[#fde047] hover:bg-yellow-400 text-slate-900 font-bold py-3 px-6 rounded-full shadow-sm transition flex items-center gap-2">
                Cetak Bukti Pendaftaran (PDF) <CheckCircle2 className="w-4 h-4"/>
              </button>
              <button className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-3 px-6 rounded-full transition">
                Lihat Status Pendaftaran
              </button>
              <Link to="/" className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-3 px-6 rounded-full transition ml-auto">
                Kembali ke Beranda
              </Link>
            </div>
            
            <p className="text-center text-slate-500 font-semibold mt-10">Selamat bergabung di Universitas Terbuka!</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-sans pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 mb-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-slate-800 font-bold hover:text-blue-700 transition">
          <Building2 className="w-6 h-6" />
          <span>SALUT UT Arek Malang</span>
        </Link>
        <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-slate-800 px-4 py-2 border rounded-full">
          Batal
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Halaman Pendaftaran</h1>

        {/* Stepper Navigation */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-1 bg-[#fde047] p-1 rounded-lg mb-6 overflow-hidden shadow-sm">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isPast = currentStep > step.id;
            return (
              <div
                key={step.id}
                className={`flex-1 min-w-[120px] text-center py-2.5 px-4 text-sm font-bold transition-all duration-300 ${
                  isActive ? "bg-[#1e293b] text-white rounded-md shadow-md" : isPast ? "text-[#1e293b] opacity-70" : "text-[#1e293b] opacity-50"
                }`}
              >
                {step.label}
              </div>
            );
          })}
        </div>

        {/* Card Utama */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative min-h-[550px] flex flex-col">
          
          <div className="absolute top-0 right-0 w-full md:w-2/3 h-full z-0 opacity-20 md:opacity-100 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1470&auto=format&fit=crop"
              alt="Background Mahasiswa"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col lg:flex-row w-full flex-grow relative z-10">
            
            {/* Sidebar Profil Pendaftar */}
            {currentStep >= 3 && (
              <aside className="w-full lg:w-[30%] bg-slate-50/95 border-r border-slate-200 p-6 lg:p-8 shrink-0 animate-in slide-in-from-left-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sticky top-6">
                  <h3 className="font-extrabold text-slate-800 border-b border-slate-200 pb-3 mb-4 text-lg">
                    Profil Pendaftar Saat Ini
                  </h3>
                  <div className="space-y-3 text-sm text-slate-700">
                    <p><span className="block text-slate-500 text-xs font-semibold mb-0.5">Nama</span> <span className="font-bold">{formData.namaLengkap || "-"}</span></p>
                    <p><span className="block text-slate-500 text-xs font-semibold mb-0.5">Email</span> <span className="font-bold break-all">{formData.email || "-"}</span></p>
                    <p><span className="block text-slate-500 text-xs font-semibold mb-0.5">Nomor HP/WhatsApp</span> <span className="font-bold">{formData.nomorHp || "-"}</span></p>
                    <div className="pt-3 border-t border-slate-100 mt-2">
                      <p><span className="block text-slate-500 text-xs font-semibold mb-0.5">Jalur Pendaftaran</span> <span className="font-bold text-blue-700">{formData.jalurPendaftaran || "-"}</span></p>
                      <p><span className="block text-slate-500 text-xs font-semibold mb-0.5">Jurusan Pendaftaran</span> <span className="font-bold text-blue-700">{formData.jurusan || "-"}</span></p>
                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* Form Konten Utama */}
            <div className={`p-6 md:p-8 lg:p-10 ${currentStep >= 3 ? 'w-full lg:w-[70%]' : 'w-full md:w-3/5'}`}>
              
              {/* STEP 1: DATA DIRI (DIPERLENGKAP) */}
              {currentStep === 1 && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                  <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-2">Langkah 1: Data Diri Calon Mahasiswa</h2>
                  <p className="text-sm text-slate-600 mb-8 font-medium">Lengkapi seluruh informasi di bawah ini secara akurat sesuai dokumen resmi.</p>
                  
                  <div className="space-y-6">
                    {/* Bagian A: Data Diri */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                      <h3 className="font-extrabold text-slate-800 text-base border-b pb-2">1. Data Diri Calon Mahasiswa</h3>
                      
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-1">Nama Lengkap (Sesuai Ijazah) <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="Nama Lengkap" value={formData.namaLengkap} onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-900 mb-1">Tempat Lahir <span className="text-red-500">*</span></label>
                          <input type="text" placeholder="Kota Kelahiran" value={formData.tempatLahir} onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-900 mb-1">Tanggal Lahir <span className="text-red-500">*</span></label>
                          <input type="date" value={formData.tanggalLahir} onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-900 mb-1">Agama <span className="text-red-500">*</span></label>
                          <select value={formData.agama} onChange={(e) => setFormData({ ...formData, agama: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
                            <option value="">-- Pilih --</option>
                            <option value="Islam">Islam</option>
                            <option value="Kristen">Kristen</option>
                            <option value="Katolik">Katolik</option>
                            <option value="Hindu">Hindu</option>
                            <option value="Buddha">Buddha</option>
                            <option value="Konghucu">Konghucu</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-900 mb-1">Jenis Kelamin <span className="text-red-500">*</span></label>
                          <select value={formData.jenisKelamin} onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
                            <option value="">-- Pilih --</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-900 mb-1">Kewarganegaraan <span className="text-red-500">*</span></label>
                          <input type="text" value={formData.kewarganegaraan} onChange={(e) => setFormData({ ...formData, kewarganegaraan: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-1">Nama Ibu Kandung <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="Nama Lengkap Ibu Kandung" value={formData.namaIbuKandung} onChange={(e) => setFormData({ ...formData, namaIbuKandung: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
                      </div>
                    </div>

                    {/* Bagian B: Informasi Kontak */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                      <h3 className="font-extrabold text-slate-800 text-base border-b pb-2">2. Informasi Kontak & Sosial Media</h3>
                      
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-1">Alamat Lengkap (Domisili saat ini) <span className="text-red-500">*</span></label>
                        <textarea rows={2} placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos" value={formData.alamatLengkap} onChange={(e) => setFormData({ ...formData, alamatLengkap: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-900 mb-1">Nomor Telepon Rumah</label>
                          <input type="tel" placeholder="(Opsional)" value={formData.telpRumah} onChange={(e) => setFormData({ ...formData, telpRumah: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-900 mb-1">Alamat Email Aktif <span className="text-red-500">*</span></label>
                          <input type="email" placeholder="nama@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-900 mb-1">Nomor Handphone 1 (WhatsApp) <span className="text-red-500">*</span></label>
                          <input type="tel" placeholder="08xx-xxxx-xxxx" value={formData.nomorHp} onChange={(e) => setFormData({ ...formData, nomorHp: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-900 mb-1">Nomor Handphone 2 (Cadangan)</label>
                          <input type="tel" placeholder="(Opsional)" value={formData.nomorHp2} onChange={(e) => setFormData({ ...formData, nomorHp2: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
                        </div>
                      </div>

                      <div className="pt-2">
                        <label className="block text-sm font-bold text-slate-900 mb-2">Akun Media Sosial (Opsional)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input type="text" placeholder="Instagram (contoh: @username)" value={formData.sosialMedia.instagram} onChange={(e) => setFormData({ ...formData, sosialMedia: { ...formData.sosialMedia, instagram: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white" />
                          <input type="text" placeholder="TikTok (contoh: @username)" value={formData.sosialMedia.tiktok} onChange={(e) => setFormData({ ...formData, sosialMedia: { ...formData.sosialMedia, tiktok: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white" />
                          <input type="text" placeholder="Facebook (Nama Akun)" value={formData.sosialMedia.facebook} onChange={(e) => setFormData({ ...formData, sosialMedia: { ...formData.sosialMedia, facebook: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white" />
                          <input type="text" placeholder="X / Twitter (contoh: @username)" value={formData.sosialMedia.x} onChange={(e) => setFormData({ ...formData, sosialMedia: { ...formData.sosialMedia, x: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: JALUR & JURUSAN */}
              {currentStep === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-2">Langkah 2: Jalur & Jurusan</h2>
                  <p className="text-sm text-slate-600 mb-8 font-medium">Pilih jalur pendaftaran dan program studi yang Anda minati.</p>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-1.5">Pilih Jalur Pendaftaran <span className="text-red-500">*</span></label>
                      <select value={formData.jalurPendaftaran} onChange={(e) => setFormData({ ...formData, jalurPendaftaran: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white/90 font-medium text-slate-700">
                        <option value="Reguler">Reguler</option>
                        <option value="RPL">RPL (Rekognisi Pembelajaran Lampau)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-1.5">Pilih Jurusan / Program Studi <span className="text-red-500">*</span></label>
                      <select value={formData.jurusan} onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white/90 font-medium text-slate-700">
                        <option value="S1 Manajemen">S1 Manajemen</option>
                        <option value="S1 Akuntansi">S1 Akuntansi</option>
                        <option value="S1 Ilmu Hukum">S1 Ilmu Hukum</option>
                        <option value="S1 Ilmu Komunikasi">S1 Ilmu Komunikasi</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: UNGGAH DOKUMEN */}
              {currentStep === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-2">Langkah 3: Unggah Dokumen</h2>
                  <p className="text-sm text-slate-600 mb-8 font-medium bg-white/60 p-3 rounded-lg border border-slate-200 inline-block">Silakan unggah dokumen persyaratan yang diperlukan. Format PDF/JPEG maks 2MB.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {requiredDocs.map((doc) => {
                      const Icon = doc.icon;
                      const file = documents[doc.id];
                      const isUploaded = !!file;

                      return (
                        <div key={doc.id} className="flex flex-col">
                          <label className="text-xs font-extrabold text-slate-800 mb-2 truncate" title={doc.label}>{doc.label}</label>
                          <div className={`relative flex flex-col items-center justify-center p-4 h-32 rounded-xl border-2 border-dashed transition-colors bg-white/90 ${isUploaded ? "border-green-400 bg-green-50/50" : "border-slate-300 hover:border-slate-400"}`}>
                            {!isUploaded ? (
                              <>
                                <Icon className="w-8 h-8 text-slate-400 mb-2" />
                                <input type="file" accept=".pdf, .jpg, .jpeg" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(doc.id, e)} />
                                <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-md"><Upload className="w-3.5 h-3.5" /> Pilih File</span>
                              </>
                            ) : (
                              <div className="w-full flex flex-col items-center text-center">
                                <div className="bg-green-100 p-2 rounded-full mb-2"><FileText className="w-6 h-6 text-green-600" /></div>
                                <p className="text-xs font-bold text-slate-700 truncate w-full px-2">{file.name}</p>
                                <button onClick={() => handleRemoveFile(doc.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-1.5 px-1">
                            {isUploaded ? <><CheckCircle2 className="w-4 h-4 text-green-500" /><span className="text-xs font-bold text-green-600">Selesai diunggah</span></> : <><XCircle className="w-4 h-4 text-red-400" /><span className="text-xs font-bold text-red-500">Belum Diunggah</span></>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: TINJAU & KIRIM */}
              {currentStep === 4 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-2">Langkah 4: Tinjau & Kirim Permohonan</h2>
                  <p className="text-sm text-slate-600 mb-8 font-medium">Harap tinjau semua informasi Anda di bawah ini sebelum mengirim.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-100/85 rounded-xl p-5 border border-slate-200 relative">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-extrabold text-slate-800 text-sm">1. Ringkasan Data Diri</h4>
                        <button onClick={() => jumpToStep(1)} className="text-xs font-bold bg-white border border-slate-300 px-3 py-1 rounded-full">Ubah</button>
                      </div>
                      <div className="grid grid-cols-[90px_1fr] gap-x-2 gap-y-1 text-sm">
                        <span className="text-slate-500 font-semibold">Nama:</span> <span className="font-bold text-slate-800">{formData.namaLengkap || "-"}</span>
                        <span className="text-slate-500 font-semibold">TTL:</span> <span className="font-bold text-slate-800">{formData.tempatLahir}, {formData.tanggalLahir || "-"}</span>
                        <span className="text-slate-500 font-semibold">Ibu Kandung:</span> <span className="font-bold text-slate-800">{formData.namaIbuKandung || "-"}</span>
                        <span className="text-slate-500 font-semibold">Email:</span> <span className="font-bold text-slate-800 truncate">{formData.email || "-"}</span>
                        <span className="text-slate-500 font-semibold">No HP:</span> <span className="font-bold text-slate-800">{formData.nomorHp || "-"}</span>
                      </div>
                    </div>

                    <div className="bg-slate-100/85 rounded-xl p-5 border border-slate-200 relative">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-extrabold text-slate-800 text-sm">2. Pilihan Program & Jalur</h4>
                        <button onClick={() => jumpToStep(2)} className="text-xs font-bold bg-white border border-slate-300 px-3 py-1 rounded-full">Ubah</button>
                      </div>
                      <div className="grid grid-cols-[70px_1fr] gap-x-2 gap-y-1 text-sm">
                        <span className="text-slate-500 font-semibold">Jalur:</span> <span className="font-bold text-slate-800">{formData.jalurPendaftaran}</span>
                        <span className="text-slate-500 font-semibold">Jurusan:</span> <span className="font-bold text-slate-800">{formData.jurusan}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" checked={agreements.dataBenar} onChange={(e) => setAgreements({...agreements, dataBenar: e.target.checked})} className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-700">Saya menyatakan bahwa semua data dan dokumen yang saya berikan adalah benar dan sah.</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" checked={agreements.setujuKetentuan} onChange={(e) => setAgreements({...agreements, setujuKetentuan: e.target.checked})} className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-700">Saya mengerti dan menyetujui ketentuan pendaftaran Sentra Layanan Universitas Terbuka.</span>
                    </label>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Footer Tombol Navigasi */}
          <div className="relative z-20 border-t border-slate-200 bg-white/95 p-5 md:p-6 flex justify-between items-center mt-auto">
            {currentStep > 1 ? (
              <button onClick={handlePrev} className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-6 rounded-full">
                ← Sebelumnya
              </button>
            ) : <div/>}
            
            {currentStep < 4 ? (
              <button onClick={handleNext} className="flex items-center gap-2 bg-[#fde047] hover:bg-yellow-400 text-slate-900 font-bold py-2.5 px-8 rounded-full shadow-md">
                Selanjutnya <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button disabled={isSubmitting} onClick={handleSubmit} className={`flex items-center gap-2 font-bold py-2.5 px-8 rounded-full shadow-md ${isSubmitting ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#fde047] hover:bg-yellow-400 text-slate-900'}`}>
                {isSubmitting ? "Mengirim..." : "✓ Kirim Permohonan Pendaftaran Sekarang"}
              </button>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
