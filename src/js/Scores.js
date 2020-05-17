import Game from "./Game.js";

export default class {
  /**
   * 分数类
   * @param {Game} game 
   */
  constructor(game) {
    this.game = game;
    this.scores = [];
    this.solves = 0;
    this.best = 0;
    this.worst = 0;
  }
  /**
   * 添加时间
   * @param {TimeRanges} time 
   */
  addScore(time) {
    this.scores.push(time);
    this.solves++;
    if (this.scores.lenght > 100)
      this.scores.shift();
    let bestTime = false;
    if (time < this.best || this.best === 0) {
      this.best = time;
      bestTime = true;
    }
    if (time > this.worst)
      this.worst = time;
    return bestTime;
  }
  // 计算统计数据
  calcStats() {
    this.setStat('total-solves', this.solves);
    this.setStat('best-time', this.convertTime(this.best));
    this.setStat('worst-time', this.convertTime(this.worst));
    this.setStat('average-5', this.getAverage(5));
    this.setStat('average-12', this.getAverage(12));
    this.setStat('average-25', this.getAverage(25));
  }
  /**
   * 设置统计数据
   * @param {String} name 名称
   * @param {Number} value 值
   */
  setStat(name, value) {
    if (value === 0)
      return;
    this.game.dom.stats.querySelector(`.stats[name="${name}"] b`).innerHTML = value;
  }
  /**
   * 获得平均值
   * @param {Number} count 计数值
   */
  getAverage(count) {
    if (this.scores.length < count)
      return 0;
    return this.convertTime(this.scores.slice(-count).reduce((a, b) => a + b, 0) / count);
  }
  /**
   * 转换时间
   * @param {TimeRanges} time 
   */
  convertTime(time) {
    if (time <= 0)
      return 0;
      return `${parseInt(time / 1000 / 60)}:${parseInt(time / 1000 % 60).toString().padStart(2, "0")}`;
  }
}
