// RumahAnggaran — hand-rolled SVG charts. No library, no network: the site
// draws its own charts from the figures in data.js.

// One colour per spending category, kept the same on every page.
const CAT_COLORS = {
  belanja: '#1b7a4d',
  listrik: '#2e86ab',
  transport: '#e07a2f',
  pulsa: '#7c5cbf',
  kesehatan: '#c0392b',
  sekolah: '#0f766e',
  makan: '#b45309',
  hiburan: '#be185d',
  pakaian: '#4d7c0f',
  jalan: '#0369a1',
};
const GROUP_COLORS = { kebutuhan: '#1b7a4d', keinginan: '#e07a2f', tabungan: '#2e86ab' };

function fmtShort(n) {
  // Rp 2.865.000 -> "Rp 2,87 jt"; small values stay in thousands.
  if (n >= 1000000) return 'Rp ' + (n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' jt';
  if (n >= 1000) return 'Rp ' + Math.round(n / 1000) + ' rb';
  return 'Rp ' + n.toLocaleString('id-ID');
}

// Donut chart: slices are { label, value, color }. Returns an SVG string.
function donutChart(slices, size) {
  size = size || 220;
  const cx = size / 2, cy = size / 2, r = size / 2 - 14, inner = r - 34;
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  let a0 = -Math.PI / 2;
  const paths = slices.map((s) => {
    const a1 = a0 + (s.value / total) * Math.PI * 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const xi1 = cx + inner * Math.cos(a1), yi1 = cy + inner * Math.sin(a1);
    const xi0 = cx + inner * Math.cos(a0), yi0 = cy + inner * Math.sin(a0);
    a0 = a1;
    if (s.value <= 0) return '';
    return `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${xi1.toFixed(1)} ${yi1.toFixed(1)} A ${inner} ${inner} 0 ${large} 0 ${xi0.toFixed(1)} ${yi0.toFixed(1)} Z" fill="${s.color}"><title>${s.label}: ${fmtShort(s.value)}</title></path>`;
  }).join('');
  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Diagram lingkaran pengeluaran per kategori" width="${size}" height="${size}">${paths}<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="15" font-weight="700" fill="#1f2a24">Total</text><text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="13" fill="#5b6b62">${fmtShort(total)}</text></svg>`;
}

// Grouped bar chart: rows are { label, income, spent, saved } (amounts in Rp).
// Shows spent bars with a thin income marker; saved is drawn as a second bar.
function barChart(rows, opts) {
  opts = opts || {};
  const w = opts.width || 640, h = opts.height || 260, padL = 46, padB = 28, padT = 14;
  const max = Math.max.apply(null, rows.map((r) => Math.max(r.income, r.spent, r.saved))) * 1.08;
  const plotW = w - padL - 8, plotH = h - padT - padB;
  const bw = Math.min(34, (plotW / rows.length) * 0.42);
  const step = plotW / rows.length;
  const y = (v) => padT + plotH - (v / max) * plotH;
  let grid = '';
  for (let g = 0; g <= 4; g++) {
    const v = (max / 1.08) * (g / 4);
    const gy = y(v);
    grid += `<line x1="${padL}" y1="${gy}" x2="${w - 8}" y2="${gy}" stroke="#e3e8e4" stroke-width="1"/><text x="${padL - 6}" y="${gy + 4}" text-anchor="end" font-size="10" fill="#7a8a80">${fmtShort(v)}</text>`;
  }
  const bars = rows.map((r, i) => {
    const x = padL + i * step + (step - bw * 2 - 6) / 2;
    return `<rect x="${x.toFixed(1)}" y="${y(r.spent).toFixed(1)}" width="${bw}" height="${(plotH - (y(r.spent) - padT)).toFixed(1)}" rx="3" fill="#1b7a4d"><title>${r.label} — keluar ${fmtShort(r.spent)}</title></rect>` +
      `<rect x="${(x + bw + 6).toFixed(1)}" y="${y(r.saved).toFixed(1)}" width="${bw}" height="${(plotH - (y(r.saved) - padT)).toFixed(1)}" rx="3" fill="#2e86ab"><title>${r.label} — ditabung ${fmtShort(r.saved)}</title></rect>` +
      `<text x="${(padL + i * step + step / 2).toFixed(1)}" y="${h - 8}" text-anchor="middle" font-size="11" fill="#5b6b62">${r.label}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Grafik batang pengeluaran dan tabungan per bulan" width="100%" height="auto">${grid}${bars}</svg>`;
}

// Horizontal progress bar for a savings goal (0–100%).
function progressBar(pct, color) {
  const p = Math.max(0, Math.min(100, pct));
  return `<div class="progress" role="progressbar" aria-valuenow="${Math.round(p)}" aria-valuemin="0" aria-valuemax="100" aria-label="Progres tabungan ${Math.round(p)} persen"><div class="progress-fill" style="width:${p.toFixed(1)}%;background:${color}"></div></div>`;
}
