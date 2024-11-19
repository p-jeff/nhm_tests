import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import LineThicknessController from "./lines_planes/LineThicknessController";

const Model = ({ url, materialRef }) => {
  const { scene } = useGLTF(url);

  useEffect(() => {
    const planarObjects = [];
    const perspectiveObjects = [];
    const otherObjects = [];

    scene.traverse((child) => {
      if (child) {
        if (child.name.includes("planar")) {
          planarObjects.push(child);
        } else if (child.name.includes("perspective")) {
          perspectiveObjects.push(child);
        } else {
          otherObjects.push(child);
        }
      }
    });

    // Convert and store materials for animation
    planarObjects.forEach((object) => {
      if (object.geometry) {
        const geometry = new LineGeometry();

        // Get world positions to preserve positioning
        const worldPositions = [];
        const positionAttribute = object.geometry.attributes.position;
        const vertex = new THREE.Vector3();

        // Store first vertex coordinates to close the loop
        let firstX, firstY, firstZ;

        for (let i = 0; i < positionAttribute.count; i++) {
          vertex.fromBufferAttribute(positionAttribute, i);
          vertex.applyMatrix4(object.matrixWorld);
          worldPositions.push(vertex.x, vertex.y, vertex.z);

          // Save first vertex coordinates
          if (i === 0) {
            firstX = vertex.x;
            firstY = vertex.y;
            firstZ = vertex.z;
          }
        }

        // Add first vertex again to close the loop
        worldPositions.push(firstX, firstY, firstZ);

        geometry.setPositions(worldPositions);

        const material = new LineMaterial({
          color: object.material.color,
          linewidth: 1,
          resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        });

        materialRef.current.push(material);

        const line = new Line2(geometry, material);
        line.computeLineDistances();
        line.position.set(0, 0, 0);
        line.rotation.set(0, 0, 0);
        line.scale.set(1, 1, 1);
        line.name = object.name;

        const parent = object.parent;
        parent.remove(object);
        parent.add(line);
      }
    });

    [...perspectiveObjects, ...otherObjects].forEach((object) => {
      scene.remove(object);
    });
  }, [scene]);

  return <primitive object={scene} />;
};

const LinesOrPlanes = () => {
  const modelPath = process.env.PUBLIC_URL + "/cat _with_lines.glb";

  const MAX_DISTANCE = 5; // Maximum distance to consider
  const MIN_LINE_WIDTH = 0.2;
  const MAX_LINE_WIDTH = 3;
  const THICKNESS_TARGET = new THREE.Vector3(-3.4, 2.6, 3); // For line thickness calculation
  const ORBIT_TARGET = new THREE.Vector3(0, 0, 0); // For camera orbit center
  const MIN_BLOOM = 0.2;
  const MAX_BLOOM = 2;

  const materialRef = useRef([]);
  const [bloomIntensity, setBloomIntensity] = useState(MIN_BLOOM);

  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Model url={modelPath} materialRef={materialRef} />
      <OrbitControls target={ORBIT_TARGET} />
      <LineThicknessController
        materialRef={materialRef}
        maxDistance={MAX_DISTANCE}
        minLineWidth={MIN_LINE_WIDTH}
        maxLineWidth={MAX_LINE_WIDTH}
        target={THICKNESS_TARGET}
        minBloom={MIN_BLOOM}
        maxBloom={MAX_BLOOM}
        setBloomIntensity={setBloomIntensity}
      />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0}
          luminanceSmoothing={0.3}
          height={500}
          intensity={bloomIntensity}
        />
      </EffectComposer>
    </Canvas>
  );
};

export default LinesOrPlanes;
