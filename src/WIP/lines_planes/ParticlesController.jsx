import { useControls, folder } from "leva";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useState } from "react";

const ParticlesController = ({
  setCurveSettings,
  proximity,
  maxDist = 3,
}) => {
  const { offset, sizeCenter, sizeVariable, speed } = useControls({
    "Particles Settings": folder(
      {
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
          value: 1,
          min: 1,
          max: 10,
          step: 1,
          label: "Speed",
        },
      },
      { collapsed: true }
    ),
  });

  useFrame(() => {
    const minSize = 0.005;
    const maxSize = 0.1;
    const adjustedSize = THREE.MathUtils.lerp(minSize, maxSize, proximity);

    // Add tiny offset animation
    const animatedOffset = offset;

    setCurveSettings({
      offset: animatedOffset,
      sizeCenter: adjustedSize,
      sizeVariable,
      speed,
    });
  });

  return null;
};

export default ParticlesController;
