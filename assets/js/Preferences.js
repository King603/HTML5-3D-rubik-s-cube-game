import Range from "./Range.js";
export default class {
  /**
   * 首选项类
   * @param {FunctionConstructor} game 游戏
   */
  constructor(game) {
    this.game = game;
  }
  // 初始化
  init() {
    // 范围
    this.ranges = {
      // 翻转设置
      flip: new Range('flip', {
        value: this.game.controls.flipConfig,
        range: [0, 2],
        step: 1,
        onUpdate: value => {
          this.game.controls.flipConfig = value;
        },
      }),
      // 加扰设置
      scramble: new Range('scramble', {
        value: this.game.scrambler.scrambleLength,
        range: [20, 30],
        step: 5,
        onUpdate: value => {
          this.game.scrambler.scrambleLength = value;
        },
      }),
      // 当前设置
      fov: new Range('fov', {
        value: this.game.world.fov,
        range: [2, 45],
        onUpdate: value => {
          this.game.world.fov = value;
          this.game.world.resize();
        },
      }),
      // 主题设置
      theme: new Range('theme', {
        value: { cube: 0, erno: 1, dust: 2, camo: 3, rain: 4 }[this.game.themes.theme],
        range: [0, 4],
        step: 1,
        onUpdate: value => {
          let theme = ['cube', 'erno', 'dust', 'camo', 'rain'][value];
          this.game.themes.setTheme(theme);
        },
      }),
    };
  }
}
