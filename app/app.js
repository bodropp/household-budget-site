// RumahAnggaran — router and state. Hash routes, one page per tool; state
// (added/deleted expenses, goal contributions, budget edits) is kept in
// memory and persisted to localStorage so a refresh keeps the family's books.

window.__pageErrors = [];
window.addEventListener('error', (e) => window.__pageErrors.push(String(e.message || e.error)));

const STORE_KEY = 'rumahanggaran-v1';

function loadState() {
  const fresh = { addedTx: [], deletedTx: [], goalExtra: {}, budgetOverride: {}, incomeOverride: null, filterQ: '', filterCat: '' };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return fresh;
    const saved = JSON.parse(raw);
    return {
      addedTx: Array.isArray(saved.addedTx) ? saved.addedTx : [],
      deletedTx: Array.isArray(saved.deletedTx) ? saved.deletedTx : [],
      goalExtra: saved.goalExtra || {},
      budgetOverride: saved.budgetOverride || {},
      incomeOverride: saved.incomeOverride != null ? saved.incomeOverride : null,
      filterQ: '', filterCat: '',
    };
  } catch { return fresh; }
}

function saveState() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      addedTx: state.addedTx,
      deletedTx: state.deletedTx,
      goalExtra: state.goalExtra,
      budgetOverride: state.budgetOverride,
      incomeOverride: state.incomeOverride,
    }));
  } catch { /* private mode: the site still works in memory */ }
}

const state = loadState();

const ROUTES = [
  { route: '/', label: 'Beranda', view: viewDashboard },
  { route: '/anggaran', label: 'Anggaran', view: viewAnggaran },
  { route: '/pengeluaran', label: 'Pengeluaran', view: viewPengeluaran },
  { route: '/tabungan', label: 'Tabungan', view: viewTabungan },
  { route: '/laporan', label: 'Laporan', view: viewLaporan },
  { route: '/panduan', label: 'Panduan', view: viewPanduan },
];

function currentRoute() {
  const h = (location.hash || '#/').slice(1) || '/';
  return ROUTES.some((r) => r.route === h) ? h : '/';
}

function render() {
  const route = currentRoute();
  const main = document.getElementById('app');
  const view = ROUTES.find((r) => r.route === route).view;
  main.innerHTML = view(state);
  document.querySelectorAll('nav a').forEach((a) => {
    const on = a.getAttribute('href') === '#' + route;
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    a.classList.toggle('on', on);
  });
  document.title = 'RumahAnggaran — ' + ROUTES.find((r) => r.route === route).label;
  wirePage(route);
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function wirePage(route) {
  if (route === '/anggaran') {
    const incomeInput = document.getElementById('income-input');
    incomeInput.addEventListener('input', () => {
      const v = Number(incomeInput.value);
      if (v > 0) { state.incomeOverride = v; saveState(); }
      render();
      const again = document.getElementById('income-input');
      if (again) again.focus();
    });
    document.querySelectorAll('[data-budget-cat]').forEach((input) => {
      input.addEventListener('input', () => {
        const v = Number(input.value);
        if (v >= 0) { state.budgetOverride[input.dataset.budgetCat] = v; saveState(); }
        const msg = document.getElementById('budget-msg');
        render();
        const m2 = document.getElementById('budget-msg');
        if (m2 && msg) m2.textContent = 'Perubahan tersimpan otomatis.';
      });
    });
    document.getElementById('save-budget').addEventListener('click', () => {
      saveState();
      document.getElementById('budget-msg').textContent = 'Anggaran tersimpan di peramban ini.';
    });
    document.getElementById('reset-budget').addEventListener('click', () => {
      state.budgetOverride = {};
      state.incomeOverride = null;
      saveState();
      render();
      document.getElementById('budget-msg').textContent = 'Anggaran dikembalikan ke 50/30/20.';
    });
  }

  if (route === '/pengeluaran') {
    document.getElementById('add-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const amount = Number(f.amount.value);
      const date = f.date.value || '2026-11-26';
      state.addedTx.push({
        id: 'u' + Date.now(),
        date,
        desc: f.desc.value.trim(),
        cat: f.cat.value,
        amount,
      });
      saveState();
      render();
      document.getElementById('add-msg').textContent =
        `Ditambahkan: ${f.desc.value.trim()} — ${fmtRp(amount)}. Total pengeluaran sekarang ${fmtRp(totalSpent(state))}.`;
    });
    document.getElementById('filter-cat').addEventListener('change', (e) => {
      state.filterCat = e.target.value;
      render();
    });
    document.getElementById('filter-q').addEventListener('input', (e) => {
      state.filterQ = e.target.value;
      render();
      const again = document.getElementById('filter-q');
      if (again) {
        again.focus();
        try { again.setSelectionRange(again.value.length, again.value.length); } catch { /* search input only */ }
      }
    });
    document.getElementById('reset-data').addEventListener('click', () => {
      state.addedTx = [];
      state.deletedTx = [];
      state.goalExtra = {};
      state.budgetOverride = {};
      state.incomeOverride = null;
      saveState();
      render();
    });
    document.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.del;
        if (id.startsWith('u')) state.addedTx = state.addedTx.filter((t) => t.id !== id);
        else if (!state.deletedTx.includes(id)) state.deletedTx.push(id);
        saveState();
        render();
      });
    });
  }

  if (route === '/tabungan') {
    document.querySelectorAll('.goal-form').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = form.dataset.goal;
        const amount = Number(form.amount.value);
        if (!(amount > 0)) return;
        state.goalExtra[id] = (state.goalExtra[id] || 0) + amount;
        saveState();
        render();
        const again = document.querySelector(`.goal-form[data-goal="${id}"] .goal-msg`);
        if (again) again.textContent = `Setoran ${fmtRp(amount)} dicatat. Terima kasih!`;
      });
    });
  }
}

window.addEventListener('hashchange', render);
render();
