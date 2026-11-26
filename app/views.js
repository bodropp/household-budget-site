// RumahAnggaran — page renderers. Each view is a function of (state) that
// returns HTML; every figure is computed from data.js, never typed twice.

function fmtRp(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function catLabel(id) {
  for (const g of BUDGET_GROUPS) for (const c of g.categories) if (c.id === id) return c.label;
  return id;
}

function catBudget(id, state) {
  if (state.budgetOverride[id] != null) return state.budgetOverride[id];
  for (const g of BUDGET_GROUPS) for (const c of g.categories) if (c.id === id) return c.budget;
  return 0;
}

function allTransactions(state) {
  const base = TRANSACTIONS.map((t, i) => ({ ...t, id: 'tx' + i, added: false }));
  const kept = base.filter((t) => !state.deletedTx.includes(t.id));
  return kept.concat(state.addedTx).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

function catActual(id, state) {
  return allTransactions(state).filter((t) => t.cat === id)
    .reduce((s, t) => s + t.amount, 0);
}

function totalIncome(state) {
  return state.incomeOverride != null ? state.incomeOverride
    : HOUSEHOLD.income.reduce((s, x) => s + x.amount, 0);
}

function totalSpent(state) {
  return allTransactions(state).reduce((s, t) => s + t.amount, 0);
}

function savingsPlanned(state) {
  return BUDGET_GROUPS.find((g) => g.id === 'tabungan').categories
    .reduce((s, c) => s + catBudget(c.id, state), 0);
}

function goalSaved(goal, state) {
  return goal.saved + (state.goalExtra[goal.id] || 0);
}

function selisihBadge(actual, budget) {
  const d = actual - budget;
  if (d > 0) return `<span class="badge over">Lebih ${fmtRp(d)}</span>`;
  if (d < 0) return `<span class="badge under">Sisa ${fmtRp(-d)}</span>`;
  return '<span class="badge even">Pas anggaran</span>';
}

function navLink(route, label, current) {
  const on = current === route ? ' aria-current="page" class="on"' : '';
  return `<a href="#${route}"${on}>${label}</a>`;
}

// ---------------- Dashboard ----------------
function viewDashboard(state) {
  const income = totalIncome(state), spent = totalSpent(state);
  const saved = savingsPlanned(state), left = income - spent;
  const afterSaving = income - spent - saved;
  const slices = [];
  for (const g of BUDGET_GROUPS) {
    if (g.id === 'tabungan') continue;
    for (const c of g.categories) {
      slices.push({ label: c.label, value: catActual(c.id, state), color: CAT_COLORS[c.id] });
    }
  }
  const over = [];
  for (const g of BUDGET_GROUPS) {
    if (g.id === 'tabungan') continue;
    for (const c of g.categories) {
      const a = catActual(c.id, state), b = catBudget(c.id, state);
      if (a > b) over.push({ label: c.label, diff: a - b, actual: a, budget: b });
    }
  }
  const recent = allTransactions(state).slice(0, 5);
  const legend = slices.map((s) => {
    const pct = spent ? Math.round((s.value / spent) * 100) : 0;
    return `<li><span class="dot" style="background:${s.color}"></span>${s.label}<b>${fmtRp(s.value)}</b><span class="pct">${pct}%</span></li>`;
  }).join('');
  return `
  <h1>Anggaran ${esc(HOUSEHOLD.month)}</h1>
  <p class="lede">${esc(HOUSEHOLD.name)} · ${esc(HOUSEHOLD.city)} · ${HOUSEHOLD.members} orang · diperbarui ${esc(HOUSEHOLD.asOf)}</p>
  <section class="stats">
    <div class="stat"><span>Pemasukan</span><b>${fmtRp(income)}</b><small>2 gaji · Budi ${fmtRp(8000000)} + Sari ${fmtRp(4500000)}</small></div>
    <div class="stat"><span>Pengeluaran</span><b>${fmtRp(spent)}</b><small>s.d. 26 Nov · ${allTransactions(state).length} transaksi</small></div>
    <div class="stat"><span>Sisa uang</span><b>${fmtRp(left)}</b><small>setelah belanja, sebelum tabungan</small></div>
    <div class="stat good"><span>Ditabung</span><b>${fmtRp(saved)}</b><small>${Math.round((saved / income) * 100)}% dari pemasukan · target 20%</small></div>
  </section>
  <section class="grid2">
    <div class="card">
      <h2>Ke mana uang pergi</h2>
      <div class="donut-wrap">${donutChart(slices, 220)}<ul class="legend">${legend}</ul></div>
    </div>
    <div class="card">
      <h2>Yang perlu diperhatikan</h2>
      ${over.length ? `<ul class="alerts">${over.map((o) => `<li><b>${o.label}</b> sudah ${fmtRp(o.actual)} dari anggaran ${fmtRp(o.budget)} — lebih ${fmtRp(o.diff)}.</li>`).join('')}</ul>`
        : '<p>Semua kategori masih dalam anggaran. Bagus!</p>'}
      <p>Setelah tabungan ${fmtRp(saved)} dipindahkan di awal bulan, sisa uang untuk 4 hari terakhir November adalah <b>${fmtRp(afterSaving)}</b>. Tagihan berikutnya: IndiHome ${fmtRp(350000)} pada 1 Des.</p>
      <p><a class="btn" href="#/anggaran">Buka perencana anggaran →</a></p>
    </div>
  </section>
  <section class="grid2">
    <div class="card">
      <h2>Enam bulan terakhir</h2>
      ${barChart(HISTORY, { width: 640, height: 250 })}
      <p class="chart-key"><span class="key green"></span> Pengeluaran &nbsp; <span class="key blue"></span> Tabungan</p>
      <p>Bulan paling hemat: Agustus 2026 (${fmtRp(9600000)}). September naik karena ada bonus proyek ${fmtRp(600000)} — setengahnya langsung ditabung.</p>
    </div>
    <div class="card">
      <h2>Pengeluaran terakhir</h2>
      <table class="mini"><tbody>${recent.map((t) => `<tr><td>${t.date.slice(5)}</td><td>${esc(t.desc)}</td><td class="num">${fmtRp(t.amount)}</td></tr>`).join('')}</tbody></table>
      <p><a href="#/pengeluaran">Lihat semua pengeluaran →</a></p>
      <h2>Tagihan mendatang</h2>
      <table class="mini"><tbody>${BILLS.map((b) => `<tr><td>${b.due.slice(5)}</td><td>${esc(b.desc)}</td><td class="num">${fmtRp(b.amount)}</td></tr>`).join('')}</tbody></table>
    </div>
  </section>
  <section class="cards3">
    <a class="tool-card" href="#/anggaran"><b>Kalkulator 50/30/20</b><span>Atur anggaran tiap kategori dan lihat langsung apakah masih muat.</span></a>
    <a class="tool-card" href="#/pengeluaran"><b>Lacak pengeluaran</b><span>Catat belanja baru, saring per kategori, hapus yang salah catat.</span></a>
    <a class="tool-card" href="#/tabungan"><b>Target tabungan</b><span>Dana darurat, DP rumah, liburan — tambah setoran dan lihat progresnya.</span></a>
  </section>`;
}

// ---------------- Budget planner / calculator ----------------
function viewAnggaran(state) {
  const income = totalIncome(state);
  const groups = BUDGET_GROUPS.map((g) => {
    const rows = g.categories.map((c) => {
      const b = catBudget(c.id, state), a = catActual(c.id, state);
      const pct = income ? Math.round((b / income) * 100) : 0;
      const fill = b ? Math.min(100, Math.round((a / b) * 100)) : 0;
      return `<div class="budget-row">
        <label for="budget-${c.id}">${c.label}</label>
        <input id="budget-${c.id}" data-budget-cat="${c.id}" type="number" min="0" step="5000" value="${b}" inputmode="numeric">
        <div class="budget-bar"><div style="width:${fill}%;background:${a > b ? '#c0392b' : '#1b7a4d'}"></div></div>
        <span class="budget-actual">${fmtRp(a)} dari ${fmtRp(b)} · ${pct}%</span>
        ${selisihBadge(a, b)}
      </div>`;
    }).join('');
    const gBudget = g.categories.reduce((s, c) => s + catBudget(c.id, state), 0);
    const gActual = g.categories.reduce((s, c) => s + catActual(c.id, state), 0);
    return `<section class="card"><h2>${g.label} — target ${g.target}% (${fmtRp((income * g.target) / 100)})</h2>
      <p class="muted">${g.note}. Anggaran ${fmtRp(gBudget)} · terpakai ${fmtRp(gActual)}.</p>${rows}</section>`;
  }).join('');
  const totalBudget = BUDGET_GROUPS.flatMap((g) => g.categories)
    .reduce((s, c) => s + catBudget(c.id, state), 0);
  const gap = income - totalBudget;
  return `
  <h1>Perencana anggaran 50/30/20</h1>
  <p class="lede">Ubah angka di bawah ini — semua total dan peringatan dihitung ulang langsung, tanpa memuat ulang halaman.</p>
  <section class="card calculator">
    <label for="income-input"><b>Pemasukan sebulan</b> (Rp)</label>
    <input id="income-input" type="number" min="0" step="50000" value="${income}" inputmode="numeric">
    <div class="split50">
      <div><span>Kebutuhan · 50%</span><b>${fmtRp(income * 0.5)}</b></div>
      <div><span>Keinginan · 30%</span><b>${fmtRp(income * 0.3)}</b></div>
      <div><span>Tabungan · 20%</span><b>${fmtRp(income * 0.2)}</b></div>
    </div>
    <p id="income-note" class="muted">Patokan: UMP DKI Jakarta 2025 adalah ${fmtRp(HOUSEHOLD.umpJakarta2025)} — pemasukan keluarga ini ${fmtRp(income - HOUSEHOLD.umpJakarta2025)} di atas UMP untuk 2 orang bekerja.</p>
  </section>
  ${groups}
  <section class="card total-bar ${gap < 0 ? 'bad' : 'good'}">
    <b>Total anggaran: ${fmtRp(totalBudget)}</b>
    <span>${gap >= 0 ? `Masih muat — sisa ${fmtRp(gap)} dari pemasukan.` : `Melebihi pemasukan ${fmtRp(-gap)}! Pangkas kategori Keinginan dulu.`}</span>
    <div class="row-btns">
      <button type="button" class="btn" id="save-budget">Simpan anggaran</button>
      <button type="button" class="btn ghost" id="reset-budget">Reset ke 50/30/20</button>
    </div>
    <p id="budget-msg" class="muted" role="status"></p>
  </section>`;
}

// ---------------- Expense tracker ----------------
function viewPengeluaran(state) {
  const q = (state.filterQ || '').toLowerCase();
  const cat = state.filterCat || '';
  const rows = allTransactions(state).filter((t) =>
    (!cat || t.cat === cat) && (!q || t.desc.toLowerCase().includes(q)));
  const spent = totalSpent(state);
  const biggest = allTransactions(state).reduce((m, t) => (t.amount > m.amount ? t : m), { amount: 0 });
  const opts = BUDGET_GROUPS.flatMap((g) => g.categories)
    .map((c) => `<option value="${c.id}"${cat === c.id ? ' selected' : ''}>${c.label}</option>`).join('');
  return `
  <h1>Lacak pengeluaran</h1>
  <p class="lede">${allTransactions(state).length} transaksi · total ${fmtRp(spent)} · terbesar: ${esc(biggest.desc || '—')} ${fmtRp(biggest.amount)}</p>
  <section class="card">
    <form id="add-form" class="add-form">
      <h2>Catat pengeluaran baru</h2>
      <label>Tanggal <input name="date" type="date" value="2026-11-26" required></label>
      <label>Keterangan <input name="desc" type="text" placeholder="cth: Pasar Minggu — sayur" required maxlength="80"></label>
      <label>Kategori <select name="cat">${BUDGET_GROUPS.flatMap((g) => g.categories).map((c) => `<option value="${c.id}">${c.label}</option>`).join('')}</select></label>
      <label>Jumlah (Rp) <input name="amount" type="number" min="1000" step="1000" placeholder="50000" required inputmode="numeric"></label>
      <button type="submit" class="btn">Tambah pengeluaran</button>
      <span id="add-msg" class="muted" role="status"></span>
    </form>
  </section>
  <section class="card">
    <div class="filters">
      <label>Saring kategori
        <select id="filter-cat"><option value="">Semua kategori</option>${opts}</select>
      </label>
      <label>Cari keterangan
        <input id="filter-q" type="search" placeholder="cth: indomaret" value="${esc(state.filterQ || '')}">
      </label>
      <button type="button" class="btn ghost" id="reset-data">Reset data ke awal</button>
    </div>
    <p class="muted">Menampilkan ${rows.length} dari ${allTransactions(state).length} pengeluaran.</p>
    <table class="data"><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th class="num">Jumlah</th><th></th></tr></thead>
    <tbody>${rows.map((t) => `<tr><td>${t.date}</td><td>${esc(t.desc)}</td><td>${catLabel(t.cat)}</td><td class="num">${fmtRp(t.amount)}</td><td><button type="button" class="del" data-del="${t.id}" aria-label="Hapus ${esc(t.desc)}">Hapus</button></td></tr>`).join('') || '<tr><td colspan="5">Tidak ada pengeluaran yang cocok.</td></tr>'}</tbody></table>
  </section>`;
}

// ---------------- Savings goals ----------------
function viewTabungan(state) {
  const cards = GOALS.map((g) => {
    const saved = goalSaved(g, state);
    const pct = (saved / g.target) * 100;
    const left = Math.max(0, g.target - saved);
    const monthly = BUDGET_GROUPS.find((x) => x.id === 'tabungan').categories.find((c) => c.id === g.id).budget;
    const months = monthly ? Math.ceil(left / monthly) : 0;
    return `<section class="card goal">
      <h2>${g.label}</h2>
      <p>${g.why}</p>
      <div class="goal-nums"><b>${fmtRp(saved)}</b><span>dari ${fmtRp(g.target)} · ${pct.toFixed(0)}%</span></div>
      ${progressBar(pct, GROUP_COLORS.tabungan)}
      <p class="muted">${left > 0 ? `Kurang ${fmtRp(left)} lagi — sekitar ${months} bulan dengan setoran ${fmtRp(monthly)}/bulan.` : 'Target tercapai! 🎉'}</p>
      <form class="goal-form" data-goal="${g.id}">
        <label>Tambah setoran (Rp) <input name="amount" type="number" min="1000" step="1000" placeholder="100000" required inputmode="numeric"></label>
        <button type="submit" class="btn">Tambah setoran</button>
        <span class="muted goal-msg" role="status"></span>
      </form>
    </section>`;
  }).join('');
  const totalSaved = GOALS.reduce((s, g) => s + goalSaved(g, state), 0);
  const totalTarget = GOALS.reduce((s, g) => s + g.target, 0);
  return `
  <h1>Target tabungan</h1>
  <p class="lede">Total terkumpul <b>${fmtRp(totalSaved)}</b> dari target ${fmtRp(totalTarget)} (${Math.round((totalSaved / totalTarget) * 100)}%) · setoran bulan ini ${fmtRp(savingsPlanned(state))} sudah dipindahkan 1 November.</p>
  ${cards}
  <section class="card"><h2>Kenapa dana darurat dulu?</h2>
  <p>Sebelum memikirkan investasi, keluarga ini menargetkan dana darurat 6 bulan pengeluaran kebutuhan — sekitar ${fmtRp(30000000)}. Sekarang sudah ${Math.round((goalSaved(GOALS[0], state) / GOALS[0].target) * 100)}%. Kalau ada yang sakit atau penghasilan berhenti sebulan, keluarga tetap bisa makan dan bayar sekolah tanpa berutang.</p></section>`;
}

// ---------------- Reports ----------------
function viewLaporan(state) {
  const spent = totalSpent(state);
  const catRows = BUDGET_GROUPS.flatMap((g) => g.categories).map((c) => {
    const a = catActual(c.id, state), b = catBudget(c.id, state);
    const share = spent ? Math.round((a / spent) * 100) : 0;
    return { label: c.label, budget: b, actual: a, diff: a - b, share };
  }).sort((x, y) => y.actual - x.actual);
  const biggest = allTransactions(state).reduce((m, t) => (t.amount > m.amount ? t : m), { amount: 0 });
  const overCount = catRows.filter((r) => r.diff > 0).length;
  const bestMonth = HISTORY.slice(0, 5).reduce((m, r) => (r.spent < m.spent ? r : m), HISTORY[0]);
  const income = totalIncome(state);
  return `
  <h1>Laporan November 2026</h1>
  <p class="lede">Ringkasan bulan berjalan, s.d. ${esc(HOUSEHOLD.asOf)} — semua angka dihitung dari daftar transaksi, bukan diketik ulang.</p>
  <section class="card">
    <h2>Tren enam bulan</h2>
    ${barChart(HISTORY, { width: 640, height: 250 })}
    <p class="chart-key"><span class="key green"></span> Pengeluaran &nbsp; <span class="key blue"></span> Tabungan</p>
    <table class="data"><thead><tr><th>Bulan</th><th class="num">Pemasukan</th><th class="num">Pengeluaran</th><th class="num">Ditabung</th><th class="num">Tingkat tabungan</th></tr></thead>
    <tbody>${HISTORY.map((r) => `<tr><td>${r.month}${r.note ? ` <span class="muted">(${esc(r.note)})</span>` : ''}</td><td class="num">${fmtRp(r.income)}</td><td class="num">${fmtRp(r.spent)}</td><td class="num">${fmtRp(r.saved)}</td><td class="num">${Math.round((r.saved / r.income) * 100)}%</td></tr>`).join('')}</tbody></table>
  </section>
  <section class="card">
    <h2>Per kategori</h2>
    <table class="data"><thead><tr><th>Kategori</th><th class="num">Anggaran</th><th class="num">Terpakai</th><th class="num">Selisih</th><th class="num">Bagian</th><th>Status</th></tr></thead>
    <tbody>${catRows.map((r) => `<tr><td>${r.label}</td><td class="num">${fmtRp(r.budget)}</td><td class="num">${fmtRp(r.actual)}</td><td class="num">${r.diff > 0 ? '+' : ''}${fmtRp(r.diff)}</td><td class="num">${r.share}%</td><td>${selisihBadge(r.actual, r.budget)}</td></tr>`).join('')}</tbody></table>
  </section>
  <section class="card">
    <h2>Yang bisa dipetik bulan ini</h2>
    <ul class="insights">
      <li><b>Kategori terbesar: Belanja harian</b> — ${fmtRp(catActual('belanja', state))}, ${Math.round((catActual('belanja', state) / spent) * 100)}% dari semua pengeluaran. Pasar Minggu tiap minggu menjaga harga tetap rendah.</li>
      <li><b>Pengeluaran sekali terbesar: ${esc(biggest.desc)}</b> — ${fmtRp(biggest.amount)} pada ${biggest.date}. Jalan-jalan memang kategori keinginan terbesar bulan ini.</li>
      <li><b>${overCount} kategori melewati anggaran</b> — Belanja harian, Listrik &amp; air, dan Kesehatan. Kesehatan membengkak karena dokter gigi Kirana (${fmtRp(350000)}), yang tidak direncanakan.</li>
      <li><b>Tingkat tabungan ${Math.round((savingsPlanned(state) / income) * 100)}%</b> — tepat di target 20% metode 50/30/20, karena tabungan dipindahkan di awal bulan sebelum belanja.</li>
      <li><b>Bulan paling hemat: ${bestMonth.month}</b> (${fmtRp(bestMonth.spent)}). Rahasianya: tidak ada jalan-jalan keluar kota dan tidak ada pengeluaran kesehatan tak terduga.</li>
    </ul>
  </section>`;
}

// ---------------- Guide ----------------
function viewPanduan(state) {
  const income = totalIncome(state);
  return `
  <h1>Panduan: metode 50/30/20</h1>
  <p class="lede">Cara sederhana membagi gaji: 50% untuk kebutuhan, 30% untuk keinginan, 20% untuk tabungan. Keluarga Prasetyo memakainya seperti ini.</p>
  <section class="grid3">
    <div class="card"><h2>50% · Kebutuhan</h2><p><b>${fmtRp(income * 0.5)}</b> dari ${fmtRp(income)}.</p><p>Belanja harian, listrik &amp; air, transportasi, pulsa &amp; internet, kesehatan, sekolah anak. Yang wajib dibayar — kalau ini di atas 50%, ada yang harus dipangkas.</p></div>
    <div class="card"><h2>30% · Keinginan</h2><p><b>${fmtRp(income * 0.3)}</b> dari ${fmtRp(income)}.</p><p>Makan di luar, hiburan &amp; streaming, pakaian, hobi &amp; jalan-jalan. Bukan larangan — tapi dibatasi, supaya tidak memakan jatah tabungan.</p></div>
    <div class="card"><h2>20% · Tabungan</h2><p><b>${fmtRp(income * 0.2)}</b> dari ${fmtRp(income)}.</p><p>Dana darurat, DP rumah, liburan. Dipindahkan begitu gajian masuk, sebelum belanja apa pun. Bulan ini keluarga ini menabung ${fmtRp(savingsPlanned(state))}.</p></div>
  </section>
  <section class="card"><h2>Enam kebiasaan yang berhasil</h2>
    <ol class="tips">${TIPS.map((t) => `<li><b>${t.title}.</b> ${t.body}</li>`).join('')}</ol>
  </section>
  <section class="card"><h2>Sumber &amp; cara angka dihitung</h2>
    <ul>
      <li>Metode 50/30/20 mengikuti panduan literasi keuangan OJK — 50% kebutuhan, 30% keinginan, 20% tabungan dan investasi.</li>
      <li>UMP DKI Jakarta 2025: ${fmtRp(HOUSEHOLD.umpJakarta2025)} — dipakai sebagai patokan upah minimum di halaman anggaran.</li>
      <li>Semua angka keluarga (pemasukan, anggaran tiap kategori, ${TRANSACTIONS.length} transaksi, target tabungan) adalah pembukuan contoh keluarga Prasetyo untuk November 2026. Total tiap kategori dihitung dari daftar transaksi — buka halaman <a href="#/pengeluaran">Pengeluaran</a> dan jumlahkan sendiri, hasilnya sama.</li>
      <li>Nama keluarga dan angkanya adalah contoh fiktif yang dibuat untuk situs ini, bukan data orang sungguhan.</li>
    </ul>
  </section>`;
}
