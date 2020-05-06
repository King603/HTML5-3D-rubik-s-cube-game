import Game from "./Game.js";

export default class {
  /**
   * 存储类
   * @param {Game} game 
   */
  constructor(game) {
    this.game = game;
  }
  // 初始化
  init() {
    this.loadGame();
    this.loadPreferences();
  }
  // 载入游戏
  loadGame() {
    this.game.saved = !1;
  }
  // 加载首选项
  loadPreferences() {
    this.game.controls.flipConfig = 0;
    this.game.scrambler.scrambleLength = 20;
    this.game.world.fov = 10;
    this.game.world.resize();
    this.game.themes.setTheme("cube");
    return !1;
  }
}
