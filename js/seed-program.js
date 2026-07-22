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
      { activityId: 'football', timing: 'after', order: 11 }
    ],
    notes: 'Light shoulder rehab + mobility routine, active recovery, football afterward.'
  },
  wed: {
    complex: {
      exerciseIds: ['one-hand-swing-ex', 'curl-to-goblet-squat-thruster', 'kb-marches-ex', 'pullover-to-triceps-extension', 'one-kb-pushup'],
      targetWeightKg: 16,
      focusNote: 'Legs, chest, triceps, shoulders, core. Mid-transition — see pending changes.'
    },
    activities: [
      { activityId: 'plate-pinch', timing: 'after', order: 0 },
      { activityId: 'incline-dumbbell-press', timing: 'after', order: 1 },
      { activityId: 'dead-bug', timing: 'after', order: 2 },
      { activityId: 'dip', timing: 'after', order: 3 },
      { activityId: 'basketball', timing: 'after', order: 4 }
    ],
    notes: 'Dips optional here (see Monday note). Basketball after training.'
  },
  thu: {
    complex: null,
    activities: [
      { activityId: 'pogo-hop', timing: 'standalone', order: 0 },
      { activityId: 'lateral-pogo-hop', timing: 'standalone', order: 1 },
      { activityId: 'box-step-off', timing: 'standalone', order: 2 }
    ],
    notes: 'Plyometrics — short, high-intensity. Placed here (not Saturday) so it isn’t the same day as football.'
  },
  fri: {
    complex: {
      exerciseIds: ['two-hand-swing-ex', 'goblet-squat-ex', 'two-hand-row-ex', 'wood-chop-ex', 'around-the-world-to-catch-to-reverse-lunge', 'side-bend-ex'],
      targetWeightKg: 16,
      focusNote: 'Legs, back, biceps, core/obliques. Complements Wednesday. (Was 20kg, lowered — wood chop was too heavy at 20kg.)'
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
      exerciseIds: ['clean-to-reverse-lunge', 'rotational-thruster-ex', 'upright-row-to-press', 'halo-to-pullover-to-triceps-extension', 'kb-pushups-on-ball'],
      targetWeightKg: 12,
      focusNote: 'Shoulders, chest, triceps — deliberately light going into Monday.'
    },
    activities: [
      { activityId: 'incline-dumbbell-press', timing: 'after', order: 0 },
      { activityId: 'dumbbell-flyes', timing: 'after', order: 1 }
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
