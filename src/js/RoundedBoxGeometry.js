/**
 * 圆盒几何形状
 * @param {Number} size 尺寸
 * @param {Number} radius 半径
 * @param {Number} radiusSegments 半径片段
 */
export default function RoundedBoxGeometry(size, radius, radiusSegments) {
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
  this.parameters = { width, height, depth, radius, radiusSegments };
  let rs1 = radiusSegments + 1;
  let totalVertexCount = (rs1 * radiusSegments + 1) << 3;
  let positions = new THREE.BufferAttribute(new Float32Array(totalVertexCount * 3), 3);
  let normals = new THREE.BufferAttribute(new Float32Array(totalVertexCount * 3), 3);
  let cornerVerts = [], cornerNormals = [], vertex = new THREE.Vector3(), vertexPool = [], normalPool = [], indices = [];
  let lastVertex = rs1 * radiusSegments, cornerVertNumber = rs1 * radiusSegments + 1;
  // 顶点
  (function () {
    let size = 1;
    let cornerLayout = [
      new THREE.Vector3(+size, +size, +size),
      new THREE.Vector3(+size, +size, -size),
      new THREE.Vector3(-size, +size, -size),
      new THREE.Vector3(-size, +size, +size),
      new THREE.Vector3(+size, -size, +size),
      new THREE.Vector3(+size, -size, -size),
      new THREE.Vector3(-size, -size, -size),
      new THREE.Vector3(-size, -size, +size)
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
  })();
  // 转向
  (function () {
    let a = lastVertex;
    let b = a + cornerVertNumber;
    let c = b + cornerVertNumber;
    let d = c + cornerVertNumber;
    indices.push(a, b, c, a, c, d);
    a = d + cornerVertNumber;
    b = a + cornerVertNumber;
    c = b + cornerVertNumber;
    d = c + cornerVertNumber;
    indices.push(a, c, b, a, d, c);
    a = 0;
    b = cornerVertNumber;
    c = b * 4;
    d = b * 5;
    indices.push(a, c, b, b, c, d);
    a = b * 2;
    b *= 3;
    c = cornerVertNumber * 6;
    d = cornerVertNumber * 7;
    indices.push(a, c, b, b, c, d);
    a = radiusSegments;
    b = a + cornerVertNumber * 3;
    c = b + cornerVertNumber;
    d = c + cornerVertNumber * 3;
    indices.push(a, b, c, b, d, c);
    a = radiusSegments + cornerVertNumber;
    b = a + cornerVertNumber;
    c = b + cornerVertNumber * 3;
    d = c + cornerVertNumber;
    indices.push(a, c, b, b, c, d);
  })();
  // 角
  (function () {
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
          indices.push(a, !flips[i] ? b : c, !flips[i] ? c : b, b, !flips[i] ? d : c, !flips[i] ? c : d);
        }
      }
      for (let u = 0; u < radiusSegments; u++) {
        let a = cornerOffset + lastRowOffset + u;
        let b = cornerOffset + lastRowOffset + u + 1;
        let c = cornerOffset + lastVertex;
        indices.push(a, !flips[i] ? b : c, !flips[i] ? c : b);
      }
    }
  })();
  // 高边
  (function () {
    for (let i = 0; i < 4; i++) {
      let cOffset = i * cornerVertNumber;
      let cRowOffset = 4 * cornerVertNumber + cOffset;
      let needsFlip = i & 1 === 1;
      for (let u = 0; u < radiusSegments; u++) {
        let a = cOffset + u;
        let b = a + 1;
        let c = cRowOffset + u;
        let d = c + 1;
        indices.push(a, !needsFlip ? b : c, !needsFlip ? c : b, b, !needsFlip ? d : c, !needsFlip ? c : d);
      }
    }
  })();
  // 深度边
  (function () {
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
        indices.push(a, !needsFlip ? b : c, !needsFlip ? c : b, b, !needsFlip ? d : c, !needsFlip ? c : d);
      }
    }
  })();
  // 宽边
  (function () {
    let end = radiusSegments - 1;
    let needsFlip = [0, 1, 1, 0];
    for (let i = 0; i < 4; i++) {
      let cStart = [0, 1, 4, 5][i] * cornerVertNumber;
      let cEnd = [3, 2, 7, 6][i] * cornerVertNumber;
      for (let u = 0; u <= end; u++) {
        let size1 = radiusSegments + u * rs1;
        let size2 = u != end ? radiusSegments + (u + 1) * rs1 : cornerVertNumber - 1;
        let a = cStart + size1;
        let b = cStart + size2;
        let c = cEnd + size1;
        let d = cEnd + size2;
        indices.push(a, !needsFlip[i] ? b : c, !needsFlip[i] ? c : b, b, !needsFlip[i] ? d : c, !needsFlip[i] ? c : d);
      }
    }
  })();
  let index = 0;
  for (let i = 0; i < vertexPool.length; i++) {
    positions.setXYZ(index, vertexPool[i].x, vertexPool[i].y, vertexPool[i].z);
    normals.setXYZ(index, normalPool[i].x, normalPool[i].y, normalPool[i].z);
    index++;
  }
  this.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
  this.addAttribute('position', positions);
  this.addAttribute('normal', normals);
}
RoundedBoxGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
RoundedBoxGeometry.constructor = RoundedBoxGeometry;
