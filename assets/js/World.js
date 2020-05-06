import Animation from "./Animation.js";
import Game from "./Game.js";

export default class extends Animation {
  /**
   * 主体类
   * @param {Game} game 
   */
  constructor(game) {
    super(!0);
    this.game = game;
    this.container = this.game.dom.game;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: !0, alpha: !0 });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(2, 1, .1, 10000);
    this.stage = { width: 2, height: 3 };
    this.fov = 10;
    this.createLights();
    this.onResize = [];
    this.resize();
    window.addEventListener('resize', () => this.resize(), !1);
  }
  // 更新
  update() {
    this.renderer.render(this.scene, this.camera);
  }
  // 调整
  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.fov = this.fov;
    this.camera.aspect = this.width / this.height;
    let aspect = this.stage.width / this.stage.height;
    let distance = (aspect < this.camera.aspect
      ? this.stage.height
      : this.stage.width / this.camera.aspect) / 2 / Math.tan(this.fov * THREE.Math.DEG2RAD / 2);
    distance *= .5;
    this.camera.position.set(distance, distance, distance);
    this.camera.lookAt(this.scene.position);
    this.camera.updateProjectionMatrix();
    let docFontSize = (aspect < this.camera.aspect
      ? this.height * aspect
      : this.width) / 100;
    document.documentElement.style.fontSize = docFontSize + 'px';
    if (this.onResize)
      this.onResize.forEach(cb => cb());
  }
  // 创建光照
  createLights() {
    let color = 0xffffff;
    this.lights = {
      holder: new THREE.Object3D,
      ambient: new THREE.AmbientLight(color, .69),
      front: new THREE.DirectionalLight(color, .36),
      back: new THREE.DirectionalLight(color, .19),
    };
    this.lights.front.position.set(1.5, 5, 3);
    this.lights.back.position.set(-1.5, -5, -3);
    this.lights.holder.add(this.lights.ambient);
    this.lights.holder.add(this.lights.front);
    this.lights.holder.add(this.lights.back);
    this.scene.add(this.lights.holder);
  }
  // 启用阴影
  enableShadows() {
    this.renderer.shadowMap.enabled = !0;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.lights.front.castShadow = !0;
    this.lights.front.shadow.mapSize.width = 512;
    this.lights.front.shadow.mapSize.height = 512;
    let size = 1.5;
    this.lights.front.shadow.camera.left = -size;
    this.lights.front.shadow.camera.right = size;
    this.lights.front.shadow.camera.top = size;
    this.lights.front.shadow.camera.bottom = -size;
    this.lights.front.shadow.camera.near = 1;
    this.lights.front.shadow.camera.far = 9;
    this.game.cube.holder.traverse(node => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = !0;
        node.receiveShadow = !0;
      }
    });
  }
}
