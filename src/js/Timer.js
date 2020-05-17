import Animation from "./Animation.js";
import Game from "./Game.js";

export default class extends Animation {
  /**
   * 计时器类
   * @param {Game} game 
   */
  constructor(game) {
    super(false);
    this.game = game;
    this.reset();
  }
  /**
   * 开始
   * @param {Boolean} isGame 游戏是否运行 
   */
  start(isGame) {
    this.startTime = Date.now() - (isGame ? this.deltaTime : 0);
    this.deltaTime = 0;
    this.converted = this.convert();
    super.start();
  }
  // 重置
  reset() {
    this.startTime = 0;
    this.currentTime = 0;
    this.deltaTime = 0;
    this.converted = "0:00";
  }
  // 停止
  stop() {
    this.currentTime = Date.now();
    this.deltaTime = this.currentTime - this.startTime;
    this.convert();
    super.stop();
    return { time: this.converted, millis: this.deltaTime };
  }
  // 更新
  update() {
    let old = this.converted;
    this.currentTime = Date.now();
    this.deltaTime = this.currentTime - this.startTime;
    this.convert();
    if (this.converted != old) {
      localStorage.setItem("theCube_time", this.deltaTime);
      this.setText();
    }
  }
  // 转换
  convert() {
    let time = this.deltaTime / 1000;
    this.converted = `${parseInt(time / 60)}:${parseInt(time % 60).toString().padStart(2, "0")}`;
  }
  // 设置文本
  setText() {
    this.game.dom.texts.timer.innerHTML = this.converted;
  }
}
