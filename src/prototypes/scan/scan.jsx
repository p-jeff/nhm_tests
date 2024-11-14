import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import ImageGrid from "./ImageGrid";
import ScanControls from "./ScanControls";
import LoadingOverlay from "./LoadingOverlay";

export default function Scan() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div id="scan">
      {!isLoaded && <LoadingOverlay onClick={() => setIsLoaded(true)} />}
      {isLoaded && (
        <Suspense fallback={<div>Loading...</div>}>
          <Canvas camera={{ position: [0, 2, 0] }}>
            <ImageGrid />
            <ScanControls />

            <EffectComposer>
              <Vignette eskil={false} offset={0.9} darkness={0.9} />
              
              </EffectComposer>
          </Canvas>
        </Suspense>
      )}
    </div>
  );
}
