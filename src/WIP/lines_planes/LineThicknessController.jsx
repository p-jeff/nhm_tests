import { useControls, folder } from "leva";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const LineThicknessController = ({
  materialRef,
  maxDistance,
  minLineWidth,
  maxLineWidth,
  target,
  minBloom,
  maxBloom,
  setBloomIntensity,
}) => {
  // Create Leva controls
  const {
    isLineEnabled,
    maxDist,
    minWidth,
    maxWidth,
    isBloomEnabled,
    minBloomValue,
    maxBloomValue,
  } = useControls({
    "Line Settings": folder({
      isLineEnabled: {
        value: true,
        label: "Enable Line Effects",
      },
      maxDist: {
        value: maxDistance,
        min: 1,
        max: 10,
        step: 0.1,
        label: "Max Distance",
      },
      minWidth: {
        value: minLineWidth,
        min: 0.1,
        max: 1,
        step: 0.1,
        label: "Min Line Width",
      },
      maxWidth: {
        value: maxLineWidth,
        min: 1,
        max: 5,
        step: 0.1,
        label: "Max Line Width",
      },
    }),

    "Bloom Settings": folder({
      isBloomEnabled: {
        value: true,
        label: "Enable Bloom",
      },
      minBloomValue: {
        value: minBloom,
        min: 0,
        max: 1,
        step: 0.1,
        label: "Min Bloom",
      },
      maxBloomValue: {
        value: maxBloom,
        min: 1,
        max: 5,
        step: 0.1,
        label: "Max Bloom",
      },
    }),
  });

  useFrame((state) => {
  if (!materialRef.current.length) return;

  const camera = state.camera;
  const distance = camera.position.distanceTo(target);
  const normalizedDist = Math.min(distance / maxDist, 1);

  // Only update line width if line effects are enabled
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
    // Reset bloom to minimum when disabled
    setBloomIntensity(0);
  }
});

  return null;
};

export default LineThicknessController;
