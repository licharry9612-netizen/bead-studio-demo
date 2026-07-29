const b = (id, name, color, size, shape, family, material, transparency, gloss, temperature, saturation, visualWeight, suitableRoles, count = 100) => ({ id, name, color, size, shape, family, material, transparency, gloss, temperature, saturation, visualWeight, suitableRoles, count });

export default [
  b('x-white-seed', '瓷白米珠', '#F2F0EA', 2, '米珠', '白/米', '琉璃', .08, .55, 'neutral', .06, .12, ['accent'], 220),
  b('x-pearl-seed', '小粒白珍珠', '#F7F1E6', 3, '圆珠', '白/米', '珍珠', .03, .72, 'warm', .08, .18, ['main', 'secondary', 'accent'], 160),
  b('x-clear-glass', '透明琉璃珠', '#EEF7F5', 5, '圆珠', '白/米', '琉璃', .88, .9, 'cool', .05, .2, ['main', 'secondary', 'focal'], 90),
  b('x-clear-square', '透明方晶', '#E7F0F0', 5, '方形珠', '白/米', '水晶', .84, .88, 'cool', .06, .3, ['accent', 'focal'], 72),
  b('x-ivory-tube', '象牙管珠', '#E8DFC9', 4, '管珠', '白/米', '天然石', .05, .3, 'warm', .12, .28, ['secondary', 'accent'], 96),
  b('x-cloud-gray', '云灰圆珠', '#CCD0CE', 6, '圆珠', '灰/黑', '天然石', .08, .3, 'neutral', .04, .38, ['main', 'secondary', 'focal'], 70),
  b('x-smoky-crystal', '烟灰水晶', '#7F8586', 4, '圆珠', '灰/黑', '水晶', .52, .7, 'cool', .08, .38, ['main', 'secondary', 'accent'], 92),
  b('x-sky-seed', '天青米珠', '#B9D4E0', 2, '米珠', '蓝', '琉璃', .42, .62, 'cool', .2, .12, ['accent'], 210),
  b('x-aqua-crystal', '海蓝宝水晶', '#A5D3DB', 4, '圆珠', '蓝', '水晶', .68, .82, 'cool', .28, .22, ['main', 'secondary', 'accent'], 110),
  b('x-denim-agate', '丹宁蓝玛瑙', '#627E9B', 6, '圆珠', '蓝', '玛瑙', .08, .42, 'cool', .32, .5, ['main', 'secondary', 'focal'], 68),
  b('x-navy-crystal', '深海蓝水晶', '#334A68', 4, '圆珠', '蓝', '水晶', .35, .72, 'cool', .44, .48, ['secondary', 'accent'], 88),
  b('x-blue-diamond', '雾蓝菱晶', '#91AFC2', 5, '菱形珠', '蓝', '水晶', .56, .8, 'cool', .26, .36, ['secondary', 'accent', 'focal'], 64),
  b('x-blue-tube', '灰蓝管珠', '#728C9C', 4, '管珠', '蓝', '琉璃', .25, .5, 'cool', .22, .28, ['secondary', 'accent'], 105),
  b('x-mint-seed', '薄荷绿米珠', '#BFD8C2', 2, '米珠', '绿', '琉璃', .35, .6, 'cool', .17, .1, ['accent'], 200),
  b('x-peridot', '橄榄石水晶', '#A8C47B', 4, '圆珠', '绿', '水晶', .55, .75, 'neutral', .36, .26, ['main', 'secondary', 'accent'], 104),
  b('x-jade-round', '青玉圆珠', '#86A98B', 6, '圆珠', '绿', '天然石', .08, .35, 'cool', .25, .42, ['main', 'secondary', 'focal'], 74),
  b('x-forest-agate', '森绿色玛瑙', '#365B49', 4, '圆珠', '绿', '玛瑙', .04, .38, 'cool', .4, .52, ['secondary', 'accent', 'focal'], 86),
  b('x-green-square', '苔青方晶', '#718D6C', 5, '方形珠', '绿', '水晶', .46, .74, 'cool', .3, .4, ['secondary', 'accent', 'focal'], 62),
  b('x-green-diamond', '浅翠菱晶', '#A7C5A0', 5, '菱形珠', '绿', '水晶', .52, .77, 'cool', .22, .32, ['secondary', 'accent'], 66)
];
