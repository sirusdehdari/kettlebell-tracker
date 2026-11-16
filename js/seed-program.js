// Seed data for EXERCISES (movement chains), the weekly SCHEDULE (complexes +
// assigned activities per day), and the initial PENDING_CHANGES queue.
// Drawn directly from kettlebell_program_spec.md — this is the user's actual
// current program as of when that document was written; edit through the
// app from here on rather than this file.

const EXERCISES = {
  'two-hand-swing-ex': {
    id: 'two-hand-swing-ex', name: 'Two-hand swing', movementIds: ['two-hand-swing'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'clean-to-squat-to-press': {
    id: 'clean-to-squat-to-press', name: 'Clean to squat to press',
    movementIds: ['clean', 'goblet-squat', 'press'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'gorilla-rows': {
    id: 'gorilla-rows', name: 'Gorilla rows', movementIds: ['gorilla-row'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'ballistic-rows': {
    id: 'ballistic-rows', name: 'Ballistic rows', movementIds: ['ballistic-row'],
    status: 'active', blockerNote: null, replacesExerciseId: null, seedVersion: 2
  },
  'high-pull-ex': {
    id: 'high-pull-ex', name: 'High pull', movementIds: ['high-pull'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'around-the-world-to-catch': {
    id: 'around-the-world-to-catch', name: 'Around the world to catch', movementIds: ['around-the-world-catch'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'one-hand-swing-ex': {
    id: 'one-hand-swing-ex', name: 'One-hand swing', movementIds: ['one-hand-swing'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'curl-to-goblet-squat-thruster': {
    id: 'curl-to-goblet-squat-thruster', name: 'Curl to goblet squat thruster',
    movementIds: ['curl', 'squat-thruster'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'kb-marches-ex': {
    id: 'kb-marches-ex', name: 'KB marches', movementIds: ['kb-marches'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'pullover-to-triceps-extension': {
    id: 'pullover-to-triceps-extension', name: 'Pullover to triceps extension',
    movementIds: ['pullover', 'triceps-extension'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'one-kb-pushup': {
    id: 'one-kb-pushup', name: 'One KB pushup', movementIds: ['kb-pushup'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'goblet-squat-ex': {
    id: 'goblet-squat-ex', name: 'Goblet squat', movementIds: ['goblet-squat'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'two-hand-row-ex': {
    id: 'two-hand-row-ex', name: 'Two-hand row', movementIds: ['two-hand-row'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'wood-chop-ex': {
    id: 'wood-chop-ex', name: 'Wood chop', movementIds: ['wood-chop'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'around-the-world-to-catch-to-reverse-lunge': {
    id: 'around-the-world-to-catch-to-reverse-lunge', name: 'Around the world to catch to reverse lunge',
    movementIds: ['around-the-world-catch', 'reverse-lunge'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'side-bend-ex': {
    id: 'side-bend-ex', name: 'Side bend', movementIds: ['side-bend'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'clean-to-reverse-lunge': {
    id: 'clean-to-reverse-lunge', name: 'Two-hand clean to reverse lunge',
    movementIds: ['clean', 'reverse-lunge'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'rotational-thruster-ex': {
    id: 'rotational-thruster-ex', name: 'Rotational thruster', movementIds: ['rotational-thruster'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'upright-row-to-press': {
    id: 'upright-row-to-press', name: 'Upright row to press', movementIds: ['upright-row', 'press'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'halo-to-pullover-to-triceps-extension': {
    id: 'halo-to-pullover-to-triceps-extension', name: 'Halo to pullover to triceps extension',
    movementIds: ['halo', 'pullover', 'triceps-extension'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },
  'kb-pushups-on-ball': {
    id: 'kb-pushups-on-ball', name: 'KB pushups (on the ball)', movementIds: ['kb-pushup'],
    status: 'active', blockerNote: null, replacesExerciseId: null
  },

  // ---- future / blocked exercises (do not affect the active program) ----
  'one-hand-swing-to-snatch-complex': {
    id: 'one-hand-swing-to-snatch-complex', name: 'One-hand swing to snatch to squat to thruster',
    movementIds: ['one-hand-swing', 'snatch', 'goblet-squat'],
    status: 'future', blockerNote: 'Needs snatch technique coached first — KB must rotate smoothly around the wrist.',
    replacesExerciseId: 'one-hand-swing-ex'
  },
  'renegade-row-with-pushup': {
    id: 'renegade-row-with-pushup', name: 'Renegade row with pushup',
    movementIds: ['renegade-row', 'kb-pushup'],
    status: 'future', blockerNote: 'Activates once Wednesday exercise 1 becomes the full snatch complex (squat+press already covered there).',
    replacesExerciseId: 'curl-to-goblet-squat-thruster'
  },

  // ---- Program 1 as actually run (2026-11) ----
  // Sunday: plain floor pushups instead of KB pushups on the ball (those
  // bother the right shoulder).
  'pushup-ex': {
    id: 'pushup-ex', name: 'Pushups', movementIds: ['pushup'],
    status: 'active', blockerNote: null, replacesExerciseId: null, seedVersion: 3
  },

  // ---- Program 2 (2026-11) ----
  // Monday
  'dead-stop-swing-ex': {
    id: 'dead-stop-swing-ex', name: 'Dead-stop swing', movementIds: ['dead-stop-swing'],
    status: 'active', blockerNote: null, replacesExerciseId: null, seedVersion: 2,
    notes: 'Two hands on the handle. Park the bell a foot in front of you, hike it back, swing to chest height, then let it swing back and park it with a full stop. Reset the hinge before every rep. 8 reps, 6 late in the AMRAP.'
  },
  'horn-curl-to-reverse-lunge-to-press': {
    id: 'horn-curl-to-reverse-lunge-to-press', name: 'Horn curl to reverse lunge to press',
    movementIds: ['horn-curl', 'reverse-lunge', 'press'],
    status: 'active', blockerNote: null, replacesExerciseId: null, seedVersion: 2,
    notes: 'Hands on the horns for the whole chain; pick the bell up with a two-hand deadlift, no clean. Curl it to the chest, reverse lunge, press overhead, bring it back to the chest and lower it slowly to the hang. Weeks 1–2: 1 lunge per rep (alternate legs), 3 reps. From week 3: 2 lunges per rep, 4–5 reps.'
  },
  'rdl-to-farmers-carry': {
    id: 'rdl-to-farmers-carry', name: "RDL to farmer's carry",
    movementIds: ['two-kb-rdl', 'farmers-carry'],
    status: 'active', blockerNote: null, replacesExerciseId: null, seedVersion: 2,
    notes: "One bell per hand by the handle, grip never changes. Romanian deadlifts with soft knees and the hips going back, then walk (or march in place) for 20–30 s. Weeks 1–2: 4 reps, lowering only to the knees; then 6 reps to mid-shin. Only one bell free? RDL with it held in both hands, then a suitcase carry switching hands at the turn."
  },
  'bench-supported-row-ex': {
    id: 'bench-supported-row-ex', name: 'Bench-supported row', movementIds: ['bench-supported-row'],
    status: 'active', blockerNote: null, replacesExerciseId: null, seedVersion: 2,
    notes: 'Same-side knee and hand on a flat bench, bell picked up from the floor beside it (one-hand deadlift, no clean). Row to the hip, squeeze 1 s, lower to a full hang. 8–10 per side — the week\'s main pull. No bench free: staggered stance with the free hand braced on the front thigh.'
  },
  // Wednesday (two-hand swing is reused from Program 1)
  'lateral-lunge-to-pause-squat': {
    id: 'lateral-lunge-to-pause-squat', name: 'Lateral lunge to pause squat',
    movementIds: ['lateral-lunge', 'goblet-squat'],
    status: 'active', blockerNote: null, replacesExerciseId: null, seedVersion: 2,
    notes: 'Goblet hold by the horns. Lateral lunge to the left and to the right, then a half-step in to your normal squat width and a goblet squat with a 2-s pause at the bottom. 3 reps a round for the first 2–3 weeks, then 4.'
  },
  'floor-press-to-skull-crusher-to-situp-to-press': {
    id: 'floor-press-to-skull-crusher-to-situp-to-press', name: 'Floor press to skull crusher to sit-up to press',
    movementIds: ['floor-press', 'triceps-extension-lying', 'situp-to-press'],
    status: 'active', blockerNote: null, replacesExerciseId: null, seedVersion: 2,
    notes: 'Hook your feet under something that can\'t move — a loaded dumbbell rack or barbell, not a loose bench. On your back, hands on the horns: floor press; skull crusher with the upper arms tilted slightly back so the bell passes over the crown of your head, not your face; lower to the chest; sit up; press overhead seated. 5 reps. Once a skull crusher slows, leave it out for the rest of the session. If the seated press isn\'t a clean, pain-free lockout, stop the sit-up with the bell at the chest.'
  },
  'tempo-pushup-ex': {
    id: 'tempo-pushup-ex', name: 'Tempo pushup', movementIds: ['pushup'],
    status: 'active', blockerNote: null, replacesExerciseId: null, seedVersion: 2,
    notes: 'Hands on the floor, elbows about 45°. 3 s down, 1-s pause with the chest a fist above the floor, normal speed up. 6 reps; drop to 4 when tired rather than rushing the tempo.'
  },
  // Friday
  'single-leg-deadlift-to-row': {
    id: 'single-leg-deadlift-to-row', name: 'Single-leg deadlift to row',
    movementIds: ['single-leg-deadlift', 'single-arm-row'],
    status: 'active', blockerNote: null, replacesExerciseId: null, seedVersion: 2,
    notes: 'Bell in one hand, picked up beside the foot. Kickstand stance (back toes lightly down), free hand braced on the thigh. Hinge until your back would start to round or the bell reaches mid-shin — no further — row to the hip, then stand up. 4 per side in weeks 1–2, then 5–6.'
  },
  'goblet-step-up-ex': {
    id: 'goblet-step-up-ex', name: 'Goblet step-up', movementIds: ['goblet-step-up'],
    status: 'active', blockerNote: null, replacesExerciseId: null, seedVersion: 2,
    notes: 'Goblet hold, stable box about 30 cm. Step up and stand tall, then step down briskly with the trailing leg; no knee drive at the top. 3 per leg in week 1, then up to 5. Keep it at 3 in weeks with a Friday run.'
  },
  'figure-8-ex': {
    id: 'figure-8-ex', name: 'Figure-8', movementIds: ['figure-8'],
    status: 'active', blockerNote: null, replacesExerciseId: null, seedVersion: 2,
    notes: 'Wide half-squat stance, flat back. Pass the bell between the legs from hand to hand, around one leg and then the other, without stopping. 10 passes.'
  },
  'suitcase-deadlift-to-suitcase-march': {
    id: 'suitcase-deadlift-to-suitcase-march', name: 'Suitcase deadlift to suitcase march',
    movementIds: ['suitcase-deadlift', 'suitcase-march'],
    status: 'active', blockerNote: null, replacesExerciseId: null, seedVersion: 2,
    notes: 'Bell on the floor beside one foot, one hand on the handle. 3 deadlifts without leaning, then stay tall and march in place: 10 slow steps, knees to hip height, without tipping toward the bell. Switch sides.'
  },
  // Sunday
  'halo-to-press-out': {
    id: 'halo-to-press-out', name: 'Halo to press-out', movementIds: ['halo', 'press-out'],
    status: 'active', blockerNote: null, replacesExerciseId: null, seedVersion: 2,
    notes: 'Tall kneeling, bell upside down by the horns at the chest. One halo each way, back to the chest, then press it straight out at chest height, hold 1 s and pull it back. 4 reps.'
  },
  'half-kneeling-chop-ex': {
    id: 'half-kneeling-chop-ex', name: 'Half-kneeling chop', movementIds: ['half-kneeling-chop'],
    status: 'active', blockerNote: null, replacesExerciseId: null, seedVersion: 2,
    notes: 'Half-kneeling, both hands on the horns. Start at shoulder height just outside the front-knee side, elbows in front of the chest; chop diagonally down to outside the opposite hip and back along the same path. 6 per side, then switch knees.'
  },
  'squeeze-press-ex': {
    id: 'squeeze-press-ex', name: 'Squeeze press', movementIds: ['squeeze-press'],
    status: 'active', blockerNote: null, replacesExerciseId: null, seedVersion: 2,
    notes: 'Lying, knees bent, bell at the chest by the horns. Squeeze the horns toward each other the whole set: press up, hold 1 s at the top, lower over 3 s. 6 reps.'
  },
  // Named after week 1 (usual hand width); the close-grip movement stays in
  // the library for when the narrower grip is pain-free.
  'pushup-to-y-t-w': {
    id: 'pushup-to-y-t-w', name: 'Pushup to Y-T-W',
    movementIds: ['pushup', 'prone-y-t-w'],
    status: 'active', blockerNote: null, replacesExerciseId: null, seedVersion: 2,
    notes: '5 pushups at your usual pain-free hand width (elbows 30–45°), down to a fist above the floor. Once that is pain-free you can narrow the grip for more triceps. Then lie face down: 3 rounds of Y, T and W raises, thumbs up, 2-s hold at the top of each.'
  }
};

const WEEKLY_SCHEDULE = {
  mon: {
    complex: {
      exerciseIds: ['two-hand-swing-ex', 'clean-to-squat-to-press', 'gorilla-rows', 'high-pull-ex', 'around-the-world-to-catch'],
      targetWeightKg: 20,
      focusNote: 'Full body — back, biceps, shoulders, legs, press. Hits back/biceps hard since there are 3 days until Saturday’s calisthenics.'
    },
    activities: [
      { activityId: 'kb-plank-drag', timing: 'after', order: 0 },
      { activityId: 'windshield-wipers', timing: 'after', order: 1 },
      { activityId: 'dip', timing: 'after', order: 2 }
    ],
    notes: 'Dips are optional here — alternate with Wednesday, only do one of the two days.'
  },
  tue: {
    complex: null,
    activities: [
      { activityId: 'rehab-external-rotation', timing: 'standalone', order: 0 },
      { activityId: 'rehab-lateral-raise', timing: 'standalone', order: 1 },
      { activityId: 'stretch-90-90', timing: 'standalone', order: 2 },
      { activityId: 'stretch-cat-cow', timing: 'standalone', order: 3 },
      { activityId: 'stretch-childs-pose', timing: 'standalone', order: 4 },
      { activityId: 'stretch-hip-flexor', timing: 'standalone', order: 5 },
      { activityId: 'stretch-pigeon', timing: 'standalone', order: 6 },
      { activityId: 'stretch-hamstring', timing: 'standalone', order: 7 },
      { activityId: 'stretch-calf', timing: 'standalone', order: 8 },
      { activityId: 'stretch-chest-doorway', timing: 'standalone', order: 9 },
      { activityId: 'stretch-thread-needle', timing: 'standalone', order: 10 },
      { activityId: 'basketball', timing: 'after', order: 11 }
    ],
    notes: 'Light shoulder rehab + mobility routine, active recovery, basketball afterward.'
  },
  wed: {
    complex: {
      exerciseIds: ['two-hand-swing-ex', 'curl-to-goblet-squat-thruster', 'kb-marches-ex', 'pullover-to-triceps-extension', 'one-kb-pushup'],
      targetWeightKg: 16,
      focusNote: 'Legs, chest, triceps, shoulders, core. Mid-transition — see pending changes.'
    },
    activities: [
      { activityId: 'plate-pinch', timing: 'after', order: 0 },
      { activityId: 'incline-dumbbell-press', timing: 'after', order: 1 },
      { activityId: 'dead-bug', timing: 'after', order: 2 },
      { activityId: 'dip', timing: 'after', order: 3 }
    ],
    notes: 'Dips optional here (see Monday note).'
  },
  thu: {
    complex: null,
    activities: [
      { activityId: 'pogo-hop', timing: 'standalone', order: 0 },
      { activityId: 'lateral-pogo-hop', timing: 'standalone', order: 1 },
      { activityId: 'box-step-off', timing: 'standalone', order: 2 },
      { activityId: 'football', timing: 'standalone', order: 3 }
    ],
    notes: 'Plyometrics — short, high-intensity.'
  },
  fri: {
    complex: {
      exerciseIds: ['two-hand-swing-ex', 'goblet-squat-ex', 'gorilla-rows', 'around-the-world-to-catch', 'side-bend-ex'],
      targetWeightKg: 16,
      focusNote: 'Legs, back, biceps, core/obliques. Complements Wednesday. (Was 20kg, lowered — wood chop was too heavy at 20kg.) Gorilla rows can be swapped for ballistic rows some weeks.'
    },
    activities: [
      { activityId: 'plank-with-saw', timing: 'after', order: 0 },
      { activityId: 'toe-to-sky', timing: 'after', order: 1 },
      { activityId: 'running', timing: 'after', order: 2 }
    ],
    notes: 'Running is occasional here, not every week.'
  },
  sat: {
    complex: null,
    activities: [
      { activityId: 'chin-up-wide', timing: 'standalone', order: 0 },
      { activityId: 'chin-up-narrow-neutral', timing: 'standalone', order: 1 },
      { activityId: 'biceps-pullup', timing: 'standalone', order: 2 },
      { activityId: 'football', timing: 'after', order: 3 }
    ],
    notes: 'Calisthenics done BEFORE football, not after — arms too fatigued post-match to get value from it.'
  },
  sun: {
    complex: {
      exerciseIds: ['clean-to-reverse-lunge', 'rotational-thruster-ex', 'upright-row-to-press', 'halo-to-pullover-to-triceps-extension', 'pushup-ex'],
      targetWeightKg: 12,
      focusNote: 'Shoulders, chest, triceps — deliberately light going into Monday.',
      positionOverride: 'kneeling'
    },
    activities: [
      { activityId: 'incline-dumbbell-press', timing: 'after', order: 0 },
      { activityId: 'dumbbell-flyes', timing: 'after', order: 1 },
      { activityId: 'football', timing: 'standalone', order: 2 }
    ],
    notes: 'Dumbbell flyes optional, lower priority — only if there’s time.'
  }
};

const PENDING_CHANGES_SEED = [
  {
    id: 'pending-wed-ex4-rename', createdAt: '2026-07-21T00:00:00.000Z',
    targetType: 'exercise', targetId: 'pullover-to-triceps-extension',
    description: 'Change Wednesday exercise 4 from "Pullover to triceps extension" to "Curl to pullover to triceps extension" (on knee) — adds biceps work not otherwise present that day.',
    status: 'pending'
  },
  {
    id: 'pending-snatch-progression-note', createdAt: '2026-07-21T00:00:00.000Z',
    targetType: 'exercise', targetId: null,
    description: 'Snatch progression path: once "One-hand swing to snatch to squat to thruster" activates (Wed ex1), "Curl to goblet squat thruster" (Wed ex2) gets replaced by "Renegade row with pushup" — both future exercises already carry this link, just flagging here for visibility.',
    status: 'pending'
  }
];

// ---- PROGRAM 2 (2026-11) ----
// Program 2 is Program 1's week with these four kettlebell complexes swapped
// in (app.js: buildProgram2Schedule). Every other day, the extras and the day
// notes are copied from the install's own Program 1, and each complex takes
// Program 1's bell weight for that day — targetWeightKg below is only the
// fallback for a day where Program 1 has no complex.
// Built for: no snatches or one-hand cleans (nor anything needing a one-hand
// clean into the rack), no overhead squats, no pushups on bells (right
// shoulder), one bell weight per complex, 20-minute AMRAP.
const PROGRAM_2_COMPLEXES = {
  mon: {
    exerciseIds: ['dead-stop-swing-ex', 'horn-curl-to-reverse-lunge-to-press', 'rdl-to-farmers-carry', 'bench-supported-row-ex'],
    targetWeightKg: 20,
    focusNote: 'Heavy pull and posterior-chain day with one press. Back and biceps get hit hardest here — horn curls, a two-bell carry and paused bench rows — while legs come from dead-stop swings, reverse lunges and a light two-bell RDL. Set up a flat bench and a second bell before the clock starts. Weeks 1–2 back from the break: stay at the low end of every rep range.',
    positionOverride: null
  },
  wed: {
    exerciseIds: ['two-hand-swing-ex', 'lateral-lunge-to-pause-squat', 'floor-press-to-skull-crusher-to-situp-to-press', 'tempo-pushup-ex'],
    targetWeightKg: 16,
    focusNote: 'Legs in a new (sideways) plane, then chest, triceps, shoulders and abs on the floor — no back or biceps today, so Monday\'s pulling recovers. Swings: two-hand, 10 a round, with the same bell as the rest. Set up next to something solid to hook your feet under for the sit-ups.',
    positionOverride: null
  },
  fri: {
    exerciseIds: ['single-leg-deadlift-to-row', 'goblet-step-up-ex', 'figure-8-ex', 'suitcase-deadlift-to-suitcase-march'],
    targetWeightKg: 16,
    focusNote: 'Posterior chain, back and obliques with low-soreness choices the day before football and chins: a supported single-leg hinge into a row, step-ups, figure-8s and a suitcase march. Complements Wednesday — hinge vs. lunge and squat, pull vs. push, obliques vs. abs. Setup: one bell and a stable box.',
    positionOverride: null
  },
  sun: {
    exerciseIds: ['halo-to-press-out', 'half-kneeling-chop-ex', 'squeeze-press-ex', 'pushup-to-y-t-w'],
    targetWeightKg: 12,
    focusNote: 'Light day, all on the knees or the floor: shoulders, chest and triceps, diagonal core and upper-back balance. Unlike Program 1, no legs (football on Saturday and Sunday), no back or biceps (after the chins) and no overhead pressing before Monday — on purpose.',
    positionOverride: null
  }
};

// Extras changes applied on top of the copied week:
// { dayKey, activityId, replaceActivityId: id | null, timing }.
// Two football injury-prevention extras that train what kettlebells can't
// load (adductors; hamstrings as knee flexors). Their start is staggered.
// Monday, after the complex: the day furthest from the football on Thursday
// and at the weekend (soreness from both peaks a day or two later).
const PROGRAM_2_ACTIVITY_CHANGES = [
  { dayKey: 'mon', activityId: 'copenhagen-plank', replaceActivityId: null, timing: 'after' },
  { dayKey: 'mon', activityId: 'nordic-hamstring-curl', replaceActivityId: null, timing: 'after' }
];

// Appended to the copied day note in Program 2, so the staggered start is
// visible on the day page without opening How to.
const PROGRAM_2_DAY_NOTES = {
  mon: 'New in Program 2: nothing extra in week 1. Copenhagen plank from week 2 (knee on the bench, 1 × 5–8 per side); Nordic curls from week 3–4 (1 × 3, partial range), only once the Copenhagen leaves no soreness. Details under How to.'
};

// ---- PROGRAM UPDATES ----
// One-time edits to programs that already exist on a phone (app.js:
// applyProgramUpdates). The week above only seeds fresh installs and Program
// 2 is built once, so a change to either reaches existing data only through
// an update here. Each update runs once per install (its id is recorded in
// meta.appliedUpdates); fresh installs start with every id recorded, because
// the seeds above already include the changes. A step only acts when the day
// still looks as expected, so nothing changed in the app since is overwritten.
// Step: { programs: [program ids], day, op, ...fields, ifHasActivity?: [ids] }
//   replaceExercise {from, to}   replaceActivity {from, to}   addActivity {activityId, timing}
//   removeActivity {activityId}  moveActivity {activityId, toDay}
//   replaceNoteText {from, to}   appendNote {text}   replaceFocusText {from, to}   appendFocusText {text}
const PROGRAM_UPDATES = [
  {
    // Program 1 as actually run, the real cardio week (basketball Tuesday;
    // football Thursday, Saturday and Sunday), Program 2's Wednesday swing to
    // two hands (one bell per complex), and Program 2's Copenhagen plank and
    // Nordic curls moved from Thursday to Monday.
    id: '2026-11-program-1-as-run',
    steps: [
      { programs: ['program-1'], day: 'wed', op: 'replaceExercise', from: 'one-hand-swing-ex', to: 'two-hand-swing-ex' },
      { programs: ['program-1'], day: 'fri', op: 'replaceExercise', from: 'two-hand-row-ex', to: 'gorilla-rows' },
      { programs: ['program-1'], day: 'fri', op: 'appendFocusText', text: 'Gorilla rows can be swapped for ballistic rows some weeks.' },
      { programs: ['program-1'], day: 'sun', op: 'replaceExercise', from: 'kb-pushups-on-ball', to: 'pushup-ex' },
      { programs: ['program-1', 'program-2'], day: 'tue', op: 'replaceActivity', from: 'football', to: 'basketball' },
      { programs: ['program-1', 'program-2'], day: 'tue', op: 'addActivity', activityId: 'basketball', timing: 'after' },
      { programs: ['program-1', 'program-2'], day: 'tue', op: 'replaceNoteText', from: 'football afterward', to: 'basketball afterward' },
      { programs: ['program-1', 'program-2'], day: 'wed', op: 'removeActivity', activityId: 'basketball' },
      { programs: ['program-1', 'program-2'], day: 'wed', op: 'replaceNoteText', from: 'Basketball after training.', to: '' },
      { programs: ['program-1', 'program-2'], day: 'thu', op: 'addActivity', activityId: 'football', timing: 'standalone' },
      { programs: ['program-1', 'program-2'], day: 'thu', op: 'replaceNoteText', from: 'Placed here (not Saturday) so it isn’t the same day as football.', to: '' },
      { programs: ['program-1', 'program-2'], day: 'sat', op: 'addActivity', activityId: 'football', timing: 'after' },
      { programs: ['program-1', 'program-2'], day: 'sun', op: 'addActivity', activityId: 'football', timing: 'standalone' },
      { programs: ['program-2'], day: 'wed', op: 'replaceExercise', from: 'one-hand-swing-ex', to: 'two-hand-swing-ex' },
      { programs: ['program-2'], day: 'wed', op: 'replaceFocusText', from: 'Swings: 5 per hand, swapping hands on the handle at chest height (10 swings); if one-hand swings bother the right shoulder, do 10 two-hand swings.', to: 'Swings: two-hand, 10 a round, with the same bell as the rest.' },
      { programs: ['program-2'], day: 'sun', op: 'replaceFocusText', from: 'no legs (after Saturday\'s football)', to: 'no legs (football on Saturday and Sunday)' },
      { programs: ['program-2'], day: 'thu', op: 'moveActivity', activityId: 'copenhagen-plank', toDay: 'mon' },
      { programs: ['program-2'], day: 'thu', op: 'moveActivity', activityId: 'nordic-hamstring-curl', toDay: 'mon' },
      { programs: ['program-2'], day: 'thu', op: 'replaceNoteText', from: 'New in Program 2: nothing extra in week 1. Copenhagen plank from week 2 (knee on the bench, 1 × 5–8 per side); Nordic curls from week 3–4 (1 × 3, partial range), only once the Copenhagen leaves no soreness. Details under How to.', to: '' },
      { programs: ['program-2'], day: 'mon', op: 'appendNote', text: PROGRAM_2_DAY_NOTES.mon, ifHasActivity: ['copenhagen-plank', 'nordic-hamstring-curl'] }
    ]
  }
];
