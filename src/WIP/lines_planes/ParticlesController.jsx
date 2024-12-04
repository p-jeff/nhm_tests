import { useControls, folder } from "leva";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useState } from "react";

const ParticlesController = ({
  setCurveSettings,
  target,
  maxDist = 3,
  sound,
}) => {
  const { offset, sizeCenter, sizeVariable, speed } = useControls({
    "Curve Settings": folder({
      offset: {
        value: 0.03,
        min: 0,
        max: 0.1,
        step: 0.001,
        label: "Offset",
      },
      sizeCenter: {
        value: 0.075,
        min: 0,
        max: 0.1,
        step: 0.001,
        label: "Size Center",
      },
      sizeVariable: {
        value: 0.01,
        min: 0,
        max: 0.1,
        step: 0.001,
        label: "Size Variable",
      },
      speed: {
        value: 5,
        min: 1,
        max: 10,
        step: 1,
        label: "Speed",
      },
    }),
  });

  const [hasEnteredCloseArea, setHasEnteredCloseArea] = useState(false); // State to track if close area is entered

  useEffect(() => {
    console.log(sound);
  }, [sound]);

  useFrame((state) => {
    const camera = state.camera;
    const distance = camera.position.distanceTo(target);
    const normalizedDist = Math.min(distance / maxDist, 1);

    // Reverse the normalized distance (1 when close, 0 when far)
    const proximity = 1 - normalizedDist;

    // Apply easing function for smooth acceleration (cubic easing)
    const eased = proximity * proximity * proximity;

    // Interpolate between min and max size instead of speed
    const minSize = 0.005;
    const maxSize = 0.1;
    const adjustedSize = THREE.MathUtils.lerp(minSize, maxSize, eased);

    // Add tiny offset animation
    const time = state.clock.getElapsedTime();
    const animatedOffset = offset

    // Check if the user is really close to the target for the first time
    if (proximity > 0.9 && !hasEnteredCloseArea) {
      setHasEnteredCloseArea(true);
      sound.play(); // Play sound
      setCurveSettings((prevSettings) => ({
        ...prevSettings,
        sizeCenter: 0.1, // Change size center to 0.1
      }));
    } else if (proximity < 0.9 && hasEnteredCloseArea) {
      setCurveSettings((prevSettings) => ({
        ...prevSettings,
        sizeCenter: 0.1, // Change size center to 0.1
      }));
    } else {
      setCurveSettings({
        offset: animatedOffset,
        sizeCenter: adjustedSize,
        sizeVariable,
        speed,
      });
    }
  });

  return null;
};

export default ParticlesController;
