// RumahAnggaran — data for the Prasetyo household, November 2026.
// Every figure on the site comes from here: category totals are computed from
// the transaction list, never typed twice, so no page can disagree with another.
// Amounts are in rupiah. The household is a fictional example family of four
// in Jakarta; the method references (50/30/20, UMP Jakarta 2025) are real.

const HOUSEHOLD = {
  name: 'Keluarga Prasetyo',
  city: 'Jakarta',
  members: 4,
  month: 'November 2026',
  monthShort: 'Nov 2026',
  asOf: '26 November 2026',
  income: [
    { source: 'Gaji Budi (ayah)', amount: 8000000 },
    { source: 'Gaji Sari (ibu)', amount: 4500000 },
  ],
  // Reference point, not the family's own money: UMP DKI Jakarta 2025.
  umpJakarta2025: 5396761,
};

// Budget groups follow the 50/30/20 method. `target` is the group's share of
// income; each category has its own monthly budget in rupiah.
const BUDGET_GROUPS = [
  {
    id: 'kebutuhan',
    label: 'Kebutuhan',
    target: 50,
    note: 'Yang wajib dibayar tiap bulan',
    categories: [
      { id: 'belanja', label: 'Belanja harian', budget: 2800000 },
      { id: 'listrik', label: 'Listrik & air', budget: 650000 },
      { id: 'transport', label: 'Transportasi', budget: 1200000 },
      { id: 'pulsa', label: 'Pulsa & internet', budget: 450000 },
      { id: 'kesehatan', label: 'Kesehatan', budget: 500000 },
      { id: 'sekolah', label: 'Sekolah anak', budget: 650000 },
    ],
  },
  {
    id: 'keinginan',
    label: 'Keinginan',
    target: 30,
    note: 'Yang bikin hidup enak, bisa dipangkas',
    categories: [
      { id: 'makan', label: 'Makan di luar', budget: 900000 },
      { id: 'hiburan', label: 'Hiburan & streaming', budget: 550000 },
      { id: 'pakaian', label: 'Belanja pakaian', budget: 700000 },
      { id: 'jalan', label: 'Hobi & jalan-jalan', budget: 1600000 },
    ],
  },
  {
    id: 'tabungan',
    label: 'Tabungan',
    target: 20,
    note: 'Dibayar ke diri sendiri di awal bulan',
    categories: [
      { id: 'darurat', label: 'Dana darurat', budget: 1500000 },
      { id: 'rumah', label: 'DP rumah', budget: 700000 },
      { id: 'liburan', label: 'Liburan keluarga', budget: 300000 },
    ],
  },
];

// Every rupiah the family spent in November 2026 up to the 26th.
// Category totals on the site are the sums of these rows.
const TRANSACTIONS = [
  { date: '2026-11-01', desc: 'IndiHome (internet rumah)', cat: 'pulsa', amount: 350000 },
  { date: '2026-11-01', desc: 'Pasar Minggu — sayur & buah', cat: 'belanja', amount: 185000 },
  { date: '2026-11-01', desc: 'Netflix', cat: 'hiburan', amount: 186000 },
  { date: '2026-11-01', desc: 'Spotify', cat: 'hiburan', amount: 54000 },
  { date: '2026-11-02', desc: 'Token PLN 200rb', cat: 'listrik', amount: 200000 },
  { date: '2026-11-02', desc: 'Bensin Pertalite', cat: 'transport', amount: 150000 },
  { date: '2026-11-03', desc: 'Indomaret — belanja mingguan', cat: 'belanja', amount: 320000 },
  { date: '2026-11-03', desc: 'SPP Dimas (anak 1)', cat: 'sekolah', amount: 400000 },
  { date: '2026-11-03', desc: 'SPP Kirana (anak 2)', cat: 'sekolah', amount: 250000 },
  { date: '2026-11-05', desc: 'Super Indo — daging & ayam', cat: 'belanja', amount: 410000 },
  { date: '2026-11-05', desc: 'Pulsa Budi', cat: 'pulsa', amount: 50000 },
  { date: '2026-11-05', desc: 'Pulsa Sari', cat: 'pulsa', amount: 50000 },
  { date: '2026-11-06', desc: 'Gojek antar anak sekolah', cat: 'transport', amount: 85000 },
  { date: '2026-11-07', desc: 'Restoran keluarga (Sabtu)', cat: 'makan', amount: 320000 },
  { date: '2026-11-07', desc: 'Apotek — obat anak', cat: 'kesehatan', amount: 125000 },
  { date: '2026-11-08', desc: 'Pasar Minggu — sayur & buah', cat: 'belanja', amount: 175000 },
  { date: '2026-11-08', desc: 'Bioskop keluarga', cat: 'hiburan', amount: 240000 },
  { date: '2026-11-08', desc: 'Piknik Ancol', cat: 'jalan', amount: 450000 },
  { date: '2026-11-09', desc: 'Token PLN 200rb', cat: 'listrik', amount: 200000 },
  { date: '2026-11-09', desc: 'Bensin Pertalite', cat: 'transport', amount: 150000 },
  { date: '2026-11-10', desc: 'Indomaret — belanja mingguan', cat: 'belanja', amount: 295000 },
  { date: '2026-11-12', desc: 'Super Indo — beras 10 kg', cat: 'belanja', amount: 145000 },
  { date: '2026-11-13', desc: 'Parkir & tol', cat: 'transport', amount: 120000 },
  { date: '2026-11-14', desc: 'BPJS Kesehatan', cat: 'kesehatan', amount: 210000 },
  { date: '2026-11-14', desc: 'Kopi & sarapan', cat: 'makan', amount: 145000 },
  { date: '2026-11-15', desc: 'Pasar Minggu — sayur & buah', cat: 'belanja', amount: 190000 },
  { date: '2026-11-15', desc: 'Seragam sekolah Dimas', cat: 'pakaian', amount: 320000 },
  { date: '2026-11-16', desc: 'Token PLN 200rb', cat: 'listrik', amount: 200000 },
  { date: '2026-11-16', desc: 'Bensin Pertalite', cat: 'transport', amount: 150000 },
  { date: '2026-11-17', desc: 'Indomaret — belanja mingguan', cat: 'belanja', amount: 310000 },
  { date: '2026-11-19', desc: 'Super Indo — daging & ayam', cat: 'belanja', amount: 385000 },
  { date: '2026-11-20', desc: 'PDAM (air)', cat: 'listrik', amount: 150000 },
  { date: '2026-11-20', desc: 'Gojek antar anak sekolah', cat: 'transport', amount: 90000 },
  { date: '2026-11-21', desc: 'Restoran keluarga (Sabtu)', cat: 'makan', amount: 385000 },
  { date: '2026-11-21', desc: 'Dokter gigi Kirana', cat: 'kesehatan', amount: 350000 },
  { date: '2026-11-22', desc: 'Pasar Minggu — sayur & buah', cat: 'belanja', amount: 165000 },
  { date: '2026-11-22', desc: 'Sepatu Kirana', cat: 'pakaian', amount: 275000 },
  { date: '2026-11-22', desc: 'Jalan-jalan Bandung', cat: 'jalan', amount: 850000 },
  { date: '2026-11-23', desc: 'Bensin Pertalite', cat: 'transport', amount: 150000 },
  { date: '2026-11-24', desc: 'Indomaret — belanja mingguan', cat: 'belanja', amount: 285000 },
  { date: '2026-11-24', desc: 'Kopi & sarapan', cat: 'makan', amount: 95000 },
  { date: '2026-11-25', desc: 'Parkir & tol', cat: 'transport', amount: 110000 },
];

// Six months of books, for the trend chart (amounts in rupiah).
const HISTORY = [
  { month: 'Jun 2026', income: 12500000, spent: 9900000, saved: 2600000 },
  { month: 'Jul 2026', income: 12500000, spent: 10200000, saved: 2300000 },
  { month: 'Agu 2026', income: 12500000, spent: 9600000, saved: 2900000 },
  { month: 'Sep 2026', income: 13100000, spent: 10400000, saved: 2700000, note: 'Bonus proyek Rp 600.000' },
  { month: 'Okt 2026', income: 12500000, spent: 10100000, saved: 2400000 },
  { month: 'Nov 2026', income: 12500000, spent: 9725000, saved: 2500000, note: 'Berjalan, s.d. 26 Nov' },
];

// Savings goals. `saved` grows when the family adds a contribution.
const GOALS = [
  { id: 'darurat', label: 'Dana darurat', target: 30000000, saved: 18750000, why: '6 bulan pengeluaran kebutuhan — bantalan kalau ada yang sakit atau kehilangan penghasilan.' },
  { id: 'rumah', label: 'DP rumah', target: 150000000, saved: 42000000, why: 'Rumah pertama di pinggir Jakarta; target terkumpul dalam 8–9 tahun dengan setoran Rp 700.000/bulan.' },
  { id: 'liburan', label: 'Liburan keluarga', target: 8000000, saved: 5200000, why: 'Liburan akhir tahun ke Yogyakarta; berangkat kalau sudah 100%.' },
];

// Bills still to come, with due dates.
const BILLS = [
  { due: '2026-12-01', desc: 'IndiHome (internet rumah)', amount: 350000 },
  { due: '2026-12-03', desc: 'SPP Dimas + Kirana', amount: 650000 },
  { due: '2026-12-05', desc: 'BPJS Kesehatan', amount: 210000 },
  { due: '2026-12-10', desc: 'Token PLN 200rb', amount: 200000 },
];

// Practical tips shown on the guide page.
const TIPS = [
  { title: 'Bayar tabungan dulu', body: 'Begitu gajian masuk, pindahkan Rp 2.500.000 ke rekening tabungan sebelum belanja apa pun. Yang tersisa itulah yang boleh dipakai.' },
  { title: 'Belanja harian seminggu sekali', body: 'Keluarga ini belanja ke pasar tiap Minggu dan Indomaret seminggu sekali, dengan daftar belanja. Belanja tanpa daftar adalah sumber bocor terbesar: Rp 65.000 di atas anggaran bulan ini.' },
  { title: 'Pisahkan rekening', body: 'Satu rekening untuk kebutuhan, satu untuk keinginan, satu untuk tabungan. Kalau uang keinginan habis, berhenti — jangan comot dari rekening kebutuhan.' },
  { title: 'Cek tagihan langganan tiap 3 bulan', body: 'Netflix, Spotify, dan langganan lain dicek tiap kuartal. Langganan yang tidak dipakai sebulan langsung berhenti.' },
  { title: 'Dana darurat sebelum investasi', body: 'Sampai dana darurat mencapai 6 bulan pengeluaran (Rp 30.000.000), jangan sentuh investasi berisiko. Sekarang sudah 62%.' },
  { title: 'Rapat anggaran 15 menit tiap Minggu', body: 'Tiap Minggu malam, Budi dan Sari duduk 15 menit: cek pengeluaran minggu itu, geser anggaran kalau perlu, dan tentukan rencana minggu depan.' },
];
