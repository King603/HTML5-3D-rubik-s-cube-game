import Game from "./Game.js";
import RoundedBoxGeometry from "./RoundedBoxGeometry.js";

export default class {
  /**
   * 立方体类
   * @param {Game} game 构造函数
   */
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
    this.holder.traverse(node => node.frustumCulled && (node.frustumCulled = false));
    this.game.world.scene.add(this.holder);
  }
  // 重置
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
  // 生成位置
  generatePositions() {
    this.positions = [];
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          let position = new THREE.Vector3(x - 1, y - 1, z - 1);
          let edges = [];
          if (x == 0)
            edges.push(0);
          if (x == 2)
            edges.push(1);
          if (y == 0)
            edges.push(2);
          if (y == 2)
            edges.push(3);
          if (z == 0)
            edges.push(4);
          if (z == 2)
            edges.push(5);
          position.edges = edges;
          this.positions.push(position);
        }
      }
    }
  }
  // 生成模型
  generateModel() {
    this.pieces = [];
    this.edges = [];
    let pieceSize = 1 / 3;
    let mainMaterial = new THREE.MeshLambertMaterial();
    let pieceMesh = new THREE.Mesh(new RoundedBoxGeometry(pieceSize, this.geometry.pieceCornerRadius, 3), mainMaterial.clone());
    let edgeGeometry = ((size, radius, depth) => {
      let x, y, width, height;
      x = y = -size / 2;
      width = height = size;
      radius = size * radius;
      let shape = new THREE.Shape();
      shape.moveTo(x, y + radius);
      draw(
        { x, y: y + height - radius },
        { x, y: y + height },
        { x: x + radius, y: y + height }
      );
      draw(
        { x: x + width - radius, y: y + height },
        { x: x + width, y: y + height },
        { x: x + width, y: y + height - radius }
      );
      draw(
        { x: x + width, y: y + radius },
        { x: x + width, y },
        { x: x + width - radius, y }
      );
      draw(
        { x: x + radius, y },
        { x, y },
        { x, y: y + radius }
      );
      function draw(line, from, to) {
        shape.lineTo(line.x, line.y);
        shape.quadraticCurveTo(from.x, from.y, to.x, to.y);
      }
      return new THREE.ExtrudeBufferGeometry(shape, { depth, bevelEnabled: false, curveSegments: 3 });;
    })(pieceSize, this.geometry.edgeCornerRoundness, this.geometry.edgeDepth);
    this.positions.forEach((position, index) => {
      let piece = new THREE.Object3D();
      let pieceCube = pieceMesh.clone();
      let pieceEdges = [];
      piece.position.copy(position.clone().divideScalar(3));
      piece.add(pieceCube);
      piece.name = index;
      piece.edgesName = "";
      position.edges.forEach(position => {
        let edge = new THREE.Mesh(edgeGeometry, mainMaterial.clone());
        let name = ["L", "R", "D", "U", "B", "F"][position];
        let distance = pieceSize / 2;
        let quarterCircle = Math.PI / 2;
        edge.position.set(distance * [-1, 1, 0, 0, 0, 0][position], distance * [0, 0, -1, 1, 0, 0][position], distance * [0, 0, 0, 0, -1, 1][position]);
        edge.rotation.set(quarterCircle * [0, 0, 1, -1, 0, 0][position], quarterCircle * [-1, 1, 0, 0, 2, 0][position], 0);
        edge.scale.set(this.geometry.edgeScale, this.geometry.edgeScale, this.geometry.edgeScale);
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
