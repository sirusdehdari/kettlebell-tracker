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

// A horizontal, scrollable, chronological row of clickable "ticks" — one per
// logged session, oldest to newest. Each tick reuses the data-history-id
// attribute that app.js already wires up generically to open the session's
// edit/detail popup, so no separate click-handling code is needed here.
function renderTimeline(entries) {
  if (entries.length === 0) return '<p class="empty-state">No sessions logged in this time period.</p>';
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const ticks = sorted.map(h => {
    const kind = h.complexSnapshot ? 'kb' : 'activity';
    const shortLabel = h.date.slice(5).replace('-', '/');
    return `<button type="button" class="timeline-tick" data-history-id="${h.id}">
      <span class="tick-dot tick-${kind}"></span>
      <span class="tick-date">${shortLabel}</span>
    </button>`;
  }).join('');
  return `<div class="timeline-scroll"><div class="timeline-track">${ticks}</div></div>`;
}
