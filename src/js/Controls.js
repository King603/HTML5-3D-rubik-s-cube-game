import Draggable from "./Draggable.js";
import Easing from "./Easing.js";
import Game from "./Game.js";
import Tween from "./Tween.js";

// 设定状态常态
// 停止
const STILL = 0;
// 准备
const PREPARING = 1;
// 旋转
const ROTATING = 2;
// 启动
const ANIMATING = 3;

export default class {
  /**
   * 控制类
   * @param {Game} game 构造函数Game
   */
  constructor(game) {
    this.game = game;
    this.flipConfig = 0;
    this.flipEasings = [Easing.Power.Out(3), Easing.Sine.Out(), Easing.Back.Out(2)];
    this.flipSpeeds = [125, 200, 350];
    this.raycaster = new THREE.Raycaster();
    let helperMaterial = new THREE.MeshBasicMaterial({ depthWrite: false, transparent: true, opacity: 0, color: 0x0033ff });
    this.group = new THREE.Object3D();
    this.game.cube.object.add(this.group);
    this.helper = new THREE.Mesh(new THREE.PlaneBufferGeometry(20, 20), helperMaterial.clone());
    this.helper.rotation.set(0, Math.PI / 4, 0);
    this.game.world.scene.add(this.helper);
    this.edges = new THREE.Mesh(new THREE.BoxBufferGeometry(.95, .95, .95), helperMaterial.clone());
    this.game.world.scene.add(this.edges);
    this.momentum = [];
    this.state = STILL;
    this.initDraggable();
  }
  // 处理
  onSolved() { }
  // 移动
  onMove() { }
  // 启用
  enable() {
    // 调用Draggable类的启用方法
    this.draggable.enable();
  }
  // 禁用
  disable() {
    // 调用Draggable类的禁用方法
    this.draggable.disable();
  }
  // 初始化旋转
  initDraggable() {
    // 调用Draggable类
    this.draggable = new Draggable(this.game.dom.game);
    // 设置Draggable类的onDragStart方法
    this.draggable.onDragStart = position => {
      if (this.scramble !== null)
        return;
      // 处于准备或旋转状态下则停止
      if (this.state === PREPARING || this.state === ROTATING)
        return;
      // 判断是否可运转
      this.gettingDrag = this.state === ANIMATING;
      // 获取边相交
      let edgeIntersect = this.getIntersect(position.current, this.edges, !1);
      // 边相交是否存在
      if (edgeIntersect !== false) {
        this.dragNormal = edgeIntersect.face.normal.round();
        this.flipType = "layer";
        this.attach(this.helper, this.edges);
        this.helper.rotation.set(0, 0, 0);
        this.helper.position.set(0, 0, 0);
        this.helper.lookAt(this.dragNormal);
        this.helper.translateZ(0.5);
        this.helper.updateMatrixWorld();
        this.detach(this.helper, this.edges);
      }
      else {
        this.dragNormal = new THREE.Vector3(0, 0, 1);
        this.flipType = "cube";
        this.helper.position.set(0, 0, 0);
        this.helper.rotation.set(0, Math.PI / 4, 0);
        this.helper.updateMatrixWorld();
      }
      // 获取平面相交
      let planeIntersect = this.getIntersect(position.current, this.helper, false).point;
      if (planeIntersect === false)
        return;
      this.dragCurrent = this.helper.worldToLocal(planeIntersect);
      this.dragTotal = new THREE.Vector3();
      this.state = this.state === STILL ? PREPARING : this.state;
    };
    this.draggable.onDragMove = position => {
      if (this.scramble !== null)
        return;
      if (this.state === STILL || (this.state === ANIMATING && this.gettingDrag === false))
        return;
      let planeIntersect = this.getIntersect(position.current, this.helper, false);
      if (planeIntersect === false)
        return;
      let point = this.helper.worldToLocal(planeIntersect.point.clone());
      this.dragDelta = point.clone().sub(this.dragCurrent).setZ(0);
      this.dragTotal.add(this.dragDelta);
      this.dragCurrent = point;
      this.addMomentumPoint(this.dragDelta);
      if (this.state === PREPARING && this.dragTotal.length() > 0.05) {
        this.dragDirection = this.getMainAxis(this.dragTotal);
        if (this.flipType === "layer") {
          let direction = new THREE.Vector3();
          direction[this.dragDirection] = 1;
          let worldDirection = this.helper.localToWorld(direction).sub(this.helper.position);
          let objectDirection = this.edges.worldToLocal(worldDirection).round();
          this.flipAxis = objectDirection.cross(this.dragNormal).negate();
          this.dragIntersect = this.getIntersect(position.current, this.game.cube.cubes, true);
          this.selectLayer(this.getLayer(false));
        }
        else {
          let axis = this.dragDirection != "x"
            ? this.dragDirection == "y" && position.current.x > this.game.world.width / 2 ? "z" : "x"
            : "y";
          this.flipAxis = new THREE.Vector3();
          this.flipAxis[axis] = axis == "x" ? -1 : 1;
        }
        this.flipAngle = 0;
        this.state = ROTATING;
      }
      else if (this.state === ROTATING) {
        const rotation = this.dragDelta[this.dragDirection];
        if (this.flipType === "layer") {
          this.group.rotateOnAxis(this.flipAxis, rotation);
          this.flipAngle += rotation;
        }
        else {
          this.edges.rotateOnWorldAxis(this.flipAxis, rotation);
          this.game.cube.object.rotation.copy(this.edges.rotation);
          this.flipAngle += rotation;
        }
      }
    };
    // 设置Draggable类的onDragEnd方法
    this.draggable.onDragEnd = () => {
      if (this.scramble !== null)
        return;
      if (this.state !== ROTATING) {
        this.gettingDrag = false;
        this.state = STILL;
        return;
      }
      this.state = ANIMATING;
      let angle = this.roundAngle(this.flipAngle + (Math.abs(this.getMomentum()[this.dragDirection]) > .05 && Math.abs(this.flipAngle) < Math.PI / 2
        ? Math.sign(this.flipAngle) * Math.PI / 4
        : 0));
      let delta = angle - this.flipAngle;
      if (this.flipType === "layer") this.rotateLayer(delta, false, () => {
        callback(this);
        this.checkIsSolved();
      });
      else this.rotateCube(delta, () => callback(this));
      function callback(self) {
        self.state = self.gettingDrag ? PREPARING : STILL;
        self.gettingDrag = !1;
      }
    };
  }
  /**
   * 旋转层
   * @param {Number} rotation 旋转
   * @param {Boolean} scramble 争夺
   * @param {Function} callback 回调函数调用后设置
   */
  rotateLayer(rotation, scramble, callback) {
    let config = scramble ? 0 : this.flipConfig;
    let bounce = config == 2 ? this.bounceCube() : (() => { });
    this.rotationTween = new Tween({
      easing: this.flipEasings[config],
      duration: this.flipSpeeds[config],
      /**
       * 设置更新方法
       * @param {Tween} tween 
       */
      onUpdate: tween => {
        let deltaAngle = tween.delta * rotation;
        this.group.rotateOnAxis(this.flipAxis, deltaAngle);
        bounce(tween.value, deltaAngle, rotation);
      },
      onComplete: () => {
        if (!scramble)
          this.onMove();
        let layer = this.flipLayer.slice(0);
        this.game.cube.object.rotation.setFromVector3(this.snapRotation(this.game.cube.object.rotation.toVector3()));
        this.group.rotation.setFromVector3(this.snapRotation(this.group.rotation.toVector3()));
        this.deselectLayer(this.flipLayer);
        callback(layer);
      },
    });
  }
  // 反弹立方体
  bounceCube() {
    let fixDelta = true;
    return (progress, delta, rotation) => {
      if (progress >= 1) {
        if (fixDelta) {
          delta = (progress - 1) * rotation;
          fixDelta = false;
        }
        this.game.cube.object.rotateOnAxis(this.flipAxis, delta);
      }
    };
  }
  /**
   * 旋转立方体
   * @param {Number} rotation 旋转
   * @param {Function} callback 回调函数调用后设置
   */
  rotateCube(rotation, callback) {
    let { flipConfig: config } = this;
    this.rotationTween = new Tween({
      easing: [Easing.Power.Out(4), Easing.Sine.Out(), Easing.Back.Out(2)][config],
      duration: [100, 150, 350][config],
      /**
       * 设置更新方法
       * @param {Tween} tween 
       */
      onUpdate: tween => {
        this.edges.rotateOnWorldAxis(this.flipAxis, tween.delta * rotation);
        this.game.cube.object.rotation.copy(this.edges.rotation);
      },
      onComplete: () => {
        this.edges.rotation.setFromVector3(this.snapRotation(this.edges.rotation.toVector3()));
        this.game.cube.object.rotation.copy(this.edges.rotation);
        callback();
      },
    });
  }
  /**
   * 选择图层
   * @param {Array} layer 图层
   */
  selectLayer(layer) {
    this.group.rotation.set(0, 0, 0);
    this.movePieces(layer, this.game.cube.object, this.group);
    this.flipLayer = layer;
  }
  /**
   * 取消层
   * @param {Array} layer 图层
   */
  deselectLayer(layer) {
    this.movePieces(layer, this.group, this.game.cube.object);
    this.flipLayer = null;
  }
  /**
   * 移动部分
   * @param {Array} layer 图层
   * @param {THREE.Object3D} from 起始位置
   * @param {THREE.Object3D} to 终点位置
   */
  movePieces(layer, from, to) {
    from.updateMatrixWorld();
    to.updateMatrixWorld();
    layer.forEach(index => {
      let piece = this.game.cube.pieces[index];
      piece.applyMatrix(from.matrixWorld);
      from.remove(piece);
      piece.applyMatrix(new THREE.Matrix4().getInverse(to.matrixWorld));
      to.add(piece);
    });
  }
  /**
   * 获取图层
   * @param {THREE.Vector3} position 位置
   */
  getLayer(position) {
    let layer = [];
    let axis = this.getMainAxis(!position ? this.flipAxis : position);
    !position && (position = this.getPiecePosition(this.dragIntersect.object));
    this.game.cube.pieces.forEach(piece => {
      if (this.getPiecePosition(piece)[axis] == position[axis])
        layer.push(piece.name);
    });
    return layer;
  }
  /**
   * 获取部件位置
   * @param {{}} piece 部件
   */
  getPiecePosition(piece) {
    let position = new THREE.Vector3()
      .setFromMatrixPosition(piece.matrixWorld)
      .multiplyScalar(3);
    return this.game.cube.object.worldToLocal(position.sub(this.game.cube.animator.position)).round();
  }
  /** 争夺方块 */
  scrambleCube() {
    if (this.scramble == null) {
      this.scramble = this.game.scrambler;
      this.scramble.callback = typeof callback !== "function" ? () => { } : callback;
    }
    let converted = this.scramble.converted;
    let move = converted[0];
    this.flipAxis = new THREE.Vector3();
    this.flipAxis[move.axis] = 1;
    this.selectLayer(this.getLayer(move.position));
    this.rotateLayer(move.angle, true, () => {
      converted.shift();
      converted.length > 0
        ? this.scrambleCube()
        : this.scramble = null;
    });
  }
  /**
   * 获取相交
   * @param {Object} position 位置
   * @param {THREE.Mesh} object 对象
   * @param {Boolean} multiple 多个
   */
  getIntersect(position, object, multiple) {
    this.raycaster.setFromCamera(this.draggable.convertPosition(position.clone()), this.game.world.camera);
    let intersect = multiple
      ? this.raycaster.intersectObjects(object)
      : this.raycaster.intersectObject(object);
    return intersect.length > 0 ? intersect[0] : false;
  }
  /**
   * 获取主轴
   * @param {Number} vector 向量
   */
  getMainAxis(vector) {
    return Object.keys(vector).reduce((a, b) => Math.abs(vector[a]) > Math.abs(vector[b]) ? a : b);
  }
  /**
   * 分离
   * @param {THREE.Mesh} child 子级
   * @param {THREE.Mesh} parent 父级
   */
  detach(child, parent) {
    child.applyMatrix(parent.matrixWorld);
    parent.remove(child);
    this.game.world.scene.add(child);
  }
  /**
   * 附加
   * @param {THREE.Mesh} child 子级
   * @param {THREE.Mesh} parent 父级
   */
  attach(child, parent) {
    child.applyMatrix(new THREE.Matrix4().getInverse(parent.matrixWorld));
    this.game.world.scene.remove(child);
    parent.add(child);
  }
  /**
   * 添加动力点
   * @param {Number} delta 差值
   */
  addMomentumPoint(delta) {
    let time = Date.now();
    this.momentum = this.momentum.filter(moment => time - moment.time < 500);
    if (delta)
      this.momentum.push({ delta, time });
  }
  getMomentum() {
    let points = this.momentum.length;
    let momentum = new THREE.Vector2();
    this.addMomentumPoint(false);
    this.momentum.forEach((point, index) => momentum.add(point.delta.multiplyScalar(index / points)));
    return momentum;
  }
  /**
   * 圆形的角
   * @param {Number} angle 角度
   */
  roundAngle(angle) {
    let round = Math.PI / 2;
    return Math.sign(angle) * Math.round(Math.abs(angle) / round) * round;
  }
  /**
   * 快速旋转
   * @param {Number} angle 角度
   */
  snapRotation(angle) {
    return angle.set(this.roundAngle(angle.x), this.roundAngle(angle.y), this.roundAngle(angle.z));
  }
  checkIsSolved() {
    let solved = true;
    let sides = { "x-": [], "x+": [], "y-": [], "y+": [], "z-": [], "z+": [] };
    this.game.cube.edges.forEach(edge => {
      let position = edge.parent
        .localToWorld(edge.position.clone())
        .sub(this.game.cube.object.position);
      let mainAxis = this.getMainAxis(position);
      let mainSign = position.multiplyScalar(2).round()[mainAxis] < 1 ? "-" : "+";
      sides[mainAxis + mainSign].push(edge.name);
    });
    Object.keys(sides).forEach(side => sides[side].every(value => value === sides[side][0]) || (solved = false));
    if (solved)
      this.onSolved();
  }
}
