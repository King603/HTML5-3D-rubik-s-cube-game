import Animation from "./Animation.js";
import Confetti from "./Confetti.js";
import Game from "./Game.js";
import Particle from "./Particle.js";

// 继承Animation类
export default class extends Animation {
  /**
   * 面板设置阶段
   * @param {Game} game 构造函数Game
   * @param {Confetti} parent 父级构造函数
   * @param {Number} distance 距离
   * @param {Number} count 计数
   */
  constructor(game, parent, distance, count) {
    super(false);
    this.game = game;
    this.parent = parent;
    this.distanceFromCube = distance;
    this.count = count;
    this.particles = [];
    (this.holder = new THREE.Object3D()).rotation.copy(this.game.world.camera.rotation);
    this.holder.add(this.object = new THREE.Object3D());
    this.resizeViewport = this.resizeViewport.bind(this);
    this.game.world.onResize.push(this.resizeViewport);
    this.resizeViewport();
    ({ geometry: this.geometry, material: this.material, options: this.options } = this.parent);
    let { count: i } = this;
    while (i--)
      this.particles.push(new Particle(this));
  }
  // 开始
  start() {
    // 利用ES5的performance技术获取精准的时间并赋值于属性time中
    this.time = performance.now();
    // 标记开始
    this.playing = true;
    // 获取类中个数
    let { count: i } = this;
    // 循环particles属性中各个元素的重置方法
    while (i--)
      this.particles[i].reset();
    // 运行父类的start方法
    super.start();
  }
  /**
   * 停止
   * @param {{()=>{}}} callback 回调函数
   */
  stop(callback) {
    // 标记停止
    this.playing = false;
    // 标记结束
    this.completed = 0;
    // 接收回调函数
    this.callback = callback;
  }
  // 重置
  reset() {
    // 运行父类stop方法
    super.stop();
    // 运行回调函数
    this.callback();
  }
  // 更新
  update() {
    // 利用ES5的performance技术获取精准的时间
    let now = performance.now();
    // 获取差值
    let delta = now - this.time;
    // 存贮当时时间
    this.time = now;
    // 获取类中个数
    let { count: i } = this;
    // 循环particles属性中各个元素
    while (i--)
      // 当元素中的completed属性不为真则执行更新方法
      if (!this.particles[i].completed)
        this.particles[i].update(delta);
    // 当游戏停止且this.completed == this.count时运行重置方法
    if (!this.playing && this.completed == this.count)
      this.reset();
  }
  // 调整窗口
  resizeViewport() {
    let { fov, position, aspect } = this.game.world.camera;
    this.height = 2 * Math.tan(fov * THREE.Math.DEG2RAD / 2) * (position.length() - this.distanceFromCube);
    this.width = this.height * aspect;
    let scale = 1 / this.game.transition.data.cameraZoom;
    this.width *= scale;
    this.height *= scale;
    this.object.position.z = this.distanceFromCube;
    this.object.position.y = this.height / 2;
  }
}
