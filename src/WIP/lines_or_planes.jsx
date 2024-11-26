import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import LineThicknessController from "./lines_planes/LineThicknessController";
import { XR, createXRStore } from "@react-three/xr";
import { Suspense } from "react";

const store = createXRStore();

const Overlay = ({ isVisible, setIsVisible }) => {
  const handleAR = () => {
    setIsVisible(false);
    store.enterAR();
  };

  const handleVR = () => {
    setIsVisible(false);
    store.enterVR();
  };

  const handleScreen = () => {
    setIsVisible(false);
  };

  return isVisible ? (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        flexDirection: "column",
      }}
    >
      <h2>Lines or Planes Prototype</h2>
      <p>
        Lines will change thickness based on camera distance from target point.
        <br />
        <br />
        In AR/VR, the model will be positioned at origin.
        <br />
        <br />
        In browser, use Orbit Controls to move the camera.
      </p>
      <button onClick={handleAR}>Enter AR</button>
      <button onClick={handleVR}>Enter VR</button>
      <button onClick={handleScreen}>Stay in Browser</button>
    </div>
  ) : null;
};

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

  const [isOverlayVisible, setIsOverlayVisible] = useState(true);

  return (
    <>
      <Canvas>
        <XR store={store}>
          <Suspense fallback={null}>
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
          </Suspense>
        </XR>
      </Canvas>
      <Overlay
        isVisible={isOverlayVisible}
        setIsVisible={setIsOverlayVisible}
      />
    </>
  );
};

export default LinesOrPlanes;
