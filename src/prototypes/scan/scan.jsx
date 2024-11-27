// ScanControls.jsx
import { useFrame, useThree } from "@react-three/fiber";
import React, { Suspense, useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  createXRStore,
  XR,
  XROrigin,
  useXR,
  useXRInputSourceState,
} from "@react-three/xr";
import LoadingOverlay from "./LoadingOverlay";
import ImageGrid from "./ImageGrid";
import ScanControls from "./ScanControls";
import * as THREE from "three";
import ImageSphere from "./ImageSphere";

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

function ZoomOnControllerPress() {
  const { camera, scene } = useThree();
  const initialPosition = useRef(null); // Store the initial XR group position
  const zoomed = useRef(false); // Track if zoom has already occurred
  const controller = useXRInputSourceState("controller", "right");

  useFrame(() => {
    const xrGroup = scene.getObjectByName("XROrigin") || camera.parent;

    if (xrGroup && controller) {
      if (
        controller.gamepad["a-button"].state === "pressed" &&
        !zoomed.current
      ) {
        // Save the initial position only once
        if (!initialPosition.current) {
          initialPosition.current = xrGroup.position.clone();
        }

        // Calculate zoom-in position (3x closer)
        const forward = new THREE.Vector3(0, 0, -1)
          .applyQuaternion(camera.quaternion)
          .normalize();
        xrGroup.position.addScaledVector(forward, 8); // Adjust zoom depth as needed
        zoomed.current = true; // Mark zoom as completed
      } else if (
        controller.gamepad["a-button"].state === "default" &&
        zoomed.current
      ) {
        // Reset to the initial position on button release
        if (initialPosition.current) {
          xrGroup.position.copy(initialPosition.current);
        }
        zoomed.current = false; // Allow future zooming
      }
    }
  });

  return null;
}

function XRContent({ groupRef, version }) {
  const { session } = useXR();
  const [isPresenting, setIsPresenting] = useState(false);

  useEffect(() => {
    console.log("XR Session:", session);
    if (session) {
      setIsPresenting(true);
    } else {
      setIsPresenting(false);
    }
  }, [session, setIsPresenting]);

  if (version === "new") {
    return (
      <group>
        <XROrigin position={[0, 0, -3]} />

        <group ref={groupRef}>
          <ImageSphere />
        </group>
        {isPresenting ? (
          <ZoomOnControllerPress />
        ) : (
          <ScanControls groupRef={groupRef} />
        )}
        <Hud />
      </group>
    );
  } else if (version === "old") {
    return (
      <group>
        <XROrigin position={[0, 0, 5]} />

        <group ref={groupRef}>
          <ImageGrid />
        </group>
        {isPresenting ? (
          <XRControls isPresenting={isPresenting} groupRef={groupRef} />
        ) : (
          <ScanControls groupRef={groupRef} />
        )}
        <Hud />
      </group>
    );
  }
}

export default function Scan() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [version, setVersion] = useState("new");
  const groupRef = useRef();

  return (
    <>
      <div id="scan">
        {!isLoaded && (
          <LoadingOverlay
            onClick={() => setIsLoaded(true)}
            xrStore={xrStore}
            setIsLoaded={setIsLoaded}
            setVersion={setVersion}
          />
        )}

        <>
          <Suspense fallback={<div>Loading...</div>}>
            <Canvas>
              <XR store={xrStore}>
                {isLoaded && <XRContent groupRef={groupRef} version={version}/>}
              </XR>
            </Canvas>
          </Suspense>
        </>
      </div>
    </>
  );
}
