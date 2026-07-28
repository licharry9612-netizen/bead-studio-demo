const bead = (id, name, color, size, shape, family, material, transparency, gloss, temperature, saturation, visualWeight, suitableRoles) => ({
  id, name, color, size, shape, family, material, transparency, gloss, temperature, saturation, visualWeight, suitableRoles, count: 120
});

export const DEFAULT_BEADS = [
  bead('white-pearl-4', '柔白珍珠', '#F7F4EE', 4, '圆珠', '白/米', '珍珠', 0.05, 0.7, 'neutral', 0.08, 0.2, ['main', 'secondary', 'accent']),
  bead('moonstone-6', '月光石', '#E9EEF1', 6, '圆珠', '白/米', '天然石', 0.42, 0.55, 'cool', 0.1, 0.35, ['main', 'secondary', 'focal']),
  bead('clear-crystal-4', '清透白水晶', '#EAF6F7', 4, '圆珠', '白/米', '水晶', 0.82, 0.82, 'cool', 0.09, 0.18, ['main', 'secondary', 'accent']),
  bead('ivory-flat-5', '象牙白扁珠', '#F1EEE8', 5, '扁圆珠', '白/米', '天然石', 0.08, 0.35, 'warm', 0.11, 0.32, ['main', 'secondary']),
  bead('cream-pearl-6', '奶油珍珠', '#F4EDE2', 6, '圆珠', '白/米', '珍珠', 0.04, 0.68, 'warm', 0.14, 0.35, ['main', 'secondary', 'focal']),
  bead('oat-stone-4', '燕麦石', '#DCC9AA', 4, '圆珠', '白/米', '天然石', 0.05, 0.26, 'warm', 0.2, 0.3, ['main', 'secondary', 'accent']),

  bead('ice-blue-4', '冰蓝水晶', '#BFDDE7', 4, '圆珠', '蓝', '水晶', 0.76, 0.82, 'cool', 0.22, 0.2, ['main', 'secondary', 'accent']),
  bead('spring-cyan-5', '泉青琉璃', '#8FCBD0', 5, '扁圆珠', '蓝', '琉璃', 0.68, 0.78, 'cool', 0.3, 0.3, ['main', 'secondary', 'focal']),
  bead('mist-blue-seed-2', '雾蓝米珠', '#AEBFCA', 2, '米珠', '蓝', '琉璃', 0.35, 0.55, 'cool', 0.2, 0.12, ['accent', 'spacer']),
  bead('rain-blue-6', '雨蓝玛瑙', '#718AA2', 6, '圆珠', '蓝', '玛瑙', 0.12, 0.38, 'cool', 0.3, 0.48, ['main', 'secondary', 'focal']),
  bead('night-blue-6', '夜幕青金石', '#2E405B', 6, '圆珠', '蓝', '天然石', 0.02, 0.3, 'cool', 0.38, 0.64, ['secondary', 'focal']),

  bead('bamboo-mist-4', '竹雾浅绿', '#D6E3C4', 4, '圆珠', '绿', '天然石', 0.12, 0.32, 'cool', 0.18, 0.22, ['main', 'secondary']),
  bead('bamboo-jade-5', '竹青玉', '#9DBB82', 5, '扁圆珠', '绿', '天然石', 0.1, 0.4, 'neutral', 0.28, 0.32, ['main', 'secondary', 'focal']),
  bead('leaf-crystal-4', '叶青水晶', '#7E9F73', 4, '圆珠', '绿', '水晶', 0.5, 0.66, 'cool', 0.3, 0.3, ['main', 'secondary', 'accent']),
  bead('deep-bamboo-6', '深竹绿玛瑙', '#4D6B50', 6, '圆珠', '绿', '玛瑙', 0.08, 0.34, 'cool', 0.32, 0.5, ['secondary', 'focal']),
  bead('moss-seed-2', '苔绿米珠', '#84957A', 2, '米珠', '绿', '琉璃', 0.25, 0.48, 'neutral', 0.24, 0.14, ['accent', 'spacer']),

  bead('silver-seed-2', '雾银米珠', '#C5CDD1', 2, '米珠', '灰/黑', '金属', 0, 0.92, 'cool', 0.05, 0.16, ['accent', 'spacer']),
  bead('silver-spacer-2', '哑光银隔珠', '#AEB8BE', 2, '隔珠', '灰/黑', '金属', 0, 0.72, 'cool', 0.05, 0.18, ['spacer']),
  bead('mist-gray-4', '雾灰水晶', '#AAB3BB', 4, '圆珠', '灰/黑', '水晶', 0.42, 0.58, 'cool', 0.08, 0.3, ['main', 'secondary', 'accent']),
  bead('graphite-5', '石墨灰玛瑙', '#59616B', 5, '圆珠', '灰/黑', '玛瑙', 0.03, 0.3, 'cool', 0.08, 0.58, ['secondary', 'focal']),
  bead('black-stone-6', '墨黑曜石', '#252A31', 6, '圆珠', '灰/黑', '天然石', 0.02, 0.7, 'cool', 0.08, 0.76, ['focal']),

  bead('gold-seed-2', '香槟金米珠', '#D7C08B', 2, '米珠', '金/黄', '金属', 0, 0.9, 'warm', 0.3, 0.16, ['accent', 'spacer']),
  bead('gold-spacer-2', '哑光金隔珠', '#C9AE78', 2, '隔珠', '金/黄', '金属', 0, 0.72, 'warm', 0.28, 0.18, ['spacer']),
  bead('lamp-crystal-4', '灯光黄水晶', '#E8CE78', 4, '圆珠', '金/黄', '水晶', 0.55, 0.72, 'warm', 0.42, 0.27, ['accent', 'focal']),

  bead('sand-stone-4', '晴柠石', '#E9D88F', 4, '圆珠', '金/黄', '天然石', 0.04, 0.3, 'warm', 0.38, 0.28, ['main', 'secondary', 'accent']),
  bead('mushroom-agate-5', '蘑菇棕玛瑙', '#A77F68', 5, '圆珠', '橙/棕', '玛瑙', 0.06, 0.38, 'warm', 0.3, 0.42, ['main', 'secondary', 'focal']),
  bead('cocoa-flat-6', '丁香灰扁珠', '#A998B6', 6, '扁圆珠', '紫', '天然石', 0.03, 0.34, 'cool', 0.22, 0.42, ['secondary', 'focal']),
  bead('clay-red-4', '柔陶红玛瑙', '#AD746A', 4, '圆珠', '粉/红', '玛瑙', 0.05, 0.38, 'warm', 0.32, 0.36, ['accent', 'secondary']),

  bead('rose-crystal-4', '淡粉水晶', '#DDB7BE', 4, '圆珠', '粉/红', '水晶', 0.6, 0.7, 'warm', 0.28, 0.24, ['main', 'secondary', 'accent']),
  bead('berry-agate-6', '莓红玛瑙', '#934E62', 6, '圆珠', '粉/红', '玛瑙', 0.04, 0.4, 'warm', 0.48, 0.55, ['secondary', 'focal']),
  bead('lavender-4', '雾紫水晶', '#B4A5C5', 4, '圆珠', '紫', '水晶', 0.5, 0.7, 'cool', 0.25, 0.27, ['main', 'secondary', 'accent']),
  bead('amethyst-6', '紫晶焦点珠', '#715B89', 6, '圆珠', '紫', '水晶', 0.4, 0.72, 'cool', 0.4, 0.55, ['secondary', 'focal']),

  bead('blue-square-5', '雨窗方晶', '#718EA5', 5, '方形珠', '蓝', '水晶', 0.62, 0.8, 'cool', 0.3, 0.42, ['accent', 'focal']),
  bead('green-tube-4', '竹节管珠', '#829C72', 4, '管珠', '绿', '琉璃', 0.3, 0.5, 'neutral', 0.28, 0.3, ['accent', 'secondary'])
];

export default DEFAULT_BEADS;
