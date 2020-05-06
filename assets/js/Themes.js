import Game from "./Game.js";

export default class {
  /**
   * 主题类
   * @param {Game} game 
   */
  constructor(game) {
    this.game = game;
    this.colors = {
      cube: { U: 0xfff7ff, D: 0xffef48, F: 0xef3923, R: 0x41aac8, B: 0xff8c0a, L: 0x82ca38, P: 0x08101a, G: 0xd1d5db, },
      erno: { U: 0xffffff, D: 0xffd500, F: 0xc41e3a, R: 0x0051ba, B: 0xff5800, L: 0x009e60, P: 0x111111, G: 0x8abdff, },
      dust: { U: 0xfff6eb, D: 0xe7c48d, F: 0x8f253e, R: 0x607e69, B: 0xbe6f62, L: 0x849f5d, P: 0x111111, G: 0xE7C48D, },
      camo: { U: 0xfff6eb, D: 0xbfb672, F: 0x805831, R: 0x718456, B: 0x37241c, L: 0x37431d, P: 0x111111, G: 0xBFB672, },
      rain: { U: 0xfafaff, D: 0xedb92d, F: 0xce2135, R: 0x449a89, B: 0xec582f, L: 0xa3a947, P: 0x111111, G: 0x87b9ac, },
    };
  }
  /**
   * 设置主题
   * @param {String} theme 
   */
  setTheme(theme) {
    // 取值一致则终止该方法
    if (theme === this.theme)
      return;
    // 开始设置
    this.theme = theme;
    // 获取主题颜色对象
    let colors = this.colors[this.theme];
    // 循环设置用户数据的多维数据集的方块颜色
    this.game.cube.pieces.forEach(piece => piece.userData.cube.material.color.setHex(colors.P));
    // 循环设置边缘颜色
    this.game.cube.edges.forEach(edge => edge.material.color.setHex(colors[edge.name]));
    // 循环设置范围内的背景颜色
    this.game.dom.rangeHandles.forEach(range => range.style.background = getcolor(colors.R));
    // 更新颜色对象
    this.game.confetti.updateColors(colors);
    // 背景颜色设置为颜色对象的G属性值转化为长度为6的字符串不足的用0占位。
    this.game.dom.back.style.background = getcolor(colors.G);
    // 按钮的字体颜色设置为颜色对象的R属性值转化为长度为6的字符串不足的用0占位。
    this.game.dom.buttons.pwa.style.color = getcolor(colors.R);
    function getcolor(color){
      return '#' + color.toString(16).padStart(6, '0');
    }
  }
}
