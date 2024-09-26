import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { createXRStore, XR } from "@react-three/xr";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const store = createXRStore();

function Model({ fullAnimation, isDiscovered, outlineAnimation }) {
  const { scene, animations } = useGLTF("/mixamo_outline.glb");
  const { ref, actions, mixer } = useAnimations(animations);
  console.log(animations);
  const [outlinesCompleted, setOutlinesCompleted] = useState(false);

  useEffect(() => {
    if (scene.children.length > 0) {
      scene.children[0].visible = false;
    }
  }, [scene]);

  // Start the outline animation once the Scene is loaded
  useEffect(() => {
    if (actions && outlineAnimation && actions[outlineAnimation]) {
      actions[outlineAnimation].reset().play();
      actions[outlineAnimation].setLoop(THREE.LoopOnce);
      actions[outlineAnimation].clampWhenFinished = true;
      actions[outlineAnimation].timeScale = 0.1;

      const onFinished = (e) => {
        if (e.action === actions[outlineAnimation]) {
          setOutlinesCompleted(true);
          console.log("Outlines completed");
        }
      };

      mixer.addEventListener("finished", onFinished);

      return () => {
        mixer.removeEventListener("finished", onFinished);
      };
    }
  }, [actions, outlineAnimation, mixer]);

  /* 
  // Search for the outlines and hide them once the other animation starts running.

  useEffect(() => {
    if (isDiscovered) {
      for (let i = 1; i < scene.children.length; i++) {
        scene.children[i].visible = false;
      }
    }
  }, [scene, isDiscovered]);
  */

  // Speed up the outline animation while the model is discovered.
  useEffect(() => {
    if (isDiscovered && actions[outlineAnimation]) {
      actions[outlineAnimation].timeScale = 3;
      scene.traverse((child) => {
        if (child.isMesh && child.name === "Flat") {
          child.material.color.set(0xff0000); // Change to desired color
        }
      });
    } else if (!isDiscovered && actions[outlineAnimation]) {
      actions[outlineAnimation].timeScale = 0.1;
      scene.traverse((child) => {
        if (child.isMesh && child.name === "Flat") {
          child.material.color.set(0xffffff); // Change to desired color
        }
      });
    }
  }, [isDiscovered, actions, outlineAnimation, scene]); //this will run when isDiscovered changes

  useEffect(() => {
    if (outlinesCompleted) {
      console.log("Playing full animation");
      scene.children[0].visible = true;
      actions[fullAnimation].setLoop(THREE.LoopOnce);
      actions[fullAnimation].clampWhenFinished = true;
      actions[fullAnimation].time = 0;
      actions[fullAnimation].play();
    }
  }, [outlinesCompleted, scene, actions, fullAnimation]);

  return <primitive ref={ref} object={scene} position={[0, 0, 0]} />;
}

// this checks whether the camera is within the specified position.
function CameraController({ setIsDiscovered, setBloomIntensity }) {
  const targetX = 0.6;
  const targetY = 1.5;
  const marginOfError = 0.1; // Adjust this value as needed for more precision

  useFrame(({ camera }) => {
    if (camera) {
      const { x, y, z } = camera.position;
      if (
        Math.abs(x - targetX) <= marginOfError &&
        Math.abs(y - targetY) < marginOfError &&
        z > 0
      ) {
        setIsDiscovered(true);
        setBloomIntensity(1);
      } else {
        setIsDiscovered(false);
        setBloomIntensity(0.2);
      }
    }
  });

  return null;
}

export default function MixamoOutline() {
  const [isPaused, setIsPaused] = useState(true);
  const [isDiscovered, setIsDiscovered] = useState(false);
  const [bloomIntensity, setBloomIntensity] = useState(0);

  return (
    <>
      <button onClick={() => store.enterVR()}>Enter VR</button>
      <button onClick={() => store.enterAR()}>Enter AR</button>
      <Canvas shadows>
        <XR store={store}>
          <Suspense>
            <CameraController
              isDiscovered={isDiscovered}
              setIsDiscovered={setIsDiscovered}
              setBloomIntensity={setBloomIntensity}
            />
            <directionalLight
              position={[3.3, 1.0, 4.4]}
              castShadow
              intensity={Math.PI * 2}
            />
            <Model
              fullAnimation={"Armature.001"}
              outlineAnimation={"Outlines"}
              isPaused={isPaused}
              setIsPaused={setIsPaused}
              isDiscovered={isDiscovered}
            />
            <OrbitControls target={[0, 1, 0]} />
          </Suspense>
        </XR>
        {/* <EffectComposer>
          <Bloom luminanceThreshold={0} mipmapBlur intensity={bloomIntensity} />
        </EffectComposer> */}
      </Canvas>
    </>
  );
}
