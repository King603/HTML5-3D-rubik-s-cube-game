import Confetti from "./Confetti.js";

export default class {
  /**
   * 粒子类
   * @param {Confetti} confetti 面板
   */
  constructor(confetti) {
    this.confetti = confetti;
    this.options = this.confetti.options;
    this.velocity = new THREE.Vector3();
    this.force = new THREE.Vector3();
    this.mesh = new THREE.Mesh(this.confetti.geometry, this.confetti.material.clone());
    this.confetti.object.add(this.mesh);
    this.size = THREE.Math.randFloat(this.options.size.min, this.options.size.max);
    this.mesh.scale.set(this.size, this.size, this.size);
    return this;
  }
  /**
   * 重置
   * @param {Boolean} randomHeight 随机高度
   */
  reset(randomHeight = true) {
    this.completed = false;
    this.mesh.material.color.set(this.color = new THREE.Color(this.options.colors[Math.floor(Math.random() * this.options.colors.length)]));
    this.speed = THREE.Math.randFloat(this.options.speed.min, this.options.speed.max) * -1;
    let { width, height } = this.confetti;
    this.mesh.position.x = THREE.Math.randFloat(-width / 2, width / 2);
    this.mesh.position.y = randomHeight ? THREE.Math.randFloat(this.size, height + this.size) : this.size;
    let { max, min } = this.options.revolution;
    this.revolutionSpeed = THREE.Math.randFloat(min, max);
    let arr = ["x", "y", "z"];
    this.revolutionAxis = arr[Math.floor(Math.random() * arr.length)];
    this.mesh.rotation.set(Math.random() * Math.PI / 3, Math.random() * Math.PI / 3, Math.random() * Math.PI / 3);
  }
  // 停止
  stop() {
    this.completed = true;
    this.confetti.completed++;
  }
  /**
   * 更新
   * @param {Number} delta 差值
   */
  update(delta) {
    this.mesh.position.y += this.speed * delta;
    this.mesh.rotation[this.revolutionAxis] += this.revolutionSpeed;
    this.mesh.position.y < -this.confetti.height - this.size && this.confetti.playing ? this.reset(false) : this.stop();
  }
}
