// Shared vocabulary used by seed-movements.js, seed-activities.js, coverage.js,
// warnings.js and bodymap.js. Keep this the single source of truth for these
// enums rather than redefining muscle/equipment/category names elsewhere.

const MUSCLE_GROUPS = [
  { key: 'chest', label: 'Chest' },
  { key: 'lats', label: 'Lats / Upper back' },
  { key: 'lower-back', label: 'Lower back' },
  { key: 'traps', label: 'Traps' },
  { key: 'front-delts', label: 'Front delts' },
  { key: 'side-delts', label: 'Side delts' },
  { key: 'rear-delts', label: 'Rear delts' },
  { key: 'biceps', label: 'Biceps' },
  { key: 'triceps', label: 'Triceps' },
  { key: 'forearms', label: 'Forearms' },
  { key: 'abs', label: 'Abs' },
  { key: 'obliques', label: 'Obliques' },
  { key: 'glutes', label: 'Glutes' },
  { key: 'quads', label: 'Quads' },
  { key: 'hamstrings', label: 'Hamstrings' },
  { key: 'calves', label: 'Calves' },
  { key: 'hip-flexors', label: 'Hip flexors' }
];
const MUSCLE_KEYS = MUSCLE_GROUPS.map(m => m.key);
const MUSCLE_LABELS = Object.fromEntries(MUSCLE_GROUPS.map(m => [m.key, m.label]));

const EQUIPMENT_TYPES = ['single-kb', 'two-kb', 'bodyweight', 'bench', 'cable'];
const EQUIPMENT_LABELS = {
  'single-kb': 'Single kettlebell', 'two-kb': 'Two kettlebells',
  bodyweight: 'Bodyweight', bench: 'Bench', cable: 'Cable'
};

const BODY_POSITIONS = ['standing', 'kneeling', 'sitting', 'floor', 'one-knee'];
const POSITION_LABELS = { standing: 'Standing', kneeling: 'Kneeling', sitting: 'Sitting', floor: 'Floor', 'one-knee': 'One knee' };

const ACTIVITY_CATEGORIES = ['strength-extra', 'plyometric', 'calisthenics', 'cardio-sport'];
const CATEGORY_LABELS = {
  'strength-extra': 'Extra exercise', plyometric: 'Plyometric',
  calisthenics: 'Calisthenics', 'cardio-sport': 'Cardio / sport'
};

const IMPACT_LEVELS = ['low', 'moderate', 'high'];

const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
const DAY_LABELS_SHORT = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };

// Merges several {primary:[...], secondary:[...]} muscle sets into one.
// Primary wins if a muscle shows up as both primary and secondary somewhere in the mix.
function mergeMuscleSets(setsArray) {
  const primary = new Set(), secondary = new Set();
  setsArray.forEach(({ primary: p = [], secondary: s = [] }) => {
    p.forEach(m => primary.add(m));
    s.forEach(m => secondary.add(m));
  });
  secondary.forEach(m => { if (primary.has(m)) secondary.delete(m); });
  return { primary, secondary };
}
