// Seed data for ACTIVITIES — the unified library for everything that is NOT
// a kettlebell complex movement/exercise: strength extras, plyometrics,
// calisthenics, and cardio/sport. One library, filterable by `category`.
// Draft muscle/impact tags — review/correct through the app afterward.

const ACTIVITIES = {
  // ---- strength-extra ----
  'kb-plank-drag': {
    id: 'kb-plank-drag', name: 'KB plank drag', category: 'strength-extra',
    primaryMuscles: ['abs'], secondaryMuscles: ['obliques', 'front-delts'],
    impactLevel: 'low', logFields: { weight: false, reps: true, duration: false, distance: false, pace: false }
  },
  'windshield-wipers': {
    id: 'windshield-wipers', name: 'Windshield wipers', category: 'strength-extra',
    primaryMuscles: ['obliques'], secondaryMuscles: ['abs'],
    impactLevel: 'low', logFields: { weight: false, reps: true, duration: false, distance: false, pace: false }
  },
  dip: {
    id: 'dip', name: 'Dips', category: 'strength-extra',
    primaryMuscles: ['chest', 'triceps'], secondaryMuscles: ['front-delts'],
    impactLevel: 'low', logFields: { weight: false, reps: true, duration: false, distance: false, pace: false }
  },
  'plate-pinch': {
    id: 'plate-pinch', name: 'Plate pinch', category: 'strength-extra',
    primaryMuscles: ['forearms'], secondaryMuscles: [],
    impactLevel: 'low', logFields: { weight: true, reps: true, duration: false, distance: false, pace: false }
  },
  'incline-dumbbell-press': {
    id: 'incline-dumbbell-press', name: 'Incline dumbbell press', category: 'strength-extra',
    primaryMuscles: ['chest'], secondaryMuscles: ['front-delts', 'triceps'],
    impactLevel: 'low', logFields: { weight: true, reps: true, duration: false, distance: false, pace: false }
  },
  'dead-bug': {
    id: 'dead-bug', name: 'Dead bug', category: 'strength-extra',
    primaryMuscles: ['abs'], secondaryMuscles: ['hip-flexors'],
    impactLevel: 'low', logFields: { weight: false, reps: true, duration: false, distance: false, pace: false }
  },
  'plank-with-saw': {
    id: 'plank-with-saw', name: 'Plank with saw', category: 'strength-extra',
    primaryMuscles: ['abs'], secondaryMuscles: ['obliques'],
    impactLevel: 'low', logFields: { weight: false, reps: true, duration: false, distance: false, pace: false }
  },
  'toe-to-sky': {
    id: 'toe-to-sky', name: 'Toe-to-sky', category: 'strength-extra',
    primaryMuscles: ['abs'], secondaryMuscles: ['hip-flexors'],
    impactLevel: 'low', logFields: { weight: false, reps: true, duration: false, distance: false, pace: false }
  },
  'dumbbell-flyes': {
    id: 'dumbbell-flyes', name: 'Dumbbell flyes', category: 'strength-extra',
    primaryMuscles: ['chest'], secondaryMuscles: ['front-delts'],
    impactLevel: 'low', logFields: { weight: true, reps: true, duration: false, distance: false, pace: false }
  },
  'rehab-external-rotation': {
    id: 'rehab-external-rotation', name: 'Rehab 1 — external rotation (cable)', category: 'strength-extra',
    primaryMuscles: ['rear-delts'], secondaryMuscles: [],
    impactLevel: 'low', logFields: { weight: true, reps: true, duration: false, distance: false, pace: false }
  },
  'rehab-lateral-raise': {
    id: 'rehab-lateral-raise', name: 'Rehab 2 — cable lateral raise from hip', category: 'strength-extra',
    primaryMuscles: ['side-delts'], secondaryMuscles: [],
    impactLevel: 'low', logFields: { weight: true, reps: true, duration: false, distance: false, pace: false }
  },
  'stretch-90-90': {
    id: 'stretch-90-90', name: '90/90 hip rotation', category: 'strength-extra',
    primaryMuscles: ['lower-back'], secondaryMuscles: ['glutes', 'hip-flexors'],
    impactLevel: 'low', logFields: { weight: false, reps: false, duration: true, distance: false, pace: false }
  },
  'stretch-cat-cow': {
    id: 'stretch-cat-cow', name: 'Cat-cow', category: 'strength-extra',
    primaryMuscles: ['lower-back'], secondaryMuscles: [],
    impactLevel: 'low', logFields: { weight: false, reps: false, duration: true, distance: false, pace: false }
  },
  'stretch-childs-pose': {
    id: 'stretch-childs-pose', name: "Child's pose with side reach", category: 'strength-extra',
    primaryMuscles: ['lower-back'], secondaryMuscles: ['obliques'],
    impactLevel: 'low', logFields: { weight: false, reps: false, duration: true, distance: false, pace: false }
  },
  'stretch-hip-flexor': {
    id: 'stretch-hip-flexor', name: 'Kneeling hip flexor stretch (90-90 lunge)', category: 'strength-extra',
    primaryMuscles: ['hip-flexors'], secondaryMuscles: [],
    impactLevel: 'low', logFields: { weight: false, reps: false, duration: true, distance: false, pace: false }
  },
  'stretch-pigeon': {
    id: 'stretch-pigeon', name: 'Pigeon pose / figure-4', category: 'strength-extra',
    primaryMuscles: ['glutes'], secondaryMuscles: [],
    impactLevel: 'low', logFields: { weight: false, reps: false, duration: true, distance: false, pace: false }
  },
  'stretch-hamstring': {
    id: 'stretch-hamstring', name: 'Standing hamstring stretch', category: 'strength-extra',
    primaryMuscles: ['hamstrings'], secondaryMuscles: [],
    impactLevel: 'low', logFields: { weight: false, reps: false, duration: true, distance: false, pace: false }
  },
  'stretch-calf': {
    id: 'stretch-calf', name: 'Standing calf stretch', category: 'strength-extra',
    primaryMuscles: ['calves'], secondaryMuscles: [],
    impactLevel: 'low', logFields: { weight: false, reps: false, duration: true, distance: false, pace: false }
  },
  'stretch-chest-doorway': {
    id: 'stretch-chest-doorway', name: 'Doorway chest stretch', category: 'strength-extra',
    primaryMuscles: ['chest'], secondaryMuscles: ['front-delts'],
    impactLevel: 'low', logFields: { weight: false, reps: false, duration: true, distance: false, pace: false }
  },
  'stretch-thread-needle': {
    id: 'stretch-thread-needle', name: 'Thread the needle (t-spine rotation)', category: 'strength-extra',
    primaryMuscles: ['traps'], secondaryMuscles: ['rear-delts'],
    impactLevel: 'low', logFields: { weight: false, reps: false, duration: true, distance: false, pace: false }
  },

  // ---- plyometric ----
  'pogo-hop': {
    id: 'pogo-hop', name: 'Pogo hops in place', category: 'plyometric',
    primaryMuscles: ['calves'], secondaryMuscles: ['quads', 'hamstrings'],
    impactLevel: 'high', logFields: { weight: false, reps: false, duration: true, distance: false, pace: false }
  },
  'lateral-pogo-hop': {
    id: 'lateral-pogo-hop', name: 'Lateral pogo hops', category: 'plyometric',
    primaryMuscles: ['calves'], secondaryMuscles: ['obliques', 'hip-flexors'],
    impactLevel: 'high', logFields: { weight: false, reps: false, duration: true, distance: false, pace: false }
  },
  'box-step-off': {
    id: 'box-step-off', name: 'Box step-off with controlled landing', category: 'plyometric',
    primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['calves', 'hamstrings'],
    impactLevel: 'high', logFields: { weight: false, reps: true, duration: false, distance: false, pace: false }
  },

  // ---- calisthenics ----
  'chin-up-wide': {
    id: 'chin-up-wide', name: 'Chins (wide/normal grip)', category: 'calisthenics',
    primaryMuscles: ['lats', 'biceps'], secondaryMuscles: ['rear-delts', 'forearms'],
    impactLevel: 'low', logFields: { weight: false, reps: true, duration: false, distance: false, pace: false }
  },
  'chin-up-narrow-neutral': {
    id: 'chin-up-narrow-neutral', name: 'Chins, narrow neutral grip (hammer)', category: 'calisthenics',
    primaryMuscles: ['forearms', 'lats'], secondaryMuscles: ['biceps'],
    impactLevel: 'low', logFields: { weight: false, reps: true, duration: false, distance: false, pace: false }
  },
  'biceps-pullup': {
    id: 'biceps-pullup', name: 'Biceps pullups (narrow, palms away)', category: 'calisthenics',
    primaryMuscles: ['biceps'], secondaryMuscles: ['lats', 'forearms'],
    impactLevel: 'low', logFields: { weight: false, reps: true, duration: false, distance: false, pace: false }
  },

  // ---- cardio-sport ----
  football: {
    id: 'football', name: 'Football', category: 'cardio-sport',
    primaryMuscles: ['quads', 'hamstrings', 'glutes'], secondaryMuscles: ['calves', 'abs'],
    impactLevel: 'high', logFields: { weight: false, reps: false, duration: true, distance: false, pace: false }
  },
  basketball: {
    id: 'basketball', name: 'Basketball', category: 'cardio-sport',
    primaryMuscles: ['quads', 'calves'], secondaryMuscles: ['glutes', 'abs'],
    impactLevel: 'high', logFields: { weight: false, reps: false, duration: true, distance: false, pace: false }
  },
  running: {
    id: 'running', name: 'Running', category: 'cardio-sport',
    primaryMuscles: ['quads', 'hamstrings', 'calves'], secondaryMuscles: ['glutes'],
    impactLevel: 'moderate', logFields: { weight: false, reps: false, duration: true, distance: true, pace: true }
  }
};
