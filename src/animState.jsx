import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { LineBasicMaterial, BufferGeometry, Line, Float32BufferAttribute } from 'three';

function Model({ actionName, frame, isPaused }) {
  const { scene, animations } = useGLTF("/suzaneLine.glb");
  const { ref, mixer, names, actions, clips } = useAnimations(animations);

  console.log(scene);

  useEffect(() => {
    if (actions && actionName && actions[actionName]) {
      actions[actionName].play();
    }
  }, [actions, actionName]);

  useEffect(() => {
    if (actions && actionName && actions[actionName] && frame !== null) {
      actions[actionName].time = frame / 24; // Assuming 24 FPS
    }
  }, [actions, actionName, frame]);

  useEffect(() => {
    if (actions && actionName && actions[actionName]) {
      actions[actionName].paused = isPaused;
    }
  }, [actions, actionName, isPaused]);

  

useEffect(() => {
  scene.traverse((child) => {
    if (child.isObject3D) {
      if (child.type === 'Object3D') {
        const points = child.getPoints(50); // Get points from the curve
        const geometry = new BufferGeometry().setFromPoints(points);
        const material = new LineBasicMaterial({ color: 0xff0000 });
        const line = new Line(geometry, material);
        scene.add(line);
      } else {
        child.material = new LineBasicMaterial({ color: 0x0000ff });
      }
    }
  });
}, [scene]);


  return (
    <primitive ref={ref} object={scene} position={[0, 1, 0]} />
  );
}

export default function AnimState() {
  const [actionName, setActionName] = useState(null);
  const [frame, setFrame] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const animName = "SuzanneAction"; // Replace with your animation name

  const handlePlayPause = () => {
    if (isPaused) {
      setIsPaused(false);
    } else {
      setActionName(animName);
      setFrame(null);
      setIsPaused(true);
    }
  };

  const handleSkipToFrame = (frameNumber) => {
    setActionName(animName);
    setFrame(frameNumber);
  };

  return (
    <>
      <button onClick={handlePlayPause}>{isPaused ? "Play" : "Pause"}</button>
         <input 
      type="range" 
      min="0" 
      max="100" 
      step="1" 
      onChange={(e) => handleSkipToFrame(e.target.value)} 
    />
      <Canvas camera={{ position: [-0.5, 1, 2] }} shadows>
        <Suspense>
          <directionalLight
            position={[3.3, 1.0, 4.4]}
            castShadow
            intensity={Math.PI * 2}
          />
          <Model actionName={actionName} frame={frame} isPaused={isPaused} />
          <OrbitControls target={[0, 1, 0]} />
        </Suspense>
      </Canvas>
    </>
  );
}