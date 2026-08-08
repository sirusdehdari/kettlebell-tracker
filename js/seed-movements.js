// Seed data for MOVEMENTS — the atomic units chained into EXERCISES used
// within a day's kettlebell complex. This is a DRAFT: muscle tags, equipment
// and position are my best-effort guess from general kettlebell-movement
// knowledge plus kettlebell_program_spec.md, since the spec itself only
// describes the exercise chains, not a clean per-movement muscle table.
// Review/correct through the app's movement editor once it's running.
//
// primaryMuscles/secondaryMuscles values must be keys from MUSCLE_KEYS (muscles.js).
// equipment must be one of EQUIPMENT_TYPES. position must be one of BODY_POSITIONS.

const MOVEMENTS = {
  'two-hand-swing': {
    id: 'two-hand-swing', name: 'Two-hand swing',
    primaryMuscles: ['glutes', 'hamstrings'], secondaryMuscles: ['lower-back', 'forearms', 'abs'],
    equipment: 'single-kb', position: 'standing'
  },
  'one-hand-swing': {
    id: 'one-hand-swing', name: 'One-hand swing',
    primaryMuscles: ['glutes', 'hamstrings'], secondaryMuscles: ['lower-back', 'forearms', 'obliques'],
    equipment: 'single-kb', position: 'standing'
  },
  clean: {
    id: 'clean', name: 'Clean',
    primaryMuscles: ['glutes', 'hamstrings', 'forearms'], secondaryMuscles: ['traps', 'lats', 'biceps'],
    equipment: 'single-kb', position: 'standing'
  },
  'goblet-squat': {
    id: 'goblet-squat', name: 'Goblet squat',
    primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['abs', 'hip-flexors'],
    equipment: 'single-kb', position: 'standing'
  },
  press: {
    id: 'press', name: 'Press',
    primaryMuscles: ['front-delts', 'triceps'], secondaryMuscles: ['traps', 'abs'],
    equipment: 'single-kb', position: 'standing'
  },
  'squat-thruster': {
    id: 'squat-thruster', name: 'Squat thruster',
    primaryMuscles: ['quads', 'glutes', 'front-delts', 'triceps'], secondaryMuscles: ['abs', 'hip-flexors'],
    equipment: 'single-kb', position: 'standing'
  },
  'gorilla-row': {
    id: 'gorilla-row', name: 'Gorilla row',
    primaryMuscles: ['lats', 'rear-delts'], secondaryMuscles: ['biceps', 'forearms', 'traps'],
    equipment: 'two-kb', position: 'standing'
  },
  'ballistic-row': {
    id: 'ballistic-row', name: 'Ballistic row',
    primaryMuscles: ['lats', 'rear-delts'], secondaryMuscles: ['biceps', 'forearms', 'glutes', 'hamstrings'],
    equipment: 'single-kb', position: 'standing'
  },
  'high-pull': {
    id: 'high-pull', name: 'High pull',
    primaryMuscles: ['traps', 'rear-delts'], secondaryMuscles: ['biceps', 'forearms'],
    equipment: 'single-kb', position: 'standing'
  },
  'around-the-world-catch': {
    id: 'around-the-world-catch', name: 'Around the world to catch',
    primaryMuscles: ['abs', 'obliques'], secondaryMuscles: ['forearms', 'front-delts'],
    equipment: 'single-kb', position: 'standing'
  },
  'reverse-lunge': {
    id: 'reverse-lunge', name: 'Reverse lunge',
    primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['hamstrings', 'hip-flexors', 'abs'],
    equipment: 'single-kb', position: 'standing'
  },
  curl: {
    id: 'curl', name: 'Curl (bear-hug grip)',
    primaryMuscles: ['biceps'], secondaryMuscles: ['forearms'],
    equipment: 'single-kb', position: 'standing'
  },
  'kb-marches': {
    id: 'kb-marches', name: 'KB marches',
    primaryMuscles: ['abs', 'hip-flexors'], secondaryMuscles: ['quads', 'obliques'],
    equipment: 'two-kb', position: 'standing'
  },
  pullover: {
    id: 'pullover', name: 'Pullover',
    primaryMuscles: ['lats', 'chest'], secondaryMuscles: ['triceps', 'abs'],
    equipment: 'single-kb', position: 'kneeling'
  },
  'triceps-extension': {
    id: 'triceps-extension', name: 'Triceps extension',
    primaryMuscles: ['triceps'], secondaryMuscles: [],
    equipment: 'single-kb', position: 'kneeling'
  },
  'kb-pushup': {
    id: 'kb-pushup', name: 'KB pushup',
    primaryMuscles: ['chest', 'triceps'], secondaryMuscles: ['front-delts', 'abs'],
    equipment: 'single-kb', position: 'floor'
  },
  'two-hand-row': {
    id: 'two-hand-row', name: 'Two-hand row (standing)',
    primaryMuscles: ['lats', 'rear-delts'], secondaryMuscles: ['biceps', 'forearms', 'traps'],
    equipment: 'single-kb', position: 'standing'
  },
  'wood-chop': {
    id: 'wood-chop', name: 'Wood chop',
    primaryMuscles: ['obliques', 'abs'], secondaryMuscles: ['traps', 'forearms'],
    equipment: 'single-kb', position: 'standing'
  },
  'side-bend': {
    id: 'side-bend', name: 'Side bend',
    primaryMuscles: ['obliques'], secondaryMuscles: ['abs', 'forearms'],
    equipment: 'single-kb', position: 'standing'
  },
  'upright-row': {
    id: 'upright-row', name: 'Upright row',
    primaryMuscles: ['traps', 'side-delts'], secondaryMuscles: ['biceps', 'forearms'],
    equipment: 'single-kb', position: 'kneeling'
  },
  'rotational-thruster': {
    id: 'rotational-thruster', name: 'Rotational thruster',
    primaryMuscles: ['obliques', 'abs', 'quads'], secondaryMuscles: ['glutes', 'front-delts'],
    equipment: 'single-kb', position: 'one-knee'
  },
  'rack-hold': {
    id: 'rack-hold', name: 'Rack position hold',
    primaryMuscles: ['front-delts', 'abs'], secondaryMuscles: ['forearms', 'traps'],
    equipment: 'single-kb', position: 'standing'
  },
  halo: {
    id: 'halo', name: 'Halo',
    primaryMuscles: ['front-delts', 'side-delts'], secondaryMuscles: ['abs', 'obliques'],
    equipment: 'single-kb', position: 'standing'
  },
  snatch: {
    id: 'snatch', name: 'Snatch',
    primaryMuscles: ['glutes', 'hamstrings', 'front-delts', 'traps'], secondaryMuscles: ['forearms', 'abs'],
    equipment: 'single-kb', position: 'standing'
  },
  'renegade-row': {
    id: 'renegade-row', name: 'Renegade row',
    primaryMuscles: ['lats', 'biceps'], secondaryMuscles: ['abs', 'forearms', 'chest'],
    equipment: 'two-kb', position: 'floor'
  },

  // ---- sitting variants of existing kneeling movements ----
  'pullover-seated': {
    id: 'pullover-seated', name: 'Pullover (seated)',
    primaryMuscles: ['lats', 'chest'], secondaryMuscles: ['triceps', 'abs'],
    equipment: 'single-kb', position: 'sitting'
  },
  'triceps-extension-seated': {
    id: 'triceps-extension-seated', name: 'Triceps extension (seated)',
    primaryMuscles: ['triceps'], secondaryMuscles: [],
    equipment: 'single-kb', position: 'sitting'
  },
  'upright-row-seated': {
    id: 'upright-row-seated', name: 'Upright row (seated)',
    primaryMuscles: ['traps', 'side-delts'], secondaryMuscles: ['biceps', 'forearms'],
    equipment: 'single-kb', position: 'sitting'
  },

  // ---- other seated movements ----
  'seated-press': {
    id: 'seated-press', name: 'Seated press',
    primaryMuscles: ['front-delts', 'triceps'], secondaryMuscles: ['abs', 'traps'],
    equipment: 'single-kb', position: 'sitting'
  },
  'seated-russian-twist': {
    id: 'seated-russian-twist', name: 'Seated Russian twist',
    primaryMuscles: ['obliques'], secondaryMuscles: ['abs', 'forearms'],
    equipment: 'single-kb', position: 'sitting'
  },
  'seated-halo': {
    id: 'seated-halo', name: 'Seated halo',
    primaryMuscles: ['front-delts', 'side-delts'], secondaryMuscles: ['abs', 'obliques'],
    equipment: 'single-kb', position: 'sitting'
  },

  // ---- other popular kettlebell movements (not yet in the program, available to build with) ----
  'turkish-get-up': {
    id: 'turkish-get-up', name: 'Turkish get-up',
    primaryMuscles: ['abs', 'glutes', 'front-delts'], secondaryMuscles: ['obliques', 'quads', 'triceps'],
    equipment: 'single-kb', position: 'floor'
  },
  windmill: {
    id: 'windmill', name: 'Windmill',
    primaryMuscles: ['obliques', 'hamstrings'], secondaryMuscles: ['side-delts', 'abs'],
    equipment: 'single-kb', position: 'standing'
  },
  'single-leg-deadlift': {
    id: 'single-leg-deadlift', name: 'Single-leg deadlift',
    primaryMuscles: ['hamstrings', 'glutes'], secondaryMuscles: ['lower-back', 'abs'],
    equipment: 'single-kb', position: 'standing'
  },
  'kb-deadlift': {
    id: 'kb-deadlift', name: 'Kettlebell deadlift',
    primaryMuscles: ['hamstrings', 'glutes'], secondaryMuscles: ['lower-back', 'forearms'],
    equipment: 'single-kb', position: 'standing'
  },
  'figure-8': {
    id: 'figure-8', name: 'Figure-8',
    primaryMuscles: ['obliques'], secondaryMuscles: ['forearms', 'abs'],
    equipment: 'single-kb', position: 'standing'
  },
  'farmers-carry': {
    id: 'farmers-carry', name: "Farmer's carry",
    primaryMuscles: ['forearms', 'traps'], secondaryMuscles: ['abs', 'quads'],
    equipment: 'two-kb', position: 'standing'
  },
  'suitcase-carry': {
    id: 'suitcase-carry', name: 'Suitcase carry',
    primaryMuscles: ['obliques', 'forearms'], secondaryMuscles: ['abs', 'traps'],
    equipment: 'single-kb', position: 'standing'
  },
  'sumo-deadlift-high-pull': {
    id: 'sumo-deadlift-high-pull', name: 'Sumo deadlift high pull',
    primaryMuscles: ['glutes', 'traps'], secondaryMuscles: ['hamstrings', 'forearms', 'quads'],
    equipment: 'single-kb', position: 'standing'
  },
  'push-press': {
    id: 'push-press', name: 'Push press',
    primaryMuscles: ['front-delts', 'triceps', 'quads'], secondaryMuscles: ['abs', 'traps'],
    equipment: 'single-kb', position: 'standing'
  },
  'bottoms-up-press': {
    id: 'bottoms-up-press', name: 'Bottoms-up press',
    primaryMuscles: ['front-delts', 'forearms'], secondaryMuscles: ['triceps', 'abs'],
    equipment: 'single-kb', position: 'standing'
  },
  'floor-press': {
    id: 'floor-press', name: 'Floor press',
    primaryMuscles: ['chest', 'triceps'], secondaryMuscles: ['front-delts'],
    equipment: 'single-kb', position: 'floor'
  },
  'situp-to-press': {
    id: 'situp-to-press', name: 'Sit-up to press',
    primaryMuscles: ['abs', 'front-delts'], secondaryMuscles: ['triceps', 'obliques'],
    equipment: 'single-kb', position: 'floor'
  }
};
