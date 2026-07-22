const STORAGE_KEY = 'kbapp_state_v1';

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.schedule && parsed.movements && parsed.exercises) return parsed;
    }
  } catch (e) { /* fall through to defaults */ }
  return {
    meta: { schemaVersion: 1 },
    movements: JSON.parse(JSON.stringify(MOVEMENTS)),
    exercises: JSON.parse(JSON.stringify(EXERCISES)),
    activities: JSON.parse(JSON.stringify(ACTIVITIES)),
    schedule: JSON.parse(JSON.stringify(WEEKLY_SCHEDULE)),
    pendingChanges: JSON.parse(JSON.stringify(PENDING_CHANGES_SEED)),
    history: []
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------- DATE / DAY HELPERS ----------

function todayStr() { return new Date().toISOString().slice(0, 10); }

function jsDayToKey(jsDay) { return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][jsDay]; }

function todayDayKey() { return jsDayToKey(new Date().getDay()); }

function uid(prefix) { return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`; }

// ---------- HISTORY LOOKUP HELPERS ----------

function getLastWeightForExercise(exerciseId, fallback) {
  const sorted = [...state.history].sort((a, b) => b.date.localeCompare(a.date));
  for (const h of sorted) {
    if (!h.complexSnapshot) continue;
    const match = h.complexSnapshot.exercises.find(e => e.exerciseId === exerciseId);
    if (match) return match.weightKg;
  }
  return fallback;
}

function getLastActivityFields(activityId) {
  const sorted = [...state.history].sort((a, b) => b.date.localeCompare(a.date));
  for (const h of sorted) {
    const match = h.activitiesSnapshot.find(a => a.activityId === activityId);
    if (match) return match.fields;
  }
  return {};
}

// ---------- MUSCLE SUMMARY MARKUP ----------

function renderMuscleSummary(primarySet, secondarySet) {
  const p = [...primarySet], s = [...secondarySet];
  if (p.length === 0 && s.length === 0) return '<p class="empty-state" style="padding:8px">No muscles tagged yet.</p>';
  return `<div class="pill-row">
    ${p.map(m => `<span class="pill" style="background:var(--muscle-primary);color:white">${MUSCLE_LABELS[m]}</span>`).join('')}
    ${s.map(m => `<span class="pill" style="background:var(--muscle-secondary);color:#5a3d00">${MUSCLE_LABELS[m]}</span>`).join('')}
  </div>`;
}

function exerciseSubLabel(exercise) {
  return exercise.movementIds.map(id => (state.movements[id] || {}).name || '?').join(' → ');
}

// ---------- GENERIC ORDERED PICKER (search-to-add + up/down arrows) ----------
// Rebuilds all markup on every change (rows + results) rather than patching
// the DOM incrementally — avoids the "select has no options yet" class of
// bugs entirely, since nothing is ever queried before its content exists.

function wireOrderedPicker(config) {
  let current = config.initial.map(x => ({ ...x }));
  let activeCategory = 'all';

  function fireChange() { if (config.onChange) config.onChange(current); }

  function renderRows() {
    config.rowsEl.innerHTML = current.map((entry, idx) => {
      const item = config.library[entry.id];
      if (!item) return '';
      const name = config.getName(item);
      const sub = config.getSub ? config.getSub(item) : '';
      const extraSelect = config.extraField
        ? `<select class="field timing-select" data-idx="${idx}">${config.extraField.options.map(o => `<option value="${o}" ${o === entry.extra ? 'selected' : ''}>${config.extraField.labels[o]}</option>`).join('')}</select>`
        : '';
      return `<div class="picker-row" data-idx="${idx}">
        <div class="picker-row-name">${name}${sub ? `<div class="picker-row-sub">${sub}</div>` : ''}</div>
        ${extraSelect}
        <div class="picker-row-btns">
          <button type="button" class="up-btn" ${idx === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" class="down-btn" ${idx === current.length - 1 ? 'disabled' : ''}>↓</button>
          <button type="button" class="remove-btn">✕</button>
        </div>
      </div>`;
    }).join('') || '<p class="empty-state" style="padding:14px">Nothing added yet — search below.</p>';

    config.rowsEl.querySelectorAll('.picker-row').forEach(row => {
      const idx = Number(row.dataset.idx);
      const upBtn = row.querySelector('.up-btn');
      const downBtn = row.querySelector('.down-btn');
      if (upBtn) upBtn.addEventListener('click', () => {
        if (idx > 0) { [current[idx - 1], current[idx]] = [current[idx], current[idx - 1]]; renderRows(); fireChange(); }
      });
      if (downBtn) downBtn.addEventListener('click', () => {
        if (idx < current.length - 1) { [current[idx + 1], current[idx]] = [current[idx], current[idx + 1]]; renderRows(); fireChange(); }
      });
      row.querySelector('.remove-btn').addEventListener('click', () => {
        current.splice(idx, 1); renderRows(); renderResults(config.searchInputEl ? config.searchInputEl.value : ''); fireChange();
      });
      const sel = row.querySelector('.timing-select');
      if (sel) sel.addEventListener('change', () => { current[idx].extra = sel.value; fireChange(); });
    });
  }

  function renderResults(query) {
    if (!config.resultsEl) return;
    const capped = !!config.maxItems && current.length >= config.maxItems;
    if (capped) {
      config.resultsEl.innerHTML = `<p class="picker-cap-note" style="padding:10px">Maximum of ${config.maxItems} reached — remove one to add another.</p>`;
      return;
    }
    const pickedIds = current.map(c => c.id);
    const q = (query || '').trim().toLowerCase();
    const matches = Object.values(config.library)
      .filter(item => !pickedIds.includes(item.id))
      .filter(item => !config.filterPredicate || config.filterPredicate(item))
      .filter(item => activeCategory === 'all' || (config.getCategory && config.getCategory(item) === activeCategory))
      .filter(item => !q || config.getName(item).toLowerCase().includes(q))
      .sort((a, b) => config.getName(a).localeCompare(config.getName(b)))
      .slice(0, 30);
    config.resultsEl.innerHTML = matches.map(item => `
      <button type="button" class="picker-search-result" data-id="${item.id}">
        ${config.getName(item)}
        ${config.getSub ? `<div class="result-sub">${config.getSub(item)}</div>` : ''}
      </button>
    `).join('') || '<p class="empty-state" style="padding:10px">No matches.</p>';

    config.resultsEl.querySelectorAll('.picker-search-result').forEach(btn => {
      btn.addEventListener('click', () => {
        if (config.maxItems && current.length >= config.maxItems) return;
        current.push({ id: btn.dataset.id, extra: config.extraField ? config.extraField.default : undefined });
        if (config.searchInputEl) config.searchInputEl.value = '';
        renderRows(); renderResults(''); fireChange();
      });
    });
  }

  if (config.searchInputEl) {
    config.searchInputEl.addEventListener('input', () => renderResults(config.searchInputEl.value));
  }
  if (config.categoryChipsEl && config.categories) {
    config.categoryChipsEl.innerHTML = config.categories.map(c => `<button type="button" class="chip ${c.value === 'all' ? 'active' : ''}" data-cat="${c.value}">${c.label}</button>`).join('');
    config.categoryChipsEl.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        activeCategory = chip.dataset.cat;
        config.categoryChipsEl.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === chip));
        renderResults(config.searchInputEl ? config.searchInputEl.value : '');
      });
    });
  }

  renderRows();
  renderResults('');

  return { getList: () => current.map(x => ({ ...x })) };
}

// ---------- NAVIGATION ----------

const VIEWS = ['week', 'muscles', 'history', 'more'];
let currentView = 'week';
let selectedDayKey = null;
let muscleViewState = { selectedDay: 'week', side: 'front' };
let historyViewState = { exerciseId: null, rangeDays: 30 };

function goTo(view) {
  currentView = view;
  selectedDayKey = null;
  render();
  window.scrollTo(0, 0);
}

function goToDay(dayKey) {
  currentView = 'day';
  selectedDayKey = dayKey;
  render();
  window.scrollTo(0, 0);
}

function render() {
  document.querySelectorAll('.tabbar button').forEach(b => {
    b.classList.toggle('active', b.dataset.view === currentView || (currentView === 'day' && b.dataset.view === 'week'));
  });
  const el = document.getElementById('view');
  if (currentView === 'week') el.innerHTML = renderWeek();
  else if (currentView === 'day') el.innerHTML = renderDayDetail(selectedDayKey);
  else if (currentView === 'muscles') el.innerHTML = renderMuscles();
  else if (currentView === 'history') el.innerHTML = renderHistory();
  else if (currentView === 'more') el.innerHTML = renderMore();
  attachViewHandlers();
}

// ---------- WARNINGS BADGE (compact, click to see the list in a popup) ----------

function renderWarningBadge(warnings, scope) {
  if (warnings.length === 0) return '';
  const label = warnings.length === 1 ? '1 warning' : `${warnings.length} warnings`;
  return `<button type="button" class="warning-badge" data-warnings-scope="${scope}">⚠️ ${label}</button>`;
}

function openWarningsModal(warnings) {
  const html = `
    <p class="modal-title">Warnings</p>
    ${warnings.map(w => `<div class="${w.severity === 'warn' ? 'modal-warning' : 'modal-info'}">${w.severity === 'warn' ? '⚠️' : '💡'} ${w.message}</div>`).join('')}
  `;
  openModal(html);
  document.getElementById('modal-close').classList.add('danger');
}

// ---------- WEEK VIEW ----------

function dayTypeLabel(day) {
  const bits = [];
  if (day.complex) bits.push(`Kettlebell (${day.complex.targetWeightKg}kg)`);
  const cats = new Set(day.activities.map(a => (state.activities[a.activityId] || {}).category).filter(Boolean));
  if (cats.has('cardio-sport')) bits.push([...cats].filter(c => c === 'cardio-sport').length ? 'Cardio/sport' : '');
  if (cats.has('plyometric')) bits.push('Plyometrics');
  if (cats.has('calisthenics')) bits.push('Calisthenics');
  if (!day.complex && cats.has('strength-extra')) bits.push('Rehab/stretch');
  return bits.filter(Boolean).join(' + ') || 'Rest';
}

function renderWeek() {
  const warnings = getAllWarnings(state);
  const weekWarnings = warnings.filter(w => w.scope === 'week');
  return `
    <h2>This week</h2>
    <button class="chip active" id="log-today-btn" style="width:100%;padding:12px;margin-bottom:16px;font-size:0.9rem">📝 Log today's workout</button>
    ${renderWarningBadge(weekWarnings, 'week')}
    <div style="margin-top:14px">
      ${DAY_ORDER.map(dayKey => {
        const day = state.schedule[dayKey];
        return `
        <button class="day-row" data-day="${dayKey}">
          <div class="day-abbr">${DAY_LABELS_SHORT[dayKey].toUpperCase()}</div>
          <div class="day-main">
            <div class="day-name">${DAY_LABELS[dayKey]}</div>
            <div class="day-sub">${dayTypeLabel(day)}</div>
          </div>
          ${day.complex ? `<div class="day-weight">${day.complex.targetWeightKg}kg</div>` : ''}
        </button>`;
      }).join('')}
    </div>
  `;
}

// ---------- DAY DETAIL VIEW ----------

function renderDayDetail(dayKey) {
  const day = state.schedule[dayKey];
  const warnings = getAllWarnings(state).filter(w => w.dayKey === dayKey);
  const { primary, secondary } = getDayMuscles(state, dayKey);

  const exerciseRows = day.complex ? day.complex.exerciseIds.map(exId => {
    const ex = state.exercises[exId];
    if (!ex) return '';
    const lastWeight = getLastWeightForExercise(exId, day.complex.targetWeightKg);
    return `
      <div class="exercise-row" data-exercise-remove="${exId}">
        <div class="ex-main">
          <div class="ex-name">${ex.name}</div>
          <div class="ex-sub">${exerciseSubLabel(ex)} · last: ${lastWeight}kg</div>
        </div>
        <button type="button" class="remove-btn" data-remove-exercise="${exId}" title="Remove from complex">✕</button>
      </div>`;
  }).join('') : '';

  const activityGroups = { before: [], standalone: [], after: [] };
  day.activities.forEach(a => {
    const act = state.activities[a.activityId];
    if (!act) return;
    activityGroups[a.timing].push({ ...a, act });
  });
  function renderActivityGroup(label, list) {
    if (list.length === 0) return '';
    return `<div class="section-title">${label}</div>` + list.map(({ activityId, act }) => `
      <div class="activity-row">
        <div class="act-main">
          <div class="act-name">${act.name}</div>
          <div class="act-sub">${CATEGORY_LABELS[act.category]}${act.impactLevel === 'high' ? ' · high impact' : ''}</div>
        </div>
        <button type="button" class="remove-btn" data-remove-activity="${activityId}" title="Remove">✕</button>
      </div>`).join('');
  }

  return `
    <button class="link-btn" id="back-to-week">← Week</button>
    <h2>${DAY_LABELS[dayKey]}</h2>
    ${day.complex ? `<p class="modal-sub">${day.complex.focusNote}</p>` : ''}
    ${day.notes ? `<p class="modal-sub">${day.notes}</p>` : ''}

    ${renderWarningBadge(warnings, 'day')}

    ${day.complex ? `
    <div class="section-title" style="margin-top:20px">Kettlebell complex — ${day.complex.targetWeightKg}kg</div>
    ${exerciseRows}
    ` : '<div class="empty-state">No kettlebell complex scheduled this day.</div>'}

    ${renderActivityGroup('Before', activityGroups.before)}
    ${renderActivityGroup(day.complex ? 'Extras (after complex)' : 'Activities', activityGroups.standalone.concat(activityGroups.after))}

    <div class="section-title">Muscles targeted today</div>
    <div class="bodymap-wrap">${renderBodyMapSVG()}</div>
    ${renderMuscleSummary(primary, secondary)}

    <div class="action-row">
      <button class="chip active" id="log-day-btn">📝 Log this day</button>
      <button class="chip" id="edit-complex-btn">Edit complex</button>
      <button class="chip" id="edit-activities-btn">Edit activities</button>
      <button class="chip" id="reset-day-btn" style="color:#922B21">Reset day</button>
    </div>
  `;
}

// ---------- COMPLEX EDITOR ----------

function openComplexEditorModal(dayKey) {
  const day = state.schedule[dayKey];
  const html = `
    <p class="modal-title">Edit ${DAY_LABELS[dayKey]}'s complex</p>
    <div class="modal-section">
      <p class="modal-section-title">Target weight (kg)</p>
      <input type="number" class="field" id="complex-weight" min="0" step="1" value="${day.complex ? day.complex.targetWeightKg : 16}">
    </div>
    <div class="modal-section">
      <p class="modal-section-title">Focus / why</p>
      <textarea class="field" id="complex-focus">${day.complex ? day.complex.focusNote : ''}</textarea>
    </div>
    <div class="modal-section">
      <p class="modal-section-title">Exercises (max 6, ordered)</p>
      <div class="picker-rows" id="complex-rows"></div>
      <div class="picker-search">
        <input type="text" class="field" id="complex-search" placeholder="Search exercises…">
        <div class="picker-search-results" id="complex-results"></div>
      </div>
    </div>
    <div class="modal-section">
      <button class="chip active" style="width:100%;padding:10px" id="complex-save-btn">Save complex</button>
    </div>
  `;
  openModal(html);

  const picker = wireOrderedPicker({
    rowsEl: document.getElementById('complex-rows'),
    searchInputEl: document.getElementById('complex-search'),
    resultsEl: document.getElementById('complex-results'),
    library: state.exercises,
    getName: item => item.name,
    getSub: item => exerciseSubLabel(item),
    filterPredicate: item => item.status === 'active',
    initial: day.complex ? day.complex.exerciseIds.map(id => ({ id })) : [],
    maxItems: 6
  });

  document.getElementById('complex-save-btn').addEventListener('click', () => {
    const exerciseIds = picker.getList().map(x => x.id);
    if (exerciseIds.length === 0) { alert('Add at least one exercise.'); return; }
    day.complex = {
      exerciseIds,
      targetWeightKg: Number(document.getElementById('complex-weight').value) || 0,
      focusNote: document.getElementById('complex-focus').value.trim()
    };
    saveState(); closeModal(); render();
  });
}

// ---------- ACTIVITIES EDITOR ----------

function openActivitiesEditorModal(dayKey) {
  const day = state.schedule[dayKey];
  const html = `
    <p class="modal-title">Edit ${DAY_LABELS[dayKey]}'s activities</p>
    <div class="modal-section">
      <p class="modal-section-title">Filter by category</p>
      <div class="filter-bar" id="activity-cat-chips"></div>
    </div>
    <div class="modal-section">
      <p class="modal-section-title">Activities (ordered)</p>
      <div class="picker-rows" id="activity-rows"></div>
      <div class="picker-search">
        <input type="text" class="field" id="activity-search" placeholder="Search activities…">
        <div class="picker-search-results" id="activity-results"></div>
      </div>
    </div>
    <div class="modal-section">
      <p class="modal-section-title">Day notes</p>
      <textarea class="field" id="day-notes">${day.notes || ''}</textarea>
    </div>
    <div class="modal-section">
      <button class="chip active" style="width:100%;padding:10px" id="activities-save-btn">Save activities</button>
    </div>
  `;
  openModal(html);

  const picker = wireOrderedPicker({
    rowsEl: document.getElementById('activity-rows'),
    searchInputEl: document.getElementById('activity-search'),
    resultsEl: document.getElementById('activity-results'),
    categoryChipsEl: document.getElementById('activity-cat-chips'),
    categories: [{ value: 'all', label: 'All' }, ...ACTIVITY_CATEGORIES.map(c => ({ value: c, label: CATEGORY_LABELS[c] }))],
    library: state.activities,
    getName: item => item.name,
    getSub: item => CATEGORY_LABELS[item.category],
    getCategory: item => item.category,
    initial: day.activities.map(a => ({ id: a.activityId, extra: a.timing })),
    maxItems: 14,
    extraField: { options: ['before', 'standalone', 'after'], labels: { before: 'Before', standalone: 'Standalone', after: 'After' }, default: 'standalone' }
  });

  document.getElementById('activities-save-btn').addEventListener('click', () => {
    day.activities = picker.getList().map((x, idx) => ({ activityId: x.id, timing: x.extra, order: idx }));
    day.notes = document.getElementById('day-notes').value.trim();
    saveState(); closeModal(); render();
  });
}

// ---------- LOG TODAY / LOG DAY ----------

function openLogModal(dayKey) {
  const day = state.schedule[dayKey];
  const dateDefault = todayStr();

  const exerciseFields = day.complex ? day.complex.exerciseIds.map(exId => {
    const ex = state.exercises[exId];
    const lastWeight = getLastWeightForExercise(exId, day.complex.targetWeightKg);
    return `
      <div class="exercise-row">
        <div class="ex-main"><div class="ex-name">${ex.name}</div></div>
        <div class="ex-weight"><input type="number" class="field" data-log-exercise="${exId}" value="${lastWeight}" step="1"> kg</div>
      </div>`;
  }).join('') : '';

  const activityFields = day.activities.map(a => {
    const act = state.activities[a.activityId];
    if (!act) return '';
    const last = getLastActivityFields(a.activityId);
    const fields = [];
    if (act.logFields.weight) fields.push(`<label style="font-size:0.7rem;color:var(--muted)">kg<input type="number" class="field" data-log-activity-field="${a.activityId}:weight" value="${last.weightKg || ''}" step="1"></label>`);
    if (act.logFields.duration) fields.push(`<label style="font-size:0.7rem;color:var(--muted)">min<input type="number" class="field" data-log-activity-field="${a.activityId}:duration" value="${last.durationMin || ''}" step="1"></label>`);
    if (act.logFields.distance) fields.push(`<label style="font-size:0.7rem;color:var(--muted)">km<input type="number" class="field" data-log-activity-field="${a.activityId}:distance" value="${last.distanceKm || ''}" step="0.1"></label>`);
    if (act.logFields.pace) fields.push(`<label style="font-size:0.7rem;color:var(--muted)">pace<input type="text" class="field" data-log-activity-field="${a.activityId}:pace" value="${last.pace || ''}" placeholder="5:30/km"></label>`);
    return `
      <div class="activity-row" style="align-items:flex-start">
        <div class="act-main">
          <label style="display:flex;align-items:center;gap:6px">
            <input type="checkbox" data-log-activity-include="${a.activityId}" checked style="width:auto">
            <span class="act-name">${act.name}</span>
          </label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">${fields.join('')}</div>
        </div>
      </div>`;
  }).join('');

  const html = `
    <p class="modal-title">Log ${DAY_LABELS[dayKey]}</p>
    <div class="modal-section">
      <p class="modal-section-title">Date</p>
      <input type="text" class="field" id="log-date" value="${dateDefault}" placeholder="YYYY-MM-DD">
    </div>
    ${day.complex ? `<div class="modal-section"><p class="modal-section-title">Weight used per exercise</p>${exerciseFields}</div>` : ''}
    ${day.activities.length ? `<div class="modal-section"><p class="modal-section-title">Activities</p>${activityFields}</div>` : ''}
    <div class="modal-section">
      <p class="modal-section-title">Notes</p>
      <textarea class="field" id="log-notes" placeholder="How did it feel?"></textarea>
    </div>
    <div class="modal-section">
      <button class="chip active" style="width:100%;padding:10px" id="log-save-btn">Save session</button>
    </div>
  `;
  openModal(html);

  document.getElementById('log-save-btn').addEventListener('click', () => {
    const date = document.getElementById('log-date').value.trim() || dateDefault;
    let complexSnapshot = null;
    if (day.complex) {
      complexSnapshot = {
        exercises: day.complex.exerciseIds.map(exId => ({
          exerciseId: exId, name: state.exercises[exId].name,
          weightKg: Number(document.querySelector(`[data-log-exercise="${exId}"]`).value) || 0
        })),
        targetWeightKg: day.complex.targetWeightKg,
        focusNote: day.complex.focusNote
      };
    }
    const activitiesSnapshot = day.activities
      .filter(a => document.querySelector(`[data-log-activity-include="${a.activityId}"]`)?.checked)
      .map(a => {
        const act = state.activities[a.activityId];
        const fields = {};
        if (act.logFields.weight) fields.weightKg = Number(document.querySelector(`[data-log-activity-field="${a.activityId}:weight"]`)?.value) || undefined;
        if (act.logFields.duration) fields.durationMin = Number(document.querySelector(`[data-log-activity-field="${a.activityId}:duration"]`)?.value) || undefined;
        if (act.logFields.distance) fields.distanceKm = Number(document.querySelector(`[data-log-activity-field="${a.activityId}:distance"]`)?.value) || undefined;
        if (act.logFields.pace) fields.pace = document.querySelector(`[data-log-activity-field="${a.activityId}:pace"]`)?.value || undefined;
        return { activityId: a.activityId, name: act.name, category: act.category, timing: a.timing, fields };
      });

    state.history.push({
      id: uid('session'), date, dayOfWeek: dayKey,
      complexSnapshot, activitiesSnapshot,
      note: document.getElementById('log-notes').value.trim()
    });
    saveState(); closeModal(); render();
  });
}

// ---------- MUSCLES VIEW ----------

function renderMuscles() {
  const chips = ['week', ...DAY_ORDER];
  const coverage = getWeeklyCoverage(state);
  const weeklyWarnings = getAllWarnings(state).filter(w => w.scope === 'week');

  let primary, secondary;
  if (muscleViewState.selectedDay === 'week') {
    ({ primary, secondary } = mergeMuscleSets(DAY_ORDER.map(d => getDayMuscles(state, d))));
  } else {
    ({ primary, secondary } = getDayMuscles(state, muscleViewState.selectedDay));
  }

  return `
    <h2>Muscles</h2>
    <div class="filter-bar">
      ${chips.map(c => `<button class="chip ${muscleViewState.selectedDay === c ? 'active' : ''}" data-muscle-day="${c}">${c === 'week' ? 'Whole week' : DAY_LABELS_SHORT[c]}</button>`).join('')}
    </div>
    <div class="bodymap-controls">
      <button class="chip ${muscleViewState.side === 'front' ? 'active' : ''}" data-muscle-side="front">Front</button>
      <button class="chip ${muscleViewState.side === 'back' ? 'active' : ''}" data-muscle-side="back">Back</button>
    </div>
    <div class="bodymap-wrap">${renderBodyMapSVG()}</div>
    <div class="bodymap-legend">
      <span><span class="swatch" style="background:var(--muscle-primary)"></span>Primary</span>
      <span><span class="swatch" style="background:var(--muscle-secondary)"></span>Secondary</span>
      <span><span class="swatch" style="background:var(--muscle-none)"></span>None</span>
    </div>
    ${renderMuscleSummary(primary, secondary)}

    <div class="section-title">Weekly coverage</div>
    <div class="table-wrap">
      <table class="coverage-table">
        <thead><tr><th>Muscle</th>${DAY_ORDER.map(d => `<th>${DAY_LABELS_SHORT[d]}</th>`).join('')}</tr></thead>
        <tbody>
          ${MUSCLE_GROUPS.map(m => `
            <tr>
              <td>${m.label}</td>
              ${DAY_ORDER.map(d => {
                const isP = coverage[m.key].primaryDays.includes(d);
                const isS = coverage[m.key].secondaryDays.includes(d);
                return `<td>${isP ? '<span class="coverage-dot p"></span>' : isS ? '<span class="coverage-dot s"></span>' : ''}</td>`;
              }).join('')}
            </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="section-title">Gaps &amp; notes</div>
    ${weeklyWarnings.length ? weeklyWarnings.map(w => `<div class="modal-info">💡 ${w.message}</div>`).join('') : '<p class="empty-state">No weekly gaps flagged right now.</p>'}
  `;
}

// ---------- HISTORY VIEW ----------

const RANGE_PRESETS = [[7, '7d'], [30, '30d'], [90, '90d'], [365, '1y'], [Infinity, 'All']];

function renderRangeChips(activeRangeDays) {
  return `<div class="range-chips">
    ${RANGE_PRESETS.map(([val, label]) => `<button class="chip ${activeRangeDays === val ? 'active' : ''}" data-range="${val === Infinity ? 'inf' : val}">${label}</button>`).join('')}
  </div>`;
}

function renderHistory() {
  const exercisesWithHistory = getAllExerciseIdsWithHistory(state);
  if (!historyViewState.exerciseId && exercisesWithHistory.length) historyViewState.exerciseId = exercisesWithHistory[0];
  const wvl = getWeekVsLastWeek(state);
  const heatmapData = getHeatmapData(state);
  const visibleHistory = filterByRange(state.history, historyViewState.rangeDays).sort((a, b) => b.date.localeCompare(a.date));

  const chartSection = historyViewState.exerciseId ? `
    <div class="section-title">Weight trend — ${state.exercises[historyViewState.exerciseId]?.name || ''}</div>
    <select class="field" id="history-exercise-select" style="margin-bottom:8px">
      ${exercisesWithHistory.map(id => `<option value="${id}" ${id === historyViewState.exerciseId ? 'selected' : ''}>${state.exercises[id]?.name || id}</option>`).join('')}
    </select>
    ${renderLineChart(getExerciseWeightSeries(state, historyViewState.exerciseId), { rangeDays: historyViewState.rangeDays })}
  ` : '<p class="empty-state">Log a session to start seeing trends.</p>';

  const prSection = exercisesWithHistory.map(id => {
    const pr = getPersonalRecord(getExerciseWeightSeries(state, id));
    if (!pr) return '';
    return `<div class="pr-card"><span>${state.exercises[id]?.name || id}</span><span>${pr.value}kg (${pr.date})</span></div>`;
  }).join('');

  return `
    <h2>History</h2>
    <div class="section-title" style="margin-top:0">Time period</div>
    ${renderRangeChips(historyViewState.rangeDays)}

    <div class="week-compare">
      <div class="wc-box"><div class="wc-num">${wvl.thisWeekSessions}</div><div class="wc-label">Sessions this week</div></div>
      <div class="wc-box"><div class="wc-num">${wvl.lastWeekSessions}</div><div class="wc-label">Last week</div></div>
    </div>

    <div class="section-title">Training frequency</div>
    ${renderHeatmap(heatmapData)}

    ${chartSection}

    ${prSection ? `<div class="section-title">Personal records</div>${prSection}` : ''}

    <div class="section-title">Log (${historyViewState.rangeDays === Infinity ? 'all time' : RANGE_PRESETS.find(([v]) => v === historyViewState.rangeDays)[1]})</div>
    ${visibleHistory.length === 0 ? '<p class="empty-state">No sessions logged in this time period.</p>' :
      visibleHistory.map(h => `
        <div class="history-entry">
          <div class="he-top"><span>${DAY_LABELS[h.dayOfWeek]}</span><span>${h.date}</span></div>
          <div class="he-sub">${h.complexSnapshot ? `KB @ ${h.complexSnapshot.targetWeightKg}kg — ${h.complexSnapshot.exercises.map(e => `${e.name} (${e.weightKg}kg)`).join(', ')}` : ''}</div>
          ${h.activitiesSnapshot.length ? `<div class="he-sub">${h.activitiesSnapshot.map(a => a.name).join(', ')}</div>` : ''}
          ${h.note ? `<div class="he-note">"${h.note}"</div>` : ''}
        </div>
      `).join('')}
  `;
}

// ---------- MORE VIEW (pending changes, movements library, backup) ----------

function renderMore() {
  return `
    <h2>More</h2>

    <div class="section-title">Pending changes</div>
    ${state.pendingChanges.filter(p => p.status === 'pending').length === 0 ? '<p class="empty-state">Nothing queued.</p>' :
      state.pendingChanges.filter(p => p.status === 'pending').map(p => `
        <div class="pending-item">
          <div class="pi-text">${p.description}</div>
          <div class="pi-actions">
            <button class="chip" data-drop-pending="${p.id}">Drop</button>
            <button class="chip active" data-apply-pending="${p.id}">Mark applied</button>
          </div>
        </div>
      `).join('')}
    <button class="chip" id="add-pending-btn" style="margin-top:8px">+ Add a pending change</button>

    <div class="section-title">Exercises library</div>
    <p class="modal-sub">Movement chains used inside kettlebell complexes.</p>
    <button class="chip" id="add-exercise-btn" style="margin-bottom:8px">+ Add exercise</button>
    ${Object.values(state.exercises).sort((a, b) => a.name.localeCompare(b.name)).map(ex => `
      <div class="exercise-row" data-edit-exercise="${ex.id}">
        <div class="ex-main">
          <div class="ex-name">${ex.name} ${ex.status === 'future' ? '<span class="pill status-future">Future</span>' : ''}</div>
          <div class="ex-sub">${exerciseSubLabel(ex)}${ex.status === 'future' && ex.blockerNote ? ` · ${ex.blockerNote}` : ''}</div>
        </div>
      </div>
    `).join('')}

    <div class="section-title">Movements library</div>
    <p class="modal-sub">Atomic building blocks used to build kettlebell exercises.</p>
    <button class="chip" id="add-movement-btn" style="margin-bottom:8px">+ Add movement</button>
    ${Object.values(state.movements).sort((a, b) => a.name.localeCompare(b.name)).map(m => `
      <div class="exercise-row" data-movement="${m.id}">
        <div class="ex-main"><div class="ex-name">${m.name}</div><div class="ex-sub">${EQUIPMENT_LABELS[m.equipment]} · ${POSITION_LABELS[m.position]}</div></div>
      </div>
    `).join('')}

    <div class="section-title">Backup</div>
    <p class="modal-sub">Everything is stored locally on this phone only. Export a backup file occasionally as a safety net.</p>
    <div style="display:flex;gap:8px">
      <button class="chip active" id="export-btn" style="flex:1;padding:10px">Export</button>
      <button class="chip" id="import-btn" style="flex:1;padding:10px">Import</button>
    </div>
    <input type="file" id="import-file-input" accept="application/json" style="display:none">
  `;
}

function openAddPendingModal() {
  const html = `
    <p class="modal-title">Add a pending change</p>
    <div class="modal-section">
      <textarea class="field" id="pending-desc" placeholder="Describe the proposed change…"></textarea>
    </div>
    <div class="modal-section">
      <button class="chip active" style="width:100%;padding:10px" id="pending-save-btn">Add to queue</button>
    </div>
  `;
  openModal(html);
  document.getElementById('pending-save-btn').addEventListener('click', () => {
    const desc = document.getElementById('pending-desc').value.trim();
    if (!desc) return;
    state.pendingChanges.push({ id: uid('pending'), createdAt: new Date().toISOString(), targetType: 'day', targetId: null, description: desc, status: 'pending' });
    saveState(); closeModal(); render();
  });
}

function suggestExerciseName(movementIds) {
  return movementIds.map(id => (state.movements[id] || {}).name || '?').join(' to ');
}

function openExerciseEditorModal(exerciseId) {
  const existing = exerciseId ? state.exercises[exerciseId] : null;
  const activeExercises = Object.values(state.exercises).filter(e => e.status === 'active' && e.id !== exerciseId);

  const html = `
    <p class="modal-title">${existing ? 'Edit exercise' : 'New exercise'}</p>
    <div class="modal-section">
      <p class="modal-section-title">Movements (2-4, ordered)</p>
      <div class="picker-rows" id="ex-movement-rows"></div>
      <div class="picker-search">
        <input type="text" class="field" id="ex-movement-search" placeholder="Search movements…">
        <div class="picker-search-results" id="ex-movement-results"></div>
      </div>
    </div>
    <div class="modal-section">
      <p class="modal-section-title">Name (auto-suggested, editable)</p>
      <input type="text" class="field" id="ex-name" value="${existing ? existing.name : ''}">
    </div>
    <div class="modal-section">
      <p class="modal-section-title">Status</p>
      <div class="filter-bar">
        <button type="button" class="chip ${(!existing || existing.status === 'active') ? 'active' : ''}" data-ex-status="active">Active</button>
        <button type="button" class="chip ${existing && existing.status === 'future' ? 'active' : ''}" data-ex-status="future">Future / blocked</button>
      </div>
    </div>
    <div class="modal-section" id="ex-future-fields" style="display:${existing && existing.status === 'future' ? '' : 'none'}">
      <p class="modal-section-title">What's blocking it?</p>
      <input type="text" class="field" id="ex-blocker" value="${existing && existing.blockerNote ? existing.blockerNote : ''}" placeholder="e.g. needs snatch technique">
      <p class="modal-section-title" style="margin-top:10px">Replaces which active exercise once ready?</p>
      <select class="field" id="ex-replaces">
        <option value="">— None —</option>
        ${activeExercises.map(e => `<option value="${e.id}" ${existing && existing.replacesExerciseId === e.id ? 'selected' : ''}>${e.name}</option>`).join('')}
      </select>
    </div>
    <div class="modal-section">
      <button class="chip active" style="width:100%;padding:10px" id="ex-save-btn">Save exercise</button>
    </div>
    ${existing ? '<div class="modal-section"><button style="width:100%;padding:10px;background:none;border:none;color:#922B21;font-family:\'Inter\',sans-serif" id="ex-delete-btn">Delete exercise</button></div>' : ''}
  `;
  openModal(html);

  const nameInput = document.getElementById('ex-name');
  let nameManuallyEdited = !!existing;

  const picker = wireOrderedPicker({
    rowsEl: document.getElementById('ex-movement-rows'),
    searchInputEl: document.getElementById('ex-movement-search'),
    resultsEl: document.getElementById('ex-movement-results'),
    library: state.movements,
    getName: item => item.name,
    getSub: item => `${EQUIPMENT_LABELS[item.equipment]} · ${POSITION_LABELS[item.position]}`,
    initial: existing ? existing.movementIds.map(id => ({ id })) : [],
    maxItems: 4,
    onChange: (list) => {
      if (!nameManuallyEdited) nameInput.value = suggestExerciseName(list.map(x => x.id));
    }
  });

  nameInput.addEventListener('input', () => { nameManuallyEdited = true; });

  document.querySelectorAll('[data-ex-status]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-ex-status]').forEach(b => b.classList.toggle('active', b === btn));
    document.getElementById('ex-future-fields').style.display = btn.dataset.exStatus === 'future' ? '' : 'none';
  }));

  document.getElementById('ex-save-btn').addEventListener('click', () => {
    const movementIds = picker.getList().map(x => x.id);
    if (movementIds.length === 0) { alert('Add at least one movement.'); return; }
    const status = document.querySelector('[data-ex-status].active').dataset.exStatus;
    const name = nameInput.value.trim() || suggestExerciseName(movementIds);
    const id = exerciseId || uid('exercise');
    state.exercises[id] = {
      id, name, movementIds, status,
      blockerNote: status === 'future' ? (document.getElementById('ex-blocker').value.trim() || null) : null,
      replacesExerciseId: status === 'future' ? (document.getElementById('ex-replaces').value || null) : null
    };
    saveState(); closeModal(); render();
  });

  const deleteBtn = document.getElementById('ex-delete-btn');
  if (deleteBtn) deleteBtn.addEventListener('click', () => {
    if (!confirm(`Delete "${existing.name}"? It will also be removed from any day's complex that uses it.`)) return;
    DAY_ORDER.forEach(d => {
      const day = state.schedule[d];
      if (day.complex) day.complex.exerciseIds = day.complex.exerciseIds.filter(id => id !== exerciseId);
    });
    delete state.exercises[exerciseId];
    saveState(); closeModal(); render();
  });
}

function openMovementEditorModal() {
  const html = `
    <p class="modal-title">Add movement</p>
    <div class="modal-section">
      <p class="modal-section-title">Name</p>
      <input type="text" class="field" id="mv-name" placeholder="e.g. Bottoms-up press">
    </div>
    <div class="modal-section">
      <p class="modal-section-title">Equipment</p>
      <select class="field" id="mv-equipment">${EQUIPMENT_TYPES.map(e => `<option value="${e}">${EQUIPMENT_LABELS[e]}</option>`).join('')}</select>
    </div>
    <div class="modal-section">
      <p class="modal-section-title">Position</p>
      <select class="field" id="mv-position">${BODY_POSITIONS.map(p => `<option value="${p}">${POSITION_LABELS[p]}</option>`).join('')}</select>
    </div>
    <div class="modal-section">
      <p class="modal-section-title">Primary muscles</p>
      <div class="filter-bar" id="mv-primary-chips">${MUSCLE_GROUPS.map(m => `<button type="button" class="chip" data-mv-primary="${m.key}">${m.label}</button>`).join('')}</div>
    </div>
    <div class="modal-section">
      <p class="modal-section-title">Secondary muscles</p>
      <div class="filter-bar" id="mv-secondary-chips">${MUSCLE_GROUPS.map(m => `<button type="button" class="chip" data-mv-secondary="${m.key}">${m.label}</button>`).join('')}</div>
    </div>
    <div class="modal-section">
      <button class="chip active" style="width:100%;padding:10px" id="mv-save-btn">Save movement</button>
    </div>
  `;
  openModal(html);
  const primarySet = new Set(), secondarySet = new Set();
  document.querySelectorAll('[data-mv-primary]').forEach(btn => btn.addEventListener('click', () => {
    const k = btn.dataset.mvPrimary;
    primarySet.has(k) ? primarySet.delete(k) : primarySet.add(k);
    btn.classList.toggle('active');
  }));
  document.querySelectorAll('[data-mv-secondary]').forEach(btn => btn.addEventListener('click', () => {
    const k = btn.dataset.mvSecondary;
    secondarySet.has(k) ? secondarySet.delete(k) : secondarySet.add(k);
    btn.classList.toggle('active');
  }));
  document.getElementById('mv-save-btn').addEventListener('click', () => {
    const name = document.getElementById('mv-name').value.trim();
    if (!name) { alert('Give the movement a name.'); return; }
    const id = uid('movement');
    state.movements[id] = {
      id, name, primaryMuscles: [...primarySet], secondaryMuscles: [...secondarySet],
      equipment: document.getElementById('mv-equipment').value, position: document.getElementById('mv-position').value
    };
    saveState(); closeModal(); render();
  });
}

// ---------- BACKUP / RESTORE ----------

async function exportData() {
  const dataStr = JSON.stringify(state, null, 2);
  const filename = `kbtracker-backup-${todayStr()}.json`;
  const blob = new Blob([dataStr], { type: 'application/json' });

  if (navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: 'application/json' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Kettlebell Tracker – backup' });
        return;
      }
    } catch (e) { /* fall back to download */ }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importDataFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed.schedule || !parsed.movements) throw new Error('Invalid format');
      state = parsed;
      saveState(); render();
      alert('Data restored!');
    } catch (e) {
      alert('Could not read that file — is it a valid backup from this app?');
    }
  };
  reader.readAsText(file);
}

// ---------- MODAL (shared) ----------

function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-close').classList.remove('danger');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
function isModalOpen() { return document.getElementById('modal-overlay').classList.contains('open'); }

function refreshFromExternalChange() {
  state = loadState();
  if (isModalOpen()) closeModal();
  render();
}

// ---------- EVENT WIRING ----------

function attachViewHandlers() {
  // Warnings badge (Week + Day detail)
  document.querySelectorAll('[data-warnings-scope]').forEach(el => el.addEventListener('click', () => {
    const scope = el.dataset.warningsScope;
    const warnings = scope === 'week'
      ? getAllWarnings(state).filter(w => w.scope === 'week')
      : getAllWarnings(state).filter(w => w.dayKey === selectedDayKey);
    openWarningsModal(warnings);
  }));

  // Week
  document.querySelectorAll('.day-row[data-day]').forEach(el => el.addEventListener('click', () => goToDay(el.dataset.day)));
  const logTodayBtn = document.getElementById('log-today-btn');
  if (logTodayBtn) logTodayBtn.addEventListener('click', () => openLogModal(todayDayKey()));

  // Day detail
  const backBtn = document.getElementById('back-to-week');
  if (backBtn) backBtn.addEventListener('click', () => goTo('week'));
  const logDayBtn = document.getElementById('log-day-btn');
  if (logDayBtn) logDayBtn.addEventListener('click', () => openLogModal(selectedDayKey));
  const editComplexBtn = document.getElementById('edit-complex-btn');
  if (editComplexBtn) editComplexBtn.addEventListener('click', () => openComplexEditorModal(selectedDayKey));
  const editActivitiesBtn = document.getElementById('edit-activities-btn');
  if (editActivitiesBtn) editActivitiesBtn.addEventListener('click', () => openActivitiesEditorModal(selectedDayKey));
  const resetDayBtn = document.getElementById('reset-day-btn');
  if (resetDayBtn) resetDayBtn.addEventListener('click', () => {
    if (!confirm(`Reset ${DAY_LABELS[selectedDayKey]}? This clears the complex, activities, and notes for this day.`)) return;
    state.schedule[selectedDayKey] = { complex: null, activities: [], notes: '' };
    saveState(); render();
  });
  document.querySelectorAll('[data-remove-exercise]').forEach(el => el.addEventListener('click', (e) => {
    e.stopPropagation();
    const day = state.schedule[selectedDayKey];
    day.complex.exerciseIds = day.complex.exerciseIds.filter(id => id !== el.dataset.removeExercise);
    if (day.complex.exerciseIds.length === 0) day.complex = null;
    saveState(); render();
  }));
  document.querySelectorAll('[data-remove-activity]').forEach(el => el.addEventListener('click', (e) => {
    e.stopPropagation();
    const day = state.schedule[selectedDayKey];
    const idx = day.activities.findIndex(a => a.activityId === el.dataset.removeActivity);
    if (idx > -1) day.activities.splice(idx, 1);
    saveState(); render();
  }));

  // Muscles
  document.querySelectorAll('[data-muscle-day]').forEach(el => el.addEventListener('click', () => { muscleViewState.selectedDay = el.dataset.muscleDay; render(); }));
  document.querySelectorAll('[data-muscle-side]').forEach(el => el.addEventListener('click', () => { muscleViewState.side = el.dataset.muscleSide; render(); }));
  const bodymapSvg = document.getElementById('bodymap-svg');
  if (bodymapSvg) {
    setBodyMapView(bodymapSvg, muscleViewState.side);
    let primary, secondary;
    if (currentView === 'muscles') {
      if (muscleViewState.selectedDay === 'week') ({ primary, secondary } = mergeMuscleSets(DAY_ORDER.map(d => getDayMuscles(state, d))));
      else ({ primary, secondary } = getDayMuscles(state, muscleViewState.selectedDay));
    } else if (currentView === 'day') {
      ({ primary, secondary } = getDayMuscles(state, selectedDayKey));
    }
    if (primary) colorBodyMap(bodymapSvg, { primary, secondary });
  }

  // History
  const historySelect = document.getElementById('history-exercise-select');
  if (historySelect) historySelect.addEventListener('change', () => { historyViewState.exerciseId = historySelect.value; render(); });
  document.querySelectorAll('[data-range]').forEach(el => el.addEventListener('click', () => {
    historyViewState.rangeDays = el.dataset.range === 'inf' ? Infinity : Number(el.dataset.range);
    render();
  }));

  // More
  const addPendingBtn = document.getElementById('add-pending-btn');
  if (addPendingBtn) addPendingBtn.addEventListener('click', openAddPendingModal);
  document.querySelectorAll('[data-drop-pending]').forEach(el => el.addEventListener('click', () => {
    const p = state.pendingChanges.find(x => x.id === el.dataset.dropPending);
    if (p) p.status = 'dropped';
    saveState(); render();
  }));
  document.querySelectorAll('[data-apply-pending]').forEach(el => el.addEventListener('click', () => {
    const p = state.pendingChanges.find(x => x.id === el.dataset.applyPending);
    if (p) p.status = 'applied';
    saveState(); render();
  }));
  const addMovementBtn = document.getElementById('add-movement-btn');
  if (addMovementBtn) addMovementBtn.addEventListener('click', openMovementEditorModal);
  const addExerciseBtn = document.getElementById('add-exercise-btn');
  if (addExerciseBtn) addExerciseBtn.addEventListener('click', () => openExerciseEditorModal(null));
  document.querySelectorAll('[data-edit-exercise]').forEach(el => el.addEventListener('click', () => openExerciseEditorModal(el.dataset.editExercise)));

  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const importFileInput = document.getElementById('import-file-input');
  if (exportBtn) exportBtn.addEventListener('click', exportData);
  if (importBtn) importBtn.addEventListener('click', () => importFileInput.click());
  if (importFileInput) importFileInput.addEventListener('change', () => {
    if (importFileInput.files[0]) importDataFile(importFileInput.files[0]);
    importFileInput.value = '';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tabbar button').forEach(b => {
    b.addEventListener('click', () => goTo(b.dataset.view));
  });
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) refreshFromExternalChange();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshFromExternalChange();
  });

  render();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }
});
