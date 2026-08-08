// Pure history-log queries — no DOM access. app.js drops the results into
// charts.js render functions.

function getExerciseWeightSeries(state, exerciseId) {
  return state.history
    .filter(h => h.complexSnapshot && h.complexSnapshot.exercises.some(e => e.exerciseId === exerciseId))
    .map(h => ({ date: h.date, value: h.complexSnapshot.exercises.find(e => e.exerciseId === exerciseId).weightKg }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getDayTypeWeightSeries(state, dayOfWeek) {
  return state.history
    .filter(h => h.dayOfWeek === dayOfWeek && h.complexSnapshot)
    .map(h => ({ date: h.date, value: h.complexSnapshot.targetWeightKg }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getPersonalRecord(series) {
  return series.reduce((best, p) => (!best || p.value > best.value ? p : best), null);
}

// Real calendar weeks (Monday-Sunday, matching DAY_ORDER), not a rolling
// "last 7 days" window — a rolling window doesn't match what "this week"
// means to the user and was a source of confusion.
function getWeekVsLastWeek(state) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dow = (today.getDay() + 6) % 7; // 0 = Monday
  const startOfThisWeek = new Date(today.getTime() - dow * 86400000);
  const startOfLastWeek = new Date(startOfThisWeek.getTime() - 7 * 86400000);
  const thisWeek = state.history.filter(h => new Date(h.date) >= startOfThisWeek);
  const lastWeek = state.history.filter(h => new Date(h.date) >= startOfLastWeek && new Date(h.date) < startOfThisWeek);
  const totalLoad = entries => entries.reduce((sum, h) => sum + (h.complexSnapshot ? h.complexSnapshot.targetWeightKg : 0), 0);
  return {
    thisWeekSessions: thisWeek.length, lastWeekSessions: lastWeek.length,
    thisWeekLoad: totalLoad(thisWeek), lastWeekLoad: totalLoad(lastWeek)
  };
}

function getAllExerciseIdsWithHistory(state) {
  const ids = new Set();
  state.history.forEach(h => { if (h.complexSnapshot) h.complexSnapshot.exercises.forEach(e => ids.add(e.exerciseId)); });
  return [...ids];
}
