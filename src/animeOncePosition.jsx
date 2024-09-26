import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { createXRStore, XR } from "@react-three/xr";

const store = createXRStore();

function Model({ actionName, isDiscovered, isPaused, setIsPaused }) {
  const { scene, animations } = useGLTF("/suzaneLine.glb");
  const { ref, actions } = useAnimations(animations);

  useEffect(() => {
    if (actions && actionName && actions[actionName]) {
      actions[actionName].reset().play(); // Start the animation
    }
  }, [actions, actionName]);

  // Set initial frame to 1
  useEffect(() => {
    if (actions && actionName && actions[actionName]) {
      actions[actionName].time = 1 / 24; // Assuming 24 FPS, set to frame 1
    }
  }, [actions, actionName]);

  useEffect(() => {
    if (isDiscovered) {
      for (let i = 1; i < scene.children.length; i++) {
        scene.children[i].visible = false;
      }
    }
  }, [scene, isDiscovered]);

  // Manage animation playback
  useFrame(() => {
    if (actions && actionName && actions[actionName]) {
      const action = actions[actionName];
      if (!isPaused) {
        console.log(action.time * 24);
        if (action.time * 24 >= 25) {
          action.paused = true;
          action.time = 26; // Stop exactly at frame 50
          setIsPaused(true);
        } else {
          action.paused = false;
        }
      } else {
        action.paused = true;
      }
    }
  });

  return <primitive ref={ref} object={scene} position={[0, 1, 0]} scale={[0.2, 0.2, 0.2]} />;
}

function CameraController({
  updateState,
  isPaused,
  setIsDiscovered,
  isDiscovered,
}) {
  const targetX = 0;
  const targetY = 1.3;
  const marginOfError = 0.04; // Adjust this value as needed for more precision

  useFrame(({ camera }) => {
    if (camera && !isDiscovered) {
      const { x, y, z } = camera.position;
      if (
        Math.abs(x - targetX) <= marginOfError &&
        Math.abs(y - targetY) < marginOfError &&
        z < 0 &&
        isPaused
      ) {
        updateState();
        console.log("is Within");
        setTimeout(() => {
          setIsDiscovered(true);
        }, 1000);
      }
    }
  });

  return null;
}

export default function AnimOncePosition() {
  const [isPaused, setIsPaused] = useState(true);
  const [isDiscovered, setIsDiscovered] = useState(false);

  const animName = "SuzanneAction"; // Replace with your animation name

  const handlePlayPause = () => {
    if (isPaused) {
      setIsPaused(false);
    } else {
      setIsPaused(true);
    }
  };

  return (
    <>
      <button onClick={handlePlayPause}>{isPaused ? "Play" : "Pause"}</button>
      <button onClick={() => store.enterVR()}>Enter VR</button>
      <button onClick={() => store.enterAR()}>Enter AR</button>
      <Canvas shadows>
        <XR store={store}>
          <Suspense>
            <CameraController
              updateState={handlePlayPause}
              isPaused={isPaused}
              isDiscovered={isDiscovered}
              setIsDiscovered={setIsDiscovered}
            />
            <directionalLight
              position={[3.3, 1.0, 4.4]}
              castShadow
              intensity={Math.PI * 2}
            />
            <Model
              actionName={animName}
              isPaused={isPaused}
              setIsPaused={setIsPaused}
              isDiscovered={isDiscovered}
            />
            <OrbitControls target={[0, 1, 0]} />
          </Suspense>
        </XR>
      </Canvas>
    </>
  );
}
