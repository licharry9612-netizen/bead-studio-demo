const smallBead = (id, name, color, family, material, temperature, transparency, gloss, saturation) => ({
  id,
  name,
  color,
  size: 3,
  shape: '圆珠',
  family,
  material,
  transparency,
  gloss,
  temperature,
  saturation,
  visualWeight: 0.16,
  suitableRoles: ['main', 'secondary', 'accent']
});

export const SMALL_BEADS = [
  smallBead('small-moon-white-3', '月白小圆珠', '#F3F0EA', '白/米', '珍珠', 'neutral', 0.08, 0.62, 0.06),
  smallBead('small-cream-pearl-3', '奶油小珍珠', '#F1DFC2', '白/米', '珍珠', 'warm', 0.06, 0.66, 0.12),
  smallBead('small-dawn-gold-3', '晨光黄水晶', '#F2D99B', '金/黄', '水晶', 'warm', 0.52, 0.7, 0.28),
  smallBead('small-peach-3', '蜜桃粉水晶', '#E7B9B0', '粉/红', '水晶', 'warm', 0.48, 0.65, 0.24),
  smallBead('small-lotus-mist-3', '莲雾粉晶', '#D7A6B5', '粉/红', '水晶', 'neutral', 0.5, 0.68, 0.27),
  smallBead('small-mist-blue-3', '雾蓝小水晶', '#B7CDD8', '蓝', '水晶', 'cool', 0.58, 0.7, 0.2),
  smallBead('small-sea-salt-3', '海盐蓝琉璃', '#8FBFC9', '蓝', '琉璃', 'cool', 0.5, 0.62, 0.28),
  smallBead('small-bamboo-dew-3', '竹露绿水晶', '#B8CEA4', '绿', '水晶', 'neutral', 0.42, 0.6, 0.2),
  smallBead('small-moss-3', '苔青小圆珠', '#7F9B78', '绿', '天然石', 'neutral', 0.12, 0.34, 0.24),
  smallBead('small-tea-3', '浅咖小玛瑙', '#B99B82', '橙/棕', '玛瑙', 'warm', 0.08, 0.36, 0.2),
  smallBead('small-lavender-3', '雾紫小水晶', '#B9AEC9', '紫', '水晶', 'cool', 0.52, 0.66, 0.2),
  smallBead('small-graphite-3', '石墨小玛瑙', '#72777B', '灰/黑', '玛瑙', 'cool', 0.06, 0.3, 0.05)
];

export default SMALL_BEADS;