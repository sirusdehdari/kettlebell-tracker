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
  },

  // ---- Program 2 (2026-11): football injury-prevention extras ----
  // Things the kettlebell complexes can't load. The app's muscle list has no
  // adductors, so the Copenhagen plank carries them in its name.
  'copenhagen-plank': {
    id: 'copenhagen-plank', name: 'Copenhagen plank (adductors)', category: 'strength-extra',
    primaryMuscles: ['obliques'], secondaryMuscles: ['abs', 'glutes'],
    impactLevel: 'low', logFields: { weight: false, reps: true, duration: false, distance: false, pace: false },
    seedVersion: 2,
    notes: 'Forearm side plank with the top leg on a bench; lift the hips by squeezing the top leg down into the bench, elbow under the shoulder. Start in week 2: knee on the bench (short lever), 1 × 5–8 slow raises per side. After 2–3 weeks move to the ankle and build to 2–3 sets — only when the groin feels fine the next morning. If the right shoulder objects as the support arm, do lying knee squeezes on a rolled mat on that side instead.'
  },
  'nordic-hamstring-curl': {
    id: 'nordic-hamstring-curl', name: 'Nordic hamstring curl', category: 'strength-extra',
    primaryMuscles: ['hamstrings'], secondaryMuscles: ['glutes', 'calves'],
    impactLevel: 'low', logFields: { weight: false, reps: true, duration: false, distance: false, pace: false },
    seedVersion: 2,
    notes: 'Kneel on a mat with the heels anchored (partner, Nordic/GHD pad, or a loaded bar at its lowest setting) and lower yourself forward as slowly as you can, catching on a box or bench in front. Start in week 3–4, after the Copenhagen plank causes no soreness: 1 × 3 over a partial range. Build to 2 × 4–6 over 4–6 weeks, increasing only when the next morning is free of hamstring soreness. Skip it in weeks with more football than usual, such as an extra match.'
  }
};
