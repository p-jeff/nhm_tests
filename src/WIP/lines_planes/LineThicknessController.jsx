import { useControls, folder } from "leva";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const LineThicknessController = ({
  materialRef,
  proximity,
  setBloomIntensity,
  lineRefs,
}) => {
  // Leva controls
  const {
    isLineEnabled,
    minWidth,
    maxWidth,
    isBloomEnabled,
    minBloomValue,
    maxBloomValue,
    isWobbleEnabled,
    baseWobbleSpeed,
    baseWobbleAmplitude,
  } = useControls({
    "Line Settings": folder({
      isLineEnabled: {
        value: true,
        label: "Enable Line Effects",
      },
      minWidth: {
        value: 0.4,
        min: 0.1,
        max: 1,
        step: 0.1,
        label: "Min Line Width",
      },
      maxWidth: {
        value: 10,
        min: 1,
        max: 10,
        step: 0.1,
        label: "Max Line Width",
      },
    },{ collapsed: true }),

    "Bloom Settings": folder({
      isBloomEnabled: {
        value: false,
        label: "Enable Bloom",
      },
      minBloomValue: {
        value: 0,
        min: 0,
        max: 1,
        step: 0.1,
        label: "Min Bloom",
      },
      maxBloomValue: {
        value: 2,
        min: 1,
        max: 5,
        step: 0.1,
        label: "Max Bloom",
      },
    },{ collapsed: true }),

    "Wobble Settings": folder({
      isWobbleEnabled: {
        value: false,
        label: "Enable Wobble",
      },
      baseWobbleSpeed: {
        value: 3,
        min: 0.1,
        max: 10,
        step: 0.1,
        label: "Base Wobble Speed",
      },
      baseWobbleAmplitude: {
        value: 0.001,
        min: 0,
        max: 0.2,
        step: 0.01,
        label: "Base Wobble Amplitude",
      },
    },{ collapsed: true }),
  },{ collapsed: true });


  useFrame((state) => {
    if (!materialRef.current.length) return;

    const normalizedDist = 1 - proximity

    if (isLineEnabled) {
      materialRef.current.forEach((material) => {
        if (material) {
          material.linewidth = THREE.MathUtils.lerp(
            maxWidth,
            minWidth,
            normalizedDist
          );
        }
      });
    } else {
      // Reset to minimum width when disabled
      materialRef.current.forEach((material) => {
        if (material) {
          material.linewidth = minWidth;
        }
      });
    }

    // Handle bloom effects
    if (isBloomEnabled) {
      const bloomValue = THREE.MathUtils.lerp(
        maxBloomValue,
        minBloomValue,
        normalizedDist
      );
      setBloomIntensity(bloomValue);
    } else {
      setBloomIntensity(0); // Reset bloom to minimum when disabled
    }

    // Apply wobble effect based on distance
    if (isWobbleEnabled && lineRefs) {
      const time = state.clock.getElapsedTime();

      // Adjust wobble amplitude and speed based on distance
      const wobbleAmplitude = THREE.MathUtils.lerp(
        baseWobbleAmplitude,
        baseWobbleAmplitude * 5,
        normalizedDist
      );
      const wobbleSpeed = THREE.MathUtils.lerp(
        baseWobbleSpeed * 5,
        baseWobbleSpeed,
        normalizedDist
      );

      lineRefs.current.forEach((line, index) => {
        line.position.y =
          Math.sin(time * wobbleSpeed + index) * wobbleAmplitude;
      });
    }
  });

  return null;
};

export default LineThicknessController;