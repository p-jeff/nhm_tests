import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import ParticlesController from "./lines_planes/ParticlesController";
import { XR, createXRStore } from "@react-three/xr";
import Overlay from "./lines_planes/Overlay";
import Particles from "./lines_planes/Particles";
import Lines from "./lines_planes/Lines";
import Planes from "./lines_planes/Planes";
import { Howl } from "howler";
import { useControls } from "leva";
import LineThicknessController from "./lines_planes/LineThicknessController";
import { Leva } from "leva";

const store = createXRStore();

const Model = ({
  url,
  materialRef,
  lineRefs,
  curveSettings,
  showParticles,
  showLines,
  showPlanes,
}) => {
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
      <primitive object={scene} scale={0.5} />
      {showParticles && (
        <Particles
          objects={objects}
          scene={scene}
          offset={curveSettings.offset}
          sizeCenter={curveSettings.sizeCenter}
          sizeVariable={curveSettings.sizeVariable}
          speed={curveSettings.speed}
        />
      )}
      {showPlanes && (
        <Planes
          objects={objects}
          scene={scene}
          materialRef={materialRef}
          lineRefs={lineRefs}
        />
      )}
      {showLines && (
        <Lines
          objects={objects}
          scene={scene}
          materialRef={materialRef}
          lineRefs={lineRefs}
        />
      )}
    </group>
  );
};

const LinesOrPlanes = () => {
  const modelPath = process.env.PUBLIC_URL + "/cat _with_lines.glb";
  const THICKNESS_TARGET = new THREE.Vector3(
    -1.256700255249674,
    0.9821507155358848,
    1.0079573275129785
  ); // For line thickness calculation
  const ORBIT_TARGET = new THREE.Vector3(0, 0, 0); // For camera orbit center

  const { showLines, showPlanes, showParticles } = useControls({
    showLines: false,
    showPlanes: false,
    showParticles: false,
  });

    const [curveSettings, setCurveSettings] = useState({
    offset: 0.01,
    sizeCenter: 0.075,
    sizeVariable: 0.025,
    speed: 0.0001,
  });

  const materialRef = useRef([]);
  const [bloomIntensity, setBloomIntensity] = useState(0);
  const lineRefs = useRef([]);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    if (!isOverlayVisible) {
      const howl = new Howl({
        src: [process.env.PUBLIC_URL + "/ding.mp3"],
      });

      if (howl) {
        setSound(howl);
        console.log(howl);
      }
    }
  }, [isOverlayVisible]);

  return (
    <>
      <Leva collapsed={true} />
      <Canvas>
        <XR store={store}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Model
            url={modelPath}
            materialRef={materialRef}
            lineRefs={lineRefs}
            curveSettings={curveSettings}
            showLines={showLines}
            showPlanes={showPlanes}
            showParticles={showParticles}
          />
          <OrbitControls target={ORBIT_TARGET} />
          <LineThicknessController
            materialRef={materialRef}
            target={THICKNESS_TARGET}
            setBloomIntensity={setBloomIntensity}
            lineRefs={lineRefs}
          />
          <ParticlesController
            setCurveSettings={setCurveSettings}
            target={THICKNESS_TARGET}
            sound={sound}
          />
        </XR>
      </Canvas>
      <Overlay
        isVisible={isOverlayVisible}
        setIsVisible={setIsOverlayVisible}
        store={store}
      />
    </>
  );
};

export default LinesOrPlanes;
