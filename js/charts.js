// Hand-rolled inline SVG chart markup generators — no charting library, no
// DOM access (return markup strings, same as every render* function in
// app.js). rangeDays: 7|30|90|365|Infinity.

function filterByRange(series, rangeDays) {
  if (rangeDays === Infinity) return series;
  const cutoff = new Date(Date.now() - rangeDays * 86400000);
  return series.filter(p => new Date(p.date) >= cutoff);
}

function renderLineChart(series, opts = {}) {
  const { rangeDays = 30, width = 320, height = 160, padding = 28, valueSuffix = 'kg' } = opts;
  const points = filterByRange(series, rangeDays);
  if (points.length === 0) return '<p class="empty-state">No data in this range yet.</p>';

  const values = points.map(p => p.value);
  const minV = Math.min(...values), maxV = Math.max(...values);
  const spanV = maxV - minV || 1;
  const innerW = width - padding * 2, innerH = height - padding * 2;

  const coords = points.map((p, i) => ({
    x: padding + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW),
    y: padding + innerH - ((p.value - minV) / spanV) * innerH,
    value: p.value, date: p.date
  }));

  const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const dots = coords.map(c => `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="3" class="chart-dot" data-date="${c.date}" data-value="${c.value}"><title>${c.date}: ${c.value}${valueSuffix}</title></circle>`).join('');
  const maxDot = coords.reduce((a, b) => (b.value > a.value ? b : a));

  return `
    <svg viewBox="0 0 ${width} ${height}" class="line-chart">
      <path d="${pathD}" fill="none" stroke="var(--accent)" stroke-width="2"/>
      ${dots}
      <circle cx="${maxDot.x.toFixed(1)}" cy="${maxDot.y.toFixed(1)}" r="4.5" class="pr-dot"><title>Best: ${maxDot.value}${valueSuffix}</title></circle>
      <text x="${padding}" y="${height - 6}" class="chart-label">${points[0].date}</text>
      <text x="${width - padding}" y="${height - 6}" class="chart-label" text-anchor="end">${points[points.length - 1].date}</text>
    </svg>`;
}

// dateValueMap: { 'YYYY-MM-DD': true }, weeks: number of week-columns.
function renderHeatmap(dateValueMap, opts = {}) {
  const { weeks = 18 } = opts;
  const cellSize = 13, gap = 3;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalDays = weeks * 7;
  const start = new Date(today.getTime() - (totalDays - 1) * 86400000);
  // Align start to a Monday so columns read as clean weeks.
  const startDow = (start.getDay() + 6) % 7; // 0=mon
  start.setDate(start.getDate() - startDow);

  const cells = [];
  for (let w = 0; w < weeks + 1; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(start.getTime() + (w * 7 + d) * 86400000);
      if (date > today) continue;
      const key = date.toISOString().slice(0, 10);
      const trained = !!dateValueMap[key];
      const x = w * (cellSize + gap);
      const y = d * (cellSize + gap);
      cells.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="3" class="${trained ? 'heatmap-on' : 'heatmap-off'}"><title>${key}${trained ? ' — trained' : ''}</title></rect>`);
    }
  }
  const svgWidth = (weeks + 1) * (cellSize + gap);
  const svgHeight = 7 * (cellSize + gap);
  return `<svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="heatmap">${cells.join('')}</svg>`;
}
