import Draggable from "./Draggable.js";
export default class {
  /**
   * 范围类
   * @param {String} name 名称
   * @param {Object} options 首选项
   */
  constructor(name, options = {}) {
    options = Object.assign({
      range: [0, 1],
      value: 0,
      step: 0,
      onUpdate: () => { },
      onComplete: () => { },
    }, options);
    this.element = document.querySelector(`.range[name="${name}"]`);
    this.track = this.element.querySelector('.range__track');
    this.handle = this.element.querySelector('.range__handle');
    this.value = options.value;
    [this.min, this.max] = options.range;
    this.step = options.step;
    ({ onUpdate: this.onUpdate, onComplete: this.onComplete } = options);
    this.value = this.round(this.limitValue(this.value));
    this.setHandlePosition();
    this.initDraggable();
  }
  // 初始化拖动
  initDraggable() {
    let current;
    this.draggable = new Draggable(this.handle, { calcDelta: !0 });
    this.draggable.onDragStart = () => {
      current = this.positionFromValue(this.value);
      this.handle.style.left = current + 'px';
    };
    this.draggable.onDragMove = position => {
      current = this.limitPosition(current + position.delta.x);
      this.value = this.round(this.valueFromPosition(current));
      this.setHandlePosition();
      this.onUpdate(this.value);
    };
    this.draggable.onDragEnd = () => this.onComplete(this.value);
  }
  /**
   * 旋转
   * @param {Number} value 值
   */
  round(value) {
    return this.step < 1
      ? value
      : Math.round((value - this.min) / this.step) * this.step + this.min;
  }
  /**
   * 极限值
   * @param {Number} value 值
   */
  limitValue(value) {
    return Math.min(Math.max(value, Math.min(this.max, this.min)), Math.max(this.max, this.min));
  }
  /**
   * 极限位置
   * @param {Number} position 位置
   */
  limitPosition(position) {
    return Math.min(Math.max(position, 0), this.track.offsetWidth);
  }
  /**
   * 值百分比
   * @param {Number} value 值
   */
  percentsFromValue(value) {
    return (value - this.min) / (this.max - this.min);
  }
  /**
   * 位置值
   * @param {Number} position 位置
   */
  valueFromPosition(position) {
    return this.min + (this.max - this.min) * position / this.track.offsetWidth;
  }
  /**
   * 位置的值
   * @param {Number}} value 值
   */
  positionFromValue(value) {
    return this.percentsFromValue(value) * this.track.offsetWidth;
  }
  // 设置处理的位置
  setHandlePosition() {
    this.handle.style.left = this.percentsFromValue(this.value) * 100 + '%';
  }
}
