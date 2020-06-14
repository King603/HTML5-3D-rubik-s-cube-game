import ConfettiStage from "./ConfettiStage.js";
import Game from "./Game.js";

export default class {
  isStart = !1;
  // 选项对象
  options = {
    // 速度
    speed: { min: .0011, max: .0022 },
    // 旋转
    revolution: { min: .01, max: .05 },
    // 型号
    size: { min: .1, max: .15 },
    // 颜色
    colors: [0x41aac8, 0x82ca38, 0xffef48, 0xef3923, 0xff8c0a],
  };
  geometry = new THREE.PlaneGeometry(1, 1);
  material = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
  /**
   * 纸屑类
   * @param {Game} game 构造函数Game
   */
  constructor(game) {
    this.game = game;
    // 调用两次ConfettiStage类放入this.holders数组中。
    this.holders = [
      new ConfettiStage(this.game, this, 1, 20),
      new ConfettiStage(this.game, this, -1, 30),
    ];
  }
  // 开始
  start() {
    // 已开始则终止
    if (this.isStart)
      return;
    // forEach循环遍历属性holders内的元素
    this.holders.forEach(holder => {
      // 为每个game属性的scene添加holder.holder
      this.game.world.scene.add(holder.holder);
      // 运行每个元素的开始方法
      holder.start();
      // 标记开始
      this.isStart = !0;
    });
  }
  // 停止
  stop() {
    // 已停止则终止
    if (!this.isStart)
      return;
    // forEach循环遍历属性holders内的元素
    this.holders.forEach(holder => {
      // 运行每个元素的停止方法
      holder.stop(() => {
        // 为每个game属性的scene移除holder.holder
        this.game.world.scene.remove(holder.holder);
        // 标记停止
        this.isStart = !1;
      });
    });
  }
  /**
   * 更新颜色
   * @param {{ U: Number, D: Number, F: Number, R: Number, B: Number, L: Number, P: Number, G: Number }} colors 颜色数组
   */
  updateColors(colors) {
    // forEach循环遍历属性holders内的元素
    this.holders.forEach(holder =>
      // 遍历每个元素的colors属性
      holder.options.colors.forEach((color, index) =>
        // 赋值对用位置
        color = colors[["D", "F", "R", "B", "L"][index]]
      )
    );
  }
}
