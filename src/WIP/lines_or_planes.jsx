import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import LineThicknessController from "./lines_planes/LineThicknessController";
import { XR, createXRStore } from "@react-three/xr";
import { Suspense } from "react";
import Overlay from "./lines_planes/Overlay";
import Curves from "./lines_planes/Curves";

const store = createXRStore();

const Model = ({ url, materialRef, lineRefs }) => {
  const { scene } = useGLTF(url);
  const [objects, setObjects] = useState([]);

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

    [...perspectiveObjects, ...otherObjects, ...planarObjects].forEach(
      (object) => {
        scene.remove(object);
      }
    );

    setObjects(planarObjects);
  }, [scene, materialRef, lineRefs]);

  return (
    <group>
      <primitive object={scene} />
      <Curves objects={objects} scene={scene} />
    </group>
  );
};


const Planes = ({ objects, scene, materialRef, lineRefs }) => {
  useEffect(() => {
    // Convert planar objects to Line2 with LineMaterial
    objects.forEach((object) => {
      if (object.geometry) {
        const geometry = new LineGeometry();
        const worldPositions = [];
        const positionAttribute = object.geometry.attributes.position;
        const vertex = new THREE.Vector3();
        const lineVertices = [];

        let firstX, firstY, firstZ;

        for (let i = 0; i < positionAttribute.count; i++) {
          vertex.fromBufferAttribute(positionAttribute, i);
          vertex.applyMatrix4(object.matrixWorld);
          worldPositions.push(vertex.x, vertex.y, vertex.z);

          lineVertices.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));

          if (i === 0) {
            firstX = vertex.x;
            firstY = vertex.y;
            firstZ = vertex.z;
          }
        }

        // Close the loop
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

        lineRefs.current.push(line);
        scene.add(line);
      }
    });
  }, [scene, objects]);
};

const LinesOrPlanes = () => {
  const modelPath = process.env.PUBLIC_URL + "/cat _with_lines.glb";
  const THICKNESS_TARGET = new THREE.Vector3(-3.4 / 2, 2.6 / 2, 3 / 2); // For line thickness calculation
  const ORBIT_TARGET = new THREE.Vector3(0, 0, 0); // For camera orbit center

  const materialRef = useRef([]);
  const [bloomIntensity, setBloomIntensity] = useState(0);
  const lineRefs = useRef([]);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);

  return (
    <>
      <Canvas>
        <XR store={store}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Model
              url={modelPath}
              materialRef={materialRef}
              lineRefs={lineRefs}
            />
            <OrbitControls target={ORBIT_TARGET} />
            <LineThicknessController
              materialRef={materialRef}
              target={THICKNESS_TARGET}
              setBloomIntensity={setBloomIntensity}
              lineRefs={lineRefs}
            />
          </Suspense>
        </XR>
      </Canvas>
      <Overlay
        isVisible={isOverlayVisible}
        setIsVisible={setIsOverlayVisible}
        store={store}
      />{" "}
    </>
  );
};
export default LinesOrPlanes;
