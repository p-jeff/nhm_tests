import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useState } from "react";
import { createXRStore, XR } from "@react-three/xr";
// I tried adding bloom as a method to give feedback but it doesn't seem to work with the current version of react-three-fiber
// import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const store = createXRStore();

/* 
the GLB contains two meshes, one for the outlines and one for the later animation. Both Meshes contain an action.
The outline very slowy start moving together so that if the user does not manage in time, the model will still be discovered.
*/

function Model({
  fullAnimation,
  isDiscovered,
  outlineAnimation,
  isOverlayVisible,
  modelPath
}) {
  const { scene, animations } = useGLTF(modelPath);
  const { ref, actions, mixer } = useAnimations(animations);

  // Define the function to play the full animation
  const playAnimation = useCallback(() => {
    console.log("Playing full animation");
    scene.children[0].visible = true;
    actions[fullAnimation].setLoop(THREE.LoopOnce);
    actions[fullAnimation].clampWhenFinished = true;
    actions[fullAnimation].time = 0;
    actions[fullAnimation].play();
  }, [actions, fullAnimation, scene.children]);

  // hide the full model on scene load
  useEffect(() => {
    if (scene.children.length > 0) {
      scene.children[0].visible = false;
    }
  }, [scene]);

  // Start the outline animation once the Scene is loaded
  useEffect(() => {
    if (
      !isOverlayVisible &&
      actions &&
      outlineAnimation &&
      actions[outlineAnimation]
    ) {
      // Settings for outline Animation
      actions[outlineAnimation].setLoop(THREE.LoopOnce);
      actions[outlineAnimation].clampWhenFinished = true;
      // Slow down the outline animation, so the user has time to discover the model.
      actions[outlineAnimation].timeScale = 0.1;

      actions[outlineAnimation].reset().play();

      // Once the outline animation is finished, play the full animation.
      const onFinished = (e) => {
        if (e.action === actions[outlineAnimation]) {
          playAnimation();
          console.log("Outlines completed");
        }
      };

      mixer.addEventListener("finished", onFinished);

      return () => {
        mixer.removeEventListener("finished", onFinished);
      };
    }
  }, [isOverlayVisible, actions, outlineAnimation, mixer, playAnimation]);

  // Speed up the outline animation while the model is discovered.
  // useEffect will run every time there is an update to one of the dependencies
  useEffect(() => {
    if (isDiscovered && actions[outlineAnimation]) {
      actions[outlineAnimation].timeScale = 3;
      scene.traverse((child) => {
        if (child.isMesh && child.name === "Flat") {
          child.material.color.set(0xff0000); // Change to red as an indicator that the correct position has been found
        }
      });
    } else if (!isDiscovered && actions[outlineAnimation]) {
      actions[outlineAnimation].timeScale = 0.1;
      scene.traverse((child) => {
        if (child.isMesh && child.name === "Flat") {
          child.material.color.set(0xffffff); // Change to white to indicate that user in not in the correct position
        }
      });
    }
  }, [isDiscovered, actions, outlineAnimation, scene]); //this will run when isDiscovered changes

  return <primitive ref={ref} object={scene} position={[0, 0, 0]} />;
}

// this checks whether the camera is within the specified position.
function CameraController({ setIsDiscovered, setBloomIntensity, target }) {
  useFrame(({ camera }) => {
    if (camera) {
      const { x, y, z } = camera.position;
      if (
        Math.abs(x - target.x) <= target.margin &&
        Math.abs(y - target.y) < target.margin &&
        z > 0
      ) {
        setIsDiscovered(true);
        //   setBloomIntensity(1);
      } else {
        setIsDiscovered(false);
        // setBloomIntensity(0.2);
      }
    }
  });

  return null;
}

function Overlay({ isVisible, setIsVisible }) {
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

  return (
    isVisible && (
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
        <h2>Outlines Mixamo Prototype</h2>
        <p>
          The outlines will turn slightly red once in correct position.
          <br />
          <br />
          In AR, the model is positioned at 0,0. Load AR and then refocus the
          quest to position the model in space.
          <br />
          <br />
          In browser, use Orbit Controls to move the camera. Scroll to zoom.
          <br />
          Page needs to be reloaded to reset.
        </p>
        <button onClick={handleAR}>Enter AR</button>
        <button onClick={handleVR}>Enter VR</button>
        <button onClick={handleScreen}>Stay in Browser</button>
      </div>
    )
  );
}

export default function MixamoOutline() {
  const [isPaused, setIsPaused] = useState(true);
  const [isDiscovered, setIsDiscovered] = useState(false);
  // const [bloomIntensity, setBloomIntensity] = useState(0);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);

  // Here are all settings
  const modelPath = process.env.PUBLIC_URL + "/mixamo_outline.glb";

  const fullAnimationName = "Armature.001"; 
  const outlineAnimationName = "Outlines";

  const targetArea = { x: 0.6, y: 1.5, margin: 0.1 };

  return (
    <>
      <Canvas shadows>
        <XR store={store}>
          <Suspense>
            <CameraController
              isDiscovered={isDiscovered}
              setIsDiscovered={setIsDiscovered}
              target={targetArea}
              // setBloomIntensity={setBloomIntensity}
            />
            <directionalLight
              position={[3.3, 1.0, 4.4]}
              castShadow
              intensity={Math.PI * 2}
            />
            <Model
              fullAnimation={fullAnimationName}
              outlineAnimation={outlineAnimationName}
              isPaused={isPaused}
              setIsPaused={setIsPaused}
              isDiscovered={isDiscovered}
              isOverlayVisible={isOverlayVisible}
              modelPath={modelPath}
            />
            <OrbitControls target={[0, 1, 0]} />
          </Suspense>
        </XR>
      </Canvas>
      <Overlay
        isVisible={isOverlayVisible}
        setIsVisible={setIsOverlayVisible}
      />
    </>
  );
}
