import React, { useRef, useState } from "react";
import { useDrag } from "@use-gesture/react";
import { Canvas, useFrame } from "@react-three/fiber";
import { createXRStore, XR, XROrigin } from "@react-three/xr";

const store = createXRStore();

function Plane() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[10, 10]} />
      <shadowMaterial opacity={0.5} />
    </mesh>
  );
}

function Wheel() {
  const meshRef = useRef();
  const [velocity, setVelocity] = useState(0);
  const [color, setColor] = useState("orange");
  const [overThreshold, setOverThreshold] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const velocityThreshold = 0.3;

  useFrame(() => {
    if (meshRef.current) {
      // Apply rotation only around the y-axis
      meshRef.current.rotation.y += velocity;

      // Check if velocity exceeds the threshold
      if (Math.abs(velocity) > velocityThreshold) {
        // Keep spinning and change color to green
        setColor("green");
        setOverThreshold(true);
      } else if (overThreshold) {
        setVelocity(1);
      } else {
        // Gradually decrease velocity to simulate friction
        setVelocity(velocity * 0.95);
        setColor(isDragging ? "red" : "orange");
      }
    }
  });

  const bind = useDrag(({ movement: [mx], velocity: [vx], active }) => {
    setIsDragging(active);
    if (overThreshold) {
      // If the wheel is spinning, don't allow dragging
      return;
    } else {
      // Accumulate velocity based on drag speed and direction (only y-axis)
      setVelocity((prevVelocity) => prevVelocity + (vx / 40) * Math.sign(mx));
      setColor(active ? "red": "orange");
    }
  });

  return (
    <mesh ref={meshRef} {...bind()} castShadow receiveShadow>
      <cylinderGeometry args={[0.5, 0.5, 0.2, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function WheelApp() {

  return (
    <>
      <button onClick={() => store.enterVR()}>Enter VR</button>
      <button onClick={() => store.enterAR()}>Enter AR</button>

      <Canvas shadows camera={{position: [0,2,2]}}>
        <XR store={store}>
          <ambientLight intensity={0.5} />

          <pointLight position={[10, 10, 10]} castShadow />
          <Wheel />
          <Plane />
          <XROrigin scale={2} position-z={2} position-y={-3}/>  
        </XR>
      </Canvas>
    </>
  );
}

export default WheelApp;