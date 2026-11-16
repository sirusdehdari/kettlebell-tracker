// The key name predates the programs split; the shape of the data inside is
// versioned by meta.schemaVersion and upgraded by migrateState().
const STORAGE_KEY = 'kbapp_state_v1';
// Per-device view preference (which tab was open last) — not program data,
// so it lives outside the backed-up state.
const UI_KEY = 'kbapp_ui_v1';
// v3: v2 plus meta.appliedUpdates (PROGRAM_UPDATES applied to existing data).
const SCHEMA_VERSION = 3;
const PRE_MIGRATION_BACKUP_KEY = `kbapp_backup_before_v${SCHEMA_VERSION}`;

function clone(value) { return JSON.parse(JSON.stringify(value)); }

// Declared before the first loadState() call below: loadState() runs during
// boot and may set them (a `let` further down would still be in its TDZ).
let unsavedChanges = false;      // memory holds edits that never reached storage
let saveFailureReported = false;
let storageLocked = false;       // stored data couldn't be read or set aside: never overwrite it
let loadNotice = null;           // shown once, after the render that follows loadState()
const LOCKED_NOTICE = 'Your saved data could not be read, and there was no room to set it aside. To protect it, the app won\'t save anything until this is fixed.';

// The service worker serves files one by one (network first, its cache when
// that fails), so a bad connection during an update can leave a script from
// the previous release — or none — next to this app.js, which would then stop
// on a blank page. Check for what this release needs from each script, and
// that the seed files belong together; if not, touch no data, say so, and
// reload when reopened.
if ([typeof DAY_ORDER, typeof MOVEMENTS, typeof ACTIVITIES, typeof EXERCISES, typeof PROGRAM_2_COMPLEXES,
  typeof PROGRAM_2_ACTIVITY_CHANGES, typeof PROGRAM_2_DAY_NOTES, typeof PROGRAM_UPDATES, typeof getWeeklyCoverage,
  typeof getAllWarnings, typeof renderBodyMapSVG].includes('undefined') || !seedFilesBelongTogether()) {
  document.addEventListener('DOMContentLoaded', () => {
    const view = document.getElementById('view');
    if (view) view.innerHTML = '<div class="save-warning">Part of the update didn\'t load. Close the app and open it again with a connection — your data is untouched.</div>';
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') location.reload(); });
  throw new Error('Scripts from different releases on the page — app not started, no data touched.');
}

let state = loadState();

// Everything seed-program.js refers to exists in the loaded
// seed-movements.js and seed-activities.js (an older copy of either lacks
// what this release added). Only reads the seed globals, so it is safe to call
// before anything else in this file has run; anything unexpected counts as no.
function seedFilesBelongTogether() {
  try {
    const activityIds = [
      ...Object.values(WEEKLY_SCHEDULE).flatMap(day => (day.activities || []).map(a => a.activityId)),
      ...PROGRAM_2_ACTIVITY_CHANGES.flatMap(c => [c.activityId, c.replaceActivityId]).filter(Boolean)
    ];
    return Object.values(EXERCISES).every(e => (e.movementIds || []).every(id => MOVEMENTS[id]))
      && activityIds.every(id => ACTIVITIES[id]);
  } catch (e) {
    return false;
  }
}

// ---------- STATE: LOAD / MIGRATE / SAVE ----------

function seedLibraries() {
  return { movements: MOVEMENTS, exercises: EXERCISES, activities: ACTIVITIES };
}

function allSeedIds() {
  return Object.entries(seedLibraries()).flatMap(([group, lib]) => Object.keys(lib).map(id => `${group}:${id}`));
}

// Program 2 = a copy of the given Program 1 week with the four kettlebell
// complexes swapped for the new ones. Rehab, plyometrics, calisthenics,
// sports, extras and day notes are copied as they are (plus Program 2's own
// extras and day-note additions), and each new complex uses the same bell
// weight as Program 1's complex that day (the user adjusts those, e.g.
// Monday went 20 -> 16 kg after an injury).
function buildProgram2Schedule(baseSchedule) {
  const schedule = clone(baseSchedule || {});
  DAY_ORDER.forEach(d => {
    const day = schedule[d] || (schedule[d] = { complex: null, activities: [], notes: '' });
    if (!Array.isArray(day.activities)) day.activities = [];
    day.memos = {};
  });
  Object.entries(PROGRAM_2_COMPLEXES).forEach(([d, complex]) => {
    const programOneWeight = schedule[d].complex && Number(schedule[d].complex.targetWeightKg);
    schedule[d].complex = clone(complex);
    if (programOneWeight > 0) schedule[d].complex.targetWeightKg = programOneWeight;
  });
  PROGRAM_2_ACTIVITY_CHANGES.forEach(({ dayKey, activityId, replaceActivityId, timing }) => {
    const day = schedule[dayKey];
    if (!day) return;
    const idx = replaceActivityId ? day.activities.findIndex(a => a.activityId === replaceActivityId) : -1;
    if (idx > -1) {
      // If the replacement is already on the day, just drop the replaced one
      // rather than listing the same activity twice.
      const alreadyThere = day.activities.some((a, i) => i !== idx && a.activityId === activityId);
      if (alreadyThere) day.activities.splice(idx, 1);
      else day.activities.splice(idx, 1, { activityId, timing: day.activities[idx].timing, order: idx });
    } else if (!day.activities.some(a => a.activityId === activityId)) {
      day.activities.push({ activityId, timing: timing || 'after', order: 0 });
    }
    day.activities.forEach((a, i) => { a.order = i; });
  });
  Object.entries(PROGRAM_2_DAY_NOTES).forEach(([dayKey, note]) => {
    const day = schedule[dayKey];
    if (day) day.notes = [typeof day.notes === 'string' ? day.notes : '', note].filter(Boolean).join(' ');
  });
  return schedule;
}

// A program can only reference an exercise/activity the library lacks if
// the user didn't delete it (deleting an exercise in the app strips it from
// every program; movements and activities can't be deleted in the app) —
// e.g. a seed item an older install never received. Restore those from the
// seeds. Must never throw: a throw would make loadState treat the data as
// unreadable.
function repairProgramReferences(s) {
  const lib = seedLibraries();
  const restore = (group, id) => { if (id && !s[group][id] && lib[group][id]) s[group][id] = clone(lib[group][id]); };
  s.programs.forEach(p => DAY_ORDER.forEach(d => {
    const day = p.schedule[d];
    if (day.complex && Array.isArray(day.complex.exerciseIds)) day.complex.exerciseIds.forEach(id => restore('exercises', id));
    day.activities.forEach(a => restore('activities', a && a.activityId));
  }));
  Object.values(s.exercises).forEach(ex => {
    if (ex && Array.isArray(ex.movementIds)) ex.movementIds.forEach(m => restore('movements', m));
  });
}

function normalizeDays(s) {
  s.programs.forEach(p => {
    p.schedule = p.schedule || {};
    DAY_ORDER.forEach(d => {
      const day = p.schedule[d] || (p.schedule[d] = { complex: null, activities: [], notes: '' });
      if (!Array.isArray(day.activities)) day.activities = [];
      if (typeof day.notes !== 'string') day.notes = '';
      if (!day.memos || typeof day.memos !== 'object') day.memos = {};
    });
  });
}

// Adds seed items this install has never been offered (things shipped in an
// update after it was set up). Installs from before this bookkeeping existed
// are assumed to have received every first-release item, so a first-release
// item that's missing now was deleted on purpose and must not come back;
// only items tagged seedVersion >= 2 are added to them.
function mergeSeedLibrary(s) {
  const offered = Array.isArray(s.meta.seededIds) ? new Set(s.meta.seededIds) : null;
  Object.entries(seedLibraries()).forEach(([group, lib]) => {
    s[group] = s[group] || {};
    Object.values(lib).forEach(item => {
      const neverOffered = offered ? !offered.has(`${group}:${item.id}`) : (item.seedVersion || 1) >= 2;
      if (neverOffered && !s[group][item.id]) s[group][item.id] = clone(item);
    });
  });
  // Activities can't be edited in the app, so the seed's field config and
  // how-to are authoritative — this is how older installs pick up e.g. the
  // reps field or a reworded how-to.
  Object.values(ACTIVITIES).forEach(a => {
    const mine = s.activities[a.id];
    if (!mine) return;
    mine.logFields = clone(a.logFields);
    if (a.notes) mine.notes = a.notes;
    else delete mine.notes;
  });
  s.meta.seededIds = allSeedIds();
}

// The previous release (after a rollback, or a stale cached copy) edits only
// `schedule` and saves `programs` back untouched, while this release always
// stores the two identical — so a `schedule` that differs from Program 1
// holds edits made there. Adopt them before anything below normalizes or
// repairs Program 1 (otherwise e.g. an exercise deleted there would be
// restored from the seeds).
function adoptLegacyScheduleEdits(s) {
  const program1 = s.programs.find(p => p.id === 'program-1') || s.programs[0];
  if (s.schedule && typeof s.schedule === 'object' && JSON.stringify(s.schedule) !== JSON.stringify(program1.schedule)) {
    program1.schedule = s.schedule;
  }
}

// Brings saved data (current or older shape, including imported backups) up
// to the current shape without losing anything the user entered. Returns
// null when the data isn't from this app at all.
function migrateState(s) {
  if (!s || typeof s !== 'object' || !s.movements || !s.exercises) return null;
  if (!Array.isArray(s.programs)) {
    if (!s.schedule) return null;
    // v1 had a single weekly schedule: it becomes Program 1, untouched.
    s.programs = [{ id: 'program-1', name: 'Program 1', schedule: s.schedule }];
  }
  if (s.programs.length === 0) return null;
  adoptLegacyScheduleEdits(s);
  s.meta = s.meta || {};
  s.pendingChanges = s.pendingChanges || [];
  mergeSeedLibrary(s);
  if (!s.programs.some(p => p.id === 'program-2')) {
    // Built from this install's own Program 1, so the non-kettlebell days and
    // extras are exactly what the user currently runs.
    const base = s.programs.find(p => p.id === 'program-1') || s.programs[0];
    s.programs.push({ id: 'program-2', name: 'Program 2', schedule: buildProgram2Schedule(base.schedule) });
  }
  normalizeDays(s);
  applyProgramUpdates(s);
  repairProgramReferences(s);
  keepLegacyKeys(s);
  s.meta.schemaVersion = SCHEMA_VERSION;
  return s;
}

// One-time edits to programs that already exist (PROGRAM_UPDATES in
// seed-program.js). Each update runs once per install and is recorded by id
// in meta.appliedUpdates (kept by older releases too, so a rollback can't
// make one run twice). Must never throw (see repairProgramReferences): a step
// that can't apply leaves its day as it is.
function applyProgramUpdates(s) {
  const applied = new Set(Array.isArray(s.meta.appliedUpdates) ? s.meta.appliedUpdates : []);
  PROGRAM_UPDATES.forEach(update => {
    if (applied.has(update.id)) return;
    update.steps.forEach(step => step.programs.forEach(programId => {
      const program = s.programs.find(p => p && p.id === programId);
      if (!program || !program.schedule || !program.schedule[step.day]) return;
      try { applyProgramStep(program.schedule, step); } catch (e) { /* skip this step */ }
    }));
    applied.add(update.id);
  });
  s.meta.appliedUpdates = [...applied];
}

// One step: acts only when the day still looks as expected (the exercise to
// replace is there, the activity to add isn't, ...).
function applyProgramStep(schedule, step) {
  const day = schedule[step.day];
  const has = (d, id) => d.activities.some(a => a && a.activityId === id);
  const at = id => day.activities.findIndex(a => a && a.activityId === id);
  const renumber = d => d.activities.forEach((a, i) => { if (a) a.order = i; });
  if (step.ifHasActivity && !step.ifHasActivity.some(id => has(day, id))) return;
  const exerciseIds = day.complex && Array.isArray(day.complex.exerciseIds) ? day.complex.exerciseIds : [];
  switch (step.op) {
    case 'replaceExercise': {
      const i = exerciseIds.indexOf(step.from);
      if (i < 0) return;
      if (exerciseIds.includes(step.to)) exerciseIds.splice(i, 1);
      else {
        // Same row, new name: kg/reps jotted on it belong to it.
        exerciseIds[i] = step.to;
        const from = `ex:${step.from}`, to = `ex:${step.to}`;
        if (day.memos[from] && !day.memos[to]) day.memos[to] = day.memos[from];
      }
      break;
    }
    case 'replaceActivity': {
      const i = at(step.from);
      if (i < 0) return;
      if (has(day, step.to)) { day.activities.splice(i, 1); renumber(day); }
      else day.activities[i] = { ...day.activities[i], activityId: step.to };
      break;
    }
    case 'addActivity':
      if (has(day, step.activityId)) return;
      day.activities.push({ activityId: step.activityId, timing: step.timing || 'after', order: 0 });
      renumber(day);
      break;
    case 'removeActivity': {
      const i = at(step.activityId);
      if (i < 0) return;
      day.activities.splice(i, 1);
      renumber(day);
      break;
    }
    case 'moveActivity': {
      const target = schedule[step.toDay];
      const i = at(step.activityId);
      if (i < 0 || !target || has(target, step.activityId)) return;
      target.activities.push(day.activities.splice(i, 1)[0]);
      const key = `act:${step.activityId}`;
      if (day.memos[key]) { target.memos[key] = day.memos[key]; delete day.memos[key]; }
      renumber(day);
      renumber(target);
      break;
    }
    case 'replaceNoteText':
      day.notes = replaceTextOnce(day.notes, step.from, step.to);
      break;
    case 'appendNote':
      if (!day.notes.includes(step.text)) day.notes = [day.notes, step.text].filter(Boolean).join(' ');
      break;
    case 'replaceFocusText':
      if (day.complex && typeof day.complex.focusNote === 'string') day.complex.focusNote = replaceTextOnce(day.complex.focusNote, step.from, step.to);
      break;
    case 'appendFocusText': {
      if (!day.complex) return;
      const focus = typeof day.complex.focusNote === 'string' ? day.complex.focusNote : '';
      if (!focus.includes(step.text)) day.complex.focusNote = [focus, step.text].filter(Boolean).join(' ');
      break;
    }
    default:
      return;
  }
  pruneMemos(day);
}

// Replaces the first `from`; removing it (to === '') also takes the space in
// front, so "A. B." minus "B." reads "A.".
function replaceTextOnce(text, from, to) {
  if (typeof text !== 'string') return text;
  const target = to === '' && text.includes(` ${from}`) ? ` ${from}` : from;
  const i = text.indexOf(target);
  if (i < 0) return text;
  return (text.slice(0, i) + to + text.slice(i + target.length)).trim();
}

// The pre-programs app only loads data that has `schedule` (and saves unknown
// keys like `programs` back untouched). Keeping `schedule` pointed at Program
// 1 means an older copy of the app — e.g. a stale cached app.js served
// offline — still reads the data instead of starting over and overwriting it.
// This release always stores the two identical (same object in memory).
function keepLegacyKeys(s) {
  s.schedule = (s.programs.find(p => p.id === 'program-1') || s.programs[0]).schedule;
  if (!Array.isArray(s.history)) s.history = [];
}

function freshState() {
  const program1 = clone(WEEKLY_SCHEDULE);
  const s = {
    // The seeds already include every program update.
    meta: { schemaVersion: SCHEMA_VERSION, seededIds: allSeedIds(), appliedUpdates: PROGRAM_UPDATES.map(u => u.id) },
    movements: clone(MOVEMENTS),
    exercises: clone(EXERCISES),
    activities: clone(ACTIVITIES),
    programs: [
      { id: 'program-1', name: 'Program 1', schedule: program1 },
      { id: 'program-2', name: 'Program 2', schedule: buildProgram2Schedule(program1) }
    ],
    pendingChanges: clone(PENDING_CHANGES_SEED)
  };
  normalizeDays(s);
  keepLegacyKeys(s);
  return s;
}

function loadState() {
  let raw = null;
  try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage unavailable */ }
  if (!raw) return freshState();
  try {
    const parsed = JSON.parse(raw);
    const fromVersion = (parsed && parsed.meta && parsed.meta.schemaVersion) || 1;
    const migrated = migrateState(parsed);
    if (migrated) {
      if (fromVersion < SCHEMA_VERSION) {
        // Keep the pre-upgrade data around once, then persist the upgrade so it
        // only ever runs once.
        try {
          if (!localStorage.getItem(PRE_MIGRATION_BACKUP_KEY)) localStorage.setItem(PRE_MIGRATION_BACKUP_KEY, raw);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        } catch (e) { unsavedChanges = true; /* runs from memory; written on the next successful save */ }
      }
      return migrated;
    }
  } catch (e) { /* unreadable — handled below */ }
  // Data we can't read is set aside once, and the stored copy is only
  // replaced after that aside-copy is safely written. If it can't be set
  // aside, nothing may ever overwrite it this session.
  const fresh = freshState();
  try {
    localStorage.setItem(`kbapp_unreadable_${Date.now()}`, raw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    loadNotice = 'Your saved data could not be read. It has been set aside on this phone (not deleted) and the app started fresh.';
  } catch (e) {
    storageLocked = true;
    unsavedChanges = true;
    loadNotice = LOCKED_NOTICE;
  }
  return fresh;
}

// Tells the user, once, what loadState() found. In locked mode this notice
// is also saveState()'s "not saved" alert, so that isn't repeated.
function showLoadNotice() {
  if (!loadNotice) return;
  const message = loadNotice;
  loadNotice = null;
  if (storageLocked) saveFailureReported = true;
  alert(message);
}

function saveState() {
  if (storageLocked) {
    unsavedChanges = true;
    if (!saveFailureReported) { saveFailureReported = true; alert(LOCKED_NOTICE); }
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    unsavedChanges = false;
    saveFailureReported = false;
  } catch (e) {
    unsavedChanges = true;
    if (!saveFailureReported) {
      saveFailureReported = true;
      alert('Could not save — the app\'s storage on this phone is full or unavailable. Your changes are kept while the app stays open.');
    }
  }
}

function loadUiPrefs() {
  try { return JSON.parse(localStorage.getItem(UI_KEY)) || {}; } catch (e) { return {}; }
}

function saveUiPrefs() {
  try {
    localStorage.setItem(UI_KEY, JSON.stringify({ view: currentView === 'day' ? 'program' : currentView, programId: currentProgramId }));
  } catch (e) { /* per-device convenience only */ }
}

// ---------- PROGRAM HELPERS ----------

function getProgram(id) { return state.programs.find(p => p.id === id); }

function currentProgram() { return getProgram(currentProgramId) || state.programs[0]; }

// What coverage.js / warnings.js work on: the shared libraries plus one
// program's week.
function programView(program) {
  return { movements: state.movements, exercises: state.exercises, activities: state.activities, schedule: program.schedule };
}

// Drops saved kg/reps notes for things no longer on the day.
function pruneMemos(day) {
  const keep = new Set([
    ...(day.complex ? day.complex.exerciseIds.map(id => `ex:${id}`) : []),
    ...day.activities.map(a => `act:${a.activityId}`)
  ]);
  Object.keys(day.memos || {}).forEach(k => { if (!keep.has(k)) delete day.memos[k]; });
}

// ---------- DATE / DAY HELPERS ----------

function todayStr() { return new Date().toISOString().slice(0, 10); }

function jsDayToKey(jsDay) { return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][jsDay]; }

function todayDayKey() { return jsDayToKey(new Date().getDay()); }

function uid(prefix) { return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`; }

// ---------- SHARED MARKUP ----------

function renderMuscleSummary(primarySet, secondarySet) {
  const p = [...primarySet], s = [...secondarySet];
  if (p.length === 0 && s.length === 0) return '<p class="empty-state" style="padding:8px">No muscles tagged yet.</p>';
  return `<div class="pill-row">
    ${p.map(m => `<span class="pill" style="background:var(--muscle-primary);color:white">${MUSCLE_LABELS[m]}</span>`).join('')}
    ${s.map(m => `<span class="pill" style="background:var(--muscle-secondary);color:#5a3d00">${MUSCLE_LABELS[m]}</span>`).join('')}
  </div>`;
}

function exerciseSubLabel(exercise) {
  if (exercise.movementIds.length === 0) return 'Custom exercise — no muscle data';
  return exercise.movementIds.map(id => (state.movements[id] || {}).name || '?').join(' → ');
}

// No bell involved (e.g. a floor pushup): gets a reps box only, like the
// bodyweight extras. A custom exercise without movements keeps its kg box.
function isBodyweightOnly(exercise) {
  return exercise.movementIds.length > 0 && exercise.movementIds.every(id => (state.movements[id] || {}).equipment === 'bodyweight');
}

// Optional how-to text on an exercise or activity, collapsed by default so
// the day page stays short once the movements are familiar.
function howToHtml(notes) {
  return notes ? `<details class="how-to"><summary>How to</summary><p>${notes}</p></details>` : '';
}

// Optional kg / reps the user can jot down per exercise or extra. Only the
// latest values are kept (saved per program and day) — there is no history.
// type="text" + inputmode instead of type="number": iOS shows a comma on the
// decimal keypad in Swedish, which type="number" silently rejects.
// Saved kg is shown with a decimal comma, matching what the Swedish keypad
// types (updateMemo accepts both separators).
function kgText(value) {
  return value === undefined || value === null || value === '' ? '' : String(value).replace('.', ',');
}

function memoInputsHtml(memoKey, memo, { weight, reps, weightPlaceholder }) {
  const values = memo || {};
  const fields = [];
  if (weight) fields.push(`<label class="memo-field"><input type="text" inputmode="decimal" autocomplete="off" data-memo-key="${memoKey}" data-memo-field="weightKg" value="${kgText(values.weightKg)}" placeholder="${kgText(weightPlaceholder)}" aria-label="kg"><span>kg</span></label>`);
  if (reps) fields.push(`<label class="memo-field"><input type="text" inputmode="numeric" autocomplete="off" data-memo-key="${memoKey}" data-memo-field="reps" value="${values.reps ?? ''}" placeholder="–" aria-label="reps"><span>reps</span></label>`);
  return fields.length ? `<div class="memo-inputs">${fields.join('')}</div>` : '';
}

function updateMemo(program, dayKey, input) {
  const day = program.schedule[dayKey];
  if (!day) return;
  const key = input.dataset.memoKey, field = input.dataset.memoField;
  const raw = input.value.trim().replace(',', '.');
  const entry = { ...(day.memos[key] || {}) };
  if (raw === '') {
    delete entry[field];
  } else {
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return; // half-typed input — wait until it parses
    entry[field] = n;
  }
  if (Object.keys(entry).length) day.memos[key] = entry;
  else delete day.memos[key];
  saveState();
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

    const exactMatch = q && matches.some(item => config.getName(item).toLowerCase() === q);
    const createHtml = (config.allowCreate && q && !exactMatch)
      ? `<button type="button" class="picker-search-result create-result" data-create="1">+ Create "${query.trim()}"${config.allowCreate.hint ? `<div class="result-sub">${config.allowCreate.hint}</div>` : ''}</button>`
      : '';

    const matchesHtml = matches.map(item => `
      <button type="button" class="picker-search-result" data-id="${item.id}">
        ${config.getName(item)}
        ${config.getSub ? `<div class="result-sub">${config.getSub(item)}</div>` : ''}
      </button>
    `).join('');

    config.resultsEl.innerHTML = (createHtml + matchesHtml) || '<p class="empty-state" style="padding:10px">No matches.</p>';

    config.resultsEl.querySelectorAll('.picker-search-result[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (config.maxItems && current.length >= config.maxItems) return;
        current.push({ id: btn.dataset.id, extra: config.extraField ? config.extraField.default : undefined });
        if (config.searchInputEl) config.searchInputEl.value = '';
        renderRows(); renderResults(''); fireChange();
      });
    });

    const createBtn = config.resultsEl.querySelector('[data-create]');
    if (createBtn) createBtn.addEventListener('click', () => {
      if (config.maxItems && current.length >= config.maxItems) return;
      const entry = config.allowCreate.onCreate(query.trim());
      current.push({ ...entry, extra: entry.extra !== undefined ? entry.extra : (config.extraField ? config.extraField.default : undefined) });
      if (config.searchInputEl) config.searchInputEl.value = '';
      renderRows(); renderResults(''); fireChange();
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
// currentView: 'program' (a program's week) | 'day' | 'muscles' | 'more'

let currentView = 'program';
let currentProgramId = 'program-1';
let selectedDayKey = null;
let muscleViewState = { selectedDay: 'week', side: 'front' };

function goToProgram(programId) {
  currentProgramId = programId;
  currentView = 'program';
  selectedDayKey = null;
  saveUiPrefs();
  render();
  window.scrollTo(0, 0);
}

function goTo(view) {
  currentView = view;
  selectedDayKey = null;
  saveUiPrefs();
  render();
  window.scrollTo(0, 0);
}

function goToDay(dayKey) {
  currentView = 'day';
  selectedDayKey = dayKey;
  render();
  window.scrollTo(0, 0);
}

function programTabIcon(index) { return index < 9 ? `${index + 1}️⃣` : '📅'; }

// An index.html cached before the programs split has the tab bar without its
// id; finding it by class too lets this script run under that old page.
function tabbarElement() {
  return document.getElementById('tabbar') || document.querySelector('.tabbar');
}

function renderTabbar() {
  const bar = tabbarElement();
  if (!bar) return;
  const onProgram = currentView === 'program' || currentView === 'day';
  bar.innerHTML = [
    ...state.programs.map((p, i) => `<button type="button" data-tab="program" data-program-id="${p.id}" class="${onProgram && p.id === currentProgramId ? 'active' : ''}"><span class="icon">${programTabIcon(i)}</span>${p.name}</button>`),
    `<button type="button" data-tab="muscles" class="${currentView === 'muscles' ? 'active' : ''}"><span class="icon">💪</span>Muscles</button>`,
    `<button type="button" data-tab="more" class="${currentView === 'more' ? 'active' : ''}"><span class="icon">⚙️</span>More</button>`
  ].join('');
}

function render() {
  if (!getProgram(currentProgramId)) currentProgramId = state.programs[0].id;
  if (currentView === 'day' && !selectedDayKey) currentView = 'program';
  renderTabbar();
  let html = '';
  if (currentView === 'program') html = renderProgram();
  else if (currentView === 'day') html = renderDayDetail(selectedDayKey);
  else if (currentView === 'muscles') html = renderMuscles();
  else if (currentView === 'more') html = renderMore();
  document.getElementById('view').innerHTML = renderSaveWarning() + html;
  attachViewHandlers();
}

function renderSaveWarning() {
  if (storageLocked) return '<div class="save-warning">⚠️ Saving is paused to protect saved data the app couldn\'t read. Changes are kept only while the app stays open.</div>';
  if (unsavedChanges) return '<div class="save-warning">⚠️ Not saved — the app\'s storage is full or unavailable. Changes are kept while the app stays open, and saving is retried when you come back to it.</div>';
  return '';
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

// ---------- PROGRAM (WEEK) VIEW ----------

function dayTypeLabel(day) {
  const bits = [];
  if (day.complex) bits.push(`Kettlebell (${day.complex.targetWeightKg}kg)${day.complex.positionOverride ? ` · ${POSITION_LABELS[day.complex.positionOverride]}` : ''}`);
  const cats = new Set(day.activities.map(a => (state.activities[a.activityId] || {}).category).filter(Boolean));
  if (cats.has('cardio-sport')) bits.push('Cardio/sport');
  if (cats.has('plyometric')) bits.push('Plyometrics');
  if (cats.has('calisthenics')) bits.push('Calisthenics');
  if (!day.complex) {
    // Strength extras on a day without a complex: the seeded rehab and
    // stretch items (ids rehab-*/stretch-*; the app can't create new
    // activities) read as recovery, anything else (e.g. Nordic curls) as extras.
    const extras = day.activities.map(a => state.activities[a.activityId]).filter(a => a && a.category === 'strength-extra');
    const isRecovery = a => /^(rehab|stretch)-/.test(a.id);
    if (extras.some(isRecovery)) bits.push('Rehab/stretch');
    if (extras.some(a => !isRecovery(a))) bits.push('Extras');
  }
  return bits.join(' + ') || 'Rest';
}

function renderProgram() {
  const program = currentProgram();
  const weekWarnings = getAllWarnings(programView(program)).filter(w => w.scope === 'week');
  const today = todayDayKey();
  return `
    <h2>${program.name}</h2>
    ${renderWarningBadge(weekWarnings, 'week')}
    <div style="margin-top:14px">
      ${DAY_ORDER.map(dayKey => {
        const day = program.schedule[dayKey];
        const isToday = dayKey === today;
        return `
        <button class="day-row ${isToday ? 'is-today' : ''}" data-day="${dayKey}">
          <div class="day-abbr">${DAY_LABELS_SHORT[dayKey].toUpperCase()}</div>
          <div class="day-main">
            <div class="day-name">${DAY_LABELS[dayKey]}${isToday ? '<span class="today-pill">Today</span>' : ''}</div>
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
  const program = currentProgram();
  const view = programView(program);
  const day = program.schedule[dayKey];
  const warnings = getAllWarnings(view).filter(w => w.dayKey === dayKey);
  const { primary, secondary } = getDayMuscles(view, dayKey);
  const memos = day.memos || {};

  const exerciseRows = day.complex ? day.complex.exerciseIds.map(exId => {
    const ex = state.exercises[exId];
    if (!ex) return '';
    return `
      <div class="exercise-row">
        <div class="ex-main">
          <div class="ex-name">${ex.name}</div>
          <div class="ex-sub">${exerciseSubLabel(ex)}</div>
          ${howToHtml(ex.notes)}
          ${memoInputsHtml(`ex:${exId}`, memos[`ex:${exId}`], { weight: !isBodyweightOnly(ex), reps: true, weightPlaceholder: day.complex.targetWeightKg })}
        </div>
        <button type="button" class="remove-btn" data-remove-exercise="${exId}" aria-label="Remove">✕</button>
      </div>`;
  }).join('') : '';

  const activityGroups = { before: [], standalone: [], after: [] };
  day.activities.forEach(a => {
    const act = state.activities[a.activityId];
    if (!act) return;
    (activityGroups[a.timing] || activityGroups.after).push({ ...a, act });
  });
  function renderActivityGroup(label, list) {
    if (list.length === 0) return '';
    return `<div class="section-title">${label}</div>` + list.map(({ activityId, act }) => {
      const lf = act.logFields || {};
      return `
      <div class="activity-row">
        <div class="act-main">
          <div class="act-name">${act.name}</div>
          <div class="act-sub">${CATEGORY_LABELS[act.category]}${act.impactLevel === 'high' ? ' · high impact' : ''}</div>
          ${howToHtml(act.notes)}
          ${memoInputsHtml(`act:${activityId}`, memos[`act:${activityId}`], { weight: !!lf.weight, reps: !!lf.reps })}
        </div>
        <button type="button" class="remove-btn" data-remove-activity="${activityId}" aria-label="Remove">✕</button>
      </div>`;
    }).join('');
  }

  return `
    <button class="link-btn" id="back-to-program">← ${program.name}</button>
    <h2>${DAY_LABELS[dayKey]}</h2>
    ${day.complex && day.complex.focusNote ? `<p class="modal-sub">${day.complex.focusNote}</p>` : ''}
    ${day.notes ? `<p class="modal-sub">${day.notes}</p>` : ''}

    ${renderWarningBadge(warnings, 'day')}

    ${day.complex ? `
    <div class="section-title" style="margin-top:20px">Kettlebell complex — ${day.complex.targetWeightKg}kg</div>
    ${day.complex.positionOverride ? `<div class="routine-position"><span class="pill status-future">🧎 Whole routine: ${POSITION_LABELS[day.complex.positionOverride]}</span></div>` : ''}
    <p class="memo-hint">Jot down kg and reps if you like — they're kept for next time.</p>
    ${exerciseRows}
    ` : '<div class="empty-state">No kettlebell complex scheduled this day.</div>'}

    ${renderActivityGroup('Before', activityGroups.before)}
    ${renderActivityGroup(day.complex ? 'Extras (after complex)' : 'Activities', activityGroups.standalone.concat(activityGroups.after))}

    <div class="section-title">Muscles targeted today</div>
    <div class="bodymap-wrap">${renderBodyMapSVG()}</div>
    ${renderMuscleSummary(primary, secondary)}

    <div class="action-row">
      <button class="chip" id="edit-complex-btn">Edit complex</button>
      <button class="chip" id="edit-activities-btn">Edit activities</button>
      <button class="chip" id="reset-day-btn" style="color:#922B21">Reset day</button>
    </div>
  `;
}

// ---------- COMPLEX EDITOR ----------

function openComplexEditorModal(programId, dayKey) {
  const program = getProgram(programId);
  const day = program.schedule[dayKey];
  const html = `
    <p class="modal-title">Edit ${DAY_LABELS[dayKey]}'s complex</p>
    <p class="modal-sub">${program.name}</p>
    <div class="modal-section">
      <p class="modal-section-title">Target weight (kg)</p>
      <input type="number" class="field" id="complex-weight" min="0" step="1" value="${day.complex ? day.complex.targetWeightKg : 16}">
    </div>
    <div class="modal-section">
      <p class="modal-section-title">Focus / why</p>
      <textarea class="field" id="complex-focus">${day.complex ? day.complex.focusNote : ''}</textarea>
    </div>
    <div class="modal-section">
      <p class="modal-section-title">Position override</p>
      <select class="field" id="complex-position-override">
        <option value="">No override (as designed)</option>
        ${['kneeling', 'sitting', 'floor', 'one-knee'].map(p => `<option value="${p}" ${day.complex && day.complex.positionOverride === p ? 'selected' : ''}>${POSITION_LABELS[p]}</option>`).join('')}
      </select>
      <p class="picker-cap-note">Use this when the whole routine is done differently than usual (e.g. the whole thing on your knees or on the floor) — it's just a note shown on the day, it doesn't change the individual movements.</p>
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
    maxItems: 6,
    allowCreate: {
      hint: 'Custom — no movements/muscle data, but usable in the complex',
      onCreate: (name) => {
        const id = uid('exercise');
        state.exercises[id] = { id, name, movementIds: [], status: 'active', blockerNote: null, replacesExerciseId: null, custom: true };
        return { id };
      }
    }
  });

  document.getElementById('complex-save-btn').addEventListener('click', () => {
    const exerciseIds = picker.getList().map(x => x.id);
    if (exerciseIds.length === 0) { alert('Add at least one exercise.'); return; }
    day.complex = {
      exerciseIds,
      targetWeightKg: Number(document.getElementById('complex-weight').value) || 0,
      focusNote: document.getElementById('complex-focus').value.trim(),
      positionOverride: document.getElementById('complex-position-override').value || null
    };
    pruneMemos(day);
    saveState(); closeModal(); render();
  });
}

// ---------- ACTIVITIES EDITOR ----------

function openActivitiesEditorModal(programId, dayKey) {
  const program = getProgram(programId);
  const day = program.schedule[dayKey];
  const html = `
    <p class="modal-title">Edit ${DAY_LABELS[dayKey]}'s activities</p>
    <p class="modal-sub">${program.name}</p>
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
    pruneMemos(day);
    saveState(); closeModal(); render();
  });
}

// ---------- MUSCLES VIEW ----------

function musclesForSelection(view) {
  return muscleViewState.selectedDay === 'week'
    ? mergeMuscleSets(DAY_ORDER.map(d => getDayMuscles(view, d)))
    : getDayMuscles(view, muscleViewState.selectedDay);
}

function renderMuscles() {
  const program = currentProgram();
  const view = programView(program);
  const coverage = getWeeklyCoverage(view);
  const weeklyWarnings = getAllWarnings(view).filter(w => w.scope === 'week');
  const { primary, secondary } = musclesForSelection(view);

  return `
    <h2>Muscles</h2>
    <div class="segmented">
      ${state.programs.map(p => `<button type="button" class="${p.id === program.id ? 'active' : ''}" data-muscle-program="${p.id}">${p.name}</button>`).join('')}
    </div>
    <div class="filter-bar">
      ${['week', ...DAY_ORDER].map(c => `<button class="chip ${muscleViewState.selectedDay === c ? 'active' : ''}" data-muscle-day="${c}">${c === 'week' ? 'Whole week' : DAY_LABELS_SHORT[c]}</button>`).join('')}
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

    <div class="section-title">Weekly coverage — ${program.name}</div>
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

// ---------- MORE VIEW (pending changes, libraries, backup) ----------

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
    <p class="modal-sub">Movement chains used inside kettlebell complexes. Shared by all programs.</p>
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
      <p class="modal-section-title">How to (optional)</p>
      <textarea class="field" id="ex-notes" placeholder="Grip, reps, cues — shown under the exercise on the day page">${existing && existing.notes ? existing.notes : ''}</textarea>
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
      ...(existing || {}),
      id, name, movementIds, status,
      blockerNote: status === 'future' ? (document.getElementById('ex-blocker').value.trim() || null) : null,
      replacesExerciseId: status === 'future' ? (document.getElementById('ex-replaces').value || null) : null,
      notes: document.getElementById('ex-notes').value.trim()
    };
    if (!state.exercises[id].notes) delete state.exercises[id].notes;
    saveState(); closeModal(); render();
  });

  const deleteBtn = document.getElementById('ex-delete-btn');
  if (deleteBtn) deleteBtn.addEventListener('click', () => {
    if (!confirm(`Delete "${existing.name}"? It will also be removed from every program's complexes that use it.`)) return;
    state.programs.forEach(p => DAY_ORDER.forEach(d => {
      const day = p.schedule[d];
      if (day.complex) {
        day.complex.exerciseIds = day.complex.exerciseIds.filter(id => id !== exerciseId);
        if (day.complex.exerciseIds.length === 0) day.complex = null;
      }
      pruneMemos(day);
    }));
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

// Old backups (one weekly schedule) are upgraded the same way stored data is.
function importDataFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let migrated = null;
    try { migrated = migrateState(JSON.parse(reader.result)); } catch (e) { migrated = null; }
    if (!migrated) { alert('Could not read that file — is it a valid backup from this app?'); return; }
    state = migrated;
    saveState(); render();
    alert(storageLocked
      ? 'Backup loaded for this session only: saving is paused to protect the data the app couldn\'t read, so it will be gone when the app closes.'
      : unsavedChanges
        ? 'Backup loaded, but it couldn\'t be saved yet (storage full or unavailable). Saving is retried when you come back to the app.'
        : 'Data restored!');
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
  // Edits that never reached storage must not be replaced by the older
  // stored copy: retry the save, and keep memory if it still fails.
  if (unsavedChanges) {
    saveState();
    if (unsavedChanges) { render(); return; }
  }
  state = loadState();
  if (isModalOpen()) closeModal();
  render();
  showLoadNotice();
}

// ---------- EVENT WIRING ----------

function attachViewHandlers() {
  const program = currentProgram();

  // Warnings badge (program week + day detail)
  document.querySelectorAll('[data-warnings-scope]').forEach(el => el.addEventListener('click', () => {
    const all = getAllWarnings(programView(program));
    openWarningsModal(el.dataset.warningsScope === 'week'
      ? all.filter(w => w.scope === 'week')
      : all.filter(w => w.dayKey === selectedDayKey));
  }));

  // Program week
  document.querySelectorAll('.day-row[data-day]').forEach(el => el.addEventListener('click', () => goToDay(el.dataset.day)));

  // Day detail
  const backBtn = document.getElementById('back-to-program');
  if (backBtn) backBtn.addEventListener('click', () => goToProgram(program.id));
  const editComplexBtn = document.getElementById('edit-complex-btn');
  if (editComplexBtn) editComplexBtn.addEventListener('click', () => openComplexEditorModal(program.id, selectedDayKey));
  const editActivitiesBtn = document.getElementById('edit-activities-btn');
  if (editActivitiesBtn) editActivitiesBtn.addEventListener('click', () => openActivitiesEditorModal(program.id, selectedDayKey));
  const resetDayBtn = document.getElementById('reset-day-btn');
  if (resetDayBtn) resetDayBtn.addEventListener('click', () => {
    if (!confirm(`Reset ${DAY_LABELS[selectedDayKey]} in ${program.name}? This clears its complex, activities, notes and saved kg/reps.`)) return;
    program.schedule[selectedDayKey] = { complex: null, activities: [], notes: '', memos: {} };
    saveState(); render();
  });
  document.querySelectorAll('[data-remove-exercise]').forEach(el => el.addEventListener('click', () => {
    const day = program.schedule[selectedDayKey];
    const ex = state.exercises[el.dataset.removeExercise];
    if (!confirm(`Remove "${ex ? ex.name : 'this exercise'}" from ${DAY_LABELS[selectedDayKey]} in ${program.name}?`)) return;
    day.complex.exerciseIds = day.complex.exerciseIds.filter(id => id !== el.dataset.removeExercise);
    if (day.complex.exerciseIds.length === 0) day.complex = null;
    pruneMemos(day);
    saveState(); render();
  }));
  document.querySelectorAll('[data-remove-activity]').forEach(el => el.addEventListener('click', () => {
    const day = program.schedule[selectedDayKey];
    const act = state.activities[el.dataset.removeActivity];
    if (!confirm(`Remove "${act ? act.name : 'this activity'}" from ${DAY_LABELS[selectedDayKey]} in ${program.name}?`)) return;
    const idx = day.activities.findIndex(a => a.activityId === el.dataset.removeActivity);
    if (idx > -1) day.activities.splice(idx, 1);
    pruneMemos(day);
    saveState(); render();
  }));
  document.querySelectorAll('[data-memo-key]').forEach(el => el.addEventListener('input', () => updateMemo(program, selectedDayKey, el)));

  // Muscles
  document.querySelectorAll('[data-muscle-program]').forEach(el => el.addEventListener('click', () => {
    currentProgramId = el.dataset.muscleProgram; saveUiPrefs(); render();
  }));
  document.querySelectorAll('[data-muscle-day]').forEach(el => el.addEventListener('click', () => { muscleViewState.selectedDay = el.dataset.muscleDay; render(); }));
  document.querySelectorAll('[data-muscle-side]').forEach(el => el.addEventListener('click', () => { muscleViewState.side = el.dataset.muscleSide; render(); }));
  const bodymapSvg = document.getElementById('bodymap-svg');
  if (bodymapSvg) {
    setBodyMapView(bodymapSvg, muscleViewState.side);
    const view = programView(program);
    const muscles = currentView === 'muscles' ? musclesForSelection(view)
      : currentView === 'day' ? getDayMuscles(view, selectedDayKey) : null;
    if (muscles) colorBodyMap(bodymapSvg, muscles);
  }

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
  const prefs = loadUiPrefs();
  currentProgramId = prefs.programId && getProgram(prefs.programId) ? prefs.programId : state.programs[0].id;
  if (['program', 'muscles', 'more'].includes(prefs.view)) currentView = prefs.view;

  // The tab bar is re-rendered on every render(), so it's wired once here by delegation.
  const tabbar = tabbarElement();
  if (tabbar) tabbar.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-tab]');
    if (!btn) return;
    if (btn.dataset.tab === 'program') goToProgram(btn.dataset.programId);
    else goTo(btn.dataset.tab);
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
  showLoadNotice();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }
});
