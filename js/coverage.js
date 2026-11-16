// Pure muscle-union computations — no DOM access. Consumed by bodymap
// rendering, the weekly coverage grid, and warnings.js.
//
// Functions that take `view` expect { movements, exercises, activities,
// schedule } — the shared libraries plus ONE program's weekly schedule
// (app.js builds it with programView()).

function getMovementMuscles(movement) {
  return { primary: movement.primaryMuscles || [], secondary: movement.secondaryMuscles || [] };
}

// Movements missing from the library (e.g. deleted, or referenced by data
// from an older install) are skipped instead of crashing every muscle view.
function getExerciseMuscles(exercise, movementsById) {
  const sets = exercise.movementIds
    .map(id => movementsById[id])
    .filter(Boolean)
    .map(getMovementMuscles);
  return mergeMuscleSets(sets);
}

function getActivityMuscles(activity) {
  return { primary: new Set(activity.primaryMuscles), secondary: new Set(activity.secondaryMuscles) };
}

// Union of everything scheduled on one day: complex exercises (only active
// ones matter for coverage — future/blocked exercises don't affect the live
// program) + all assigned activities.
function getDayMuscles(view, dayKey) {
  const day = view.schedule[dayKey];
  const sets = [];
  if (!day) return mergeMuscleSets(sets);
  if (day.complex) {
    day.complex.exerciseIds.forEach(id => {
      const exercise = view.exercises[id];
      if (exercise && exercise.status === 'active') sets.push(getExerciseMuscles(exercise, view.movements));
    });
  }
  day.activities.forEach(a => {
    const activity = view.activities[a.activityId];
    if (activity) sets.push(getActivityMuscles(activity));
  });
  return mergeMuscleSets(sets);
}

// { [muscleKey]: { primaryDays: [dayKey,...], secondaryDays: [dayKey,...], primaryCount, secondaryCount } }
function getWeeklyCoverage(view) {
  const table = Object.fromEntries(MUSCLE_KEYS.map(k => [k, { primaryDays: [], secondaryDays: [] }]));
  DAY_ORDER.forEach(dayKey => {
    const { primary, secondary } = getDayMuscles(view, dayKey);
    primary.forEach(m => { if (table[m]) table[m].primaryDays.push(dayKey); });
    secondary.forEach(m => { if (table[m]) table[m].secondaryDays.push(dayKey); });
  });
  Object.values(table).forEach(row => { row.primaryCount = row.primaryDays.length; row.secondaryCount = row.secondaryDays.length; });
  return table;
}
