// Three.js - https://github.com/mrdoob/three.js/
// RoundedBoxGeometry - https://github.com/pailhead/three-rounded-box
let animationEngine = (() => {
  let uniqueID = 0;
  return new class {
    constructor() {
      this.ids = [];
      this.animations = {};
      this.update = this.update.bind(this);
      this.raf = 0;
      this.time = 0;
    }
    update() {
      let now = performance.now();
      let delta = now - this.time;
      this.time = now;
      let i = this.ids.length;
      this.raf = i ? requestAnimationFrame(this.update) : 0;
      while (i--)
        this.animations[this.ids[i]] && this.animations[this.ids[i]].update(delta);
    }
    add(animation) {
      animation.id = uniqueID++;
      this.ids.push(animation.id);
      this.animations[animation.id] = animation;
      if (this.raf !== 0) return;
      this.time = performance.now();
      this.raf = requestAnimationFrame(this.update);
    }
    remove(animation) {
      let index = this.ids.indexOf(animation.id);
      if (index < 0) return;
      this.ids.splice(index, 1);
      delete this.animations[animation.id];
      animation = null;
    }
  }
})();
class Animation {
  constructor(start) {
    if (start === !0) this.start();
  }
  start() {
    animationEngine.add(this);
  }
  stop() {
    animationEngine.remove(this);
  }
  update() { }
}
class World extends Animation {
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
  update() {
    this.renderer.render(this.scene, this.camera);
  }
  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.fov = this.fov;
    this.camera.aspect = this.width / this.height;
    let aspect = this.stage.width / this.stage.height;
    let fovRad = this.fov * THREE.Math.DEG2RAD;
    let distance = (aspect < this.camera.aspect)
      ? (this.stage.height / 2) / Math.tan(fovRad / 2)
      : (this.stage.width / this.camera.aspect) / (2 * Math.tan(fovRad / 2));
    distance *= .5;
    this.camera.position.set(distance, distance, distance);
    this.camera.lookAt(this.scene.position);
    this.camera.updateProjectionMatrix();
    let docFontSize = (aspect < this.camera.aspect)
      ? (this.height / 100) * aspect
      : this.width / 100;
    document.documentElement.style.fontSize = docFontSize + 'px';
    if (this.onResize) this.onResize.forEach(cb => cb());
  }
  createLights() {
    this.lights = {
      holder: new THREE.Object3D,
      ambient: new THREE.AmbientLight(0xffffff, .69),
      front: new THREE.DirectionalLight(0xffffff, .36),
      back: new THREE.DirectionalLight(0xffffff, .19),
    };
    this.lights.front.position.set(1.5, 5, 3);
    this.lights.back.position.set(-1.5, -5, -3);
    this.lights.holder.add(this.lights.ambient);
    this.lights.holder.add(this.lights.front);
    this.lights.holder.add(this.lights.back);
    this.scene.add(this.lights.holder);
  }
  enableShadows() {
    this.renderer.shadowMap.enabled = !0;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.lights.front.castShadow = !0;
    this.lights.front.shadow.mapSize.width = 512;
    this.lights.front.shadow.mapSize.height = 512;
    let d = 1.5;
    this.lights.front.shadow.camera.left = -d;
    this.lights.front.shadow.camera.right = d;
    this.lights.front.shadow.camera.top = d;
    this.lights.front.shadow.camera.bottom = -d;
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
function RoundedBoxGeometry(size, radius, radiusSegments) {
  THREE.BufferGeometry.call(this);
  this.type = 'RoundedBoxGeometry';
  radiusSegments = !isNaN(radiusSegments) ? Math.max(1, Math.floor(radiusSegments)) : 1;
  let width, height, depth;
  width = height = depth = size;
  radius = size * radius;
  radius = Math.min(radius, Math.min(width, Math.min(height, Math.min(depth))) / 2);
  let edgeHalfWidth = width / 2 - radius;
  let edgeHalfHeight = height / 2 - radius;
  let edgeHalfDepth = depth / 2 - radius;
  this.parameters = {
    width: width,
    height: height,
    depth: depth,
    radius: radius,
    radiusSegments: radiusSegments
  };
  let rs1 = radiusSegments + 1;
  let totalVertexCount = (rs1 * radiusSegments + 1) << 3;
  let positions = new THREE.BufferAttribute(new Float32Array(totalVertexCount * 3), 3);
  let normals = new THREE.BufferAttribute(new Float32Array(totalVertexCount * 3), 3);
  let cornerVerts = [],
    cornerNormals = [],
    vertex = new THREE.Vector3(),
    vertexPool = [],
    normalPool = [],
    indices = [];
  let lastVertex = rs1 * radiusSegments,
    cornerVertNumber = rs1 * radiusSegments + 1;
  doVertices();
  doFaces();
  doCorners();
  doHeightEdges();
  doWidthEdges();
  doDepthEdges();
  function doVertices() {
    let cornerLayout = [
      new THREE.Vector3(1, 1, 1),
      new THREE.Vector3(1, 1, - 1),
      new THREE.Vector3(- 1, 1, - 1),
      new THREE.Vector3(- 1, 1, 1),
      new THREE.Vector3(1, - 1, 1),
      new THREE.Vector3(1, - 1, - 1),
      new THREE.Vector3(- 1, - 1, - 1),
      new THREE.Vector3(- 1, - 1, 1)
    ];
    for (let j = 0; j < 8; j++) {
      cornerVerts.push([]);
      cornerNormals.push([]);
    }
    let PIhalf = Math.PI / 2;
    let cornerOffset = new THREE.Vector3(edgeHalfWidth, edgeHalfHeight, edgeHalfDepth);
    for (let y = 0; y <= radiusSegments; y++) {
      let v = y / radiusSegments;
      let va = v * PIhalf;
      let cosVa = Math.cos(va);
      let sinVa = Math.sin(va);
      if (y == radiusSegments) {
        vertex.set(0, 1, 0);
        let vert = vertex.clone().multiplyScalar(radius).add(cornerOffset);
        cornerVerts[0].push(vert);
        vertexPool.push(vert);
        let norm = vertex.clone();
        cornerNormals[0].push(norm);
        normalPool.push(norm);
        continue;
      }
      for (let x = 0; x <= radiusSegments; x++) {
        let u = x / radiusSegments;
        let ha = u * PIhalf;
        vertex.x = cosVa * Math.cos(ha);
        vertex.y = sinVa;
        vertex.z = cosVa * Math.sin(ha);
        let vert = vertex.clone().multiplyScalar(radius).add(cornerOffset);
        cornerVerts[0].push(vert);
        vertexPool.push(vert);
        let norm = vertex.clone().normalize();
        cornerNormals[0].push(norm);
        normalPool.push(norm);
      }
    }
    for (let i = 1; i < 8; i++) {
      for (let j = 0; j < cornerVerts[0].length; j++) {
        let vert = cornerVerts[0][j].clone().multiply(cornerLayout[i]);
        cornerVerts[i].push(vert);
        vertexPool.push(vert);
        let norm = cornerNormals[0][j].clone().multiply(cornerLayout[i]);
        cornerNormals[i].push(norm);
        normalPool.push(norm);
      }
    }
  }
  function doCorners() {
    let flips = [!0, !1, !0, !1, !1, !0, !1, !0];
    let lastRowOffset = rs1 * (radiusSegments - 1);
    for (let i = 0; i < 8; i++) {
      let cornerOffset = cornerVertNumber * i;
      for (let v = 0; v < radiusSegments - 1; v++) {
        let r1 = v * rs1;
        let r2 = (v + 1) * rs1;
        for (let u = 0; u < radiusSegments; u++) {
          let u1 = u + 1;
          let a = cornerOffset + r1 + u;
          let b = cornerOffset + r1 + u1;
          let c = cornerOffset + r2 + u;
          let d = cornerOffset + r2 + u1;
          indices.push(a);
          indices.push(!flips[i] ? b : c);
          indices.push(!flips[i] ? c : b);
          indices.push(b);
          indices.push(!flips[i] ? d : c);
          indices.push(!flips[i] ? c : d);
        }
      }
      for (let u = 0; u < radiusSegments; u++) {
        let a = cornerOffset + lastRowOffset + u;
        let b = cornerOffset + lastRowOffset + u + 1;
        let c = cornerOffset + lastVertex;
        indices.push(a);
        indices.push(!flips[i] ? b : c);
        indices.push(!flips[i] ? c : b);
      }
    }
  }
  function doFaces() {
    let a = lastVertex;
    let b = lastVertex + cornerVertNumber;
    let c = lastVertex + cornerVertNumber * 2;
    let d = lastVertex + cornerVertNumber * 3;
    indices.push(a);
    indices.push(b);
    indices.push(c);
    indices.push(a);
    indices.push(c);
    indices.push(d);
    a = lastVertex + cornerVertNumber * 4;
    b = lastVertex + cornerVertNumber * 5;
    c = lastVertex + cornerVertNumber * 6;
    d = lastVertex + cornerVertNumber * 7;
    indices.push(a);
    indices.push(c);
    indices.push(b);
    indices.push(a);
    indices.push(d);
    indices.push(c);
    a = 0;
    b = cornerVertNumber;
    c = cornerVertNumber * 4;
    d = cornerVertNumber * 5;
    indices.push(a);
    indices.push(c);
    indices.push(b);
    indices.push(b);
    indices.push(c);
    indices.push(d);
    a = cornerVertNumber * 2;
    b = cornerVertNumber * 3;
    c = cornerVertNumber * 6;
    d = cornerVertNumber * 7;
    indices.push(a);
    indices.push(c);
    indices.push(b);
    indices.push(b);
    indices.push(c);
    indices.push(d);
    a = radiusSegments;
    b = radiusSegments + cornerVertNumber * 3;
    c = radiusSegments + cornerVertNumber * 4;
    d = radiusSegments + cornerVertNumber * 7;
    indices.push(a);
    indices.push(b);
    indices.push(c);
    indices.push(b);
    indices.push(d);
    indices.push(c);
    a = radiusSegments + cornerVertNumber;
    b = radiusSegments + cornerVertNumber * 2;
    c = radiusSegments + cornerVertNumber * 5;
    d = radiusSegments + cornerVertNumber * 6;
    indices.push(a);
    indices.push(c);
    indices.push(b);
    indices.push(b);
    indices.push(c);
    indices.push(d);
  }
  function doHeightEdges() {
    for (let i = 0; i < 4; i++) {
      let cOffset = i * cornerVertNumber;
      let cRowOffset = 4 * cornerVertNumber + cOffset;
      let needsFlip = i & 1 === 1;
      for (let u = 0; u < radiusSegments; u++) {
        let u1 = u + 1;
        let a = cOffset + u;
        let b = cOffset + u1;
        let c = cRowOffset + u;
        let d = cRowOffset + u1;
        indices.push(a);
        indices.push(!needsFlip ? b : c);
        indices.push(!needsFlip ? c : b);
        indices.push(b);
        indices.push(!needsFlip ? d : c);
        indices.push(!needsFlip ? c : d);
      }
    }
  }
  function doDepthEdges() {
    let cStarts = [0, 2, 4, 6];
    let cEnds = [1, 3, 5, 7];
    for (let i = 0; i < 4; i++) {
      let cStart = cornerVertNumber * cStarts[i];
      let cEnd = cornerVertNumber * cEnds[i];
      let needsFlip = 1 >= i;
      for (let u = 0; u < radiusSegments; u++) {
        let urs1 = u * rs1;
        let u1rs1 = (u + 1) * rs1;
        let a = cStart + urs1;
        let b = cStart + u1rs1;
        let c = cEnd + urs1;
        let d = cEnd + u1rs1;
        indices.push(a);
        indices.push(!needsFlip ? b : c);
        indices.push(!needsFlip ? c : b);
        indices.push(b);
        indices.push(!needsFlip ? d : c);
        indices.push(!needsFlip ? c : d);
      }
    }
  }
  function doWidthEdges() {
    let end = radiusSegments - 1;
    let needsFlip = [0, 1, 1, 0];
    for (let i = 0; i < 4; i++) {
      let cStart = [0, 1, 4, 5][i] * cornerVertNumber;
      let cEnd = [3, 2, 7, 6][i] * cornerVertNumber;
      for (let u = 0; u <= end; u++) {
        let a = cStart + radiusSegments + u * rs1;
        let b = cStart + (u != end ? radiusSegments + (u + 1) * rs1 : cornerVertNumber - 1);
        let c = cEnd + radiusSegments + u * rs1;
        let d = cEnd + (u != end ? radiusSegments + (u + 1) * rs1 : cornerVertNumber - 1);
        indices.push(a);
        indices.push(!needsFlip[i] ? b : c);
        indices.push(!needsFlip[i] ? c : b);
        indices.push(b);
        indices.push(!needsFlip[i] ? d : c);
        indices.push(!needsFlip[i] ? c : d);
      }
    }
  }
  let index = 0;
  for (let i = 0; i < vertexPool.length; i++) {
    positions.setXYZ(
      index,
      vertexPool[i].x,
      vertexPool[i].y,
      vertexPool[i].z
    );
    normals.setXYZ(
      index,
      normalPool[i].x,
      normalPool[i].y,
      normalPool[i].z
    );
    index++;
  }
  this.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
  this.addAttribute('position', positions);
  this.addAttribute('normal', normals);
}
RoundedBoxGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
RoundedBoxGeometry.constructor = RoundedBoxGeometry;
function RoundedPlaneGeometry(size, radius, depth) {
  let x, y, width, height;
  x = y = - size / 2;
  width = height = size;
  radius = size * radius;
  let shape = new THREE.Shape();
  shape.moveTo(x, y + radius);
  shape.lineTo(x, y + height - radius);
  shape.quadraticCurveTo(x, y + height, x + radius, y + height);
  shape.lineTo(x + width - radius, y + height);
  shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  shape.lineTo(x + width, y + radius);
  shape.quadraticCurveTo(x + width, y, x + width - radius, y);
  shape.lineTo(x + radius, y);
  shape.quadraticCurveTo(x, y, x, y + radius);
  let geometry = new THREE.ExtrudeBufferGeometry(
    shape,
    { depth: depth, bevelEnabled: !1, curveSegments: 3 }
  );
  return geometry;
}
class Cube {
  constructor(game) {
    this.game = game;
    this.geometry = {
      pieceSize: 1 / 3,
      pieceCornerRadius: .12,
      edgeCornerRoundness: .15,
      edgeScale: .82,
      edgeDepth: .01,
    };
    this.holder = new THREE.Object3D();
    this.object = new THREE.Object3D();
    this.animator = new THREE.Object3D();
    this.holder.add(this.animator);
    this.animator.add(this.object);
    this.cubes = [];
    this.generatePositions();
    this.generateModel();
    this.pieces.forEach(piece => {
      this.cubes.push(piece.userData.cube);
      this.object.add(piece);
    });
    this.holder.traverse(node => node.frustumCulled && (node.frustumCulled = !1));
    this.game.world.scene.add(this.holder);
  }
  reset() {
    this.game.controls.edges.rotation.set(0, 0, 0);
    this.holder.rotation.set(0, 0, 0);
    this.object.rotation.set(0, 0, 0);
    this.animator.rotation.set(0, 0, 0);
    this.pieces.forEach(piece => {
      piece.position.copy(piece.userData.start.position);
      piece.rotation.copy(piece.userData.start.rotation);
    });
  }
  generatePositions() {
    let x, y, z;
    this.positions = [];
    for (x = 0; x < 3; x++) {
      for (y = 0; y < 3; y++) {
        for (z = 0; z < 3; z++) {
          let position = new THREE.Vector3(x - 1, y - 1, z - 1);
          let edges = [];
          if (x == 0) edges.push(0);
          if (x == 2) edges.push(1);
          if (y == 0) edges.push(2);
          if (y == 2) edges.push(3);
          if (z == 0) edges.push(4);
          if (z == 2) edges.push(5);
          position.edges = edges;
          this.positions.push(position);
        }
      }
    }
  }
  generateModel() {
    this.pieces = [];
    this.edges = [];
    let pieceSize = 1 / 3;
    let mainMaterial = new THREE.MeshLambertMaterial();
    let pieceMesh = new THREE.Mesh(
      new RoundedBoxGeometry(pieceSize, this.geometry.pieceCornerRadius, 3),
      mainMaterial.clone()
    );
    let edgeGeometry = RoundedPlaneGeometry(
      pieceSize,
      this.geometry.edgeCornerRoundness,
      this.geometry.edgeDepth);
    this.positions.forEach((position, index) => {
      let piece = new THREE.Object3D();
      let pieceCube = pieceMesh.clone();
      let pieceEdges = [];
      piece.position.copy(position.clone().divideScalar(3));
      piece.add(pieceCube);
      piece.name = index;
      piece.edgesName = '';
      position.edges.forEach(position => {
        let edge = new THREE.Mesh(edgeGeometry, mainMaterial.clone());
        let name = ['L', 'R', 'D', 'U', 'B', 'F'][position];
        let distance = pieceSize / 2;
        edge.position.set(
          distance * [- 1, 1, 0, 0, 0, 0][position],
          distance * [0, 0, - 1, 1, 0, 0][position],
          distance * [0, 0, 0, 0, - 1, 1][position]
        );
        edge.rotation.set(
          Math.PI / 2 * [0, 0, 1, - 1, 0, 0][position],
          Math.PI / 2 * [- 1, 1, 0, 0, 2, 0][position],
          0
        );
        edge.scale.set(
          this.geometry.edgeScale,
          this.geometry.edgeScale,
          this.geometry.edgeScale
        );
        edge.name = name;
        piece.add(edge);
        pieceEdges.push(name);
        this.edges.push(edge);
      });
      piece.userData.edges = pieceEdges;
      piece.userData.cube = pieceCube;
      piece.userData.start = {
        position: piece.position.clone(),
        rotation: piece.rotation.clone(),
      };
      this.pieces.push(piece);
    });
  }
}
let Easing = {
  Power: {
    In(power) {
      power = Math.round(power || 1);
      return t => Math.pow(t, power);
    },
    Out(power) {
      power = Math.round(power || 1);
      return t => 1 - Math.abs(Math.pow(t - 1, power));
    },
    InOut(power) {
      power = Math.round(power || 1);
      return t => t < .5
        ? Math.pow(t * 2, power) / 2
        : (1 - Math.abs(Math.pow((t * 2 - 1) - 1, power))) / 2 + .5;
    },
  },
  Sine: {
    In() { t => 1 + Math.sin(Math.PI / 2 * t - Math.PI / 2) },
    Out() { t => Math.sin(Math.PI / 2 * t) },
    InOut() { t => (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2 },
  },
  Back: {
    Out(s = 1.70158) {
      return t => (t -= 1) * t * ((s + 1) * t + s) + 1;
    },
    In(s = 1.70158) {
      return t => t * t * ((s + 1) * t - s);
    }
  },
  Elastic: {
    Out: (amplitude, period) => {
      let PI2 = Math.PI * 2;
      let p1 = (amplitude >= 1) ? amplitude : 1;
      let p2 = (period || .3) / (amplitude < 1 ? amplitude : 1);
      let p3 = p2 / PI2 * (Math.asin(1 / p1) || 0);
      p2 = PI2 / p2;
      return t => { return p1 * Math.pow(2, -10 * t) * Math.sin((t - p3) * p2) + 1 }
    },
  },
};
class Tween extends Animation {
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
    if (this.delay) setTimeout(() => super.start(), this.delay);
    else super.start();
    this.onUpdate(this);
  }
  update(delta) {
    let old = this.value * 1;
    let direction = (this.yoyo === !0) ? - 1 : 1;
    this.progress += (delta / this.duration) * direction;
    this.value = this.easing(this.progress);
    this.delta = this.value - old;
    if (this.values !== null) this.updateFromTo();
    if (this.yoyo !== null) this.updateYoyo();
    else if (this.progress <= 1) this.onUpdate(this);
    else {
      this.progress = 1;
      this.value = 1;
      this.onUpdate(this);
      this.onComplete(this);
      super.stop();
    }
  }
  updateYoyo() {
    if (this.progress > 1 || this.progress < 0) {
      this.value = this.progress = (this.progress > 1) ? 1 : 0;
      this.yoyo = !this.yoyo;
    }
    this.onUpdate(this);
  }
  updateFromTo() {
    this.values.forEach(key => this.target[key] = this.from[key] + (this.to[key] - this.from[key]) * this.value);
  }
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
window.addEventListener('touchmove', () => { });
document.addEventListener('touchmove', event => { event.preventDefault(); }, { passive: !1 });
class Draggable {
  constructor(element, options) {
    this.position = {
      current: new THREE.Vector2(),
      start: new THREE.Vector2(),
      delta: new THREE.Vector2(),
      old: new THREE.Vector2(),
      drag: new THREE.Vector2(),
    };
    this.options = Object.assign({
      calcDelta: !1,
    }, options || {});
    this.element = element;
    this.touch = null;
    this.drag = {
      start: (event) => {
        if (event.type == 'mousedown' && event.which != 1) return;
        if (event.type == 'touchstart' && event.touches.length > 1) return;
        this.getPositionCurrent(event);
        if (this.options.calcDelta) {
          this.position.start = this.position.current.clone();
          this.position.delta.set(0, 0);
          this.position.drag.set(0, 0);
        }
        this.touch = (event.type == 'touchstart');
        this.onDragStart(this.position);
        window.addEventListener((this.touch) ? 'touchmove' : 'mousemove', this.drag.move, !1);
        window.addEventListener((this.touch) ? 'touchend' : 'mouseup', this.drag.end, !1);
      },
      move: (event) => {
        if (this.options.calcDelta) {
          this.position.old = this.position.current.clone();
        }
        this.getPositionCurrent(event);
        if (this.options.calcDelta) {
          this.position.delta = this.position.current.clone().sub(this.position.old);
          this.position.drag = this.position.current.clone().sub(this.position.start);
        }
        this.onDragMove(this.position);
      },
      end: (event) => {
        this.getPositionCurrent(event);
        this.onDragEnd(this.position);
        window.removeEventListener((this.touch) ? 'touchmove' : 'mousemove', this.drag.move, !1);
        window.removeEventListener((this.touch) ? 'touchend' : 'mouseup', this.drag.end, !1);
      },
    };
    this.onDragStart = () => { };
    this.onDragMove = () => { };
    this.onDragEnd = () => { };
    this.enable();
    return this;
  }
  enable() {
    this.element.addEventListener('touchstart', this.drag.start, !1);
    this.element.addEventListener('mousedown', this.drag.start, !1);
    return this;
  }
  disable() {
    this.element.removeEventListener('touchstart', this.drag.start, !1);
    this.element.removeEventListener('mousedown', this.drag.start, !1);
    return this;
  }
  getPositionCurrent(event) {
    let dragEvent = event.touches
      ? (event.touches[0] || event.changedTouches[0])
      : event;
    this.position.current.set(dragEvent.pageX, dragEvent.pageY);
  }
  convertPosition(position) {
    position.x = (position.x / this.element.offsetWidth) * 2 - 1;
    position.y = - ((position.y / this.element.offsetHeight) * 2 - 1);
    return position;
  }
}
let STILL = 0;
let PREPARING = 1;
let ROTATING = 2;
let ANIMATING = 3;
class Controls {
  constructor(game) {
    this.game = game;
    this.flipConfig = 0;
    this.flipEasings = [Easing.Power.Out(3), Easing.Sine.Out(), Easing.Back.Out(2)];
    this.flipSpeeds = [125, 200, 350];
    this.raycaster = new THREE.Raycaster();
    let helperMaterial = new THREE.MeshBasicMaterial({ depthWrite: !1, transparent: !0, opacity: 0, color: 0x0033ff });
    this.group = new THREE.Object3D();
    this.game.cube.object.add(this.group);
    this.helper = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(20, 20),
      helperMaterial.clone(),
    );
    this.helper.rotation.set(0, Math.PI / 4, 0);
    this.game.world.scene.add(this.helper);
    this.edges = new THREE.Mesh(
      new THREE.BoxBufferGeometry(0.95, .95, .95),
      helperMaterial.clone(),
    );
    this.game.world.scene.add(this.edges);
    this.onSolved = () => { };
    this.onMove = () => { };
    this.momentum = [];
    this.scramble = null;
    this.state = STILL;
    this.initDraggable();
  }
  enable() {
    this.draggable.enable();
  }
  disable() {
    this.draggable.disable();
  }
  initDraggable() {
    this.draggable = new Draggable(this.game.dom.game);
    this.draggable.onDragStart = position => {
      if (this.scramble !== null) return;
      if (this.state === PREPARING || this.state === ROTATING) return;
      this.gettingDrag = this.state === ANIMATING;
      let edgeIntersect = this.getIntersect(position.current, this.edges, !1);
      if (edgeIntersect !== !1) {
        this.dragNormal = edgeIntersect.face.normal.round();
        this.flipType = 'layer';
        this.attach(this.helper, this.edges);
        this.helper.rotation.set(0, 0, 0);
        this.helper.position.set(0, 0, 0);
        this.helper.lookAt(this.dragNormal);
        this.helper.translateZ(0.5);
        this.helper.updateMatrixWorld();
        this.detach(this.helper, this.edges);
      } else {
        this.dragNormal = new THREE.Vector3(0, 0, 1);
        this.flipType = 'cube';
        this.helper.position.set(0, 0, 0);
        this.helper.rotation.set(0, Math.PI / 4, 0);
        this.helper.updateMatrixWorld();
      }
      let planeIntersect = this.getIntersect(position.current, this.helper, !1).point;
      if (planeIntersect === !1) return;
      this.dragCurrent = this.helper.worldToLocal(planeIntersect);
      this.dragTotal = new THREE.Vector3();
      this.state = (this.state === STILL) ? PREPARING : this.state;
    };
    this.draggable.onDragMove = position => {
      if (this.scramble !== null) return;
      if (this.state === STILL || (this.state === ANIMATING && this.gettingDrag === !1)) return;
      let planeIntersect = this.getIntersect(position.current, this.helper, !1);
      if (planeIntersect === !1) return;
      let point = this.helper.worldToLocal(planeIntersect.point.clone());
      this.dragDelta = point.clone().sub(this.dragCurrent).setZ(0);
      this.dragTotal.add(this.dragDelta);
      this.dragCurrent = point;
      this.addMomentumPoint(this.dragDelta);
      if (this.state === PREPARING && this.dragTotal.length() > .05) {
        this.dragDirection = this.getMainAxis(this.dragTotal);
        if (this.flipType === 'layer') {
          let direction = new THREE.Vector3();
          direction[this.dragDirection] = 1;
          let worldDirection = this.helper.localToWorld(direction).sub(this.helper.position);
          let objectDirection = this.edges.worldToLocal(worldDirection).round();
          this.flipAxis = objectDirection.cross(this.dragNormal).negate();
          this.dragIntersect = this.getIntersect(position.current, this.game.cube.cubes, !0);
          this.selectLayer(this.getLayer(!1));
        } else {
          let axis = (this.dragDirection != 'x')
            ? ((this.dragDirection == 'y' && position.current.x > this.game.world.width / 2) ? 'z' : 'x')
            : 'y';
          this.flipAxis = new THREE.Vector3();
          this.flipAxis[axis] = 1 * (axis == 'x' ? - 1 : 1);
        }
        this.flipAngle = 0;
        this.state = ROTATING;
      } else if (this.state === ROTATING) {
        let rotation = this.dragDelta[this.dragDirection];
        if (this.flipType === 'layer') {
          this.group.rotateOnAxis(this.flipAxis, rotation);
          this.flipAngle += rotation;
        } else {
          this.edges.rotateOnWorldAxis(this.flipAxis, rotation);
          this.game.cube.object.rotation.copy(this.edges.rotation);
          this.flipAngle += rotation;
        }
      }
    };
    this.draggable.onDragEnd = () => {
      if (this.scramble !== null) return;
      if (this.state !== ROTATING) {
        this.gettingDrag = !1;
        this.state = STILL;
        return;
      }
      this.state = ANIMATING;
      let angle = this.roundAngle(this.flipAngle + (
        Math.abs(this.getMomentum()[this.dragDirection]) > .05 && Math.abs(this.flipAngle) < Math.PI / 2
          ? Math.sign(this.flipAngle) * (Math.PI / 4)
          : 0
      ));
      let delta = angle - this.flipAngle;
      if (this.flipType === 'layer') {
        this.rotateLayer(delta, !1, () => {
          this.state = this.gettingDrag ? PREPARING : STILL;
          this.gettingDrag = !1;
          this.checkIsSolved();
        });
      } else {
        this.rotateCube(delta, () => {
          this.state = this.gettingDrag ? PREPARING : STILL;
          this.gettingDrag = !1;
        });
      }
    };
  }
  rotateLayer(rotation, scramble, callback) {
    let config = scramble ? 0 : this.flipConfig;
    let easing = this.flipEasings[config];
    let duration = this.flipSpeeds[config];
    let bounce = (config == 2) ? this.bounceCube() : (() => { });
    this.rotationTween = new Tween({
      easing: easing,
      duration: duration,
      onUpdate: tween => {
        let deltaAngle = tween.delta * rotation;
        this.group.rotateOnAxis(this.flipAxis, deltaAngle);
        bounce(tween.value, deltaAngle, rotation);
      },
      onComplete: () => {
        if (!scramble) this.onMove();
        let layer = this.flipLayer.slice(0);
        this.game.cube.object.rotation.setFromVector3(this.snapRotation(this.game.cube.object.rotation.toVector3()));
        this.group.rotation.setFromVector3(this.snapRotation(this.group.rotation.toVector3()));
        this.deselectLayer(this.flipLayer);
        callback(layer);
      },
    });
  }
  bounceCube() {
    let fixDelta = !0;
    return (progress, delta, rotation) => {
      if (progress >= 1) {
        if (fixDelta) {
          delta = (progress - 1) * rotation;
          fixDelta = !1;
        }
        this.game.cube.object.rotateOnAxis(this.flipAxis, delta);
      }
    }
  }
  rotateCube(rotation, callback) {
    let config = this.flipConfig;
    let easing = [Easing.Power.Out(4), Easing.Sine.Out(), Easing.Back.Out(2)][config];
    let duration = [100, 150, 350][config];
    this.rotationTween = new Tween({
      easing: easing,
      duration: duration,
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
  selectLayer(layer) {
    this.group.rotation.set(0, 0, 0);
    this.movePieces(layer, this.game.cube.object, this.group);
    this.flipLayer = layer;
  }
  deselectLayer(layer) {
    this.movePieces(layer, this.group, this.game.cube.object);
    this.flipLayer = null;
  }
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
  getLayer(position) {
    let layer = [];
    let axis;
    if (position === !1) {
      axis = this.getMainAxis(this.flipAxis);
      position = this.getPiecePosition(this.dragIntersect.object);
    } else {
      axis = this.getMainAxis(position);
    }
    this.game.cube.pieces.forEach(piece => {
      let piecePosition = this.getPiecePosition(piece);
      if (piecePosition[axis] == position[axis]) layer.push(piece.name);
    });
    return layer;
  }
  getPiecePosition(piece) {
    let position = new THREE.Vector3()
      .setFromMatrixPosition(piece.matrixWorld)
      .multiplyScalar(3);
    return this.game.cube.object.worldToLocal(position.sub(this.game.cube.animator.position)).round();
  }
  scrambleCube() {
    if (this.scramble == null) {
      this.scramble = this.game.scrambler;
      this.scramble.callback = (typeof callback !== 'function') ? () => { } : callback;
    }
    let converted = this.scramble.converted;
    let move = converted[0];
    let layer = this.getLayer(move.position);
    this.flipAxis = new THREE.Vector3();
    this.flipAxis[move.axis] = 1;
    this.selectLayer(layer);
    this.rotateLayer(move.angle, !0, () => {
      converted.shift();
      if (converted.length > 0) {
        this.scrambleCube();
      } else {
        this.scramble = null;
      }
    });
  }
  getIntersect(position, object, multiple) {
    this.raycaster.setFromCamera(
      this.draggable.convertPosition(position.clone()),
      this.game.world.camera
    );
    let intersect = (multiple)
      ? this.raycaster.intersectObjects(object)
      : this.raycaster.intersectObject(object);
    return (intersect.length > 0) ? intersect[0] : !1;
  }
  getMainAxis(vector) {
    return Object.keys(vector).reduce(
      (a, b) => Math.abs(vector[a]) > Math.abs(vector[b]) ? a : b
    );
  }
  detach(child, parent) {
    child.applyMatrix(parent.matrixWorld);
    parent.remove(child);
    this.game.world.scene.add(child);
  }
  attach(child, parent) {
    child.applyMatrix(new THREE.Matrix4().getInverse(parent.matrixWorld));
    this.game.world.scene.remove(child);
    parent.add(child);
  }
  addMomentumPoint(delta) {
    let time = Date.now();
    this.momentum = this.momentum.filter(moment => time - moment.time < 500);
    if (delta !== !1) this.momentum.push({ delta, time });
  }
  getMomentum() {
    let points = this.momentum.length;
    let momentum = new THREE.Vector2();
    this.addMomentumPoint(!1);
    this.momentum.forEach((point, index) => {
      momentum.add(point.delta.multiplyScalar(index / points));
    });
    return momentum;
  }
  roundAngle(angle) {
    let round = Math.PI / 2;
    return Math.sign(angle) * Math.round(Math.abs(angle) / round) * round;
  }
  snapRotation(angle) {
    return angle.set(
      this.roundAngle(angle.x),
      this.roundAngle(angle.y),
      this.roundAngle(angle.z)
    );
  }
  checkIsSolved() {
    let solved = !0;
    let sides = { 'x-': [], 'x+': [], 'y-': [], 'y+': [], 'z-': [], 'z+': [] };
    this.game.cube.edges.forEach(edge => {
      let position = edge.parent
        .localToWorld(edge.position.clone())
        .sub(this.game.cube.object.position);
      let mainAxis = this.getMainAxis(position);
      let mainSign = position.multiplyScalar(2).round()[mainAxis] < 1 ? '-' : '+';
      sides[mainAxis + mainSign].push(edge.name);
    });
    Object.keys(sides).forEach(side => {
      if (!sides[side].every(value => value === sides[side][0])) solved = !1;
    });
    if (solved) this.onSolved();
  }
}
class Scrambler {
  constructor(game) {
    this.game = game;
    this.scrambleLength = 20;
    this.moves = [];
    this.conveted = [];
    this.pring = '';
  }
  scramble(scramble) {
    let count = 0;
    this.moves = (typeof scramble !== 'undefined') ? scramble.split(' ') : [];
    if (this.moves.length < 1) {
      let faces = 'UDLRFB';
      let modifiers = ["", "'", "2"];
      let total = (typeof scramble === 'undefined') ? this.scrambleLength : scramble;
      while (count < total) {
        let move = faces[Math.floor(Math.random() * 6)] + modifiers[Math.floor(Math.random() * 3)];
        if (count > 0 && move.charAt(0) == this.moves[count - 1].charAt(0)) continue;
        if (count > 1 && move.charAt(0) == this.moves[count - 2].charAt(0)) continue;
        this.moves.push(move);
        count++;
      }
    }
    this.callback = () => { };
    this.convert();
    this.print = this.moves.join(' ');
    return this;
  }
  convert() {
    this.converted = [];
    this.moves.forEach(move => {
      let face = move.charAt(0);
      let modifier = move.charAt(1);
      let axis = { D: 'y', U: 'y', L: 'x', R: 'x', F: 'z', B: 'z' }[face];
      let row = { D: -1, U: 1, L: -1, R: 1, F: 1, B: -1 }[face];
      let position = new THREE.Vector3();
      position[{ D: 'y', U: 'y', L: 'x', R: 'x', F: 'z', B: 'z' }[face]] = row;
      let angle = (Math.PI / 2) * - row * ((modifier == "'") ? - 1 : 1);
      let convertedMove = { position, axis, angle, name: move };
      this.converted.push(convertedMove);
      if (modifier == "2") this.converted.push(convertedMove);
    });
  }
}
class Transition {
  constructor(game) {
    this.game = game;
    this.tweens = {};
    this.durations = {};
    this.data = {
      cubeY: -.2,
      cameraZoom: .85,
    };
    this.activeTransitions = 0;
  }
  init() {
    this.game.controls.disable();
    this.game.cube.object.position.y = this.data.cubeY;
    this.game.controls.edges.position.y = this.data.cubeY;
    this.game.cube.animator.position.y = 4;
    this.game.cube.animator.rotation.x = - Math.PI / 3;
    this.game.world.camera.zoom = this.data.cameraZoom;
    this.game.world.camera.updateProjectionMatrix();
    this.tweens.buttons = {};
    this.tweens.timer = [];
    this.tweens.title = [];
    this.tweens.best = [];
    this.tweens.complete = [];
    this.tweens.range = [];
    this.tweens.stats = [];
  }
  buttons(show, hide) {
    let buttonTween = (button, show) => {
      return new Tween({
        target: button.style,
        duration: 300,
        easing: show ? Easing.Power.Out(2) : Easing.Power.In(3),
        from: { opacity: show ? 0 : 1 },
        to: { opacity: show ? 1 : 0 },
        onUpdate: tween => {
          let translate = show ? 1 - tween.value : tween.value;
          button.style.transform = `translate3d(0, ${translate * 1.5}em, 0)`;
        },
        onComplete: () => button.style.pointerEvents = show ? 'all' : 'none'
      });
    };
    hide.forEach(button =>
      this.tweens.buttons[button] = buttonTween(this.game.dom.buttons[button], !1)
    );
    setTimeout(() => show.forEach(button => {
      this.tweens.buttons[button] = buttonTween(this.game.dom.buttons[button], !0);
    }), hide ? 500 : 0);
  }
  cube(show) {
    this.activeTransitions++;
    try { this.tweens.cube.stop(); } catch (e) { }
    let currentY = this.game.cube.animator.position.y;
    let currentRotation = this.game.cube.animator.rotation.x;
    this.tweens.cube = new Tween({
      duration: show ? 3000 : 1250,
      easing: show ? Easing.Elastic.Out(0.8, .6) : Easing.Back.In(1),
      onUpdate: tween => {
        this.game.cube.animator.position.y = show
          ? (1 - tween.value) * 4
          : currentY + tween.value * 4;
        this.game.cube.animator.rotation.x = show
          ? (1 - tween.value) * Math.PI / 3
          : currentRotation - tween.value * Math.PI / 3;
      }
    });
    this.durations.cube = show ? 1500 : 1500;
    setTimeout(() => this.activeTransitions--, this.durations.cube);
  }
  float() {
    try { this.tweens.float.stop(); } catch (e) { }
    this.tweens.float = new Tween({
      duration: 1500,
      easing: Easing.Sine.InOut(),
      yoyo: !0,
      onUpdate: tween => {
        this.game.cube.holder.position.y = (-.02 + tween.value * .04);
        this.game.cube.holder.rotation.x = .005 - tween.value * .01;
        this.game.cube.holder.rotation.z = -this.game.cube.holder.rotation.x;
        this.game.cube.holder.rotation.y = this.game.cube.holder.rotation.x;
      },
    });
  }
  zoom(play, time) {
    this.activeTransitions++;
    let duration = (time > 0) ? Math.max(time, 1500) : 1500;
    let rotations = (time > 0) ? Math.round(duration / 1500) : 1;
    let easing = Easing.Power.InOut((time > 0) ? 2 : 3);
    this.tweens.zoom = new Tween({
      target: this.game.world.camera,
      duration,
      easing,
      to: { zoom: play ? 1 : this.data.cameraZoom },
      onUpdate: () => { this.game.world.camera.updateProjectionMatrix(); },
    });
    this.tweens.rotate = new Tween({
      target: this.game.cube.animator.rotation,
      duration,
      easing,
      to: { y: - Math.PI * 2 * rotations },
      onComplete: () => { this.game.cube.animator.rotation.y = 0; },
    });
    this.durations.zoom = duration;
    setTimeout(() => this.activeTransitions--, this.durations.zoom);
  }
  elevate(complete) {
    this.activeTransitions++;
    this.durations.elevate = 1500;
    setTimeout(() => this.activeTransitions--, this.durations.elevate);
  }
  complete(show, best) {
    this.activeTransitions++;
    let text = best ? this.game.dom.texts.best : this.game.dom.texts.complete;
    if (text.querySelector('span i') === null)
      text.querySelectorAll('span').forEach(span => this.splitLetters(span));
    let letters = text.querySelectorAll('.icon, i');
    this.flipLetters(best ? 'best' : 'complete', letters, show);
    text.style.opacity = 1;
    let duration = this.durations[best ? 'best' : 'complete'];
    if (!show) setTimeout(() => this.game.dom.texts.timer.style.transform = '', duration);
    setTimeout(() => this.activeTransitions--, duration);
  }
  stats(show) {
    if (show) this.game.scores.calcStats();
    this.activeTransitions++;
    this.tweens.stats.forEach(tween => { tween.stop(); tween = null; });
    let tweenId = -1;
    let stats = this.game.dom.stats.querySelectorAll('.stats');
    let easing = show ? Easing.Power.Out(2) : Easing.Power.In(3);
    stats.forEach((stat, index) => {
      this.tweens.stats[tweenId++] = new Tween({
        delay: index * (show ? 80 : 60),
        duration: 400,
        easing,
        onUpdate: tween => {
          stat.style.transform = `translate3d(0, ${show ? (1 - tween.value) * 2 : tween.value}em, 0)`;
          stat.style.opacity = show ? tween.value : (1 - tween.value);
        }
      });
    });
    this.durations.stats = 0;
    setTimeout(() => this.activeTransitions--, this.durations.stats);
  }
  preferences(show) {
    this.activeTransitions++;
    this.tweens.range.forEach(tween => {
      tween.stop();
      tween = null;
    });
    let tweenId = -1;
    let listMax = 0;
    let ranges = this.game.dom.prefs.querySelectorAll('.range');
    let easing = show ? Easing.Power.Out(2) : Easing.Power.In(3);
    ranges.forEach((range, rangeIndex) => {
      let label = range.querySelector('.range__label');
      let track = range.querySelector('.range__track-line');
      let handle = range.querySelector('.range__handle');
      let list = range.querySelectorAll('.range__list div');
      let delay = rangeIndex * (show ? 120 : 100);
      let duration = 400;
      label.style.opacity = show ? 0 : 1;
      track.style.opacity = show ? 0 : 1;
      handle.style.opacity = show ? 0 : 1;
      handle.style.pointerEvents = show ? 'all' : 'none';
      this.tweens.range[tweenId++] = new Tween({
        delay,
        duration,
        easing,
        onUpdate: tween => {
          let translate = show ? (1 - tween.value) : tween.value;
          let opacity = show ? tween.value : (1 - tween.value);
          label.style.transform = `translate3d(0, ${translate}em, 0)`;
          label.style.opacity = opacity;
        }
      });
      this.tweens.range[tweenId++] = new Tween({
        delay: show ? delay + 100 : delay,
        duration,
        easing,
        onUpdate: tween => {
          let translate = show ? 1 - tween.value : tween.value;
          let opacity = show ? tween.value : 1 - tween.value;
          track.style.transform = `translate3d(0, ${translate}em, 0) scale3d(${opacity}, 1, 1)`;
          track.style.opacity = opacity;
        }
      });
      this.tweens.range[tweenId++] = new Tween({
        delay: show ? delay + 100 : delay,
        duration,
        easing,
        onUpdate: tween => {
          let translate = show ? (1 - tween.value) : tween.value;
          let opacity = 1 - translate;
          let scale = .5 + opacity * .5;
          handle.style.transform = `translate3d(0, ${translate}em, 0) scale3d(${scale}, ${scale}, ${scale})`;
          handle.style.opacity = opacity;
        }
      });
      list.forEach((listItem, labelIndex) => {
        listItem.style.opacity = show ? 0 : 1;
        this.tweens.range[tweenId++] = new Tween({
          delay: show ? delay + 200 + labelIndex * 50 : delay,
          duration,
          easing,
          onUpdate: tween => {
            let translate = show ? (1 - tween.value) : tween.value;
            let opacity = show ? tween.value : (1 - tween.value);
            listItem.style.transform = `translate3d(0, ${translate}em, 0)`;
            listItem.style.opacity = opacity;
          }
        });
      });
      listMax = list.length > listMax ? list.length - 1 : listMax;
      range.style.opacity = 1;
    });
    this.durations.preferences = (ranges.length - 1) * 100 + (show ? 200 + listMax * 50 : 0) + 400;
    setTimeout(() => this.activeTransitions--, this.durations.preferences);
  }
  title(show) {
    this.activeTransitions++;
    let title = this.game.dom.texts.title;
    if (title.querySelector('span i') === null)
      title.querySelectorAll('span').forEach(span => this.splitLetters(span));
    let letters = title.querySelectorAll('i');
    this.flipLetters('title', letters, show);
    title.style.opacity = 1;
    let note = this.game.dom.texts.note;
    this.tweens.title[letters.length] = new Tween({
      target: note.style,
      easing: Easing.Sine.InOut(),
      duration: show ? 800 : 400,
      yoyo: show ? !0 : null,
      from: { opacity: show ? 0 : (parseFloat(getComputedStyle(note).opacity)) },
      to: { opacity: show ? 1 : 0 },
    });
    setTimeout(() => this.activeTransitions--, this.durations.title);
  }
  timer(show) {
    this.activeTransitions++;
    let timer = this.game.dom.texts.timer;
    timer.style.opacity = 0;
    this.game.timer.convert();
    this.game.timer.setText();
    this.splitLetters(timer);
    this.flipLetters('timer', timer.querySelectorAll('i'), show);
    timer.style.opacity = 1;
    setTimeout(() => this.activeTransitions--, this.durations.timer);
  }
  splitLetters(element) {
    let text = element.innerHTML;
    element.innerHTML = '';
    text.split('').forEach(letter => {
      let i = document.createElement('i');
      i.innerHTML = letter;
      element.appendChild(i);
    });
  }
  flipLetters(type, letters, show) {
    try { this.tweens[type].forEach(tween => tween.stop()); } catch (e) { }
    letters.forEach((letter, index) => {
      letter.style.opacity = show ? 0 : 1;
      this.tweens[type][index] = new Tween({
        easing: Easing.Sine.Out(),
        duration: show ? 800 : 400,
        delay: index * 50,
        onUpdate: tween => {
          let rotation = show ? (1 - tween.value) * -80 : tween.value * 80;
          letter.style.transform = `rotate3d(0, 1, 0, ${rotation}deg)`;
          letter.style.opacity = show ? tween.value : (1 - tween.value);
        },
      });
    });
    this.durations[type] = (letters.length - 1) * 50 + (show ? 800 : 400);
  }
}
class Timer extends Animation {
  constructor(game) {
    super(!1);
    this.game = game;
    this.reset();
  }
  start(continueGame) {
    this.startTime = continueGame ? (Date.now() - this.deltaTime) : Date.now();
    this.deltaTime = 0;
    this.converted = this.convert();
    super.start();
  }
  reset() {
    this.startTime = 0;
    this.currentTime = 0;
    this.deltaTime = 0;
    this.converted = '0:00';
  }
  stop() {
    this.currentTime = Date.now();
    this.deltaTime = this.currentTime - this.startTime;
    this.convert();
    super.stop();
    return { time: this.converted, millis: this.deltaTime };
  }
  update() {
    let old = this.converted;
    this.currentTime = Date.now();
    this.deltaTime = this.currentTime - this.startTime;
    this.convert();
    if (this.converted != old) {
      localStorage.setItem('theCube_time', this.deltaTime);
      this.setText();
    }
  }
  convert() {
    let seconds = parseInt((this.deltaTime / 1000) % 60);
    let minutes = parseInt((this.deltaTime / (1000 * 60)));
    this.converted = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }
  setText() {
    this.game.dom.texts.timer.innerHTML = this.converted;
  }
}
document.querySelectorAll('range').forEach(el => {
  let temp = document.createElement('div');
  temp.innerHTML =
    `<div class="range">
      <div class="range__label"></div>
      <div class="range__track">
        <div class="range__track-line"></div>
        <div class="range__handle">
          <div></div>
        </div>
      </div>
      <div class="range__list"></div>
    </div>`;
  let range = temp.querySelector('.range');
  range.setAttribute('name', el.getAttribute('name'));
  range.querySelector('.range__label').innerHTML = el.getAttribute('title');
  el.getAttribute('list').split(',').forEach(listItemText => {
    let listItem = document.createElement('div');
    listItem.innerHTML = listItemText;
    range.querySelector('.range__list').appendChild(listItem);
  });
  el.parentNode.replaceChild(range, el);
});
class Range {
  constructor(name, options) {
    options = Object.assign({
      range: [0, 1],
      value: 0,
      step: 0,
      onUpdate: () => { },
      onComplete: () => { },
    }, options || {});
    this.element = document.querySelector('.range[name="' + name + '"]');
    this.track = this.element.querySelector('.range__track');
    this.handle = this.element.querySelector('.range__handle');
    this.value = options.value;
    this.min = options.range[0];
    this.max = options.range[1];
    this.step = options.step;
    this.onUpdate = options.onUpdate;
    this.onComplete = options.onComplete;
    this.value = this.round(this.limitValue(this.value));
    this.setHandlePosition();
    this.initDraggable();
  }
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
  round(value) {
    if (this.step < 1) return value;
    return Math.round((value - this.min) / this.step) * this.step + this.min;
  }
  limitValue(value) {
    let max = Math.max(this.max, this.min);
    let min = Math.min(this.max, this.min);
    return Math.min(Math.max(value, min), max);
  }
  limitPosition(position) {
    return Math.min(Math.max(position, 0), this.track.offsetWidth);
  }
  percentsFromValue(value) {
    return (value - this.min) / (this.max - this.min);
  }
  valueFromPosition(position) {
    return this.min + (this.max - this.min) * (position / this.track.offsetWidth);
  }
  positionFromValue(value) {
    return this.percentsFromValue(value) * this.track.offsetWidth;
  }
  setHandlePosition() {
    this.handle.style.left = this.percentsFromValue(this.value) * 100 + '%';
  }
}
class Preferences {
  constructor(game) {
    this.game = game;
  }
  init() {
    this.ranges = {
      flip: new Range('flip', {
        value: this.game.controls.flipConfig,
        range: [0, 2],
        step: 1,
        onUpdate: value => {
          this.game.controls.flipConfig = value;
        },
      }),
      scramble: new Range('scramble', {
        value: this.game.scrambler.scrambleLength,
        range: [20, 30],
        step: 5,
        onUpdate: value => {
          this.game.scrambler.scrambleLength = value;
        },
      }),
      fov: new Range('fov', {
        value: this.game.world.fov,
        range: [2, 45],
        onUpdate: value => {
          this.game.world.fov = value;
          this.game.world.resize();
        },
      }),
      theme: new Range('theme', {
        value: { cube: 0, erno: 1, dust: 2, camo: 3, rain: 4 }[this.game.themes.theme],
        range: [0, 4],
        step: 1,
        onUpdate: value => {
          let theme = ['cube', 'erno', 'dust', 'camo', 'rain'][value];
          this.game.themes.setTheme(theme);
        },
      }),
    };
  }
}
class Confetti {
  constructor(game) {
    this.game = game;
    this.started = 0;
    this.options = {
      speed: { min: .0011, max: .0022 },
      revolution: { min: .01, max: .05 },
      size: { min: .1, max: .15 },
      colors: [0x41aac8, 0x82ca38, 0xffef48, 0xef3923, 0xff8c0a],
    };
    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
    this.holders = [
      new ConfettiStage(this.game, this, 1, 20),
      new ConfettiStage(this.game, this, -1, 30),
    ];
  }
  start() {
    if (this.started > 0) return;
    this.holders.forEach(holder => {
      this.game.world.scene.add(holder.holder);
      holder.start();
      this.started++;
    });
  }
  stop() {
    if (this.started == 0) return;
    this.holders.forEach(holder => {
      holder.stop(() => {
        this.game.world.scene.remove(holder.holder);
        this.started--;
      });
    });
  }
  updateColors(colors) {
    this.holders.forEach(holder => {
      holder.options.colors.forEach((color, index) => {
        holder.options.colors[index] = colors[['D', 'F', 'R', 'B', 'L'][index]];
      });
    });
  }
}
class ConfettiStage extends Animation {
  constructor(game, parent, distance, count) {
    super(!1);
    this.game = game;
    this.parent = parent;
    this.distanceFromCube = distance;
    this.count = count;
    this.particles = [];
    this.holder = new THREE.Object3D();
    this.holder.rotation.copy(this.game.world.camera.rotation);
    this.object = new THREE.Object3D();
    this.holder.add(this.object);
    this.resizeViewport = this.resizeViewport.bind(this);
    this.game.world.onResize.push(this.resizeViewport);
    this.resizeViewport();
    this.geometry = this.parent.geometry;
    this.material = this.parent.material;
    this.options = this.parent.options;
    let i = this.count;
    while (i--) this.particles.push(new Particle(this));
  }
  start() {
    this.time = performance.now();
    this.playing = !0;
    let i = this.count;
    while (i--) this.particles[i].reset();
    super.start();
  }
  stop(callback) {
    this.playing = !1;
    this.completed = 0;
    this.callback = callback;
  }
  reset() {
    super.stop();
    this.callback();
  }
  update() {
    let now = performance.now();
    let delta = now - this.time;
    this.time = now;
    let i = this.count;
    while (i--)
      if (!this.particles[i].completed) this.particles[i].update(delta);
    if (!this.playing && this.completed == this.count) this.reset();
  }
  resizeViewport() {
    let fovRad = this.game.world.camera.fov * THREE.Math.DEG2RAD;
    this.height = 2 * Math.tan(fovRad / 2) * (this.game.world.camera.position.length() - this.distanceFromCube);
    this.width = this.height * this.game.world.camera.aspect;
    let scale = 1 / this.game.transition.data.cameraZoom;
    this.width *= scale;
    this.height *= scale;
    this.object.position.z = this.distanceFromCube;
    this.object.position.y = this.height / 2;
  }
}
class Particle {
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
  reset(randomHeight = !0) {
    this.completed = !1;
    this.color = new THREE.Color(this.options.colors[Math.floor(Math.random() * this.options.colors.length)]);
    this.mesh.material.color.set(this.color);
    this.speed = THREE.Math.randFloat(this.options.speed.min, this.options.speed.max) * - 1;
    this.mesh.position.x = THREE.Math.randFloat(- this.confetti.width / 2, this.confetti.width / 2);
    this.mesh.position.y = (randomHeight)
      ? THREE.Math.randFloat(this.size, this.confetti.height + this.size)
      : this.size;
    this.revolutionSpeed = THREE.Math.randFloat(this.options.revolution.min, this.options.revolution.max);
    this.revolutionAxis = ['x', 'y', 'z'][Math.floor(Math.random() * 3)];
    this.mesh.rotation.set(Math.random() * Math.PI / 3, Math.random() * Math.PI / 3, Math.random() * Math.PI / 3);
  }
  stop() {
    this.completed = !0;
    this.confetti.completed++;
  }
  update(delta) {
    this.mesh.position.y += this.speed * delta;
    this.mesh.rotation[this.revolutionAxis] += this.revolutionSpeed;
    this.mesh.position.y < - this.confetti.height - this.size && this.confetti.playing ? this.reset(!1) : this.stop();
  }
}
class Scores {
  constructor(game) {
    this.game = game;
    this.scores = [];
    this.solves = 0;
    this.best = 0;
    this.worst = 0;
  }
  addScore(time) {
    this.scores.push(time);
    this.solves++;
    if (this.scores.lenght > 100) this.scores.shift();
    let bestTime = !1;
    if (time < this.best || this.best === 0) {
      this.best = time;
      bestTime = !0;
    }
    if (time > this.worst) this.worst = time;
    return bestTime;
  }
  calcStats() {
    this.setStat('total-solves', this.solves);
    this.setStat('best-time', this.convertTime(this.best));
    this.setStat('worst-time', this.convertTime(this.worst));
    this.setStat('average-5', this.getAverage(5));
    this.setStat('average-12', this.getAverage(12));
    this.setStat('average-25', this.getAverage(25));
  }
  setStat(name, value) {
    if (value === 0) return;
    this.game.dom.stats.querySelector(`.stats[name="${name}"] b`).innerHTML = value;
  }
  getAverage(count) {
    if (this.scores.length < count) return 0;
    return this.convertTime(this.scores.slice(-count).reduce((a, b) => a + b, 0) / count);
  }
  convertTime(time) {
    if (time <= 0) return 0;
    let seconds = parseInt((time / 1000) % 60);
    let minutes = parseInt((time / (1000 * 60)));
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }
}
class Storage {
  constructor(game) {
    this.game = game;
  }
  init() {
    this.loadGame();
    this.loadPreferences();
  }
  loadGame() {
    this.game.saved = !1;
  }
  loadPreferences() {
    this.game.controls.flipConfig = 0;
    this.game.scrambler.scrambleLength = 20;
    this.game.world.fov = 10;
    this.game.world.resize();
    this.game.themes.setTheme('cube');
    return !1;
  }
}
class Themes {
  constructor(game) {
    this.game = game;
    this.theme = null;
    this.colors = {
      cube: { U: 0xfff7ff, D: 0xffef48, F: 0xef3923, R: 0x41aac8, B: 0xff8c0a, L: 0x82ca38, P: 0x08101a, G: 0xd1d5db, },
      erno: { U: 0xffffff, D: 0xffd500, F: 0xc41e3a, R: 0x0051ba, B: 0xff5800, L: 0x009e60, P: 0x111111, G: 0x8abdff, },
      dust: { U: 0xfff6eb, D: 0xe7c48d, F: 0x8f253e, R: 0x607e69, B: 0xbe6f62, L: 0x849f5d, P: 0x111111, G: 0xE7C48D, },
      camo: { U: 0xfff6eb, D: 0xbfb672, F: 0x805831, R: 0x718456, B: 0x37241c, L: 0x37431d, P: 0x111111, G: 0xBFB672, },
      rain: { U: 0xfafaff, D: 0xedb92d, F: 0xce2135, R: 0x449a89, B: 0xec582f, L: 0xa3a947, P: 0x111111, G: 0x87b9ac, },
    };
  }
  setTheme(theme) {
    if (theme === this.theme) return;
    this.theme = theme;
    let colors = this.colors[this.theme];
    this.game.cube.pieces.forEach(piece => piece.userData.cube.material.color.setHex(colors.P));
    this.game.cube.edges.forEach(edge => edge.material.color.setHex(colors[edge.name]));
    this.game.dom.rangeHandles.forEach(handle => handle.style.background = '#' + colors.R.toString(16).padStart(6, '0'));
    this.game.confetti.updateColors(colors);
    this.game.dom.back.style.background = '#' + colors.G.toString(16).padStart(6, '0');
    this.game.dom.buttons.pwa.style.color = '#' + colors.R.toString(16).padStart(6, '0');
  }
}
class IconsConverter {
  constructor(options) {
    options = Object.assign({
      tagName: 'icon',
      className: 'icon',
      styles: !1,
      icons: {},
      observe: !1,
      convert: !1,
    }, options || {});
    this.tagName = options.tagName;
    this.className = options.className;
    this.icons = options.icons;
    this.svgTag = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svgTag.setAttribute('class', this.className);
    if (options.styles) this.addStyles();
    if (options.convert) this.convertAllIcons();
    if (options.observe) {
      this.observer = new (window.MutationObserver || window.WebKitMutationObserver)(() => this.convertAllIcons());
      this.observer.observe(document.documentElement, { childList: !0, subtree: !0 });
    }
    return this;
  }
  convertAllIcons() {
    document.querySelectorAll(this.tagName).forEach(icon => this.convertIcon(icon));
  }
  convertIcon(icon) {
    let svgData = this.icons[icon.attributes[0].localName];
    if (typeof svgData === 'undefined') return;
    let svg = this.svgTag.cloneNode(!0);
    let viewBox = svgData.viewbox.split(' ');
    svg.setAttributeNS(null, 'viewBox', svgData.viewbox);
    svg.style.width = viewBox[2] / viewBox[3] + 'em';
    svg.style.height = '1em';
    svg.innerHTML = svgData.content;
    icon.parentNode.replaceChild(svg, icon);
  }
  addStyles() {
    let style = document.createElement('style');
    style.innerHTML = `.${this.className} { display: inline-block; font-size: inherit; overflow: visible; vertical-align: -.125em; preserveAspectRatio: none; }`;
    document.head.appendChild(style);
  }
}
let Icons = new IconsConverter({
  icons: {
    settings: {
      viewbox: '0 0 512 512',
      content: '<path fill="currentColor" d="M444.788 291.1l42.616 24.599c4.867 2.809 7.126 8.618 5.459 13.985-11.07 35.642-29.97 67.842-54.689 94.586a12.016 12.016 0 0 1-14.832 2.254l-42.584-24.595a191.577 191.577 0 0 1-60.759 35.13v49.182a12.01 12.01 0 0 1-9.377 11.718c-34.956 7.85-72.499 8.256-109.219.007-5.49-1.233-9.403-6.096-9.403-11.723v-49.184a191.555 191.555 0 0 1-60.759-35.13l-42.584 24.595a12.016 12.016 0 0 1-14.832-2.254c-24.718-26.744-43.619-58.944-54.689-94.586-1.667-5.366.592-11.175 5.459-13.985L67.212 291.1a193.48 193.48 0 0 1 0-70.199l-42.616-24.599c-4.867-2.809-7.126-8.618-5.459-13.985 11.07-35.642 29.97-67.842 54.689-94.586a12.016 12.016 0 0 1 14.832-2.254l42.584 24.595a191.577 191.577 0 0 1 60.759-35.13V25.759a12.01 12.01 0 0 1 9.377-11.718c34.956-7.85 72.499-8.256 109.219-.007 5.49 1.233 9.403 6.096 9.403 11.723v49.184a191.555 191.555 0 0 1 60.759 35.13l42.584-24.595a12.016 12.016 0 0 1 14.832 2.254c24.718 26.744 43.619 58.944 54.689 94.586 1.667 5.366-.592 11.175-5.459 13.985L444.788 220.9a193.485 193.485 0 0 1 0 70.2zM336 256c0-44.112-35.888-80-80-80s-80 35.888-80 80 35.888 80 80 80 80-35.888 80-80z" class=""></path>',
    },
    back: {
      viewbox: '0 0 512 512',
      content: '<path transform="translate(512, 0) scale(-1,1)" fill="currentColor" d="M503.691 189.836L327.687 37.851C312.281 24.546 288 35.347 288 56.015v80.053C127.371 137.907 0 170.1 0 322.326c0 61.441 39.581 122.309 83.333 154.132 13.653 9.931 33.111-2.533 28.077-18.631C66.066 312.814 132.917 274.316 288 272.085V360c0 20.7 24.3 31.453 39.687 18.164l176.004-152c11.071-9.562 11.086-26.753 0-36.328z" class=""></path>',
    },
    trophy: {
      viewbox: '0 0 576 512',
      content: '<path fill="currentColor" d="M552 64H448V24c0-13.3-10.7-24-24-24H152c-13.3 0-24 10.7-24 24v40H24C10.7 64 0 74.7 0 88v56c0 66.5 77.9 131.7 171.9 142.4C203.3 338.5 240 360 240 360v72h-48c-35.3 0-64 20.7-64 56v12c0 6.6 5.4 12 12 12h296c6.6 0 12-5.4 12-12v-12c0-35.3-28.7-56-64-56h-48v-72s36.7-21.5 68.1-73.6C498.4 275.6 576 210.3 576 144V88c0-13.3-10.7-24-24-24zM64 144v-16h64.2c1 32.6 5.8 61.2 12.8 86.2-47.5-16.4-77-49.9-77-70.2zm448 0c0 20.2-29.4 53.8-77 70.2 7-25 11.8-53.6 12.8-86.2H512v16zm-127.3 4.7l-39.6 38.6 9.4 54.6c1.7 9.8-8.7 17.2-17.4 12.6l-49-25.8-49 25.8c-8.8 4.6-19.1-2.9-17.4-12.6l9.4-54.6-39.6-38.6c-7.1-6.9-3.2-19 6.7-20.5l54.8-8 24.5-49.6c4.4-8.9 17.1-8.9 21.5 0l24.5 49.6 54.8 8c9.6 1.5 13.5 13.6 6.4 20.5z" class=""></path>',
    },
    share: {
      viewbox: '0 0 36 50',
      content: '<path fill="currentColor" d="M19,4.414L19,32C19,32.552 18.552,33 18,33C17.448,33 17,32.552 17,32L17,4.414L10.707,10.707C10.317,11.098 9.683,11.098 9.293,10.707C8.902,10.317 8.902,9.683 9.293,9.293L18,0.586L26.707,9.293C27.098,9.683 27.098,10.317 26.707,10.707C26.317,11.098 25.683,11.098 25.293,10.707L19,4.414ZM34,18L26,18C25.448,18 25,17.552 25,17C25,16.448 25.448,16 26,16L36,16L36,50L0,50L0,16L10,16C10.552,16 11,16.448 11,17C11,17.552 10.552,18 10,18L2,18L2,48L34,48L34,18Z" />',
    },
    pwa: {
      viewbox: '0 0 740 280',
      content: '<path d="M544.62 229.7L565.998 175.641H627.722L598.43 93.6366L635.066 .988922L740 279.601H662.615L644.683 229.7H544.62V229.7Z" fill="#3d3d3d"/><path d="M478.6 279.601L590.935 .989288H516.461L439.618 181.035L384.974 .989655H327.73L269.058 181.035L227.681 98.9917L190.236 214.352L228.254 279.601H301.545L354.565 118.139L405.116 279.601H478.6V279.601Z" fill="currentColor"/><path d="M70.6927 183.958H116.565C130.46 183.958 142.834 182.407 153.685 179.305L165.548 142.757L198.704 40.6105C196.177 36.6063 193.293 32.8203 190.051 29.2531C173.028 10.4101 148.121 .988861 115.33 .988861H0V279.601H70.6927V183.958V183.958ZM131.411 65.0863C138.061 71.7785 141.385 80.7339 141.385 91.9534C141.385 103.259 138.461 112.225 132.614 118.853C126.203 126.217 114.399 129.898 97.2023 129.898H70.6927V55.0474H97.3972C113.424 55.0474 124.762 58.3937 131.411 65.0863V65.0863Z" fill="#3d3d3d"/>',
    }
  },
  convert: !0,
});
let MENU = 0;
let PLAYING = 1;
let COMPLETE = 2;
let STATS = 3;
let PREFS = 4;
let SHOW = !0;
let HIDE = !1;
class Game {
  constructor() {
    let qs = document.querySelector.bind(document);
    this.dom = {
      ui: qs('.ui'),
      game: qs('.ui__game'),
      back: qs('.ui__background'),
      texts: qs('.ui__texts'),
      prefs: qs('.ui__prefs'),
      stats: qs('.ui__stats'),
      texts: {
        title: qs('.text--title'),
        note: qs('.text--note'),
        timer: qs('.text--timer'),
        stats: qs('.text--timer'),
        complete: qs('.text--complete'),
        best: qs('.text--best-time'),
      },
      buttons: {
        prefs: qs('.btn--prefs'),
        back: qs('.btn--back'),
        stats: qs('.btn--stats'),
        pwa: qs('.btn--pwa'),
      },
      rangeHandles: document.querySelectorAll.bind(document)('.range__handle div'),
    };
    this.world = new World(this);
    this.cube = new Cube(this);
    this.controls = new Controls(this);
    this.scrambler = new Scrambler(this);
    this.transition = new Transition(this);
    this.timer = new Timer(this);
    this.preferences = new Preferences(this);
    this.scores = new Scores(this);
    this.storage = new Storage(this);
    this.confetti = new Confetti(this);
    this.themes = new Themes(this);
    this.initActions();
    this.state = MENU;
    this.saved = !1;
    this.newGame = !1;
    this.storage.init();
    this.preferences.init();
    this.transition.init();
    this.scores.calcStats();
    setTimeout(() => {
      this.transition.float();
      this.transition.cube(SHOW);
      setTimeout(() => this.transition.title(SHOW), 700);
      setTimeout(() => this.transition.buttons(['prefs', 'pwa'], []), 1000);
    }, 500);
  }
  initActions() {
    let tappedTwice = !1;
    this.dom.game.onclick = () => {
      if (this.transition.activeTransitions > 0) return;
      if (this.state === PLAYING) return;
      if (this.state === MENU) {
        if (!tappedTwice) {
          tappedTwice = !0;
          setTimeout(() => tappedTwice = !1, 300);
          return !1;
        }
        if (!this.saved) {
          this.scrambler.scramble();
          this.controls.scrambleCube();
          this.newGame = !0;
        }
        this.state = PLAYING;
        this.saved = !0;
        this.transition.buttons([], ['pwa', 'prefs']);
        this.transition.zoom(PLAYING, this.saved ? 0 : this.scrambler.converted.length * this.controls.flipSpeeds[0]);
        this.transition.title(HIDE);
        setTimeout(() => {
          this.transition.timer(SHOW);
          this.transition.buttons(['back'], []);
        }, this.transition.durations.zoom - 1000);
        setTimeout(() => {
          this.controls.enable();
          if (!this.newGame) this.timer.start(!0);
        }, this.transition.durations.zoom);
      } else if (this.state === COMPLETE) {
        this.state = STATS;
        this.saved = !1;
        this.transition.timer(HIDE);
        this.transition.complete(HIDE, this.bestTime);
        this.transition.cube(HIDE);
        this.timer.reset();
        setTimeout(() => {
          this.cube.reset();
          this.confetti.stop();
          this.transition.stats(SHOW);
          this.transition.elevate(0);
        }, 1000);
        return !1;
      } else if (this.state === STATS) {
        this.state = MENU;
        this.transition.buttons(['pwa', 'prefs'], []);
        this.transition.stats(HIDE);
        setTimeout(() => this.transition.cube(SHOW), 500);
        setTimeout(() => this.transition.title(SHOW), 1200);
      }
    };
    this.controls.onMove = () => {
      if (this.newGame) {
        this.timer.start(!0);
        this.newGame = !1;
      }
    };
    this.dom.buttons.back.onclick = () => {
      if (this.transition.activeTransitions > 0) return;
      if (this.state === PREFS) {
        this.state = MENU;
        this.transition.buttons(['pwa', 'prefs'], ['back']);
        this.transition.preferences(HIDE);
        setTimeout(() => this.transition.cube(SHOW), 500);
        setTimeout(() => this.transition.title(SHOW), 1200);
      } else if (this.state === PLAYING) {
        this.state = MENU;
        this.transition.buttons(['pwa', 'prefs'], ['back']);
        this.transition.zoom(MENU, 0);
        this.controls.disable();
        if (!this.newGame) this.timer.stop();
        this.transition.timer(HIDE);
        setTimeout(() => this.transition.title(SHOW), this.transition.durations.zoom - 1000);
        this.playing = !1;
        this.controls.disable();
      }
    };
    this.dom.buttons.prefs.onclick = () => {
      if (this.transition.activeTransitions > 0) return;
      this.state = PREFS;
      this.transition.buttons(['back'], ['pwa', 'prefs']);
      this.transition.title(HIDE);
      this.transition.cube(HIDE);
      setTimeout(() => this.transition.preferences(SHOW), 1000);
    };
    this.dom.buttons.stats.onclick = () => {
      if (this.transition.activeTransitions > 0) return;
      this.state = STATS;
      this.transition.buttons([], ['pwa', 'prefs']);
      this.transition.title(HIDE);
      this.transition.cube(HIDE);
      setTimeout(() => this.transition.stats(SHOW), 1000);
    };
    this.controls.onSolved = () => {
      this.transition.buttons([], ['back']);
      this.state = COMPLETE;
      this.saved = !1;
      this.controls.disable();
      this.timer.stop();
      this.bestTime = this.scores.addScore(this.timer.deltaTime);
      this.transition.zoom(MENU, 0);
      this.transition.elevate(SHOW);
      setTimeout(() => {
        this.transition.complete(SHOW, this.bestTime);
        this.confetti.start();
      }, 1000);
    };
  }
}
window.game = new Game();
