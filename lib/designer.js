import {
  DESIGN_PROFILES,
  colorDistance,
  designDifference,
  generateDesigns as generateCoreDesigns,
  hexToRgb,
  isBeadForbidden,
  scoreFinalDesign,
  candidatePassesHardRules,
  candidatePassesThemeRatios
} from './designer-core.js?v=83';
export { DESIGN_PROFILES, colorDistance, designDifference, hexToRgb, isBeadForbidden };
function signature(design) { return design.pattern.map(bead => `${bead.id}:${bead.role}`).join('|'); }
function rescore(theme, designs) {
  return designs.map((design, index) => {
    const scoreBreakdown = scoreFinalDesign(theme, design);
    const others = designs.filter((_, otherIndex) => otherIndex !== index);
    const difference = others.length ? others.reduce((sum, other) => sum + designDifference(design, other), 0) / others.length : 1;
    const base = Object.values(scoreBreakdown).reduce((sum, value) => sum + value, 0);
    return { ...design, score: Math.min(100, Math.round(base + difference * 10)), scoreBreakdown: { ...scoreBreakdown, difference: Math.round(difference * 100) / 10 } };
  });
}
export function generateDesigns(theme, library, options = {}) {
  const previous = new Set((options.previousDesigns ?? []).map(signature));
  const baseSeed = Number.isFinite(options.seed) ? Number(options.seed) >>> 0 : 0;
  let best = [];
  let bestQuality = -Infinity;
  for (let attempt = 0; attempt < 18; attempt += 1) {
    const designs = rescore(theme, generateCoreDesigns(theme, library, { ...options, seed: (baseSeed + Math.imul(attempt, 2246822519)) >>> 0 }));
    const validCount = designs.filter(design => candidatePassesHardRules(design) && candidatePassesThemeRatios(design, theme)).length;
    const differences = designs.flatMap((design, index) => designs.slice(index + 1).map(other => designDifference(design, other)));
    const minimumDifference = differences.length ? Math.min(...differences) : 1;
    const repeated = designs.some(design => previous.has(signature(design)));
    const quality = validCount * 10 + minimumDifference - (repeated ? 1 : 0);
    if (quality > bestQuality) { best = designs; bestQuality = quality; }
    if (validCount === designs.length && minimumDifference > 0.45 && !repeated) return designs;
  }
  return best;
}