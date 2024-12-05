import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree} from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { XR, createXRStore } from "@react-three/xr";

import * as THREE from "three";

import { Howl } from "howler";
import { useControls, Leva } from "leva";

import Overlay from "./lines_planes/Overlay";
import Particles from "./lines_planes/Particles";
import Lines from "./lines_planes/Lines";
import Planes from "./lines_planes/Planes";
import ParticlesController from "./lines_planes/ParticlesController";

const store = createXRStore();

const Model = ({ url, curveSettings, showParticles, setObjects, objects }) => {
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

    [...perspectiveObjects, ...otherObjects, ...planarObjects].forEach(
      (object) => {
        scene.remove(object);
      }
    );

    setObjects(planarObjects);
  }, [scene]);

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
    </group>
  );
};

const ProximitySensor = ({ target, maxDist = 10, sound, setProximity}) => {
  const {camera} = useThree();
  const [hasEnteredCloseArea, setHasEnteredCloseArea] = useState(false); 

  useFrame(() => {
    const distance = camera.position.distanceTo(target);
    const normalizedDist = Math.min(distance / maxDist, 1);
    const proximity = 1 - normalizedDist;

    setProximity(proximity);

    if (proximity > 0.90 && !hasEnteredCloseArea) {
      setHasEnteredCloseArea(true);
      sound.play()
    }    
  });
};

const LinesOrPlanes = () => {
  const modelPath = process.env.PUBLIC_URL + "/cat _with_lines.glb";

  const THICKNESS_TARGET = new THREE.Vector3(
    -1.256700255249674,
    0.9821507155358848,
    1.0079573275129785
  );

  const ORBIT_TARGET = new THREE.Vector3(0, 0, 0);

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

  const [proximity, setProximity] = useState(0);

  const [objects, setObjects] = useState([]);
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

          <ProximitySensor target={THICKNESS_TARGET} maxDist={10} sound={sound} setProximity={setProximity}/>

          <Model
            url={modelPath}
            curveSettings={curveSettings}
            showParticles={showParticles}
            setObjects={setObjects}
            objects={objects}
          />

          {showPlanes && <Planes objects={objects} />}

          {showLines && <Lines objects={objects} target={THICKNESS_TARGET} proximity={proximity}/>}

          <OrbitControls target={ORBIT_TARGET} />

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
