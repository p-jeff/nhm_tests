import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, useGLTF } from '@react-three/drei';

// Custom EdgesGeometry function
function EdgesGeometry(geometry, thresholdAngle = 170) {
  const g = new THREE.BufferGeometry();
  const vertices = [];
  const edges = {};
  const positionAttribute = geometry.attributes.position;
  const faceIndices = geometry.index ? geometry.index.array : null;
  const zMin = -0.5; // Define the minimum z-value for the slice
  const zMax = 0.5;  // Define the maximum z-value for the slice

  // Prepare edges
  for (let i = 0; i < faceIndices.length; i += 3) {
    const face = [faceIndices[i], faceIndices[i + 1], faceIndices[i + 2]];

    const v0 = new THREE.Vector3().fromArray(positionAttribute.array, face[0] * 3);
    const v1 = new THREE.Vector3().fromArray(positionAttribute.array, face[1] * 3);
    const v2 = new THREE.Vector3().fromArray(positionAttribute.array, face[2] * 3);

    const normal = new THREE.Vector3()
      .crossVectors(new THREE.Vector3().subVectors(v1, v0), new THREE.Vector3().subVectors(v2, v0))
      .normalize();

    for (let j = 0; j < 3; j++) {
      const edge1 = face[j];
      const edge2 = face[(j + 1) % 3];
      const edge = [Math.min(edge1, edge2), Math.max(edge1, edge2)];
      const key = edge.join(',');

      if (!edges[key]) {
        edges[key] = { index1: edge[0], index2: edge[1], normals: [normal] };
      } else {
        edges[key].normals.push(normal);
      }
    }
  }

  // Generate vertices based on edge visibility and z-range
  for (const key in edges) {
    const e = edges[key];
    if (e.normals.length === 1) { // Only consider edges with one normal (boundary edges)
      const vertex1 = new THREE.Vector3().fromArray(positionAttribute.array, e.index1 * 3);
      const vertex2 = new THREE.Vector3().fromArray(positionAttribute.array, e.index2 * 3);
      if (e.normals.some((n) => n.z > 0) && vertex1.z >= zMin && vertex1.z <= zMax && vertex2.z >= zMin && vertex2.z <= zMax) {
        vertices.push(vertex1.x, vertex1.y, vertex1.z);
        vertices.push(vertex2.x, vertex2.y, vertex2.z);
      }
    }
  }

  g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  return g;
}

// OutlinedCube component
const OutlinedCube = () => {
  const { scene } = useGLTF("suzan.glb");
  const geometry = scene.children[0].geometry;
  const edgesGeometry = EdgesGeometry(geometry);

  return (
    <lineSegments geometry={edgesGeometry}>
      <lineBasicMaterial attach="material" color="#000000" linewidth={2} />
    </lineSegments>
  );
};

function App() {
  return (
    <Canvas style={{ background: "#444444" }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <OutlinedCube />
      <OrbitControls />
    </Canvas>
  );
}

export default App;