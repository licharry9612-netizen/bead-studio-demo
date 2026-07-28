// lib/theme-base.js
var DEFAULT_MODEL = "doubao-seed-2-0-lite-260428";
var ALLOWED_MATERIALS = ["水晶", "玛瑙", "琉璃", "珍珠", "金属", "天然石", "贝壳", "陶瓷", "木质"];
var ALLOWED_SHAPES = ["圆珠", "米珠", "方形珠", "菱形珠", "扁圆珠", "管珠", "隔珠"];
var DIRECTION_KEYS = ["airy", "flow", "focus"];
var DEFAULT_PALETTE = ["#F5F1E8", "#DDE8E4", "#B8CFCA", "#8FA9A1", "#607A72"];
var DARK_ATMOSPHERE_PATTERN = /黑暗|幽暗|阴暗|昏暗|暗夜|幽深|阴森|暮色|无光/;
var SEMANTIC_CONCEPTS = [
  {
    pattern: /泉|溪|河|湖|水|雨|露|冰|雪|雾/,
    palette: ["#F7FAF9", "#CFE7ED", "#9DD7DE", "#AEBBC3", "#6C929F"],
    moods: ["清透", "流动", "轻盈"],
    forbiddenColors: ["高饱和粉", "暖棕", "厚重纯黑"],
    materials: ["水晶", "琉璃", "珍珠"],
    shapes: ["圆珠", "扁圆珠", "米珠"],
    metal: "silver",
    brightness: "high",
    saturation: "low",
    transparency: 0.72,
    visualWeight: "light"
  },
  {
    pattern: /竹|苔|叶|草|林|植物|茶/,
    palette: ["#F3F3E8", "#DDE8C9", "#AAC58E", "#789467", "#466447"],
    moods: ["清雅", "自然", "东方"],
    forbiddenColors: ["粉色", "蓝色", "紫色"],
    materials: ["天然石", "水晶", "珍珠"],
    shapes: ["圆珠", "扁圆珠", "米珠"],
    metal: "silver",
    brightness: "medium-high",
    saturation: "low",
    transparency: 0.38,
    visualWeight: "light"
  },
  {
    pattern: /夜|月|星|暮|暗|影/,
    palette: ["#F1F0E8", "#C7CED5", "#687486", "#323C50", "#1E2738"],
    moods: ["安静", "微冷", "深邃"],
    forbiddenColors: ["荧光粉", "鲜橙"],
    materials: ["水晶", "天然石", "金属"],
    shapes: ["圆珠", "扁圆珠", "米珠"],
    metal: "silver",
    brightness: "medium-low",
    saturation: "low",
    transparency: 0.42,
    visualWeight: "medium"
  },
  {
    pattern: /店|灯|窗|街|城市|便利|霓虹/,
    palette: ["#F5E7B2", "#E2C66F", "#AAB4BF", "#58677A", "#26344A"],
    moods: ["都市", "有光", "克制"],
    forbiddenColors: ["高饱和粉", "荧光绿"],
    materials: ["琉璃", "水晶", "金属"],
    shapes: ["圆珠", "方形珠", "米珠"],
    metal: "silver",
    brightness: "medium",
    saturation: "medium-low",
    transparency: 0.4,
    visualWeight: "medium"
  },
  {
    pattern: /奶油|牛奶|燕麦|柔软|香草|布丁/,
    palette: ["#FFF9EC", "#F2E7D2", "#DECBAE", "#C5A987", "#A77E67"],
    moods: ["温柔", "松软", "温暖"],
    forbiddenColors: ["海蓝", "高饱和紫", "纯黑"],
    materials: ["珍珠", "陶瓷", "琉璃", "天然石"],
    shapes: ["圆珠", "扁圆珠", "米珠"],
    metal: "gold",
    brightness: "high",
    saturation: "low",
    transparency: 0.2,
    visualWeight: "light"
  },
  {
    pattern: /蘑菇|菌|泥土|木|岩|咖啡|可可/,
    palette: ["#F3E9D8", "#D7BE9E", "#B69170", "#8E6554", "#67483F"],
    moods: ["质朴", "自然", "温暖"],
    forbiddenColors: ["海蓝", "高饱和紫"],
    materials: ["天然石", "玛瑙", "珍珠"],
    shapes: ["圆珠", "扁圆珠", "米珠"],
    metal: "gold",
    brightness: "medium-high",
    saturation: "low",
    transparency: 0.18,
    visualWeight: "medium"
  }
,
  {
    pattern: /清晨|晨光|朝阳|日出|曙光|光线|晨曦/,
    palette: ['#FFF9ED', '#F4E5C7', '#E9C98F', '#D9A77B', '#A8795E'],
    moods: ['温柔', '明亮', '新生'],
    forbiddenColors: ['冷灰蓝', '高饱和紫', '厚重纯黑'],
    materials: ['珍珠', '水晶', '琉璃'],
    shapes: ['圆珠', '米珠', '扁圆珠'],
    metal: 'gold',
    brightness: 'high',
    saturation: 'low',
    transparency: 0.42,
    visualWeight: 'light'
  },
  {
    pattern: /花|荷|莲|樱|玫瑰|花园|花瓣/,
    palette: ['#FFF8F1', '#F0D4D6', '#D9A7B3', '#A8B99A', '#6F8B6C'],
    moods: ['柔美', '自然', '舒展'],
    forbiddenColors: ['荧光色', '厚重纯黑'],
    materials: ['珍珠', '贝壳', '水晶', '陶瓷'],
    shapes: ['圆珠', '扁圆珠'],
    metal: 'gold',
    brightness: 'high',
    saturation: 'low',
    transparency: 0.38,
    visualWeight: 'light'
  },
  {
    pattern: /深海|海洋|海底|潮汐|鲸|珊瑚礁/,
    palette: ['#EAF5F4', '#A9D4D3', '#559AA5', '#285C70', '#173747'],
    moods: ['深邃', '流动', '静谧'],
    forbiddenColors: ['荧光粉', '亮橙'],
    materials: ['水晶', '琉璃', '贝壳', '天然石'],
    shapes: ['圆珠', '米珠'],
    metal: 'silver',
    brightness: 'medium',
    saturation: 'medium-low',
    transparency: 0.58,
    visualWeight: 'medium'
  },
  {
    pattern: /机械|朋克|工业|齿轮|机甲|金属感/,
    palette: ['#E8E5DF', '#B6B0A5', '#8B7358', '#55575A', '#27292C'],
    moods: ['克制', '结构', '力量'],
    forbiddenColors: ['甜粉', '荧光绿'],
    materials: ['金属', '玛瑙', '天然石'],
    shapes: ['圆珠', '方形珠', '管珠'],
    metal: 'silver',
    brightness: 'medium-low',
    saturation: 'low',
    transparency: 0.12,
    visualWeight: 'medium'
  },
  {
    pattern: /波西米亚|复古|民族|异域|手工感/,
    palette: ['#B98250', '#D2A46F', '#654C43', '#5C8C88', '#F2E4CF'],
    moods: ['自由', '复古', '丰盈'],
    forbiddenColors: ['冷淡灰', '荧光色'],
    materials: ['天然石', '玛瑙', '木质', '琉璃'],
    shapes: ['圆珠', '扁圆珠', '管珠'],
    metal: 'gold',
    brightness: 'medium-high',
    saturation: 'medium',
    transparency: 0.22,
    visualWeight: 'medium'
  },
  {
    pattern: /秋|落叶|枫|丰收|桂花/,
    palette: ['#F8EBD3', '#E2BF82', '#C98754', '#9A5F43', '#65453A'],
    moods: ['温暖', '安定', '丰盈'],
    forbiddenColors: ['冷蓝', '高饱和紫'],
    materials: ['天然石', '玛瑙', '珍珠'],
    shapes: ['圆珠', '扁圆珠', '米珠'],
    metal: 'gold',
    brightness: 'medium-high',
    saturation: 'medium-low',
    transparency: 0.18,
    visualWeight: 'medium'
  }];
function cleanText(value, fallback, maxLength) {
  const text = String(value ?? "").trim();
  return (text || fallback).slice(0, maxLength);
}
function uniqueStrings(values, max, maxLength = 16) {
  const cleaned = Array.isArray(values) ? values.map((value) => cleanText(value, "", maxLength)).filter(Boolean) : [];
  return [...new Set(cleaned)].slice(0, max);
}
function allowedValues(values, allowed, fallback, min, max) {
  const result = uniqueStrings(values, max).filter((value) => allowed.includes(value));
  for (const value of fallback) {
    if (result.length >= min) break;
    if (!result.includes(value)) result.push(value);
  }
  return result.slice(0, max);
}
function normalizePalette(values, fallback = DEFAULT_PALETTE) {
  const colors = Array.isArray(values) ? values.map((value) => String(value ?? "").trim().toUpperCase()).filter((value) => /^#[0-9A-F]{6}$/.test(value)) : [];
  const result = [...new Set(colors)];
  for (const color of fallback) {
    if (result.length >= 5) break;
    if (!result.includes(color)) result.push(color);
  }
  return result.slice(0, 5);
}
function normalizeDirections(value, title) {
  const input = Array.isArray(value) ? value : [];
  const defaults = {
    airy: { name: `${title}留白`, layout: "spaced", mainRatio: 0.8, accentRatio: 0.04, spacerRatio: 0.04, symmetry: "radial" },
    flow: { name: `${title}流光`, layout: "gradient", mainRatio: 0.64, accentRatio: 0.22, spacerRatio: 0.05, symmetry: "bilateral" },
    focus: { name: `${title}焦点`, layout: "cluster", mainRatio: 0.58, accentRatio: 0.25, spacerRatio: 0.1, symmetry: "bilateral" }
  };
  const clampRatio = (value, fallback, minimum, maximum) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, number)) : fallback;
  };
  return DIRECTION_KEYS.map((key) => {
    const found = input.find((item) => item?.key === key) ?? {};
    const fallback = defaults[key];
    const layout = ["spaced", "gradient", "cluster"].includes(found.layout) ? found.layout : fallback.layout;
    const symmetry = ["radial", "bilateral", "asymmetric"].includes(found.symmetry) ? found.symmetry : fallback.symmetry;
    const bands = {
      airy: { main: [0.76, 0.82], accent: [0.04, 0.08], spacer: [0.02, 0.06] },
      flow: { main: [0.6, 0.68], accent: [0.18, 0.24], spacer: [0.03, 0.07] },
      focus: { main: [0.55, 0.62], accent: [0.23, 0.26], spacer: [0.08, 0.1] }
    }[key];
    const accentRatio = clampRatio(found.accentRatio, fallback.accentRatio, ...bands.accent);
    const spacerRatio = clampRatio(found.spacerRatio, fallback.spacerRatio, ...bands.spacer);
    const mainRatio = clampRatio(found.mainRatio, fallback.mainRatio, ...bands.main);
    return { key, name: cleanText(found.name, fallback.name, 12), layout, symmetry, mainRatio, accentRatio, spacerRatio };
  });
}
function normalizeTheme(data, originalTheme = "未命名主题") {
  const title = cleanText(data?.title, cleanText(originalTheme, "未命名主题", 24), 24);
  const semanticMatches = SEMANTIC_CONCEPTS.filter((concept) => concept.pattern.test(String(originalTheme)));
  const semanticAnchor = semanticMatches.length === 1 ? semanticMatches[0] : null;
  const moods = uniqueStrings(semanticAnchor ? [...semanticAnchor.moods, ...(data?.moods ?? [])] : data?.moods, 5, 8);
  const transparency = Number(semanticAnchor?.transparency ?? data?.transparency);
  const darkAtmosphere = DARK_ATMOSPHERE_PATTERN.test(String(originalTheme));
  const basePalette = normalizePalette(semanticAnchor?.palette ?? data?.palette ?? data?.colors);
  const palette = darkAtmosphere ? composeDarkPalette(basePalette) : basePalette;
  const forbiddenSource = semanticAnchor
    ? [...semanticAnchor.forbiddenColors, ...(data?.forbiddenColors ?? data?.forbiddenCategories ?? [])]
    : data?.forbiddenColors ?? data?.forbiddenCategories;
  const materialSource = semanticAnchor ? [...semanticAnchor.materials, ...(data?.materials ?? [])] : data?.materials;
  const shapeSource = semanticAnchor ? [...semanticAnchor.shapes, ...(data?.shapes ?? data?.allowedTypes ?? [])] : data?.shapes ?? data?.allowedTypes;
  const brightness = darkAtmosphere ? "low" : semanticAnchor?.brightness ?? data?.brightness;
  const saturation = semanticAnchor?.saturation ?? data?.saturation;
  const visualWeight = darkAtmosphere ? "heavy" : semanticAnchor?.visualWeight ?? data?.visualWeight;
  return {
    title,
    moods: moods.length >= 3 ? moods : [...moods, "协调", "自然", "耐看"].slice(0, 3),
    palette,
    forbiddenColors: uniqueStrings(forbiddenSource, 6, 12),
    materials: allowedValues(materialSource, ALLOWED_MATERIALS, ["水晶", "天然石"], 2, 4),
    shapes: allowedValues(shapeSource, ALLOWED_SHAPES, ["圆珠", "扁圆珠", "米珠"], 2, 6),
    metal: (semanticAnchor?.metal ?? data?.metal) === "gold" ? "gold" : "silver",
    brightness: ["low", "medium-low", "medium", "medium-high", "high"].includes(brightness) ? brightness : "medium-high",
    saturation: ["low", "medium-low", "medium", "medium-high", "high"].includes(saturation) ? saturation : "low",
    transparency: Number.isFinite(transparency) ? Math.max(0, Math.min(1, transparency)) : 0.4,
    visualWeight: ["light", "medium", "heavy"].includes(visualWeight) ? visualWeight : "light",
    directions: normalizeDirections(data?.directions ?? Object.entries(data?.variantNames ?? {}).map(([key, name]) => ({ key, name })), title)
  };
}
function hashString(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function hslToHex(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(h / 60 % 2 - 1));
  const m = l - c / 2;
  let rgb = [0, 0, 0];
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return `#${rgb.map((channel) => Math.round((channel + m) * 255).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}
function colorChroma(hex) {
  const value = String(hex).replace('#', '');
  const channels = [0, 2, 4].map(index => Number.parseInt(value.slice(index, index + 2), 16));
  return Math.max(...channels) - Math.min(...channels);
}
function colorToHsl(hex) {
  const [r, g, b] = String(hex).replace('#', '').match(/.{2}/g).map(value => Number.parseInt(value, 16) / 255);
  const maximum = Math.max(r, g, b);
  const minimum = Math.min(r, g, b);
  const delta = maximum - minimum;
  const lightness = (maximum + minimum) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;
  if (delta && maximum === r) hue = 60 * (((g - b) / delta) % 6);
  else if (delta && maximum === g) hue = 60 * ((b - r) / delta + 2);
  else if (delta) hue = 60 * ((r - g) / delta + 4);
  return { hue: (hue + 360) % 360, saturation, lightness };
}
function toneForDarkAtmosphere(hex, targetLightness) {
  const { hue, saturation } = colorToHsl(hex);
  return hslToHex(hue, Math.max(0.16, Math.min(0.52, saturation * 0.92)), targetLightness);
}
function composeDarkPalette(palette) {
  const primaryIndex = palette.findIndex((color) => {
    const { lightness } = colorToHsl(color);
    return colorChroma(color) >= 24 && lightness < 0.88;
  });
  const primary = palette[Math.max(0, primaryIndex)];
  const supporting = palette
    .filter((_, index) => index !== Math.max(0, primaryIndex))
    .sort((left, right) => colorChroma(right) - colorChroma(left));
  const ordered = [primary, ...supporting];
  const lightnessSteps = [0.22, 0.18, 0.28, 0.38, 0.5];
  return ordered.slice(0, 5).map((color, index) => toneForDarkAtmosphere(color, lightnessSteps[index]));
}
function composePalette(concepts) {
  if (concepts.length === 1) return [...concepts[0].palette];
  const result = [concepts[0].palette[0]];
  const add = color => {
    if (color && !result.includes(color) && result.length < 5) result.push(color);
  };
  for (const concept of concepts) {
    const chromaticAnchor = concept.palette.slice(1, 4).sort((left, right) => colorChroma(right) - colorChroma(left))[0];
    add(chromaticAnchor);
  }
  for (const concept of [...concepts].reverse()) add(concept.palette.at(-1));
  for (const concept of concepts) for (const color of concept.palette) add(color);
  return result.slice(0, 5);
}
function createLocalTheme(rawTheme) {
  const title = cleanText(rawTheme, "自然灵感", 24);
  let concepts = SEMANTIC_CONCEPTS.filter((concept) => concept.pattern.test(title));
  if (!concepts.length) {
    return normalizeTheme({
      title,
      moods: ['克制', '协调', '自然'],
      palette: DEFAULT_PALETTE,
      materials: ['水晶', '天然石', '珍珠'],
      shapes: ['圆珠', '扁圆珠', '米珠'],
      metal: 'silver',
      brightness: 'medium-high',
      saturation: 'low',
      transparency: 0.35,
      visualWeight: 'light'
    }, title);
  }
  const darkAtmosphere = DARK_ATMOSPHERE_PATTERN.test(title);
  if (darkAtmosphere && concepts.length > 1) {
    concepts = [...concepts].sort((left, right) => Number(left.pattern.test("暗")) - Number(right.pattern.test("暗")));
  }
  const primary = concepts[0];
  const merged = (field) => [...new Set(concepts.flatMap((concept) => concept[field] ?? []))];
  const hasNight = concepts.some((concept) => concept.pattern.test("夜"));
  const composedPalette = composePalette(concepts);
  return normalizeTheme({
    title,
    moods: merged("moods").slice(0, 5),
    palette: composedPalette,
    forbiddenColors: darkAtmosphere ? [...primary.forbiddenColors, "高明度白色", "奶油白"] : primary.forbiddenColors,
    materials: merged("materials"),
    shapes: merged("shapes"),
    metal: concepts.at(-1)?.metal ?? primary.metal,
    brightness: darkAtmosphere ? "low" : hasNight ? "medium" : primary.brightness,
    saturation: darkAtmosphere ? "medium-low" : primary.saturation,
    transparency: darkAtmosphere ? Math.min(0.35, concepts.reduce((sum, concept) => sum + concept.transparency, 0) / concepts.length) : concepts.reduce((sum, concept) => sum + concept.transparency, 0) / concepts.length,
    visualWeight: darkAtmosphere ? "heavy" : hasNight && concepts.length > 1 ? "medium" : primary.visualWeight
  }, title);
}
function extractJson(text) {
  const raw = String(text ?? "").trim();
  if (!raw) throw new Error("模型没有返回内容");
  try {
    return JSON.parse(raw);
  } catch {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) return JSON.parse(fenced[1].trim());
    const first = raw.indexOf("{");
    const last = raw.lastIndexOf("}");
    if (first >= 0 && last > first) return JSON.parse(raw.slice(first, last + 1));
    throw new Error("模型返回的不是有效 JSON");
  }
}

export {
  ALLOWED_MATERIALS,
  ALLOWED_SHAPES,
  DEFAULT_MODEL,
  DIRECTION_KEYS,
  createLocalTheme,
  extractJson,
  normalizePalette,
  normalizeTheme
};
