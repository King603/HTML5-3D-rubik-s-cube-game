import Animation from "./Animation.js";
export default class extends Animation {
  /**
   * 渐变类
   * @param {Object} options 首选项 
   */
  constructor(options) {
    super(!1);
    this.duration = options.duration || 500;
    this.easing = options.easing || (t => t);
    this.onUpdate = options.onUpdate || (() => { });
    this.onComplete = options.onComplete || (() => { });
    this.delay = options.delay || !1;
    this.yoyo = options.yoyo ? !1 : null;
    this.progress = 0;
    this.value = 0;
    this.delta = 0;
    this.getFromTo(options);
    this.delay
      ? setTimeout(() => super.start(), this.delay)
      : super.start();
    this.onUpdate(this);
  }
  /**
   * 更新
   * @param {Number} delta 差值
   */
  update(delta) {
    let old = this.value * 1;
    this.progress += delta / this.duration * (this.yoyo === !0 ? -1 : 1);
    this.value = this.easing(this.progress);
    this.delta = this.value - old;
    if (this.values !== null)
      this.updateFromTo();
    if (this.yoyo !== null)
      this.updateYoyo();
    else if (this.progress <= 1)
      this.onUpdate(this);
    else {
      this.progress = 1;
      this.value = 1;
      this.onUpdate(this);
      this.onComplete(this);
      super.stop();
    }
  }
  // 更新yoyo
  updateYoyo() {
    if (this.progress > 1 || this.progress < 0) {
      this.value = this.progress = (this.progress > 1) ? 1 : 0;
      this.yoyo = !this.yoyo;
    }
    this.onUpdate(this);
  }
  // 更新FromTo
  updateFromTo() {
    this.values.forEach(key => this.target[key] = this.from[key] + (this.to[key] - this.from[key]) * this.value);
  }
  /**
   * 获取FromTo
   * @param {Object} options 首选项 
   */
  getFromTo(options) {
    if (!options.target || !options.to) {
      this.values = null;
      return;
    }
    this.target = options.target || null;
    this.from = options.from || {};
    this.to = options.to || null;
    this.values = [];
    if (Object.keys(this.from).length < 1)
      Object.keys(this.to).forEach(key => { this.from[key] = this.target[key]; });
    Object.keys(this.to).forEach(key => { this.values.push(key); });
  }
}
