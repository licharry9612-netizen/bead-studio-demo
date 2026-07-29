const bead = (id, name, color, size, shape, family, material, transparency, gloss, temperature, saturation, visualWeight, suitableRoles, count = 80) => ({
  id, name, color, size, shape, family, material, transparency, gloss, temperature, saturation, visualWeight, suitableRoles, count
});

export const STYLE_EXPANSION_BEADS = [
  bead('style-shell-blush', '樱粉贝壳片', '#E9C7C8', 4, '扁圆珠', '粉/红', '贝壳', .06, .58, 'warm', .22, .22, ['main', 'secondary', 'accent'], 86),
  bead('style-shell-seafoam', '海沫贝壳菱片', '#BFDCD5', 5, '菱形珠', '绿', '贝壳', .1, .6, 'cool', .2, .3, ['secondary', 'accent', 'focal'], 64),
  bead('style-ceramic-celadon', '雨青陶瓷珠', '#AFCBBB', 4, '圆珠', '绿', '陶瓷', .02, .42, 'cool', .22, .32, ['main', 'secondary', 'accent'], 96),
  bead('style-ceramic-cream', '奶白陶瓷米珠', '#F1E9DB', 3, '米珠', '白/米', '陶瓷', .02, .38, 'warm', .1, .18, ['main', 'secondary', 'accent'], 140),
  bead('style-ceramic-peach', '蜜桃陶瓷珠', '#E5B4A8', 4, '圆珠', '粉/红', '陶瓷', .02, .42, 'warm', .3, .3, ['main', 'secondary', 'accent'], 92),
  bead('style-wood-honey-tube', '蜜蜡木管珠', '#D9B56F', 4, '管珠', '金/黄', '木质', .01, .28, 'warm', .34, .3, ['secondary', 'accent'], 82),
  bead('style-wood-pale', '浅枫木圆珠', '#E4D2B6', 4, '圆珠', '白/米', '木质', .01, .24, 'warm', .16, .28, ['main', 'secondary', 'accent'], 90),
  bead('style-onyx-square', '墨曜切面方珠', '#45484C', 5, '方形珠', '灰/黑', '天然石', .02, .36, 'cool', .06, .5, ['secondary', 'focal'], 60),
  bead('style-lavender-diamond', '丁香紫菱晶', '#B9A7CE', 4, '菱形珠', '紫', '水晶', .55, .76, 'cool', .28, .28, ['main', 'secondary', 'accent'], 84),
  bead('style-sun-square', '晴日黄方晶', '#E8CE72', 4, '方形珠', '金/黄', '琉璃', .42, .68, 'warm', .48, .3, ['main', 'secondary', 'accent'], 88),
  bead('style-midnight-focal', '午夜蓝方晶', '#3F536B', 5, '方形珠', '蓝', '水晶', .36, .72, 'cool', .34, .48, ['secondary', 'focal'], 62),
  bead('style-aqua-tube', '湖光蓝管珠', '#8ECBD2', 4, '管珠', '蓝', '琉璃', .5, .72, 'cool', .38, .3, ['secondary', 'accent'], 86),
  bead('style-blush-diamond', '樱雾粉菱晶', '#E8B9C3', 4, '菱形珠', '粉/红', '水晶', .5, .72, 'warm', .3, .26, ['main', 'secondary', 'accent'], 86),
  bead('style-sun-diamond', '晨光黄菱晶', '#E8D57F', 4, '菱形珠', '金/黄', '水晶', .48, .7, 'warm', .38, .26, ['main', 'secondary', 'accent'], 84),
  bead('style-clear-diamond', '雾白菱晶', '#E7EEF2', 4, '菱形珠', '白/米', '水晶', .7, .78, 'cool', .08, .23, ['main', 'secondary', 'accent'], 92),
  bead('style-coral-diamond', '珊瑚橙菱晶', '#E0A28F', 4, '菱形珠', '粉/红', '琉璃', .42, .66, 'warm', .38, .27, ['secondary', 'accent'], 78),
  bead('style-blush-tube', '柔粉管珠', '#E7BDC2', 4, '管珠', '粉/红', '琉璃', .4, .64, 'warm', .25, .28, ['secondary', 'accent'], 84),
  bead('style-lavender-tube', '雾紫管珠', '#B7A7CB', 4, '管珠', '紫', '琉璃', .42, .66, 'cool', .26, .29, ['secondary', 'accent'], 82),
  bead('style-mint-tube', '薄荷绿管珠', '#A9CDB8', 4, '管珠', '绿', '琉璃', .44, .66, 'cool', .24, .28, ['secondary', 'accent'], 86),
  bead('style-white-tube', '月雾白管珠', '#E8ECE8', 4, '管珠', '白/米', '琉璃', .54, .7, 'neutral', .07, .25, ['main', 'secondary', 'accent'], 94),
];

export default STYLE_EXPANSION_BEADS;
