import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { createXRStore, XR } from "@react-three/xr";
const store = createXRStore();

function Cube() {
  const meshRef = useRef();
  const [color, setColor] = useState("red");

  const targetX = 0;
  const targetY = 1.5;
  const marginOfError = 0.1; // Adjust this value as needed for more precision

  useFrame(({ camera }) => {
    const { x, y, z } = camera.position;
    if (
      Math.abs(x - targetX) < marginOfError &&
      Math.abs(y - targetY) < marginOfError &&
      z > 0
    ) {
      setColor("green");
    } else {
      setColor("red");
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 1.5, 0]}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default function PositionLock() {
  return (
    <>
      <button onClick={() => store.enterVR()}>Enter VR</button>
      <button onClick={() => store.enterAR()}>Enter AR</button>
      <Canvas>
        <XR store={store}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <Cube />
          <OrbitControls />
        </XR>
      </Canvas>
    </>
  );
}
