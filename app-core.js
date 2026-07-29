import DEFAULT_BEADS from './lib/beads.js?v=84';
import { createLocalTheme, normalizeTheme } from './lib/theme.js?v=84';
import { generateDesigns } from './lib/designer.js?v=84';
import { hydrateSavedDesigns } from './lib/saved-designs.js';

const THEME_ANALYSIS_ENDPOINT = window.location.hostname.endsWith('.github.io')
  ? 'https://bead-studio-ai.vercel.app/api/analyze-theme'
  : '/api/analyze-theme';

const STORAGE_KEY = 'bead-studio-saved-v2';
const CUSTOM_BEADS_KEY = 'bead-studio-custom-beads-v1';
const DELETED_BEADS_KEY = 'bead-studio-deleted-beads-v1';
const MATERIAL_ORDER = ['水晶', '玛瑙', '琉璃', '珍珠', '金属', '天然石', '贝壳', '陶瓷', '木质'];
const MATERIAL_OPTIONS = MATERIAL_ORDER.filter(material => DEFAULT_BEADS.some(bead => bead.material === material));
const customBeads = readCustomBeads();
const deletedBeadIds = readDeletedBeadIds();
const state = {
  library: [...DEFAULT_BEADS.filter(bead => !deletedBeadIds.has(bead.id)), ...customBeads],
  customBeads,
  deletedBeadIds,
  currentTheme: null,
  currentDesigns: [],
  generationCounter: 0,
  generationHistory: new Map(),
  saved: readSaved(),
  editingBeadId: null
};

const elements = {
  form: document.querySelector('#theme-form'),
  input: document.querySelector('#theme-input'),
  wristSize: document.querySelector('#wrist-size'),
  button: document.querySelector('#generate-button'),
  status: document.querySelector('#generation-status'),
  results: document.querySelector('#results'),
  schemeGrid: document.querySelector('#scheme-grid'),
  beadGrid: document.querySelector('#bead-grid'),
  librarySearch: document.querySelector('#library-search'),
  materialFilter: document.querySelector('#material-filter'),
  materialChoices: document.querySelector('#material-options'),
  shapeFilter: document.querySelector('#shape-filter'),
  sizeFilter: document.querySelector('#size-filter'),
  addBeadButton: document.querySelector('#add-bead-button'),
  beadDialog: document.querySelector('#bead-dialog'),
  addBeadForm: document.querySelector('#add-bead-form'),
  cancelAddBead: document.querySelector('#cancel-add-bead'),
  beadDialogMode: document.querySelector('#bead-dialog-mode'),
  beadDialogTitle: document.querySelector('#bead-dialog-title'),
  beadDialogSubmit: document.querySelector('#bead-dialog-submit'),
  libraryCount: document.querySelector('#library-count'),
  savedGrid: document.querySelector('#saved-grid'),
  savedEmpty: document.querySelector('#saved-empty'),
  toast: document.querySelector('#toast'),
  homeLink: document.querySelector('#home-link'),
  libraryEmpty: document.querySelector('#library-empty'),
  resetFilters: document.querySelector('#reset-filters'),
  restoreDefaultBeads: document.querySelector('#restore-default-beads'),
  clearSaved: document.querySelector('#clear-saved')
};

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

function renderMaterialControls() {
  elements.materialFilter.innerHTML = '<option value="">全部材质</option>' + MATERIAL_OPTIONS.map(material => `<option value="${material}">${material}</option>`).join('');
  elements.materialChoices.innerHTML = MATERIAL_OPTIONS.map((material, index) => `<label><input type="radio" name="material" value="${material}" ${index === 0 ? 'checked' : ''} required><span>${material}</span></label>`).join('');
}

function readCustomBeads() {
  try {
    const value = JSON.parse(localStorage.getItem(CUSTOM_BEADS_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter(item => item && item.id && item.name && item.color && item.shape !== '隔珠' && !item.suitableRoles?.includes('spacer')) : [];
  } catch {
    return [];
  }
}

function readDeletedBeadIds() {
  try {
    const value = JSON.parse(localStorage.getItem(DELETED_BEADS_KEY) ?? '[]');
    return new Set(Array.isArray(value) ? value.filter(id => typeof id === 'string') : []);
  } catch {
    return new Set();
  }
}

function persistDeletedBeads() {
  try {
    localStorage.setItem(DELETED_BEADS_KEY, JSON.stringify([...state.deletedBeadIds]));
  } catch (error) {
    console.warn('Unable to save deleted beads locally', { type: error?.name ?? 'storage_error' });
    showToast('浏览器存储空间不足，删除状态未能保存');
  }
}
function persistCustomBeads() {
  try {
    localStorage.setItem(CUSTOM_BEADS_KEY, JSON.stringify(state.customBeads));
  } catch (error) {
    console.warn('Unable to save custom beads locally', { type: error?.name ?? 'storage_error' });
    showToast('浏览器存储空间不足，珠子未能保存');
  }
}

function readSaved() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return hydrateSavedDesigns(value, [...DEFAULT_BEADS, ...customBeads]);
  } catch {
    return [];
  }
}

function persistSaved() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.saved));
  } catch (error) {
    console.warn('Unable to save designs locally', { type: error?.name ?? 'storage_error' });
    showToast('浏览器存储空间不足，方案未能保存');
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove('show'), 2400);
}

async function requestThemeAnalysis(rawTheme) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(THEME_ANALYSIS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: rawTheme }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`theme_service_${response.status}`);
    const data = await response.json();
    return normalizeTheme(data?.theme, rawTheme);
  } finally {
    window.clearTimeout(timeout);
  }
}

function ellipsePerimeter(rx, ry) {
  return Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
}

function buildArcTable(rx, ry, steps = 900) {
  const table = [{ angle: Math.PI / 2, distance: 0 }];
  let distance = 0;
  let previous = { x: rx * Math.cos(Math.PI / 2), y: ry * Math.sin(Math.PI / 2) };
  for (let index = 1; index <= steps; index += 1) {
    const angle = Math.PI / 2 + (Math.PI * 2 * index) / steps;
    const current = { x: rx * Math.cos(angle), y: ry * Math.sin(angle) };
    distance += Math.hypot(current.x - previous.x, current.y - previous.y);
    table.push({ angle, distance });
    previous = current;
  }
  return { table, total: distance };
}

function angleAtDistance(arc, target) {
  const normalized = ((target % arc.total) + arc.total) % arc.total;
  let low = 0;
  let high = arc.table.length - 1;
  while (low + 1 < high) {
    const middle = Math.floor((low + high) / 2);
    if (arc.table[middle].distance < normalized) low = middle;
    else high = middle;
  }
  const left = arc.table[low];
  const right = arc.table[high];
  const progress = (normalized - left.distance) / Math.max(0.0001, right.distance - left.distance);
  return left.angle + (right.angle - left.angle) * progress;
}

let svgRenderCounter = 0;

function safeBeadColor(color) {
  return /^#[0-9A-F]{6}$/i.test(color) ? color.toUpperCase() : '#CCCCCC';
}

function mixColor(color, target, ratio) {
  const source = color.slice(1).match(/.{2}/g).map(value => Number.parseInt(value, 16));
  const destination = target.slice(1).match(/.{2}/g).map(value => Number.parseInt(value, 16));
  const channels = source.map((value, index) => Math.round(value + (destination[index] - value) * ratio));
  return `#${channels.map(value => value.toString(16).padStart(2, '0')).join('')}`;
}

function beadBrightness(color) {
  const channels = safeBeadColor(color).slice(1).match(/.{2}/g).map((value) => Number.parseInt(value, 16));
  return (channels[0] * 299 + channels[1] * 587 + channels[2] * 114) / 1000;
}

function sharedOpticalDefinitions(id, color) {
  const pale = mixColor(color, '#FFFFFF', 0.82);
  const cool = mixColor(color, '#D8EAF0', 0.58);
  const warm = mixColor(color, '#F4DCE2', 0.52);
  const depth = mixColor(color, '#2E3332', 0.34);
  return `<radialGradient id="${id}-soft" cx="34%" cy="28%" r="72%"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".78"/><stop offset=".34" stop-color="${pale}" stop-opacity=".36"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient><linearGradient id="${id}-nacre" x1=".08" y1=".08" x2=".92" y2=".9"><stop offset="0" stop-color="${cool}" stop-opacity=".2"/><stop offset=".32" stop-color="${pale}" stop-opacity=".42"/><stop offset=".6" stop-color="${warm}" stop-opacity=".22"/><stop offset="1" stop-color="${cool}" stop-opacity=".08"/></linearGradient><radialGradient id="${id}-depth" cx="62%" cy="68%" r="68%"><stop offset="0" stop-color="${depth}" stop-opacity=".34"/><stop offset=".62" stop-color="${color}" stop-opacity=".1"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
}

function materialDefinition(bead, id) {
  const color = safeBeadColor(bead.color);
  const transmission = Math.max(0, Math.min(1, Number(bead.transparency) || 0));
  const white = mixColor(color, '#FFFFFF', 0.88);
  const light = mixColor(color, '#FFFFFF', 0.58);
  const mid = mixColor(color, '#FFFFFF', 0.18);
  const deep = mixColor(color, '#282E2D', 0.28);
  let base;
  if (bead.material === '水晶') {
    base = `<radialGradient id="${id}" cx="35%" cy="28%" r="76%"><stop offset="0" stop-color="${white}" stop-opacity="${(0.52 + transmission * .16).toFixed(2)}"/><stop offset=".22" stop-color="${light}" stop-opacity=".42"/><stop offset=".52" stop-color="${color}" stop-opacity="${(0.42 + (1 - transmission) * .18).toFixed(2)}"/><stop offset=".76" stop-color="${deep}" stop-opacity=".62"/><stop offset=".91" stop-color="${light}" stop-opacity=".52"/><stop offset="1" stop-color="${deep}" stop-opacity=".72"/></radialGradient>`;
  } else if (bead.material === '琉璃') {
    base = `<radialGradient id="${id}" cx="37%" cy="31%" r="72%"><stop offset="0" stop-color="${white}" stop-opacity=".72"/><stop offset=".2" stop-color="${light}" stop-opacity=".68"/><stop offset=".5" stop-color="${mid}" stop-opacity=".82"/><stop offset=".78" stop-color="${color}" stop-opacity=".94"/><stop offset="1" stop-color="${deep}" stop-opacity=".9"/></radialGradient>`;
  } else if (bead.material === '珍珠') {
    base = `<radialGradient id="${id}" cx="36%" cy="28%" r="74%"><stop offset="0" stop-color="${mixColor(color, '#FFFDF7', .9)}"/><stop offset=".26" stop-color="${mixColor(color, '#F7F3ED', .66)}"/><stop offset=".56" stop-color="${light}"/><stop offset=".78" stop-color="${mixColor(color, '#D8E6EB', .28)}"/><stop offset="1" stop-color="${mixColor(color, '#8C8580', .22)}"/></radialGradient>`;
  } else if (bead.material === '贝壳') {
    base = `<linearGradient id="${id}" x1=".04" y1=".08" x2=".96" y2=".92"><stop offset="0" stop-color="${mixColor(color, '#E0F0F1', .58)}"/><stop offset=".2" stop-color="${white}"/><stop offset=".44" stop-color="${mixColor(color, '#F2DCE8', .38)}"/><stop offset=".66" stop-color="${mixColor(color, '#D6E7EF', .36)}"/><stop offset=".84" stop-color="${mid}"/><stop offset="1" stop-color="${deep}"/></linearGradient>`;
  } else if (bead.material === '玛瑙') {
    base = `<radialGradient id="${id}" cx="39%" cy="34%" r="75%"><stop offset="0" stop-color="${light}"/><stop offset=".22" stop-color="${mid}"/><stop offset=".5" stop-color="${color}"/><stop offset=".76" stop-color="${mixColor(color, '#5F4C48', .18)}"/><stop offset="1" stop-color="${deep}"/></radialGradient>`;
  } else if (bead.material === '天然石') {
    base = `<radialGradient id="${id}" cx="34%" cy="29%" r="78%"><stop offset="0" stop-color="${mixColor(color, '#FFFFFF', .6)}"/><stop offset=".26" stop-color="${light}"/><stop offset=".6" stop-color="${color}"/><stop offset=".84" stop-color="${mixColor(color, '#6C716D', .15)}"/><stop offset="1" stop-color="${deep}"/></radialGradient>`;
  } else if (bead.material === '陶瓷') {
    base = `<radialGradient id="${id}" cx="34%" cy="27%" r="75%"><stop offset="0" stop-color="${mixColor(color, '#FFFFFF', .9)}"/><stop offset=".2" stop-color="${mixColor(color, '#FFFFFF', .7)}"/><stop offset=".58" stop-color="${mid}"/><stop offset=".82" stop-color="${color}"/><stop offset="1" stop-color="${deep}"/></radialGradient>`;
  } else if (bead.material === '木质') {
    base = `<linearGradient id="${id}" x1=".05" y1=".05" x2=".95" y2=".95"><stop offset="0" stop-color="${light}"/><stop offset=".3" stop-color="${mid}"/><stop offset=".58" stop-color="${color}"/><stop offset=".76" stop-color="${mixColor(color, '#8C674C', .16)}"/><stop offset="1" stop-color="${deep}"/></linearGradient>`;
  } else if (bead.material === '金属') {
    base = `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${deep}"/><stop offset=".12" stop-color="${light}"/><stop offset=".25" stop-color="${color}"/><stop offset=".38" stop-color="#FFF9E8"/><stop offset=".5" stop-color="${mid}"/><stop offset=".65" stop-color="${deep}"/><stop offset=".78" stop-color="${light}"/><stop offset=".9" stop-color="${color}"/><stop offset="1" stop-color="${deep}"/></linearGradient>`;
  } else {
    base = `<radialGradient id="${id}" cx="34%" cy="28%" r="76%"><stop offset="0" stop-color="${light}"/><stop offset=".56" stop-color="${color}"/><stop offset="1" stop-color="${deep}"/></radialGradient>`;
  }
  return `${base}${sharedOpticalDefinitions(id, color)}`;
}

function materialDetails(bead, size, paintId) {
  const gloss = Math.max(0, Math.min(1, Number(bead.gloss) || 0));
  const color = safeBeadColor(bead.color);
  const light = mixColor(color, '#FFFFFF', 0.68);
  const pale = mixColor(color, '#F7F9F7', 0.82);
  const dark = mixColor(color, '#313534', 0.34);
  const soft = `url(#${paintId}-soft)`;
  const nacre = `url(#${paintId}-nacre)`;
  const depth = `url(#${paintId}-depth)`;
  if (bead.material === '水晶') {
    return `<ellipse cx="${-size * .1}" cy="${-size * .12}" rx="${size * .3}" ry="${size * .23}" fill="${soft}" fill-opacity=".54"/><ellipse cx="${size * .16}" cy="${size * .18}" rx="${size * .28}" ry="${size * .19}" fill="${depth}" fill-opacity=".32"/><path d="M ${-size * .34} ${size * .08} C ${-size * .16} ${size * .26}, ${size * .08} ${size * .3}, ${size * .3} ${size * .12}" fill="none" stroke="${pale}" stroke-opacity="${(.2 + gloss * .12).toFixed(2)}" stroke-width="${Math.max(.45, size * .025)}" stroke-linecap="round"/>`;
  }
  if (bead.material === '琉璃') {
    return `<ellipse cx="${-size * .1}" cy="${-size * .13}" rx="${size * .28}" ry="${size * .2}" fill="${soft}" fill-opacity=".66"/><ellipse cx="${size * .15}" cy="${size * .16}" rx="${size * .31}" ry="${size * .22}" fill="${depth}" fill-opacity=".4"/><path d="M ${-size * .3} ${size * .18} Q 0 ${size * .31} ${size * .3} ${size * .14}" fill="none" stroke="${light}" stroke-opacity=".2" stroke-width="${Math.max(.5, size * .03)}"/>`;
  }
  if (bead.material === '珍珠') {
    return `<ellipse cx="${-size * .08}" cy="${-size * .08}" rx="${size * .34}" ry="${size * .27}" fill="${soft}" fill-opacity="${(.42 + gloss * .12).toFixed(2)}"/><ellipse cx="${size * .06}" cy="${size * .08}" rx="${size * .39}" ry="${size * .31}" fill="${nacre}" fill-opacity=".52"/><ellipse cx="${size * .16}" cy="${size * .18}" rx="${size * .24}" ry="${size * .15}" fill="${depth}" fill-opacity=".16"/>`;
  }
  if (bead.material === '贝壳') {
    return `<path d="M ${-size * .4} ${-size * .2} C ${-size * .14} ${-size * .3}, ${size * .12} ${size * .02}, ${size * .4} ${-size * .1}" fill="none" stroke="${pale}" stroke-opacity=".32" stroke-width="${Math.max(.7, size * .06)}"/><path d="M ${-size * .38} ${size * .02} C ${-size * .1} ${-size * .08}, ${size * .12} ${size * .26}, ${size * .38} ${size * .12}" fill="none" stroke="${mixColor(color, '#E9BFD5', .5)}" stroke-opacity=".2" stroke-width="${Math.max(.6, size * .05)}"/><path d="M ${-size * .3} ${size * .22} Q 0 ${size * .08} ${size * .34} ${size * .2}" fill="none" stroke="${mixColor(color, '#BFDDE8', .56)}" stroke-opacity=".2" stroke-width="${Math.max(.5, size * .04)}"/>`;
  }
  if (bead.material === '玛瑙') {
    return `<path d="M ${-size * .43} ${-size * .2} C ${-size * .18} ${-size * .34}, ${size * .06} ${size * .04}, ${size * .43} ${-size * .18}" fill="none" stroke="${light}" stroke-opacity=".28" stroke-width="${Math.max(.8, size * .075)}"/><path d="M ${-size * .42} ${size * .02} C ${-size * .14} ${-size * .14}, ${size * .12} ${size * .22}, ${size * .42} ${size * .02}" fill="none" stroke="${pale}" stroke-opacity=".18" stroke-width="${Math.max(.65, size * .055)}"/><path d="M ${-size * .36} ${size * .23} C ${-size * .08} ${size * .04}, ${size * .18} ${size * .32}, ${size * .36} ${size * .16}" fill="none" stroke="${dark}" stroke-opacity=".18" stroke-width="${Math.max(.6, size * .05)}"/>`;
  }
  if (bead.material === '天然石') {
    return `<path d="M ${-size * .36} ${size * .18} Q ${-size * .12} ${-size * .02} ${size * .04} ${size * .09} T ${size * .34} ${-size * .12}" fill="none" stroke="${pale}" stroke-opacity=".23" stroke-width="${Math.max(.45, size * .027)}"/><path d="M ${-size * .22} ${-size * .3} Q ${-size * .05} ${-size * .08} ${size * .16} ${-size * .2}" fill="none" stroke="${dark}" stroke-opacity=".14" stroke-width="${Math.max(.4, size * .022)}"/><ellipse cx="${-size * .19}" cy="${size * .02}" rx="${size * .075}" ry="${size * .045}" fill="${dark}" fill-opacity=".12"/><ellipse cx="${size * .18}" cy="${size * .13}" rx="${size * .055}" ry="${size * .035}" fill="${light}" fill-opacity=".2"/><circle cx="${size * .12}" cy="${-size * .17}" r="${Math.max(.35, size * .025)}" fill="${dark}" fill-opacity=".14"/>`;
  }
  if (bead.material === '陶瓷') {
    return `<ellipse cx="${-size * .1}" cy="${-size * .13}" rx="${size * .3}" ry="${size * .22}" fill="${soft}" fill-opacity="${(.54 + gloss * .1).toFixed(2)}"/><ellipse cx="${size * .14}" cy="${size * .18}" rx="${size * .28}" ry="${size * .18}" fill="${depth}" fill-opacity=".18"/>`;
  }
  if (bead.material === '木质') {
    return `<path d="M ${-size * .4} ${-size * .18} C ${-size * .14} ${-size * .06}, ${size * .1} ${-size * .22}, ${size * .4} ${-size * .08}" fill="none" stroke="rgba(77,54,39,.2)" stroke-width="${Math.max(.45, size * .028)}"/><path d="M ${-size * .4} ${size * .06} C ${-size * .08} ${size * .18}, ${size * .12} ${-size * .02}, ${size * .4} ${size * .12}" fill="none" stroke="${light}" stroke-opacity=".18" stroke-width="${Math.max(.4, size * .024)}"/><path d="M ${-size * .34} ${size * .23} Q 0 ${size * .1} ${size * .34} ${size * .22}" fill="none" stroke="rgba(77,54,39,.14)" stroke-width="${Math.max(.4, size * .022)}"/>`;
  }
  if (bead.material === '金属') {
    return `<path d="M ${-size * .34} ${-size * .24} L ${size * .08} ${size * .18}" stroke="rgba(255,255,255,.58)" stroke-width="${Math.max(.8, size * .075)}" stroke-linecap="round"/><path d="M ${-size * .08} ${-size * .28} L ${size * .28} ${size * .08}" stroke="rgba(255,248,220,.3)" stroke-width="${Math.max(.55, size * .045)}" stroke-linecap="round"/><ellipse cx="${size * .19}" cy="${size * .2}" rx="${size * .2}" ry="${size * .12}" fill="${depth}" fill-opacity=".36"/>`;
  }
  return `<ellipse cx="${-size * .1}" cy="${-size * .12}" rx="${size * .28}" ry="${size * .21}" fill="${soft}" fill-opacity=".46"/>`;
}
function beadMarkup(bead, size, paintId, shadowId) {
  const paint = `url(#${paintId})`;
  const isPale = beadBrightness(bead.color) >= 222;
  const edgeByMaterial = {
    '水晶': isPale ? 'rgba(67,92,96,.46)' : 'rgba(66,88,92,.3)',
    '琉璃': isPale ? 'rgba(70,91,94,.42)' : 'rgba(62,78,81,.3)',
    '珍珠': isPale ? 'rgba(105,101,96,.34)' : 'rgba(79,74,71,.25)',
    '贝壳': isPale ? 'rgba(92,98,96,.34)' : 'rgba(75,78,76,.24)',
    '金属': 'rgba(67,55,43,.42)',
    '陶瓷': isPale ? 'rgba(97,98,94,.32)' : 'rgba(62,65,63,.23)'
  };
  const stroke = edgeByMaterial[bead.material] ?? (isPale ? 'rgba(75,82,79,.34)' : 'rgba(54,59,57,.22)');
  const transparency = Math.max(0, Math.min(1, Number(bead.transparency) || 0));
  const bodyOpacity = bead.material === '水晶'
    ? Math.max(.86, .98 - transparency * .12)
    : bead.material === '琉璃'
      ? Math.max(.91, .99 - transparency * .07)
      : 1;
  const strokeWidth = isPale ? Math.max(.65, size * .045) : Math.max(.52, size * .032);
  const attributes = `fill="${paint}" fill-opacity="${bodyOpacity}" stroke="${stroke}" stroke-width="${strokeWidth}" filter="url(#${shadowId})"`;
  const detail = materialDetails(bead, size, paintId);
  if (bead.shape === '米珠') return `<ellipse rx="${size * 0.52}" ry="${size * 0.41}" ${attributes}/>${detail}`;
  if (bead.shape === '扁圆珠') return `<ellipse rx="${size * 0.54}" ry="${size * 0.42}" ${attributes}/>${detail}`;
  if (bead.shape === '管珠') return `<rect x="${-size * 0.68}" y="${-size * 0.28}" width="${size * 1.36}" height="${size * 0.56}" rx="${size * 0.16}" ${attributes}/>${detail}<path d="M ${-size * 0.5} ${-size * 0.18} V ${size * 0.18} M ${size * 0.5} ${-size * 0.18} V ${size * 0.18}" stroke="rgba(45,50,48,.18)" stroke-width="${Math.max(.55, size * .045)}"/>`;
  if (bead.shape === '方形珠') return `<rect x="${-size * 0.45}" y="${-size * 0.45}" width="${size * 0.9}" height="${size * 0.9}" rx="${size * 0.08}" ${attributes}/>${detail}`;
  if (bead.shape === '菱形珠') return `<rect x="${-size * 0.38}" y="${-size * 0.38}" width="${size * 0.76}" height="${size * 0.76}" rx="${size * 0.06}" transform="rotate(45)" ${attributes}/>${detail}`;
  return `<circle r="${size * 0.5}" ${attributes}/>${detail}`;
}

export function renderBraceletSvg(pattern) {
  const width = 340;
  const height = 250;
  const cx = width / 2;
  const cy = height / 2 - 2;
  const gap = 0.9;
  const rx = 94;
  const ry = 66;
  const arc = buildArcTable(rx, ry);
  const prefix = `bracelet-${++svgRenderCounter}`;
  const uniqueBeads = [...new Map(pattern.map(bead => [bead.id, bead])).values()];
  const paintIds = new Map(uniqueBeads.map((bead, index) => [bead.id, `${prefix}-paint-${index}`]));
  const materialDefs = uniqueBeads.map(bead => materialDefinition(bead, paintIds.get(bead.id))).join('');
  const shadowId = `${prefix}-contact-shadow`;
  const defs = `<defs>${materialDefs}<filter id="${shadowId}" x="-50%" y="-50%" width="200%" height="220%"><feDropShadow dx="0" dy="1.05" stdDeviation=".9" flood-color="#4B4742" flood-opacity=".14"/></filter></defs>`;
  const longitudinalFactor = bead => ({ '管珠': 1.36, '米珠': 1.04, '扁圆珠': 1.08, '菱形珠': 1.08, '方形珠': 0.9 }[bead.shape] ?? 1);
  const physicalWidths = pattern.map(bead => bead.size * longitudinalFactor(bead));
  const availableForBeads = Math.max(1, arc.total - gap * pattern.length);
  const scale = Math.min(3.45, availableForBeads / physicalWidths.reduce((sum, value) => sum + value, 0));
  const displayWidths = physicalWidths.map(value => value * scale);
  const distributedGap = Math.max(gap, (arc.total - displayWidths.reduce((sum, value) => sum + value, 0)) / pattern.length);
  const trackWidths = displayWidths.map(value => value + distributedGap);
  let cursor = 0;
  const beads = pattern.map((bead, index) => {
    const trackWidth = trackWidths[index];
    const angle = angleAtDistance(arc, cursor + trackWidth / 2);
    cursor += trackWidth;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    const tangent = Math.atan2(ry * Math.cos(angle), -rx * Math.sin(angle)) * 180 / Math.PI;
    const displaySize = bead.size * scale;
    return `<g class="bracelet-bead" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${tangent.toFixed(2)})">${beadMarkup(bead, displaySize, paintIds.get(bead.id), shadowId)}</g>`;
  }).join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="完整闭合的真实材质手链预览">${defs}<ellipse cx="${cx}" cy="${cy}" rx="${rx.toFixed(2)}" ry="${ry.toFixed(2)}" fill="none" stroke="rgba(110,115,110,.07)" stroke-width=".8"/>${beads}</svg>`;
}

function designCard(design, savedMode = false) {
  const usage = design.pattern.reduce((counts, bead) => counts.set(bead.id, (counts.get(bead.id) ?? 0) + 1), new Map());
  const chips = design.beads.map(bead => `<span class="bead-chip" title="${escapeHtml(bead.name)} · ${bead.size}mm × ${usage.get(bead.id) ?? 0}"><i style="background:${bead.color}"></i>${escapeHtml(bead.name)} · ${bead.size}mm × ${usage.get(bead.id) ?? 0}</span>`).join('');
  const numbers = { flow: '01', focus: '02', airy: '03' };
  const estimatedLengthMm = Number(design.estimatedLengthMm) || design.pattern.reduce((sum, bead) => sum + bead.size, 0);
  const alreadySaved = !savedMode && state.saved.some(item => item.id === design.id);
  const buttonLabel = savedMode ? '移除收藏' : alreadySaved ? '已收藏' : '收藏方案';
  return `<article class="scheme-card" style="--scheme-a:${design.palette[0]};--scheme-b:${design.palette.at(-1)}">
    <div class="card-meta"><span>方案 ${numbers[design.profile]}</span><span class="score">审美评分 ${design.score}</span></div>
    <div class="bracelet">${renderBraceletSvg(design.pattern)}</div>
    <p class="scheme-note">${escapeHtml(design.note)}</p>
    <div class="materials-heading"><span>使用珠材</span><small>共 ${design.pattern.length} 颗 · 约 ${(estimatedLengthMm / 10).toFixed(1)}cm</small></div>
    <div class="bead-list">${chips}</div>
    <div class="card-actions"><button class="save-button${alreadySaved ? ' is-saved' : ''}" type="button" data-save-id="${escapeHtml(design.id)}" aria-pressed="${alreadySaved}" ${alreadySaved ? 'disabled' : ''}>${buttonLabel}</button></div>
  </article>`;
}

function syncResultSaveButtons() {
  const savedIds = new Set(state.saved.map(item => item.id));
  elements.schemeGrid.querySelectorAll('[data-save-id]').forEach(button => {
    const saved = savedIds.has(button.dataset.saveId);
    button.textContent = saved ? '已收藏' : '收藏方案';
    button.classList.toggle('is-saved', saved);
    button.disabled = saved;
    button.setAttribute('aria-pressed', String(saved));
  });
}

function attachSaveHandlers(container, savedMode) {
  container.querySelectorAll('[data-save-id]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.saveId;
      if (savedMode) {
        state.saved = state.saved.filter(item => item.id !== id);
        persistSaved();
        renderSaved();
        syncResultSaveButtons();
        showToast('方案已移除');
        return;
      }
      const design = state.currentDesigns.find(item => item.id === id);
      if (!design) return;
      state.saved = [design, ...state.saved.filter(item => item.id !== id)].slice(0, 30);
      persistSaved();
      syncResultSaveButtons();
      showToast('方案已收藏');
    });
  });
}

function renderResults(designs) {
  elements.results.classList.remove('hidden');
  const displayOrder = { flow: 0, focus: 1, airy: 2 };
  const ordered = [...designs].sort((left, right) => displayOrder[left.profile] - displayOrder[right.profile]);
  elements.schemeGrid.innerHTML = ordered.map(design => designCard(design)).join('');
  attachSaveHandlers(elements.schemeGrid, false);
  elements.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function generate(rawTheme) {
  elements.button.disabled = true;
  elements.button.textContent = '理解主题中…';
  elements.status.textContent = '';
  elements.results.setAttribute('aria-busy', 'true');
  elements.results.classList.add('is-generating');
  let theme;
  try {
    try {
      theme = await requestThemeAnalysis(rawTheme);
    } catch (error) {
      console.info('AI theme analysis unavailable; local semantic fallback used', { type: error?.name ?? 'request_error' });
      theme = createLocalTheme(rawTheme);
    }
    elements.button.textContent = '筛选候选中…';
      await new Promise(resolve => window.setTimeout(resolve, 120));
    state.generationCounter += 1;
    const entropy = new Uint32Array(1);
    window.crypto.getRandomValues(entropy);
    const seed = (entropy[0] ^ Date.now() ^ Math.imul(state.generationCounter, 2654435761)) >>> 0;
    const wristSizeCm = Number(elements.wristSize.value) || 16;
    const historyKey = `${theme.title}|${wristSizeCm}`;
    const previousDesigns = state.generationHistory.get(historyKey) ?? [];
    const availableLibrary = state.library.filter(bead => Number(bead.count ?? 1) > 0);
    const previousVariant = previousDesigns.at(-1)?.layoutVariant;
    const generationVariant = Number.isInteger(previousVariant) ? (previousVariant + 1) % 3 : seed % 3;
    const designs = generateDesigns(theme, availableLibrary, { candidateCount: 36, seed, previousDesigns, wristSizeCm, generationVariant });
    state.currentTheme = theme;
    state.currentDesigns = designs;
    state.generationHistory.set(historyKey, [...previousDesigns, ...designs].slice(-60));
    renderResults(designs);
    elements.status.textContent = '';
  } catch (error) {
    console.error('Design generation failed', { type: error?.name ?? 'generation_error' });
    elements.status.textContent = '未找到同时满足主题与结构的方案，请换一种描述或稍后重试。';
    showToast('生成失败，请稍后重试');
  } finally {
    elements.button.disabled = false;
    elements.button.textContent = '生成 3 个方案';
    elements.results.setAttribute('aria-busy', 'false');
    elements.results.classList.remove('is-generating');
  }
}

const SHAPE_CLASSES = {
  '圆珠': 'round', '米珠': 'rice', '方形珠': 'square',
  '菱形珠': 'diamond', '扁圆珠': 'flat', '管珠': 'tube'
};

function libraryBeadMarkup(bead) {
  const size = Math.max(28, Math.min(62, bead.size * 8));
  const prefix = `preview-${++svgRenderCounter}`;
  const paintId = `${prefix}-paint`;
  const shadowId = `${prefix}-shadow`;
  const defs = `<defs>${materialDefinition(bead, paintId)}<filter id="${shadowId}" x="-50%" y="-50%" width="200%" height="220%"><feDropShadow dx="0" dy="1.4" stdDeviation="1.15" flood-color="#4B4742" flood-opacity=".16"/></filter></defs>`;
  const preview = beadMarkup(bead, size, paintId, shadowId);
  return `<svg class="bead-preview-svg" viewBox="-42 -42 84 84" aria-hidden="true">${defs}<g>${preview}</g></svg>`;
}

function colorMetrics(hex) {
  const channels = hex.slice(1).match(/.{2}/g).map(value => parseInt(value, 16) / 255);
  const max = Math.max(...channels);
  const min = Math.min(...channels);
  return { saturation: max === 0 ? 0 : (max - min) / max, brightness: channels.reduce((sum, value) => sum + value, 0) / 3 };
}

function inferColorFamily(hex) {
  const [r, g, b] = hex.slice(1).match(/.{2}/g).map(value => parseInt(value, 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  if (lightness > 0.88 && saturation < 0.22) return '白/米';
  if (saturation < 0.14) return '灰/黑';
  let hue = 0;
  if (max === r) hue = 60 * (((g - b) / delta) % 6);
  else if (max === g) hue = 60 * ((b - r) / delta + 2);
  else hue = 60 * ((r - g) / delta + 4);
  if (hue < 0) hue += 360;
  if (hue < 18 || hue >= 345) return '粉/红';
  if (hue < 48) return '橙/棕';
  if (hue < 72) return '金/黄';
  if (hue < 165) return '绿';
  if (hue < 255) return '蓝';
  if (hue < 315) return '紫';
  return '粉/红';
}

const FAMILY_NAMES = { '白/米': '雾白', '金/黄': '暖金', '灰/黑': '烟灰', '粉/红': '柔粉', '绿': '青绿', '蓝': '雾蓝', '紫': '暮紫', '橙/棕': '暖棕' };

function buildCustomBead(form, existingId = null) {
  const data = new FormData(form);
  const shape = String(data.get('shape'));
  const material = String(data.get('material'));
  const size = Number(data.get('size'));
  const color = String(data.get('color')).toUpperCase();
  const family = inferColorFamily(color);
  const suitableRoles = shape === '管珠'
      ? ['secondary', 'accent']
      : size <= 2 ? ['accent']
        : size <= 3 ? ['main', 'secondary', 'accent']
          : size <= 4 ? ['main', 'secondary', 'accent']
            : size <= 6 ? ['main', 'secondary', 'focal'] : ['focal'];
  const { saturation } = colorMetrics(color);
  return {
    id: existingId ?? `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` ,
    name: String(data.get('name')).trim() || `${FAMILY_NAMES[family]}${material}${shape}`, color, size, shape, family, material,
    count: Math.max(0, Number(data.get('count')) || 0),
    transparency: ({ '水晶': 0.58, '琉璃': 0.35, '珍珠': 0.06, '贝壳': 0.06, '陶瓷': 0.02, '木质': 0.01 })[material] ?? 0.03,
    gloss: ({ '金属': 0.82, '水晶': 0.72, '珍珠': 0.66, '贝壳': 0.58, '陶瓷': 0.4, '木质': 0.22 })[material] ?? 0.38,
    temperature: ['金/黄', '粉/红', '橙/棕'].includes(family) ? 'warm' : ['蓝', '紫'].includes(family) ? 'cool' : 'neutral',
    saturation, visualWeight: Math.min(0.78, Math.max(0.12, size / 11)), suitableRoles
  };
}

function closeBeadDialog() {
  state.editingBeadId = null;
  elements.addBeadForm.reset();
  elements.beadDialog.close();
}

function openAddBeadDialog() {
  state.editingBeadId = null;
  elements.addBeadForm.reset();
  elements.beadDialogMode.textContent = 'MY BEAD';
  elements.beadDialogTitle.textContent = '添加一颗珠子';
  elements.beadDialogSubmit.textContent = '保存到珠子库';
  elements.beadDialog.showModal();
}

function openEditBeadDialog(beadId) {
  const bead = state.customBeads.find(item => item.id === beadId);
  if (!bead) return;
  state.editingBeadId = bead.id;
  elements.addBeadForm.elements.name.value = bead.name;
  elements.addBeadForm.elements.color.value = bead.color;
  elements.addBeadForm.elements.size.value = String(bead.size);
  elements.addBeadForm.elements.shape.value = bead.shape;
  elements.addBeadForm.elements.material.value = bead.material;
  elements.addBeadForm.elements.count.value = String(Math.max(0, Number(bead.count ?? 0)));
  elements.beadDialogMode.textContent = 'EDIT BEAD';
  elements.beadDialogTitle.textContent = '编辑珠子';
  elements.beadDialogSubmit.textContent = '保存修改';
  elements.beadDialog.showModal();
}

function deleteBead(beadId) {
  const bead = state.library.find(item => item.id === beadId);
  if (!bead || !window.confirm(`确定从珠子库删除「${bead.name}」吗？它将不再参与新方案生成。`)) return;
  if (bead.id.startsWith('custom-')) {
    state.customBeads = state.customBeads.filter(item => item.id !== beadId);
    persistCustomBeads();
  } else {
    state.deletedBeadIds.add(beadId);
    persistDeletedBeads();
  }
  state.library = state.library.filter(item => item.id !== beadId);
  renderLibrary();
  showToast(`已删除「${bead.name}」`);
}

function restoreDefaultBeads() {
  if (!state.deletedBeadIds.size || !window.confirm('恢复此前删除的全部默认珠子吗？')) return;
  state.deletedBeadIds.clear();
  persistDeletedBeads();
  state.library = [...DEFAULT_BEADS, ...state.customBeads];
  renderLibrary();
  showToast('已恢复默认珠子');
}

function resetLibraryFilters() {
  elements.librarySearch.value = '';
  elements.materialFilter.value = '';
  elements.shapeFilter.value = '';
  elements.sizeFilter.value = '';
  renderLibrary();
}

function renderLibrary() {
  const query = elements.librarySearch.value.trim().toLowerCase();
  const material = elements.materialFilter.value;
  const shape = elements.shapeFilter.value;
  const sizeFilter = Number(elements.sizeFilter.value);
  const visible = state.library.filter(bead => {
    const haystack = `${bead.name} ${bead.family} ${bead.material} ${bead.shape}`.toLowerCase();
    return (!query || haystack.includes(query)) && (!material || bead.material === material) && (!shape || bead.shape === shape) && (!sizeFilter || bead.size === sizeFilter);
  });
  elements.restoreDefaultBeads.classList.toggle('hidden', state.deletedBeadIds.size === 0);
  elements.libraryCount.textContent = visible.length === state.library.length
    ? `共 ${state.library.length} 种`
    : `找到 ${visible.length} 种`;
  elements.libraryEmpty.classList.toggle('hidden', visible.length > 0);
  elements.beadGrid.classList.toggle('hidden', visible.length === 0);
  elements.beadGrid.innerHTML = visible.map(bead => {
    const stock = Math.max(0, Number(bead.count ?? 1) || 0);
    const customTools = `<div class="bead-card-tools">${bead.id.startsWith('custom-') ? `<button type="button" data-edit-bead="${bead.id}">编辑</button>` : ''}<button type="button" data-delete-bead="${bead.id}">删除</button></div>`;
    return `<article class="bead-card">${customTools}
      <div class="bead-swatch">${libraryBeadMarkup(bead)}</div>
      <div class="bead-info"><h3>${escapeHtml(bead.name)} <small class="material-badge">${escapeHtml(bead.material)}</small></h3><p>${bead.size}mm · ${escapeHtml(bead.shape)} <span class="stock-count${stock === 0 ? ' is-empty' : ''}">库存 ${stock}</span></p></div>
    </article>`;
  }).join('');
}

function renderSaved() {
  elements.savedEmpty.classList.toggle('hidden', state.saved.length > 0);
  elements.clearSaved.classList.toggle('hidden', state.saved.length === 0);
  elements.savedGrid.innerHTML = state.saved.map(design => designCard(design, true)).join('');
  attachSaveHandlers(elements.savedGrid, true);
}

const VALID_PAGES = new Set(['inspiration', 'library', 'saved']);

function switchPage(page, updateHash = true) {
  const target = VALID_PAGES.has(page) ? page : 'inspiration';
  document.querySelectorAll('.page').forEach(section => section.classList.toggle('hidden', section.id !== `page-${target}`));
  document.querySelectorAll('.tab').forEach(tab => {
    const active = tab.dataset.page === target;
    tab.classList.toggle('active', active);
    if (active) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  });
  if (target === 'library') renderLibrary();
  if (target === 'saved') renderSaved();
  if (updateHash) window.history.replaceState(null, '', `#${target}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('hashchange', () => switchPage(window.location.hash.slice(1), false));
elements.homeLink.addEventListener('click', event => {
  event.preventDefault();
  switchPage('inspiration');
});

elements.input.addEventListener('keydown', event => {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing || event.keyCode === 229) return;
  event.preventDefault();
  if (!elements.button.disabled) elements.form.requestSubmit();
});

elements.form.addEventListener('submit', event => {
  event.preventDefault();
  const rawTheme = elements.input.value.trim();
  if (rawTheme) generate(rawTheme);
});

document.querySelectorAll('[data-theme]').forEach(button => button.addEventListener('click', () => {
  elements.input.value = button.dataset.theme;
  elements.input.focus();
}));

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => switchPage(tab.dataset.page)));
elements.librarySearch.addEventListener('input', renderLibrary);
elements.materialFilter.addEventListener('change', renderLibrary);
elements.shapeFilter.addEventListener('change', renderLibrary);
elements.sizeFilter.addEventListener('change', renderLibrary);
elements.resetFilters.addEventListener('click', resetLibraryFilters);
elements.restoreDefaultBeads.addEventListener('click', restoreDefaultBeads);
elements.addBeadButton.addEventListener('click', openAddBeadDialog);
elements.cancelAddBead.addEventListener('click', closeBeadDialog);
elements.beadDialog.addEventListener('click', event => {
  if (event.target === elements.beadDialog) closeBeadDialog();
});
elements.beadGrid.addEventListener('click', event => {
  const editButton = event.target.closest('[data-edit-bead]');
  const deleteButton = event.target.closest('[data-delete-bead]');
  if (editButton) openEditBeadDialog(editButton.dataset.editBead);
  if (deleteButton) deleteBead(deleteButton.dataset.deleteBead);
});
elements.addBeadForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!elements.addBeadForm.reportValidity()) return;
  const editingId = state.editingBeadId;
  const bead = buildCustomBead(elements.addBeadForm, editingId);
  if (editingId) {
    state.customBeads = state.customBeads.map(item => item.id === editingId ? bead : item);
    state.library = state.library.map(item => item.id === editingId ? bead : item);
  } else {
    state.customBeads.unshift(bead);
    state.library.unshift(bead);
  }
  persistCustomBeads();
  closeBeadDialog();
  renderLibrary();
  showToast(editingId ? `已更新「${bead.name}」` : `已添加「${bead.name}」`);
});
elements.clearSaved.addEventListener('click', () => {
  if (!state.saved.length || !window.confirm('确定清空全部收藏方案吗？')) return;
  state.saved = [];
  persistSaved();
  renderSaved();
  syncResultSaveButtons();
  showToast('方案库已清空');
});

renderMaterialControls();
renderLibrary();
renderSaved();
switchPage(window.location.hash.slice(1), false);
