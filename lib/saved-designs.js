function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function validColor(value, fallback = '#CCCCCC') {
  return /^#[0-9A-F]{6}$/i.test(String(value)) ? String(value).toUpperCase() : fallback;
}

export function hydrateSavedBead(rawBead, library = []) {
  const raw = rawBead?.bead && typeof rawBead.bead === 'object'
    ? { ...rawBead.bead, ...rawBead }
    : (rawBead ?? {});
  const base = library.find(bead => bead.id === raw.id || bead.id === raw.beadId)
    ?? library.find(bead => bead.name === raw.name)
    ?? {};
  return {
    ...base,
    ...raw,
    id: raw.id ?? raw.beadId ?? base.id ?? `legacy-${String(raw.name ?? 'bead')}`,
    name: raw.name ?? base.name ?? '未命名珠子',
    color: validColor(raw.color ?? raw.hex, validColor(base.color)),
    size: Math.max(2, finite(raw.size, finite(base.size, 4))),
    shape: raw.shape ?? base.shape ?? '圆珠',
    material: raw.material ?? base.material ?? '未知材质',
    family: raw.family ?? base.family ?? '白/米',
    transparency: Math.min(1, Math.max(0, finite(raw.transparency, finite(base.transparency, 0.08)))),
    gloss: Math.min(1, Math.max(0, finite(raw.gloss, finite(base.gloss, 0.45)))),
    role: raw.role ?? base.role ?? 'main',
    suitableRoles: Array.isArray(raw.suitableRoles) ? raw.suitableRoles : (base.suitableRoles ?? ['main'])
  };
}

export function hydrateSavedDesigns(rawDesigns, library = []) {
  if (!Array.isArray(rawDesigns)) return [];
  return rawDesigns.filter(design => design && typeof design === 'object').map((design, designIndex) => {
    const pattern = Array.isArray(design.pattern)
      ? design.pattern.map(bead => hydrateSavedBead(bead, library))
      : [];
    const listedBeads = Array.isArray(design.beads)
      ? design.beads.map(bead => hydrateSavedBead(bead, library))
      : [];
    const beads = pattern.length
      ? [...new Map(pattern.map(bead => [bead.id, bead])).values()]
      : listedBeads;
    return {
      ...design,
      id: design.id ?? `saved-legacy-${designIndex}`,
      profile: design.profile ?? 'airy',
      score: finite(design.score, 80),
      palette: Array.isArray(design.palette) && design.palette.length ? design.palette : ['#EEEAE4', '#8A817A'],
      note: design.note ?? '',
      pattern,
      beads
    };
  });
}
