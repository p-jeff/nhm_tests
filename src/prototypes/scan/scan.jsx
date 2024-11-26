// ScanControls.jsx
import { useFrame, useThree } from "@react-three/fiber";
import React, { Suspense, useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { createXRStore, XR, XROrigin, useXR } from "@react-three/xr";
import LoadingOverlay from "./LoadingOverlay";
import ImageGrid from "./ImageGrid";
import ScanControls from "./ScanControls";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";

const xrStore = createXRStore();

function XRControls({ groupRef, isPresenting }) {
  const { session } = useXR();

  console.log("XRControls session:", session);
  console.log("XRControls groupRef:", groupRef);

  useFrame(({ camera }) => {
    if (!isPresenting || !session || !groupRef) return;

    const xRotation = camera.rotation.x;
    const yRotation = camera.rotation.y;

    const threshold = 0.2; // rotation threshold to start moving
    const moveSpeed = 0.02;

    console.log("xRotation:", xRotation);

    // Move group based on camera rotation
    if (Math.abs(xRotation) > threshold) {
      // Move opposite to rotation direction
      groupRef.current.position.y -= xRotation * moveSpeed;
    }

    if (Math.abs(yRotation) > threshold) {
      // Move opposite to rotation direction
      groupRef.current.position.x += yRotation * moveSpeed;
    }

    // Clamp group position
    const maxOffset = 10;
    groupRef.current.position.x = THREE.MathUtils.clamp(
      groupRef.current.position.x,
      -maxOffset,
      maxOffset
    );
    groupRef.current.position.y = THREE.MathUtils.clamp(
      groupRef.current.position.y,
      -maxOffset,
      maxOffset
    );
  });

  return null;
}

const Hud = ({ position = [0, 0, -1] }) => {
  const { camera } = useThree();
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      // Move HUD relative to the camera
      const hudPosition = new THREE.Vector3(...position);
      camera.localToWorld(hudPosition);
      groupRef.current.position.copy(hudPosition);

      // Match the camera's rotation
      groupRef.current.rotation.copy(camera.rotation);
    }
  });

  // Create the plane geometry with a circular hole
  const shape = new THREE.Shape();
  shape.absarc(0, 0, 12, 0, Math.PI * 2); // Outer plane shape

  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.4, 0, Math.PI * 2); // Circular hole
  shape.holes.push(hole);

  const geometry = new THREE.ShapeGeometry(shape);

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry}>
        <meshBasicMaterial color="black" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

function XRContent({ groupRef }) {
  const { session } = useXR();
  const [isPresenting, setIsPresenting] = useState(false);

  useEffect(() => {
    console.log("XR Session:", session);
    if (session) {
      setIsPresenting(true);
    } else {
      setIsPresenting(false);
    }
  });

  return (
    <group>
      <group ref={groupRef}>
        <ImageGrid />
      </group>
      {isPresenting ? (
        <XRControls isPresenting={isPresenting} groupRef={groupRef} />
      ) : (
        <ScanControls groupRef={groupRef} />
      )}
      <Hud/>
    </group>
  );
}

export default function Scan() {
  const [isLoaded, setIsLoaded] = useState(false);
  const groupRef = useRef();

  return (
    <>
      <div id="scan">
        {!isLoaded && (
          <LoadingOverlay
            onClick={() => setIsLoaded(true)}
            xrStore={xrStore}
            setIsLoaded={setIsLoaded}
          />
        )}

        <>
          <Suspense fallback={<div>Loading...</div>}>
            <Canvas>
              <XR store={xrStore}>
                {isLoaded && <XRContent groupRef={groupRef} />}
                <XROrigin position={[0, 0, 4]} />
              </XR>

            </Canvas>
          </Suspense>
        </>
      </div>
    </>
  );
}
