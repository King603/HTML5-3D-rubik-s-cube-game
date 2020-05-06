let animationEngine = (() => {
  // 声明闭包中的计数变量，防止外界影响
  let uniqueID = 0;
  return new class {
    constructor() {
      this.ids = [];
      this.animations = {};
      this.update = this.update.bind(this);
      this.raf = 0;
      this.time = 0;
    }
    // 更新
    update() {
      // 利用ES5的performance技术获取精准的时间
      let now = performance.now();
      // 获取时间差
      let delta = now - this.time;
      // 把现在的时间存入类中
      this.time = now;
      // 获取ID个数
      let i = this.ids.length;
      // 依照ID个数判断是否执行请求帧动画
      this.raf = i ? requestAnimationFrame(this.update) : 0;
      // 循环递减执行类中动画属性对应位置的更新方法
      while (i--)
        this.animations[this.ids[i]] && this.animations[this.ids[i]].update(delta);
    }
    /**
     * 添加
     * @param {ObjectConstructor} animation 构造函数
     */
    add(animation) {
      // 赋值于animation.id后自增
      animation.id = uniqueID++;
      // 把animation.id添加到类中的ID属性中
      this.ids.push(animation.id);
      // 把animation赋值于类中动画属性的对应位置
      this.animations[animation.id] = animation;
      // 判断该属性是否为0，若为0则终止该方法
      if (this.raf !== 0)
        return;
      // 利用ES5的performance技术获取精准的时间并赋值于属性time中
      this.time = performance.now();
      // 执行请求帧动画
      this.raf = requestAnimationFrame(this.update);
    }
    // 
    /**
     * 删除
     * @param {ObjectConstructor} animation 构造函数
     */
    remove(animation) {
      // 获取animation.id在属性ids中的对应位置
      let index = this.ids.indexOf(animation.id);
      // 若不存在则终止
      if (index < 0)
        return;
      // 删除属性ids对应位置的元素
      this.ids.splice(index, 1);
      // 删除属性animations对应位置的元素
      delete this.animations[animation.id];
      // 清空animation变量
      animation = null;
    }
  };
})();
export default class {
  /**
   * 动画类
   * @param {Boolean} isStart 执行
   */
  constructor(isStart) {
    // 判断是否执行该方法
    isStart && this.start();
  }
  // 开始
  start() {
    // 调用闭包执行添加方法
    animationEngine.add(this);
  }
  // 停止
  stop() {
    // 调用闭包执行删除方法
    animationEngine.remove(this);
  }
  update() { }
}
