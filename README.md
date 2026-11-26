# household-budget-site

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/bodropp/household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/bodropp/household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

**RumahAnggaran — Anggaran Rumah Tangga Keluarga Prasetyo**: a static household budget
site for an Indonesian family of four in Jakarta, in Bahasa Indonesia. Six pages
(hash routes): a dashboard with the month at a glance, a 50/30/20 budget planner
with a working calculator, an expense tracker with add / filter / delete, savings
goals with working contributions, monthly reports with charts and insights, and a
guide to the method. Charts are hand-rolled SVG from embedded data — no libraries,
no framework, no network requests at all.

Every figure is a real figure of the example household for November 2026.
Highlights: pemasukan Rp 12.500.000/bulan, pengeluaran s.d. 26 Nov Rp 9.725.000,
tabungan Rp 2.500.000 (20%), dana darurat Rp 18.750.000 dari target Rp 30.000.000.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — or serve `app/` with any static HTTP server (`python3 -m http.server` from `app/`).
No build step, no install.

## Method & references

- **Metode 50/30/20** — 50% kebutuhan, 30% keinginan, 20% tabungan (OJK / literasi keuangan).
- **UMP DKI Jakarta 2025 Rp 5.396.761** — patokan upah minimum sebagai konteks pemasukan.
- Figures for the Prasetyo household (income, budgets, 42 transactions, savings goals)
  are the example family's own November 2026 books, kept consistent across every page:
  category totals are computed from the transaction list, never typed twice.

See the **Panduan** page in the site for the method, practical tips, and sources.

---

<sub>Entered on [make.fun](https://make.fun/?ref=tvfbjxfd&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>
