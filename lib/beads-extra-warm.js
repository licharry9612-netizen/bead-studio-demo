const b = (id, name, color, size, shape, family, material, transparency, gloss, temperature, saturation, visualWeight, suitableRoles, count = 100) => ({ id, name, color, size, shape, family, material, transparency, gloss, temperature, saturation, visualWeight, suitableRoles, count });

export default [
  b('x-champagne-crystal', '香槟水晶', '#E4D2AA', 4, '圆珠', '金/黄', '水晶', .58, .8, 'warm', .28, .23, ['main', 'secondary', 'accent'], 112),
  b('x-lemon-glass', '淡柠琉璃', '#E9D981', 4, '圆珠', '金/黄', '琉璃', .64, .82, 'warm', .44, .25, ['secondary', 'accent'], 92),
  b('x-amber-round', '琥珀圆珠', '#C78E44', 6, '圆珠', '金/黄', '琉璃', .58, .78, 'warm', .52, .48, ['secondary', 'focal'], 60),
  b('x-citrine-focal', '黄晶焦点珠', '#D5B154', 8, '圆珠', '金/黄', '水晶', .48, .8, 'warm', .5, .58, ['focal'], 38),
  b('x-apricot-flat', '蜜桃粉扁珠', '#E6B8A8', 5, '扁圆珠', '粉/红', '天然石', .04, .34, 'warm', .3, .32, ['main', 'secondary', 'accent'], 78),
  b('x-carnelian', '珊瑚橙玛瑙', '#E17F68', 6, '圆珠', '粉/红', '玛瑙', .08, .5, 'warm', .58, .46, ['secondary', 'focal'], 65),
  b('x-terracotta', '陶土红圆珠', '#A96650', 4, '圆珠', '橙/棕', '天然石', .03, .26, 'warm', .38, .38, ['main', 'secondary', 'accent'], 90),
  b('x-walnut-agate', '胡桃棕玛瑙', '#725342', 6, '圆珠', '橙/棕', '玛瑙', .04, .38, 'warm', .3, .58, ['secondary', 'focal'], 58),
  b('x-tea-crystal', '晨霞粉水晶', '#E7B7BD', 4, '圆珠', '粉/红', '水晶', .52, .72, 'warm', .28, .26, ['main', 'secondary', 'accent'], 96),
  b('x-blush-seed', '柔粉米珠', '#E4C3C4', 2, '米珠', '粉/红', '琉璃', .28, .58, 'warm', .24, .1, ['accent', 'spacer'], 190),
  b('x-rose-quartz', '蔷薇粉晶', '#D9AEB5', 5, '圆珠', '粉/红', '水晶', .58, .72, 'warm', .28, .3, ['main', 'secondary', 'focal'], 82),
  b('x-coral-round', '珊瑚红圆珠', '#D18478', 4, '圆珠', '粉/红', '琉璃', .18, .52, 'warm', .42, .34, ['main', 'secondary', 'accent'], 90),
  b('x-garnet-agate', '石榴红玛瑙', '#743E4B', 6, '圆珠', '粉/红', '玛瑙', .04, .42, 'warm', .48, .6, ['secondary', 'focal'], 55),
  b('x-ruby-focal', '酒红焦点珠', '#813B4A', 8, '圆珠', '粉/红', '水晶', .32, .76, 'warm', .52, .64, ['focal'], 34),
  b('x-peach-pearl', '蜜桃珍珠', '#E3B6A4', 4, '圆珠', '粉/红', '珍珠', .04, .7, 'warm', .26, .22, ['main', 'secondary', 'accent'], 106),
  b('x-lilac-seed', '浅紫米珠', '#CFC0DA', 2, '米珠', '紫', '琉璃', .34, .6, 'cool', .22, .1, ['accent', 'spacer'], 185),
  b('x-amethyst-small', '淡紫水晶', '#B09AC3', 4, '圆珠', '紫', '水晶', .56, .76, 'cool', .3, .27, ['main', 'secondary', 'accent'], 96),
  b('x-plum-agate', '梅子紫玛瑙', '#65506F', 6, '圆珠', '紫', '玛瑙', .06, .38, 'cool', .38, .56, ['secondary', 'focal'], 58),
  b('x-violet-square', '灰紫方晶', '#8C789E', 5, '方形珠', '紫', '水晶', .48, .76, 'cool', .32, .4, ['secondary', 'accent', 'focal'], 62),
  b('x-silver-spacer-4', '拉丝银隔珠', '#BFC4C5', 4, '隔珠', '灰/黑', '金属', 0, .7, 'cool', .04, .28, ['spacer'], 130),
  b('x-gold-spacer-4', '拉丝金隔珠', '#C8A862', 4, '隔珠', '金/黄', '金属', 0, .72, 'warm', .32, .3, ['spacer'], 125),
  b('x-rose-gold-seed', '玫瑰金米珠', '#C99486', 2, '米珠', '粉/红', '金属', 0, .88, 'warm', .28, .15, ['spacer', 'accent'], 170),
  b('x-gunmetal-seed', '枪灰米珠', '#666B6D', 2, '米珠', '灰/黑', '金属', 0, .75, 'cool', .04, .2, ['spacer', 'accent'], 160)
];
