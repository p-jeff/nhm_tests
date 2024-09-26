import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { createXRStore, XR, XROrigin } from "@react-three/xr";
import { OrbitControls } from "@react-three/drei";
import * as THREE from 'three';

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
  const pointerDownRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const { camera } = useThree();

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

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (meshRef.current) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
        );
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(meshRef.current);
        if (intersects.length > 0) {
          pointerDownRef.current = true;
          lastPointerXRef.current = event.clientX;
          setIsDragging(true);
        }
      }
    };

    const handlePointerMove = (event) => {
      if (pointerDownRef.current) {
        const deltaX = event.clientX - lastPointerXRef.current;
        lastPointerXRef.current = event.clientX;
        setVelocity((prevVelocity) => prevVelocity + (deltaX / 400));
      }
    };

    const handlePointerUp = () => {
      pointerDownRef.current = false;
      setIsDragging(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [camera]);

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
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

      <Canvas shadows camera={{ position: [0, 2, 2] }}>
        <XR store={store}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} castShadow />
          <Wheel />
          <Plane />
          <XROrigin scale={2} position-z={2} position-y={-3} />
        </XR>
      </Canvas>
    </>
  );
}

export default WheelApp;