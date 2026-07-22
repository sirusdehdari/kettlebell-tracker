// Pure, rule-based advisory warnings — never blocking. Consumes coverage.js
// output + raw state, returns plain data; app.js is the only place that ever
// renders these (as small dismissible-for-this-render banners).
// Each warning: { id, severity: 'info'|'warn', scope: 'day'|'week', dayKey, message }

function dayHasComplexOrActivities(day) {
  return !!day.complex || day.activities.length > 0;
}

function checkDayRedundancy(state, dayKey) {
  const day = state.schedule[dayKey];
  if (!dayHasComplexOrActivities(day)) return [];
  const contributors = {}; // muscleKey -> [labels]
  if (day.complex) {
    day.complex.exerciseIds.forEach(id => {
      const exercise = state.exercises[id];
      if (!exercise || exercise.status !== 'active') return;
      const { primary } = getExerciseMuscles(exercise, state.movements);
      primary.forEach(m => { (contributors[m] = contributors[m] || []).push(exercise.name); });
    });
  }
  day.activities.forEach(a => {
    const activity = state.activities[a.activityId];
    if (!activity) return;
    activity.primaryMuscles.forEach(m => { (contributors[m] = contributors[m] || []).push(activity.name); });
  });
  const warnings = [];
  Object.entries(contributors).forEach(([muscle, names]) => {
    if (names.length >= 2) {
      warnings.push({
        id: `redundancy-${dayKey}-${muscle}`, severity: 'warn', scope: 'day', dayKey,
        message: `${MUSCLE_LABELS[muscle]} is hit as primary by ${names.length} things today (${names.join(', ')}) — possibly redundant.`
      });
    }
  });
  return warnings;
}

function checkWeeklyGaps(weeklyCoverage) {
  return Object.entries(weeklyCoverage)
    .filter(([, row]) => row.primaryCount === 0)
    .map(([muscle]) => ({
      id: `gap-${muscle}`, severity: 'info', scope: 'week', dayKey: null,
      message: `${MUSCLE_LABELS[muscle]} has zero primary work anywhere this week.`
    }));
}

function checkHighImpactClash(state, dayKey) {
  const day = state.schedule[dayKey];
  const highImpact = day.activities
    .map(a => state.activities[a.activityId])
    .filter(a => a && a.impactLevel === 'high');
  if (highImpact.length >= 2) {
    return [{
      id: `impact-${dayKey}`, severity: 'warn', scope: 'day', dayKey,
      message: `${highImpact.map(a => a.name).join(' + ')} are both high-impact/explosive and scheduled the same day.`
    }];
  }
  return [];
}

function checkAdjacentDayOverlap(state) {
  const warnings = [];
  for (let i = 0; i < DAY_ORDER.length; i++) {
    const dayA = DAY_ORDER[i];
    const dayB = DAY_ORDER[(i + 1) % DAY_ORDER.length]; // wraps sun -> mon
    const musclesA = getDayMuscles(state, dayA).primary;
    const musclesB = getDayMuscles(state, dayB).primary;
    const shared = [...musclesA].filter(m => musclesB.has(m));
    if (shared.length > 0) {
      warnings.push({
        id: `adjacent-${dayA}-${dayB}`, severity: 'info', scope: 'day', dayKey: dayB,
        message: `${DAY_LABELS[dayA]} and ${DAY_LABELS[dayB]} are back-to-back and both hit ${shared.map(m => MUSCLE_LABELS[m]).join(', ')} as primary — no rest day between them.`
      });
    }
  }
  return warnings;
}

function getAllWarnings(state) {
  const weeklyCoverage = getWeeklyCoverage(state);
  return [
    ...DAY_ORDER.flatMap(d => checkDayRedundancy(state, d)),
    ...checkWeeklyGaps(weeklyCoverage),
    ...DAY_ORDER.flatMap(d => checkHighImpactClash(state, d)),
    ...checkAdjacentDayOverlap(state)
  ];
}
