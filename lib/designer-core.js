// lib/designer-base.js
import { normalizeTheme } from "./theme.js?v=83";
var DESIGN_PROFILES = [
  { key: "flow", label: "小珠细节", structure: "small-bead", targetSizes: { main: 3, secondary: 3, accent: 3, focal: 4, spacer: 3 } },
  { key: "focus", label: "异形结构", structure: "shaped-bead", targetSizes: { main: 4, secondary: 4, accent: 4, focal: 5, spacer: 4 } },
  { key: "airy", label: "大珠质感", structure: "large-bead", targetSizes: { main: 6, secondary: 6, accent: 6, focal: 7, spacer: 6 } }
];
var STRUCTURAL_SHAPES = new Set(["方形珠", "菱形珠", "管珠"]);
var FAMILY_TERMS = {
  "白/米": ["白", "米", "奶油", "燕麦"],
  "金/黄": ["金", "黄"],
  "灰/黑": ["灰", "黑", "墨"],
  "粉/红": ["粉", "红", "玫瑰"],
  "绿": ["绿", "青竹", "竹绿"],
  "蓝": ["蓝", "海"],
  "紫": ["紫"],
  "橙/棕": ["橙", "棕", "褐", "咖啡", "可可"]
};
function hexToRgb(hex) {
  const value = String(hex).replace("#", "");
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16)
  };
}
function colorDistance(left, right) {
  const a = hexToRgb(left);
  const b = hexToRgb(right);
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}
function isBeadForbidden(bead, theme) {
  return (theme.forbiddenColors ?? []).some((rule) => {
    const text = String(rule);
    if (/^#[0-9A-F]{6}$/i.test(text)) return colorDistance(bead.color, text) < 38;
    const terms = FAMILY_TERMS[bead.family] ?? [];
    if (!terms.some((term) => text.includes(term))) return false;
    if (text.includes("高饱和") && bead.saturation < 0.45) return false;
    if (text.includes("厚重") && bead.visualWeight < 0.6) return false;
    return true;
  });
}
function targetMetric(value, map, fallback) {
  return map[value] ?? fallback;
}
function matchCost(bead, role, targetColor, targetSize, theme) {
  const paletteCost = colorDistance(bead.color, targetColor) / 2.8;
  const targetFamily = colorFamily(targetColor);
  const chromaticTarget = !["白/米", "灰/黑"].includes(targetFamily);
  const familyCost = !chromaticTarget || bead.family === targetFamily
    ? 0
    : ["白/米", "灰/黑"].includes(bead.family)
      ? role === "main" ? 44 : 24
      : role === "main" ? 30 : 18;
  const sizeCost = Math.abs(bead.size - targetSize) * (role === "focal" ? 4 : 7);
  const materialCost = theme.materials.includes(bead.material) ? 0 : 13;
  const shapeCost = role === "spacer" ? bead.suitableRoles.includes("spacer") ? 0 : 40 : theme.shapes.includes(bead.shape) ? 0 : 10;
  const roleCost = bead.suitableRoles.includes(role) ? -8 : 12;
  const transparencyCost = Math.abs(bead.transparency - theme.transparency) * 12;
  const desiredSaturation = targetMetric(theme.saturation, { low: 0.16, "medium-low": 0.28, medium: 0.4, "medium-high": 0.55, high: 0.72 }, 0.25);
  const saturationCost = Math.abs(bead.saturation - desiredSaturation) * 10;
  const desiredWeight = targetMetric(theme.visualWeight, { light: 0.24, medium: 0.48, heavy: 0.72 }, 0.3);
  const weightCost = Math.abs(bead.visualWeight - desiredWeight) * 8;
  const metalCost = bead.material !== "金属" ? 0 : theme.metal === "silver" && bead.family === "灰/黑" || theme.metal === "gold" && bead.family === "金/黄" ? -6 : 24;
  return paletteCost + familyCost + sizeCost + materialCost + shapeCost + roleCost + transparencyCost + saturationCost + weightCost + metalCost;
}
function mixSeed(seed, variation, salt) {
  let value = (Number(seed) >>> 0) ^ Math.imul(variation + 1, -1640531527) ^ Math.imul(salt + 1, -2048144789);
  value ^= value >>> 16;
  value = Math.imul(value, 2146121005);
  value ^= value >>> 15;
  value = Math.imul(value, -2073254261);
  return (value ^ value >>> 16) >>> 0;
}
function chooseBead(library, theme, profile, role, targetColor, variation, excludedIds, seed) {
  const targetSize = profile.targetSizes[role];
  const roleEligible = (bead) => {
    if (!bead.suitableRoles.includes(role)) return false;
    if (role === "spacer") return bead.shape === "隔珠";
    if (bead.shape === "隔珠") return false;
    if (profile.key === "airy" && ['main', 'focal'].includes(role) && bead.size < 5) return false;
    if (profile.key === "airy" && role === "secondary" && (bead.size < 4 || bead.size > 6 || bead.shape === "管珠")) return false;
    if (profile.key === "flow" && bead.size > (role === "focal" ? 5 : 3)) return false;
    if (profile.key === "focus" && role === "main" && bead.size !== 4) return false;
    if (profile.key === "focus" && role === "accent" && (bead.size < 4 || bead.size > 5)) return false;
    if (profile.key === "focus" && role === 'secondary' && (bead.size < 4 || bead.size > 5)) return false;
    if (profile.key === "focus" && role === 'focal' && (bead.size < 5 || bead.size > 6)) return false;
    if (profile.key === "focus") {
      if (role === "accent") return ["方形珠", "菱形珠"].includes(bead.shape);
      return !STRUCTURAL_SHAPES.has(bead.shape);
    }
    if (bead.shape === "管珠") return role === "secondary";
    if (STRUCTURAL_SHAPES.has(bead.shape)) return ['secondary', 'focal'].includes(role);
    return true;
  };
  const roleCandidates = library.filter((bead) => roleEligible(bead) && !excludedIds.has(bead.id));
  const permitted = roleCandidates.filter((bead) => !isBeadForbidden(bead, theme));
  let source = permitted.length ? permitted : roleCandidates;
  if (role === "spacer") {
    const preferredMetalFamily = theme.metal === "gold" ? "金/黄" : "灰/黑";
    const matchingMetal = source.filter(bead => bead.material === "金属" && bead.family === preferredMetalFamily);
    if (matchingMetal.length) source = matchingMetal;
  }
  const sizeEligible = source.filter((bead) => Math.abs(bead.size - targetSize) <= 2);
  const allowed = sizeEligible.length ? sizeEligible : source;
  const fallback = source;
  const targetFamily = colorFamily(targetColor);
  const themeUsesEarthTones = theme.palette.some((color) => colorFamily(color) === "橙/棕");
  const gentleEligible = profile.key === "focus" || themeUsesEarthTones
    ? allowed
    : allowed.filter((bead) => bead.family !== "橙/棕");
  let candidateSource = gentleEligible.length ? gentleEligible : allowed.length ? allowed : fallback;
  if (role === "main" || !["白/米", "灰/黑"].includes(targetFamily)) {
    const sameFamily = candidateSource.filter(bead => bead.family === targetFamily);
    if (sameFamily.length) candidateSource = sameFamily;
  }
  const candidates = candidateSource
    .map((bead) => ({ bead, cost: matchCost(bead, role, targetColor, targetSize, theme) }))
    .sort((left, right) => left.cost - right.cost);
  const costWindow = role === "main" ? 24 : role === "focal" ? 30 : 38;
  const qualityCandidates = candidates.filter((candidate) => candidate.cost <= (candidates[0]?.cost ?? 0) + costWindow);
  const poolLimit = role === "main" ? 4 : role === "focal" ? 6 : 7;
  const selectionPool = qualityCandidates.slice(0, poolLimit);
  const roleOffset = { main: 0, secondary: 1, accent: 2, focal: 3, spacer: 4 }[role];
  const profileOffset = { airy: 0, flow: 17, focus: 31 }[profile.key] ?? 0;
  const selected = selectionPool[mixSeed(seed, variation, roleOffset + profileOffset) % Math.max(1, selectionPool.length)]?.bead;
  if (!selected) throw new Error(`没有可用于${role}角色的${targetSize}mm珠子`);
  return { ...selected, role };
}
function assignRoles(library, theme, profile, variation, seed) {
  const palette = theme.palette;
  const excluded = new Set();
  const take = (role, paletteIndex, source = library) => {
    const selected = chooseBead(source, theme, profile, role, palette[paletteIndex] ?? palette.at(-1), variation, excluded, seed);
    excluded.add(selected.id);
    return selected;
  };
  const palettePlan = profile.key === "airy"
    ? { focal: 1, main: 0, secondary: 1, accent: 2 }
    : profile.key === "flow"
      ? { focal: 4, main: 0, secondary: 1, accent: 2 }
      : { focal: 4, main: 0, secondary: 2, accent: 3 };
  const focal = take("focal", palettePlan.focal);
  const spacer = take("spacer", theme.metal === "gold" ? 2 : 1);
  const main = take("main", palettePlan.main);
  const secondarySource = profile.key === "airy"
    ? library.filter(bead => Math.abs(perceivedBrightness(bead.color) - perceivedBrightness(main.color)) <= 60)
    : library;
  const secondary = take("secondary", palettePlan.secondary, secondarySource);
  const accent = take("accent", palettePlan.accent);
  return { focal, spacer, main, secondary, accent };
}
function roleCounts(length, direction) {
  const usable = length - 1;
  let accent = Math.max(4, Math.round(length * direction.accentRatio));
  let spacer = Math.max(0, Math.round(length * direction.spacerRatio));
  spacer = Math.min(spacer, Math.floor(length * 0.12));
  let main = Math.max(1, Math.round(length * direction.mainRatio));
  let secondary = usable - main - accent - spacer;
  if (secondary < 4) {
    main = Math.max(1, main - (4 - secondary));
    secondary = usable - main - accent - spacer;
  }
  if (secondary < 0) {
    accent = Math.max(4, accent + secondary);
    secondary = 0;
  }
  main = usable - accent - spacer - secondary;
  return { main, secondary, accent, spacer, focal: 1 };
}
function capSpacerCount(counts, spacer) {
  const maximum = spacer.size >= 4 ? 2 : 4;
  const removed = Math.max(0, counts.spacer - maximum);
  counts.spacer -= removed;
  counts.main += removed;
}
function spreadPositions(length, count, offset = 0) {
  const positions = [];
  const usable = length - 1;
  for (let index = 0; index < count; index += 1) positions.push(1 + Math.floor((((index + 0.5) * usable / count) + offset) % usable));
  return positions;
}
function claimNearest(pattern, preferred, bead) {
  for (let distance = 0; distance < pattern.length; distance += 1) {
    for (const sign of distance ? [1, -1] : [1]) {
      const index = 1 + ((preferred - 1 + sign * distance) % (pattern.length - 1) + (pattern.length - 1)) % (pattern.length - 1);
      if (!pattern[index]) { pattern[index] = bead; return; }
    }
  }
}
function fillEvenly(pattern, bead, count, offset = 0) {
  for (const position of spreadPositions(pattern.length, count, offset)) claimNearest(pattern, position, bead);
}
function focalOrder(length) {
  const order = [];
  for (let distance = 1; order.length < length - 1; distance += 1) {
    if (distance < length) order.push(distance);
    const mirror = length - distance;
    if (mirror > 0 && mirror < length && mirror !== distance) order.push(mirror);
  }
  return order;
}
function fillFromOrder(pattern, bead, count, order, cursor) {
  let used = 0;
  while (used < count && cursor.index < order.length) {
    const position = order[cursor.index++];
    if (!pattern[position]) { pattern[position] = bead; used += 1; }
  }
}
function buildAiryPattern(roles, length, direction, layoutVariant = 0) {
  const counts = roleCounts(length, direction);
  counts.main += counts.accent + counts.spacer;
  counts.accent = 0;
  counts.spacer = 0;
  if (layoutVariant === 1) counts.secondary = Math.max(counts.secondary, Math.floor((length - 1) * 0.2));
  if (layoutVariant === 2) counts.secondary = Math.max(counts.secondary, Math.floor((length - 1) * 0.28));
  if (STRUCTURAL_SHAPES.has(roles.secondary.shape)) counts.secondary = Math.min(counts.secondary, Math.floor(length * 0.16));
  const pattern = Array(length).fill(null);
  pattern[0] = roles.focal;
  placeSpacers(pattern, roles.spacer, counts.spacer);
  if (layoutVariant === 1) {
    fillEvenly(pattern, roles.secondary, counts.secondary, length / Math.max(2, counts.secondary * 3));
  } else if (layoutVariant === 2) {
    fillFromOrder(pattern, roles.secondary, counts.secondary, opposingClusterOrder(length), { index: 0 });
  } else {
    fillFromOrder(pattern, roles.secondary, counts.secondary, focalOrder(length), { index: 0 });
  }
  return pattern.map(bead => bead ?? roles.main);
}
function sideFlowOrder(length, reverse = false) {
  const usable = length - 1;
  const start = Math.max(2, Math.round(length * 0.14));
  const order = Array.from({ length: usable }, (_, index) => 1 + ((start - 1 + index) % usable));
  return reverse ? order.reverse() : order;
}
function dualArcOrder(length) {
  const usable = length - 1;
  const first = Math.max(1, Math.round(usable * 0.2));
  const second = Math.max(1, Math.round(usable * 0.8));
  const order = [];
  const seen = new Set();
  for (let step = 0; order.length < usable; step += 1) {
    for (const position of [
      1 + ((first - 1 + step) % usable),
      1 + ((second - 1 - step + usable * 2) % usable)
    ]) {
      if (!seen.has(position)) { seen.add(position); order.push(position); }
    }
  }
  return order;
}
function opposingClusterOrder(length) {
  const usable = length - 1;
  const centers = [
    1 + (Math.round(usable * 0.25) % usable),
    1 + (Math.round(usable * 0.75) % usable)
  ];
  const order = [];
  const seen = new Set();
  for (let distance = 0; order.length < usable; distance += 1) {
    for (const center of centers) {
      for (const direction of distance === 0 ? [0] : [-1, 1]) {
        const position = 1 + ((center - 1 + direction * distance + usable * 2) % usable);
        if (!seen.has(position)) { seen.add(position); order.push(position); }
      }
    }
  }
  return order;
}
function placeSpacers(pattern, bead, count) {
  if (count <= 0) return;
  if (count < 4) {
    if (count >= 2) {
      claimNearest(pattern, 1, bead);
      claimNearest(pattern, pattern.length - 1, bead);
    }
    return;
  }
  fillEvenly(pattern, bead, count, pattern.length / Math.max(2, count * 2));
}
function buildFlowPattern(roles, length, direction, layoutVariant = 0) {
  const counts = roleCounts(length, direction);
  capSpacerCount(counts, roles.spacer);
  const pattern = Array(length).fill(null);
  pattern[0] = roles.focal;
  placeSpacers(pattern, roles.spacer, counts.spacer);
  if (layoutVariant === 1) {
    fillEvenly(pattern, roles.secondary, counts.secondary, length / Math.max(2, counts.secondary * 2));
    fillEvenly(pattern, roles.accent, counts.accent, length / Math.max(2, counts.accent * 3));
  } else if (layoutVariant === 2) {
    const order = focalOrder(length);
    const cursor = { index: 0 };
    fillFromOrder(pattern, roles.secondary, counts.secondary, order, cursor);
    fillFromOrder(pattern, roles.accent, counts.accent, order, cursor);
  } else {
    const order = dualArcOrder(length);
    const cursor = { index: 0 };
    fillFromOrder(pattern, roles.secondary, counts.secondary, order, cursor);
    fillFromOrder(pattern, roles.accent, counts.accent, order, cursor);
  }
  return pattern.map(bead => bead ?? roles.main);
}
function buildFocusPattern(roles, length, direction, layoutVariant = 0) {
  const counts = roleCounts(length, direction);
  capSpacerCount(counts, roles.spacer);
  counts.accent = Math.max(counts.accent, Math.floor((length - 1) * 0.55));
  if (roles.accent.shape === "管珠") {
    const maximumTubes = Math.max(4, Math.floor(length * 0.16));
    const removed = Math.max(0, counts.accent - maximumTubes);
    counts.accent -= removed;
    counts.main += removed;
  }
  const pattern = Array(length).fill(null);
  pattern[0] = roles.focal;
  placeSpacers(pattern, roles.spacer, counts.spacer);
  if (layoutVariant === 1) {
    fillFromOrder(pattern, roles.accent, counts.accent, focalOrder(length), { index: 0 });
  } else if (layoutVariant === 2) {
    fillFromOrder(pattern, roles.accent, counts.accent, opposingClusterOrder(length), { index: 0 });
  } else {
    fillEvenly(pattern, roles.accent, counts.accent, length / Math.max(2, counts.accent * 2));
  }
  const order = focalOrder(length);
  const cursor = { index: 0 };
  fillFromOrder(pattern, roles.secondary, counts.secondary, order, cursor);
  return pattern.map(bead => bead ?? roles.main);
}
function patternAtLength(profile, roles, length, direction, layoutVariant) {
  if (direction.layout === "gradient" || profile.key === "flow") return buildFlowPattern(roles, length, direction, layoutVariant);
  if (direction.layout === "cluster" || profile.key === "focus") return buildFocusPattern(roles, length, direction, layoutVariant);
  return buildAiryPattern(roles, length, direction, layoutVariant);
}

function buildPattern(profile, roles, direction, requestedWristSizeCm = 16, layoutVariant = 0) {
  const wristSizeCm = Math.max(14, Math.min(18, Number(requestedWristSizeCm) || 16));
  const targetLengthMm = wristSizeCm * 10;
  let best = null;
  for (let length = 24; length <= 72; length += 1) {
    const pattern = patternAtLength(profile, roles, length, direction, layoutVariant);
    const estimatedLengthMm = pattern.reduce((sum, bead) => sum + bead.size, 0);
    const difference = Math.abs(estimatedLengthMm - targetLengthMm);
    if (!best || difference < best.difference) best = { pattern, estimatedLengthMm, wristSizeCm, difference };
  }
  return best;
}

function clampScore(value, maximum) {
  return Math.max(0, Math.min(maximum, value));
}
function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}
function perceivedBrightness(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function circularDistance(index, length) {
  return Math.min(index, length - index);
}

function sizeRhythm(pattern) {
  const sizeUsage = new Map();
  pattern.forEach((bead) => sizeUsage.set(bead.size, (sizeUsage.get(bead.size) ?? 0) + 1));
  const dominantSize = [...sizeUsage.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? 0;
  const repeatedLargePositions = pattern
    .map((bead, index) => ({ bead, index }))
    .filter(({ bead, index }) => bead.role !== 'focal' && bead.size > dominantSize && circularDistance(index, pattern.length) > 2)
    .map(({ index }) => index);

  if (!repeatedLargePositions.length) return { coherent: true, penalty: 0 };
  if (repeatedLargePositions.length < 4) {
    return { coherent: false, penalty: 5 + (4 - repeatedLargePositions.length) };
  }

  const gaps = repeatedLargePositions.map((position, index) => {
    const next = repeatedLargePositions[(index + 1) % repeatedLargePositions.length];
    return (next - position + pattern.length) % pattern.length;
  });
  const expectedGap = pattern.length / repeatedLargePositions.length;
  const minimumGap = Math.min(...gaps);
  const maximumGap = Math.max(...gaps);
  const coherent = minimumGap >= Math.max(2, expectedGap * 0.4) && maximumGap <= expectedGap * 2;
  const penalty = coherent ? 0 : Math.min(8, 2 + (maximumGap - minimumGap) / Math.max(1, expectedGap));
  return { coherent, penalty };
}

function roleRatios(pattern) {
  const ratio = role => pattern.filter(bead => bead.role === role).length / pattern.length;
  return { main: ratio('main'), accent: ratio('accent'), spacer: ratio('spacer') };
}
function scoreCandidate(theme, profile, pattern, direction = theme.directions.find(item => item.key === profile.key)) {
  const colorDistances = pattern.map(bead => Math.min(...theme.palette.map(color => colorDistance(bead.color, color))));
  const forbiddenRatio = pattern.filter(bead => isBeadForbidden(bead, theme)).length / pattern.length;
  const materialMissRatio = pattern.filter(bead => bead.material !== '金属' && !theme.materials.includes(bead.material)).length / pattern.length;
  const mainBeads = pattern.filter(bead => bead.role === 'main');
  const primaryDistance = average(mainBeads.map(bead => colorDistance(bead.color, theme.palette[0])));
  const primaryRgb = hexToRgb(theme.palette[0]);
  const primaryChroma = Math.max(primaryRgb.r, primaryRgb.g, primaryRgb.b) - Math.min(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  const primaryPenalty = primaryChroma >= 40 ? Math.min(18, Math.max(0, primaryDistance - 30) / 10) : 0;
  const themeFit = clampScore(30 - average(colorDistances) / 7 - forbiddenRatio * 36 - materialMissRatio * 9 - primaryPenalty, 30);
  const adjacentColorDistances = pattern.map((bead, index) => colorDistance(bead.color, pattern[(index + 1) % pattern.length].color));
  const colorHarmony = clampScore(25 - average(adjacentColorDistances) / 13, 25);
  const adjacentSizeDiffs = pattern.map((bead, index) => Math.abs(bead.size - pattern[(index + 1) % pattern.length].size));
  const severeChanges = adjacentSizeDiffs.filter(value => value > 2).length;
  const rhythmOfSizes = sizeRhythm(pattern);
  const sizeHarmony = clampScore(15 - average(adjacentSizeDiffs) * 1.35 - severeChanges * 3 - rhythmOfSizes.penalty, 15);
  const materials = new Set(pattern.map(bead => bead.material));
  const matchingMaterialRatio = pattern.filter(bead => bead.material === '金属' || theme.materials.includes(bead.material)).length / pattern.length;
  const materialUnity = clampScore(10 - (1 - matchingMaterialRatio) * 6 - Math.max(0, materials.size - 4) * 1.5, 10);
  const ratios = roleRatios(pattern);
  const ratioError = Math.abs(ratios.main - direction.mainRatio) + Math.abs(ratios.accent - direction.accentRatio) + Math.abs(ratios.spacer - direction.spacerRatio);
  const rhythm = clampScore(10 - ratioError * 24 - (pattern.filter(bead => bead.role === 'focal').length === 1 ? 0 : 4), 10);
  return { themeFit: Math.round(themeFit * 10) / 10, colorHarmony: Math.round(colorHarmony * 10) / 10, sizeHarmony: Math.round(sizeHarmony * 10) / 10, materialUnity: Math.round(materialUnity * 10) / 10, rhythm: Math.round(rhythm * 10) / 10 };
}function baseScore(breakdown) {
  return Object.values(breakdown).reduce((sum, value) => sum + value, 0);
}
function histogramDifference(left, right, keySelector) {
  const leftCounts = new Map();
  const rightCounts = new Map();
  left.pattern.forEach((bead) => leftCounts.set(keySelector(bead), (leftCounts.get(keySelector(bead)) ?? 0) + 1));
  right.pattern.forEach((bead) => rightCounts.set(keySelector(bead), (rightCounts.get(keySelector(bead)) ?? 0) + 1));
  const keys = new Set([...leftCounts.keys(), ...rightCounts.keys()]);
  return [...keys].reduce((sum, key) => sum + Math.abs((leftCounts.get(key) ?? 0) / left.pattern.length - (rightCounts.get(key) ?? 0) / right.pattern.length), 0) / 2;
}

function designDifference(left, right) {
  const leftIds = new Set(left.beads.map((bead) => bead.id));
  const rightIds = new Set(right.beads.map((bead) => bead.id));
  const union = new Set([...leftIds, ...rightIds]).size;
  const shared = [...leftIds].filter((id) => rightIds.has(id)).length;
  const beadDifference = union ? 1 - shared / union : 0;
  const samples = 36;
  const roleDifference = average(Array.from({ length: samples }, (_, index) => {
    const leftBead = left.pattern[Math.floor(index * left.pattern.length / samples)];
    const rightBead = right.pattern[Math.floor(index * right.pattern.length / samples)];
    return leftBead.role !== rightBead.role ? 1 : 0;
  }));
  const colorDifference = histogramDifference(left, right, (bead) => bead.family);
  const shapeDifference = histogramDifference(left, right, (bead) => bead.shape);
  const materialDifference = histogramDifference(left, right, (bead) => bead.material);
  return Math.min(1, beadDifference * 0.25 + roleDifference * 0.3 + colorDifference * 0.2 + shapeDifference * 0.15 + materialDifference * 0.1);
}
function makeCandidate(library, theme, profile, direction, variation, seed, wristSizeCm, layoutVariant) {
  const roles = assignRoles(library, theme, profile, variation, seed);
  const sizing = buildPattern(profile, roles, direction, wristSizeCm, layoutVariant);
  const pattern = sizing.pattern;
  const beads = [...new Map(pattern.map((bead) => [bead.id, bead])).values()];
  const breakdown = scoreCandidate(theme, profile, pattern, direction);
  return { profile: profile.key, variation, layoutVariant, direction, roles, pattern, beads, estimatedLengthMm: sizing.estimatedLengthMm, wristSizeCm: sizing.wristSizeCm, scoreBreakdown: breakdown, baseScore: baseScore(breakdown) };
}
function designSignature(design) {
  return design.pattern.map((bead) => `${bead.id}:${bead.role}`).join("|");
}

function placementIsIntentional(positions, focalIndex, length) {
  if (!positions.length) return true;
  const sorted = [...positions].sort((left, right) => left - right);
  const gaps = sorted.map((position, index) => (sorted[(index + 1) % sorted.length] - position + length) % length);
  const expectedGap = length / positions.length;
  const minimumIntervalCount = Math.max(4, Math.ceil(length * 0.12));
  const regular = positions.length >= minimumIntervalCount && Math.min(...gaps) >= expectedGap * 0.45 && Math.max(...gaps) <= expectedGap * 1.8;
  const signedOffsets = positions.map((position) => {
    const offset = (position - focalIndex + length) % length;
    return offset > length / 2 ? offset - length : offset;
  });
  const focalRadius = Math.ceil(positions.length / 2) + 1;
  const leftCount = signedOffsets.filter((offset) => offset < 0).length;
  const rightCount = signedOffsets.filter((offset) => offset > 0).length;
  const focalCluster = focalIndex >= 0
    && signedOffsets.every((offset) => Math.abs(offset) <= focalRadius)
    && Math.abs(leftCount - rightCount) <= 1;
  const largeGaps = gaps.filter((gap) => gap > Math.max(2, expectedGap * 1.1));
  const opposingClusters = positions.length >= 4
    && Math.min(...gaps) <= 2
    && largeGaps.length === 2
    && Math.max(...largeGaps) / Math.max(1, Math.min(...largeGaps)) <= 1.8;
  return regular || focalCluster || opposingClusters;
}

function hasStructuredColorPlacement(pattern, profile) {
  const positionsById = new Map();
  pattern.forEach((bead, index) => {
    if (!positionsById.has(bead.id)) positionsById.set(bead.id, []);
    positionsById.get(bead.id).push(index);
  });
  const dominantId = [...positionsById.entries()].sort((left, right) => right[1].length - left[1].length)[0]?.[0];
  const focalIndex = pattern.findIndex((bead) => bead.role === 'focal');
  for (const [beadId, positions] of positionsById.entries()) {
    if (beadId === dominantId) continue;
    const bead = pattern[positions[0]];
    if (bead.role === 'spacer' || bead.shape === '隔珠' || bead.material === '金属' && profile !== 'airy') continue;
    if (positions.length === 1) {
      if (bead.role !== 'focal') return false;
      continue;
    }
    if (profile !== 'airy') {
      if (positions.length <= 3) {
        const formsFocalTransition = focalIndex >= 0 && positions.every((position) => circularDistance((position - focalIndex + pattern.length) % pattern.length, pattern.length) <= 2);
        if (!formsFocalTransition) return false;
      }
      continue;
    }
    if (positions.length <= 3) {
      const formsFocalTransition = focalIndex >= 0 && positions.every((position) => circularDistance((position - focalIndex + pattern.length) % pattern.length, pattern.length) <= 2);
      if (!formsFocalTransition) return false;
      continue;
    }
    if (!placementIsIntentional(positions, focalIndex, pattern.length)) return false;
  }
  return true;
}
function focalTransitionIsBalanced(pattern) {
  const focalIndex = pattern.findIndex((bead) => bead.role === 'focal');
  if (focalIndex < 0) return false;
  const left = pattern[(focalIndex - 1 + pattern.length) % pattern.length];
  const right = pattern[(focalIndex + 1) % pattern.length];
  if (!left || !right) return false;
  const rolesMatch = left.role === right.role || ['main', 'secondary'].includes(left.role) && ['main', 'secondary'].includes(right.role);
  const spacerMatch = (left.role === 'spacer' || left.shape === '隔珠') === (right.role === 'spacer' || right.shape === '隔珠');
  return rolesMatch && spacerMatch && left.family === right.family && Math.abs(left.size - right.size) <= 1;
}
function decorativePlacementIsBalanced(pattern, profile) {
  const focalIndex = pattern.findIndex((bead) => bead.role === 'focal');
  const spacerPositions = pattern.flatMap((bead, index) => bead.role === 'spacer' || bead.shape === '隔珠' ? [index] : []);
  if (spacerPositions.length === 1) return false;
  if (spacerPositions.length === 2) {
    const offsets = spacerPositions.map((position) => {
      const offset = (position - focalIndex + pattern.length) % pattern.length;
      return offset > pattern.length / 2 ? offset - pattern.length : offset;
    });
    if (offsets[0] * offsets[1] >= 0 || Math.abs(Math.abs(offsets[0]) - Math.abs(offsets[1])) > 1) return false;
  } else if (spacerPositions.length > 2 && !placementIsIntentional(spacerPositions, focalIndex, pattern.length)) return false;
  return profile !== 'airy' || focalTransitionIsBalanced(pattern);
}
function visualCrossSection(bead) {
  const factor = ({ '米珠': 0.82, '扁圆珠': 0.84, '管珠': 0.56, '方形珠': 0.9, '菱形珠': 0.82, '隔珠': 0.48 })[bead.shape] ?? 1;
  return bead.size * factor;
}
function hasBalancedVisualTransitions(pattern) {
  return pattern.every((bead, index) => {
    const next = pattern[(index + 1) % pattern.length];
    if (bead.role === 'spacer' || bead.shape === '隔珠' || next.role === 'spacer' || next.shape === '隔珠') return true;
    const smaller = Math.min(visualCrossSection(bead), visualCrossSection(next));
    const larger = Math.max(visualCrossSection(bead), visualCrossSection(next));
    return larger / Math.max(0.1, smaller) <= 1.85;
  });
}function candidatePassesHardRules(candidate) {
  const { pattern } = candidate;
  if (!Array.isArray(pattern) || !pattern.length) return false;
  if (!pattern.every(bead => bead.suitableRoles.includes(bead.role))) return false;
  const inventoryUsage = new Map();
  pattern.forEach(bead => inventoryUsage.set(bead.id, (inventoryUsage.get(bead.id) ?? 0) + 1));
  if (pattern.some(bead => Number.isFinite(Number(bead.count)) && (inventoryUsage.get(bead.id) ?? 0) > Number(bead.count))) return false;
  const spacers = pattern.filter(bead => bead.shape === '隔珠');
  if (spacers.some(bead => bead.role !== 'spacer')) return false;
  if (spacers.length > (spacers.some(bead => bead.size >= 4) ? 2 : 4)) return false;
  const spacerRatio = spacers.length / pattern.length;
  const structuralRatio = pattern.filter(bead => STRUCTURAL_SHAPES.has(bead.shape)).length / pattern.length;
  const tubeCount = pattern.filter(bead => bead.shape === '管珠').length;
  if (spacerRatio > 0.13 || tubeCount / pattern.length > 0.18 || tubeCount === 1) return false;
  if (candidate.profile !== 'focus' && structuralRatio > 0.18) return false;
  if (!hasStructuredColorPlacement(pattern, candidate.profile)) return false;
  if (!hasBalancedVisualTransitions(pattern)) return false;
  if (candidate.profile === 'airy' && !decorativePlacementIsBalanced(pattern, candidate.profile)) return false;
  if (candidate.profile === 'airy') {
    const main = pattern.find(bead => bead.role === 'main');
    const supporting = pattern.filter(bead => ['secondary', 'accent'].includes(bead.role));
    if (main && supporting.some(bead => Math.abs(perceivedBrightness(bead.color) - perceivedBrightness(main.color)) > 60)) return false;
  }
  const edges = pattern.map((bead, index) => {
    const next = pattern[(index + 1) % pattern.length];
    return { difference: Math.abs(bead.size - next.size), ratio: Math.max(bead.size, next.size) / Math.max(1, Math.min(bead.size, next.size)) };
  });
  if (edges.some(edge => edge.difference > 3 || edge.ratio > 2.25)) return false;
  const focalIndex = pattern.findIndex(bead => bead.role === 'focal');
  const dominantSize = [...new Map(pattern.map(bead => [bead.size, pattern.filter(item => item.size === bead.size).length])).entries()].sort((left, right) => right[1] - left[1])[0]?.[0];
  const positionsBySize = new Map();
  pattern.forEach((bead, index) => {
    if (bead.role === 'focal' || bead.role === 'spacer' || bead.size === dominantSize) return;
    if (!positionsBySize.has(bead.size)) positionsBySize.set(bead.size, []);
    positionsBySize.get(bead.size).push(index);
  });
  for (const positions of positionsBySize.values()) {
    if (positions.length >= 4) {
      const sorted = [...positions].sort((left, right) => left - right);
      const gaps = sorted.map((position, index) => (sorted[(index + 1) % sorted.length] - position + pattern.length) % pattern.length);
      const expectedGap = pattern.length / positions.length;
      const regular = Math.min(...gaps) >= expectedGap * 0.4 && Math.max(...gaps) <= expectedGap * 2;
      const pairedClusters = Math.min(...gaps) <= 2 && gaps.filter(gap => gap > 2).length <= 2;
      if (!regular && !pairedClusters) return false;
      continue;
    }
    const formsFocalTransition = positions.length >= 2 && focalIndex >= 0 && positions.every(index => circularDistance((index - focalIndex + pattern.length) % pattern.length, pattern.length) <= 2);
    if (!formsFocalTransition) return false;
  }
  if (candidate.direction) {
    const ratios = roleRatios(pattern);
    if (candidate.profile === 'airy') {
      if (ratios.main < 0.7 || ratios.accent > 0.01 || ratios.spacer > 0.01) return false;
    } else if (candidate.profile === 'focus') {
      const structuralRatio = pattern.filter(bead => STRUCTURAL_SHAPES.has(bead.shape)).length / pattern.length;
      if (structuralRatio < 0.5 || structuralRatio > 0.68) return false;
    } else {
      if (Math.abs(ratios.main - candidate.direction.mainRatio) > 0.14) return false;
      if (Math.abs(ratios.accent - candidate.direction.accentRatio) > 0.1) return false;
      if (Math.abs(ratios.spacer - candidate.direction.spacerRatio) > 0.055) return false;
    }
  }
  return true;
}
function candidatePassesSemanticSafety(candidate, theme) {
  const mainBeads = candidate.pattern.filter((bead) => bead.role === "main");
  if (!mainBeads.length) return false;
  const mainPaletteDistance = average(mainBeads.map((bead) => Math.min(...theme.palette.map((color) => colorDistance(bead.color, color)))));
  if (mainPaletteDistance > (candidate.profile === "focus" ? 90 : 105)) return false;
  const whiteRatio = candidate.pattern.filter((bead) => bead.family === "白/米").length / candidate.pattern.length;
  const averageMainBrightness = average(mainBeads.map((bead) => perceivedBrightness(bead.color)));
  const brightnessIsValid = {
    low: averageMainBrightness <= 165,
    "medium-low": averageMainBrightness <= 230,
    medium: true,
    "medium-high": averageMainBrightness >= 95,
    high: averageMainBrightness >= 160
  }[theme.brightness] ?? true;
  if (!brightnessIsValid) return false;
  if (theme.brightness === "low" && whiteRatio > 0.12) return false;
  return true;
}
function candidatePassesThemeRatios(candidate, theme) {
  if (!candidatePassesSemanticSafety(candidate, theme)) return false;
  const primaryFamily = colorFamily(theme.palette[0]);
  const mainBeads = candidate.pattern.filter((bead) => bead.role === "main");
  const primaryFamilyRatio = mainBeads.filter((bead) => bead.family === primaryFamily).length / mainBeads.length;
  const requiredPrimaryRatio = ["白/米", "灰/黑"].includes(primaryFamily) ? 0.62 : 0.75;
  if (primaryFamilyRatio < requiredPrimaryRatio) return false;
  const whiteRatio = candidate.pattern.filter((bead) => bead.family === "白/米").length / candidate.pattern.length;
  const grayRatio = candidate.pattern.filter((bead) => bead.family === "灰/黑").length / candidate.pattern.length;
  if (["白/米", "灰/黑"].includes(primaryFamily)) return true;
  const neutralLimit = theme.visualWeight === "light" ? 0.42 : 0.34;
  return whiteRatio <= 0.36 && grayRatio <= 0.24 && whiteRatio + grayRatio <= neutralLimit;
}
function scoreFinalDesign(rawTheme, design) {
  const theme = Array.isArray(rawTheme?.palette) && rawTheme.palette.length >= 3 && Array.isArray(rawTheme?.directions)
    ? rawTheme
    : normalizeTheme(rawTheme, rawTheme?.title);
  const profile = DESIGN_PROFILES.find((item) => item.key === design.profile) ?? DESIGN_PROFILES[0];
  const direction = theme.directions.find(item => item.key === profile.key);
  return scoreCandidate(theme, profile, design.pattern, direction);
}
function compositionNote(profile, roles, layoutVariant) {
  if (profile.key === 'airy') {
    if (layoutVariant === 1) return `${roles.main.name}铺陈主体，${roles.secondary.name}等距呼应。`;
    if (layoutVariant === 2) return `${roles.main.name}铺陈主体，${roles.secondary.name}形成双区呼应。`;
    return `${roles.main.name}铺陈主体，${roles.secondary.name}在焦点两侧对称收束。`;
  }
  if (profile.key === 'flow') {
    if (layoutVariant === 1) return `${roles.main.name}为底，${roles.secondary.name}与${roles.accent.name}间隔呼应。`;
    if (layoutVariant === 2) return `${roles.main.name}为底，${roles.secondary.name}与${roles.accent.name}围绕焦点渐进。`;
    return `${roles.main.name}为底，${roles.secondary.name}与${roles.accent.name}双向过渡。`;
  }
  if (layoutVariant === 1) return `${roles.main.name}衔接主体，${roles.accent.name}围绕${roles.focal.name}形成中心结构。`;
  if (layoutVariant === 2) return `${roles.main.name}衔接主体，${roles.accent.name}形成双区结构，${roles.focal.name}收束焦点。`;
  return `${roles.main.name}衔接主体，${roles.accent.name}规律重复，${roles.focal.name}集中焦点。`;
}

function generateDesigns(rawTheme, library, options = {}) {
  const theme = normalizeTheme(rawTheme, rawTheme?.title);
  const candidateCount = Math.max(24, options.candidateCount ?? 36);
  const seed = Number.isFinite(options.seed) ? Number(options.seed) >>> 0 : 0;
  const previousDesigns = Array.isArray(options.previousDesigns) ? options.previousDesigns : [];
  const wristSizeCm = Math.max(14, Math.min(18, Number(options.wristSizeCm) || 16));
  const layoutVariant = Math.abs(Math.trunc(Number(options.generationVariant ?? seed))) % 3;
  const selected = [];
  for (const [profileIndex, profile] of DESIGN_PROFILES.entries()) {
    const direction = theme.directions.find((item) => item.key === profile.key);
    const candidates = Array.from({ length: candidateCount }, (_, variation) => [0, 1, 2].map((layoutOffset) => {
      const candidateLayout = (layoutVariant + layoutOffset) % 3;
      const candidateVariation = variation + layoutOffset * candidateCount;
      return makeCandidate(library, theme, profile, direction, candidateVariation, seed, wristSizeCm, candidateLayout);
    })).flat();
    const previousForProfile = previousDesigns.filter((design) => design.profile === profile.key);
    const previousSignatures = new Set(previousForProfile.map(designSignature));
    const freshCandidates = candidates.filter((candidate) => !previousSignatures.has(designSignature(candidate)));
    const structurallyValid = candidates.filter((candidate) => candidatePassesHardRules(candidate));
    const freshStructurallyValid = freshCandidates.filter((candidate) => candidatePassesHardRules(candidate));
    const hardValid = structurallyValid.filter((candidate) => candidatePassesThemeRatios(candidate, theme));
    const freshValid = freshStructurallyValid.filter((candidate) => candidatePassesThemeRatios(candidate, theme));
    const semanticallySafe = structurallyValid.filter((candidate) => candidatePassesSemanticSafety(candidate, theme));
    const freshSemanticallySafe = freshStructurallyValid.filter((candidate) => candidatePassesSemanticSafety(candidate, theme));
    const freshnessOf = (candidate) => previousForProfile.length
      ? Math.min(...previousForProfile.map((design) => designDifference(candidate, design)))
      : 1;
    const visiblyFresh = freshValid.filter((candidate) => freshnessOf(candidate) >= 0.28);
    const candidatePool = visiblyFresh.length
      ? visiblyFresh
      : freshValid.length
        ? freshValid
        : hardValid.length
          ? hardValid
          : freshSemanticallySafe.length
            ? freshSemanticallySafe
            : semanticallySafe;
    if (!candidatePool.length) throw new Error(`没有可用且同时满足主题、配色与结构规则的${profile.label}方案`);
    const ranked = candidatePool.map((candidate) => {
      const difference = selected.length ? average(selected.map((design) => designDifference(candidate, design))) : 1;
      const freshness = freshnessOf(candidate);
      const jitter = mixSeed(seed, candidate.variation, profileIndex + 9) / 4294967295;
      const layoutMatch = candidate.layoutVariant === layoutVariant ? 4 : 0;
      return { ...candidate, difference, totalScore: candidate.baseScore + difference * 12 + freshness * 26 + layoutMatch + jitter * 2.5 };
    }).sort((left, right) => right.totalScore - left.totalScore);
    const best = ranked[0];
    selected.push({
      id: `${profile.key}-${theme.title}-${wristSizeCm}-${seed}`,
      name: direction?.name ?? profile.label,
      profile: profile.key,
      style: profile.label,
      structure: profile.structure,
      theme: theme.title,
      moods: theme.moods,
      palette: theme.palette,
      beads: best.beads,
      pattern: best.pattern,
      wristSizeCm: best.wristSizeCm,
      estimatedLengthMm: best.estimatedLengthMm,
      score: Math.round(best.totalScore),
      scoreBreakdown: { ...best.scoreBreakdown, difference: Math.round(best.difference * 100) / 10 },
      layoutVariant: best.layoutVariant,
      note: compositionNote(profile, best.roles, best.layoutVariant)
    });
  }
  return selected;
}

// lib/designer-filter-v2.js
function colorFamily(hex) {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const lightness = (max + min) / 2;
  const delta = max - min;
  const saturation = delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0;
  if (lightness > 0.9) return "白/米";
  if (saturation < 0.12) return "灰/黑";
  let hue;
  if (max === r / 255) hue = 60 * ((g - b) / 255 / delta % 6);
  else if (max === g / 255) hue = 60 * ((b - r) / 255 / delta + 2);
  else hue = 60 * ((r - g) / 255 / delta + 4);
  if (hue < 0) hue += 360;
  if (hue < 25 || hue >= 340) return "粉/红";
  if (hue < 65) return lightness < 0.58 ? "橙/棕" : "金/黄";
  if (hue < 175) return "绿";
  if (hue < 250) return "蓝";
  if (hue < 325) return "紫";
  return "粉/红";
}
function curatedLibrary(theme, library) {
  const allowedFamilies = new Set(theme.palette.map(colorFamily));
  allowedFamilies.add("白/米");
  allowedFamilies.add("灰/黑");
  const preferredMetalFamily = theme.metal === "gold" ? "金/黄" : "灰/黑";
  allowedFamilies.add(preferredMetalFamily);
  const coolOnly = allowedFamilies.has("蓝") && !["金/黄", "橙/棕", "粉/红"].some((family) => allowedFamilies.has(family));
  const filtered = library.filter((bead) => {
    if (isBeadForbidden(bead, theme)) return false;
    if (!bead.suitableRoles?.length) return false;
    if (bead.suitableRoles.includes("spacer") && bead.size === 3) return true;
    if (!allowedFamilies.has(bead.family)) return false;
    if (coolOnly && bead.temperature === "warm" && bead.material !== "金属") return false;
    if (bead.suitableRoles.includes("spacer") && bead.material === "金属" && bead.family !== preferredMetalFamily) return false;
    if (theme.visualWeight === "light" && bead.visualWeight > 0.68) return false;
    const paletteDistance = Math.min(...theme.palette.map((color) => colorDistance(bead.color, color)));
    return paletteDistance < 70 || bead.material === "金属" && bead.family === preferredMetalFamily && paletteDistance < 92;
  });
  if (filtered.length >= 8) return filtered;
  return library
    .filter((bead) => !isBeadForbidden(bead, theme) && bead.suitableRoles?.length)
    .sort((left, right) => {
      const leftDistance = Math.min(...theme.palette.map((color) => colorDistance(left.color, color)));
      const rightDistance = Math.min(...theme.palette.map((color) => colorDistance(right.color, color)));
      return leftDistance - rightDistance;
    })
    .slice(0, 28);
}
function generateDesigns2(theme, library, options = {}) {
  try {
    return generateDesigns(theme, curatedLibrary(theme, library), options);
  } catch (error) {
    const message = String(error?.message ?? '');
    const retryable = message.startsWith('没有可用于') || message.includes('同时满足主题、配色与结构规则');
    if (!retryable) throw error;
    const availableLibrary = library.filter(bead => Number(bead.count ?? 1) > 0 && bead.suitableRoles?.length);
    const expandedOptions = { ...options, candidateCount: Math.max(72, Number(options.candidateCount) || 0) };
    return generateDesigns(theme, availableLibrary, expandedOptions);
  }
}

export {
  DESIGN_PROFILES,
  colorDistance,
  designDifference,
  generateDesigns2 as generateDesigns,
  hexToRgb,
  isBeadForbidden,
  scoreFinalDesign,
  candidatePassesHardRules,
  candidatePassesThemeRatios
};