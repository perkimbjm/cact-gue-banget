
import { Question } from "./types";

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Setelah seminggu penuh dengan rapat, deadline, atau pelayanan publik yang melelahkan, cara terbaikmu mengisi ulang energi adalah?",
    type: "mcq",
    category: "Energy Pattern",
    options: [
      "Kumpul bareng teman/kolega, makan-makan, atau karaokean biar lepas stres.",
      "Istirahat total di rumah, matikan notifikasi grup kantor, nikmati 'Me Time'.",
      "Olahraga atau aktivitas fisik biar badan gerak dan pikiran fresh.",
      "Melakukan hobi santai seperti berkebun, memancing, atau kerajinan tangan."
    ]
  },
  {
    id: 2,
    text: "Jika kantor mengadakan kegiatan 'Gathering' atau 'Dinas Luar', tipe kegiatan apa yang paling kamu harapkan?",
    type: "mcq",
    category: "Ideal Environment",
    options: [
      "Acara kebersamaan yang ramai, games seru, dan bisa kenal banyak orang dari divisi lain.",
      "Retreat di tempat sejuk dan tenang, fokus pada relaksasi tanpa banyak agenda padat.",
      "Kunjungan lapangan atau studi banding ke tempat baru yang menantang.",
      "Agenda yang jelas, tertata rapi, akomodasi nyaman, dan tidak banyak kejutan."
    ]
  },
  {
    id: 3,
    text: "Ada rekan kerja yang ingin meminjam uang atau meminta bantuan di luar tupoksi yang berisiko. Sikapmu?",
    type: "mcq",
    category: "Decision Making Style",
    options: [
      "Bantu saja karena kasihan atau menjaga hubungan baik, nanti bisa diganti.",
      "Tolak secara halus tapi tegas. Risiko harus dihindari demi profesionalisme.",
      "Analisa dulu urgensinya dan cek aturan mainnya, baru putuskan secara logis.",
      "Sebenarnya keberatan dan ragu, tapi sulit menolak karena tidak enak hati."
    ]
  },
  {
    id: 4,
    text: "Saat sedang fokus mengerjakan laporan penting, suasana ruangan sangat berisik (suara obrolan atau renovasi). Reaksimu?",
    type: "mcq",
    category: "HSP / Reactivity",
    options: [
      "Tidak masalah, saya tetap bisa fokus kerja di tengah keramaian.",
      "Sangat terganggu dan jadi tidak bisa berpikir jernih, harus cari tempat sepi.",
      "Langsung menegur sumber keributan agar diam/tenang.",
      "Pasang earphone/headset, dengarkan musik biar suara luar tidak masuk."
    ]
  },
  {
    id: 5,
    text: "Beredar isu (desas-desus) akan ada pergantian Pimpinan atau perubahan struktur organisasi besar-besaran. Kamu...",
    type: "mcq",
    category: "Social Interaction",
    options: [
      "Aktif mencari info dari berbagai sumber untuk update situasi terkini.",
      "Menyimak saja, tapi tidak ikut menyebarkan isu yang belum pasti.",
      "Masa bodoh, yang penting tugas saya hari ini selesai.",
      "Cemas memikirkan dampaknya terhadap posisi atau kenyamanan kerja saya."
    ]
  },
  {
    id: 6,
    text: "Ada tawaran jabatan atau proyek baru yang prestisius tapi beban kerjanya sangat berat dan risiko gagal tinggi. Ambil?",
    type: "mcq",
    category: "Risk Pattern",
    options: [
      "Siap! Ini tantangan untuk pembuktian diri dan loncat karir.",
      "Pertimbangkan matang-matang, lihat untung-ruginya secara detail.",
      "Lebih baik tetap di posisi sekarang yang sudah stabil dan aman.",
      "Minta saran senior atau rekan kepercayaan dulu sebelum memutuskan."
    ]
  },
  {
    id: 7,
    text: "Jika kamu ditunjuk sebagai Koordinator/Ketua Tim, gaya kepemimpinanmu lebih ke arah...",
    type: "mcq",
    category: "Leadership Pattern",
    options: [
      "Keluargaan, santai, yang penting suasana tim guyub dan target tercapai.",
      "Tegas, instruktif, dan memastikan semua berjalan sesuai SOP/Aturan.",
      "Musyawarah, mendengarkan aspirasi anggota sebelum ketok palu.",
      "Perfeksionis, mengawasi detail hasil kerja anggota agar tidak ada kesalahan."
    ]
  },
  {
    id: 8,
    text: "Studi Kasus 1: Terjadi konflik antar anggota tim karena salah paham soal pembagian tugas. Deadline makin dekat. Apa yang kamu lakukan?",
    type: "mcq",
    category: "Conflict Resolution",
    options: [
      "Tegas menengahi, suruh mereka berhenti ribut dan fokus kerja.",
      "Ajak bicara personal atau mediasi santai (ngopi bareng) untuk luruskan masalah.",
      "Ambil alih pekerjaan krusial agar deadline tidak meleset, urusan konflik belakangan.",
      "Buat ulang pembagian tugas secara tertulis dan adil agar tidak ada celah protes."
    ]
  },
  {
    id: 9,
    text: "Studi Kasus 2: Kamu mendadak dimutasi/dirotasi ke divisi yang tidak sesuai keahlianmu atau ditempatkan di lokasi yang kurang strategis. Pikiran pertamamu?",
    type: "mcq",
    category: "Resilience",
    options: [
      "Sedih dan kecewa berat, merasa karir dipersulit.",
      "Marah dan ingin protes ke kepegawaian/HRD karena merasa tidak adil.",
      "Terima tantangan, segera pelajari skill baru untuk adaptasi.",
      "Pasrah saja, jalani apa adanya, atau mulai pikirkan rencana cadangan (bisnis/pindah)."
    ]
  },
  {
    id: 10,
    text: "Studi Kasus 3: Pimpinan meminta Anda mensosialisasikan aturan baru yang rumit dan pasti tidak populer (banyak penolakan) kepada tim/klien. Strategi komunikasi Anda?",
    type: "mcq",
    category: "Communication Skill",
    options: [
      "Jelaskan poin-poinnya secara tegas 'hitam di atas putih', ini aturan yang wajib ditaati.",
      "Gunakan pendekatan personal/empatik, dengarkan keluhan mereka dulu, baru bujuk pelan-pelan.",
      "Buat presentasi visual yang menarik dan highlight manfaat jangka panjangnya agar mereka terinspirasi.",
      "Bagikan dokumen tertulis yang sangat rinci agar tidak ada celah kesalahpahaman sedikitpun."
    ]
  },
  {
    id: 11,
    text: "Studi Kasus 4: Sistem kerja manual yang sudah nyaman tiba-tiba diganti total ke aplikasi digital baru yang masih sering error di awal implementasi. Sikap Anda?",
    type: "mcq",
    category: "Managing Change",
    options: [
      "Merasa terbebani dan cenderung mengeluh bersama rekan lain yang senasib.",
      "Langsung eksplorasi aplikasinya, cari cara mengakali error-nya, dan ajari teman lain.",
      "Menunggu instruksi teknis resmi saja, tidak mau coba-coba kalau belum stabil.",
      "Membuat catatan log error secara detail untuk dilaporkan ke tim IT agar segera diperbaiki."
    ]
  },
  {
    id: 12,
    text: "Studi Kasus 5: Deadline proyek tinggal besok, tapi data pendukung dari tim lain belum lengkap 100%. Jika menunggu lengkap, pasti terlambat submit.",
    type: "mcq",
    category: "Result Orientation",
    options: [
      "Submit saja apa adanya yang penting masuk tepat waktu. Revisi bisa menyusul.",
      "Minta perpanjangan waktu resmi ke atasan, kualitas dan kelengkapan data adalah prioritas.",
      "Cari data alternatif/estimasi logis untuk menambal kekurangan, lalu submit.",
      "Marah pada tim lain dan menolak submit sampai mereka melengkapi datanya."
    ]
  },
  {
    id: 13,
    text: "Studi Kasus 6: Seorang warga/klien datang marah-marah dengan nada tinggi karena merasa dipersulit, padahal berkas yang dia bawa memang tidak lengkap sesuai prosedur.",
    type: "mcq",
    category: "Public Service",
    options: [
      "Tetap tenang, tidak terpancing emosi, dan jelaskan ceklis persyaratan dengan sabar.",
      "Tegas memotong pembicaraan, katakan bahwa marah tidak akan menyelesaikan masalah.",
      "Mencoba mencari solusi alternatif 'win-win' agar dia tidak pulang dengan tangan kosong.",
      "Merasa tertekan dan sakit hati, lalu meminta rekan lain untuk menghadapinya."
    ]
  },
  {
    id: 14,
    text: "Studi Kasus 7: Anda diberi wewenang memilih Vendor/Mitra untuk acara kantor. Vendor A kualitas premium tapi mahal (over budget), Vendor B kualitas standar tapi murah dan sesuai budget.",
    type: "mcq",
    category: "Strategic Decision Making",
    options: [
      "Pilih Vendor B. Yang Penting sesuai aturan",
      "Pilih Vendor A, Yang penting kualitas. Cari cara ambil anggaran di pos anggaran lain",
      "Nego keras ke Vendor A agar turun harga, atau minta Vendor B upgrade kualitas.",
      "Buat matriks perbandingan detail dulu untuk dilaporkan ke pimpinan, biar pimpinan yang pilih."
    ]
  },
  {
    id: 15,
    text: "Studi Kasus 8: Bayangkan Pimpinan memberimu revisi mendadak sore ini dan harus selesai besok pagi, padahal kamu sudah ada janji lain. Strategimu?",
    type: "mcq",
    category: "Adaptation History",
    options: [
      "Batalkan janji, lembur totalitas demi loyalitas pada pimpinan.",
      "Nego ke pimpinan untuk prioritas bagian krusial saja yang diselesaikan malam ini.",
      "Minta bantuan rekan tim agar terbagi beban kerja atau cari joki.",
      "Kerjakan secepat mungkin dengan kualitas standar, asal selesai tepat waktu"
    ]
  },
  {
    id: 16,
    text: "Bagaimana pola konsentrasimu saat menghadapi tugas rutin (administrasi/input data) yang membosankan?",
    type: "mcq",
    category: "Energy Pattern II",
    options: [
      "Cepat bosan, butuh selingan ngobrol, ngopi, atau buka sosmed sering-sering.",
      "Tahan berjam-jam fokus tanpa terganggu sampai selesai.",
      "Harus sambil mendengarkan musik atau ngemil biar mood terjaga.",
      "Menunda-nunda di awal, lalu kebut di akhir."
    ]
  },
  {
    id: 17,
    text: "Jika boleh memilih sistem kerja permanen yang paling ideal buat mentalmu, kamu pilih:",
    type: "mcq",
    category: "Ideal Environment II",
    options: [
      "100% WFO: Suka interaksi langsung, ketemu orang, dan vibes kantor yang hidup.",
      "100% WFH/Remote: Bebas gangguan, tenang, hemat waktu perjalanan, lebih produktif.",
      "Hybrid: Kombinasi seimbang, ada waktu sosial dan waktu fokus.",
      "Fleksibel: Bebas kerja di mana saja dan kapan saja asal target tercapai."
    ]
  },
  {
    "id": 18,
    "text": "Saat menghadapi tugas harian yang harus diputuskan cepat, kamu biasanya...",
    "type": "mcq",
    "category": "Decision Making Style II",
    "options": [
      "Langsung memutuskan berdasarkan insting dan pengalaman pribadi.",
      "Sangat hati-hati, cek semua data dan dokumen sebelum menyetujui langkah.",
      "Mencari jalan tengah agar semua rekan kerja merasa setuju dengan keputusanmu.",
      "Mengikuti prosedur atau cara yang sudah biasa dilakukan sebelumnya supaya aman."
    ]
  },
  {
    id: 19,
    text: "Di jam istirahat kantor atau acara bebas, gaya interaksi sosialmu biasanya...",
    type: "mcq",
    category: "Social Interaction II",
    options: [
      "Bergabung dengan grup besar ('geng kantor'), gosip santai, dan tertawa lepas.",
      "Makan dengan 1-2 teman dekat saja untuk ngobrol deep/curhat.",
      "Menyendiri (makan sambil nonton/baca) untuk recharge energi sosial.",
      "Keliling menyapa orang dari departemen lain."
    ]
  },
  {
    id: 20,
    text: "Perusahaan/Instansi berencana menerapkan inovasi radikal yang belum teruji namun berpotensi sukses besar. Pendapatmu?",
    type: "mcq",
    category: "Risk Pattern II",
    options: [
      "Gas pol! Kita harus jadi pionir dan berani ambil risiko",
      "Tunggu dulu, lihat instansi/kompetitor lain yang sudah coba",
      "Skeptis, lebih baik sempurnakan sistem lama yang sudah terbukti",
      "Buat pilot project kecil dulu untuk meminimalisir dampak jika gagal"
    ]
  }
];
