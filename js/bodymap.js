// Schematic (not anatomically precise) front/back body-map SVG. The
// silhouette is built from rounded-rect "capsules" (not ellipses) for the
// torso/limbs, because a full ellipse tapers to a point at its own top and
// bottom — stacking ellipses of different widths for chest/waist/hips
// produces pinch points instead of a visible waist. Capsules keep their
// nominal width along their length and only round off at the very ends, so
// a narrower waist capsule between a wider chest and wider hips actually
// reads as a waist. The head stays a simple ellipse. Muscle regions on top
// are still soft ellipses (a muscle SHOULD look like a rounded bulge).
// Everything with data-muscle="<MUSCLE_KEYS value>" is colorable via
// colorBodyMap(); plain silhouette shapes are never touched by JS.

function renderBodyMapSVG() {
  const silhouette = `
    <ellipse class="silhouette" cx="120" cy="24" rx="19" ry="21"/>
    <rect class="silhouette" x="106" y="42" width="28" height="14" rx="7"/>
    <rect class="silhouette" x="78" y="44" width="84" height="80" rx="30"/>
    <rect class="silhouette" x="92" y="110" width="56" height="60" rx="24"/>
    <rect class="silhouette" x="80" y="150" width="80" height="70" rx="30"/>
    <ellipse class="silhouette" cx="70" cy="76" rx="15" ry="20"/>
    <ellipse class="silhouette" cx="170" cy="76" rx="15" ry="20"/>
    <rect class="silhouette" x="46" y="50" width="32" height="96" rx="16"/>
    <rect class="silhouette" x="162" y="50" width="32" height="96" rx="16"/>
    <rect class="silhouette" x="50" y="138" width="24" height="76" rx="12"/>
    <rect class="silhouette" x="166" y="138" width="24" height="76" rx="12"/>
    <rect class="silhouette" x="76" y="206" width="40" height="128" rx="20"/>
    <rect class="silhouette" x="124" y="206" width="40" height="128" rx="20"/>
    <rect class="silhouette" x="80" y="326" width="32" height="98" rx="16"/>
    <rect class="silhouette" x="128" y="326" width="32" height="98" rx="16"/>
  `;

  const frontRegions = `
    <ellipse data-muscle="front-delts" cx="62" cy="68" rx="14" ry="12"/>
    <ellipse data-muscle="front-delts" cx="178" cy="68" rx="14" ry="12"/>
    <ellipse data-muscle="side-delts" cx="74" cy="78" rx="9" ry="14"/>
    <ellipse data-muscle="side-delts" cx="166" cy="78" rx="9" ry="14"/>
    <ellipse data-muscle="biceps" cx="62" cy="98" rx="12" ry="32"/>
    <ellipse data-muscle="biceps" cx="178" cy="98" rx="12" ry="32"/>
    <ellipse data-muscle="forearms" cx="62" cy="176" rx="10" ry="30"/>
    <ellipse data-muscle="forearms" cx="178" cy="176" rx="10" ry="30"/>
    <ellipse data-muscle="chest" cx="120" cy="76" rx="32" ry="20"/>
    <ellipse data-muscle="abs" cx="120" cy="118" rx="17" ry="11"/>
    <ellipse data-muscle="abs" cx="120" cy="136" rx="17" ry="11"/>
    <ellipse data-muscle="abs" cx="120" cy="154" rx="17" ry="11"/>
    <ellipse data-muscle="obliques" cx="98" cy="140" rx="10" ry="26"/>
    <ellipse data-muscle="obliques" cx="142" cy="140" rx="10" ry="26"/>
    <ellipse data-muscle="hip-flexors" cx="100" cy="180" rx="14" ry="10"/>
    <ellipse data-muscle="hip-flexors" cx="140" cy="180" rx="14" ry="10"/>
    <ellipse data-muscle="quads" cx="96" cy="268" rx="18" ry="58"/>
    <ellipse data-muscle="quads" cx="144" cy="268" rx="18" ry="58"/>
    <ellipse data-muscle="calves" cx="96" cy="376" rx="14" ry="46"/>
    <ellipse data-muscle="calves" cx="144" cy="376" rx="14" ry="46"/>
  `;

  const backRegions = `
    <polygon data-muscle="traps" points="98,42 142,42 156,72 84,72"/>
    <ellipse data-muscle="rear-delts" cx="62" cy="68" rx="14" ry="12"/>
    <ellipse data-muscle="rear-delts" cx="178" cy="68" rx="14" ry="12"/>
    <ellipse data-muscle="side-delts" cx="74" cy="78" rx="9" ry="14"/>
    <ellipse data-muscle="side-delts" cx="166" cy="78" rx="9" ry="14"/>
    <ellipse data-muscle="lats" cx="94" cy="100" rx="16" ry="34"/>
    <ellipse data-muscle="lats" cx="146" cy="100" rx="16" ry="34"/>
    <ellipse data-muscle="triceps" cx="62" cy="98" rx="12" ry="32"/>
    <ellipse data-muscle="triceps" cx="178" cy="98" rx="12" ry="32"/>
    <ellipse data-muscle="forearms" cx="62" cy="176" rx="10" ry="30"/>
    <ellipse data-muscle="forearms" cx="178" cy="176" rx="10" ry="30"/>
    <ellipse data-muscle="lower-back" cx="120" cy="150" rx="20" ry="28"/>
    <ellipse data-muscle="glutes" cx="98" cy="192" rx="19" ry="20"/>
    <ellipse data-muscle="glutes" cx="142" cy="192" rx="19" ry="20"/>
    <ellipse data-muscle="hamstrings" cx="96" cy="268" rx="16" ry="52"/>
    <ellipse data-muscle="hamstrings" cx="144" cy="268" rx="16" ry="52"/>
    <ellipse data-muscle="calves" cx="96" cy="376" rx="14" ry="46"/>
    <ellipse data-muscle="calves" cx="144" cy="376" rx="14" ry="46"/>
  `;

  return `
    <svg id="bodymap-svg" viewBox="0 0 240 440" xmlns="http://www.w3.org/2000/svg" class="bodymap">
      <g class="silhouette-layer">${silhouette}</g>
      <g data-view="front" class="muscle-layer">${frontRegions}</g>
      <g data-view="back" class="muscle-layer" style="display:none">${backRegions}</g>
    </svg>
  `;
}

function colorBodyMap(svgRoot, muscleUnion) {
  if (!svgRoot) return;
  MUSCLE_KEYS.forEach(key => {
    const els = svgRoot.querySelectorAll(`[data-muscle="${key}"]`);
    let fill = 'var(--muscle-none)';
    if (muscleUnion.primary.has(key)) fill = 'var(--muscle-primary)';
    else if (muscleUnion.secondary.has(key)) fill = 'var(--muscle-secondary)';
    els.forEach(el => { el.style.fill = fill; });
  });
}

function setBodyMapView(svgRoot, view) {
  if (!svgRoot) return;
  svgRoot.querySelector('[data-view="front"]').style.display = view === 'front' ? '' : 'none';
  svgRoot.querySelector('[data-view="back"]').style.display = view === 'back' ? '' : 'none';
}
