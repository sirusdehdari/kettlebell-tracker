// Pure muscle-union computations — no DOM access. Consumed by bodymap
// rendering, the weekly coverage grid, and warnings.js.

function getMovementMuscles(movement) {
  return { primary: movement.primaryMuscles, secondary: movement.secondaryMuscles };
}

function getExerciseMuscles(exercise, movementsById) {
  const sets = exercise.movementIds.map(id => getMovementMuscles(movementsById[id])).filter(Boolean);
  return mergeMuscleSets(sets);
}

function getActivityMuscles(activity) {
  return { primary: new Set(activity.primaryMuscles), secondary: new Set(activity.secondaryMuscles) };
}

// Union of everything scheduled on one day: complex exercises (only active
// ones matter for coverage — future/blocked exercises don't affect the live
// program) + all assigned activities.
function getDayMuscles(state, dayKey) {
  const day = state.schedule[dayKey];
  const sets = [];
  if (day.complex) {
    day.complex.exerciseIds.forEach(id => {
      const exercise = state.exercises[id];
      if (exercise && exercise.status === 'active') sets.push(getExerciseMuscles(exercise, state.movements));
    });
  }
  day.activities.forEach(a => {
    const activity = state.activities[a.activityId];
    if (activity) sets.push(getActivityMuscles(activity));
  });
  return mergeMuscleSets(sets);
}

// { [muscleKey]: { primaryDays: [dayKey,...], secondaryDays: [dayKey,...], primaryCount, secondaryCount } }
function getWeeklyCoverage(state) {
  const table = Object.fromEntries(MUSCLE_KEYS.map(k => [k, { primaryDays: [], secondaryDays: [] }]));
  DAY_ORDER.forEach(dayKey => {
    const { primary, secondary } = getDayMuscles(state, dayKey);
    primary.forEach(m => table[m].primaryDays.push(dayKey));
    secondary.forEach(m => table[m].secondaryDays.push(dayKey));
  });
  Object.values(table).forEach(row => { row.primaryCount = row.primaryDays.length; row.secondaryCount = row.secondaryDays.length; });
  return table;
}
