import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import ImageGrid from "./ImageGrid";
import ScanControls from "./ScanControls";

function LoadingOverlay({ onClick }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      <h2 style={{ color: "white", margin: "30px" }}>
        First Binocular Prototype. <br /> Uses positional audio - works better
        with headphones. <br /> Pan by moving the mouse close to the edge.
      </h2>
      <button
        onClick={onClick}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        Start Prototype
      </button>
    </div>
  );
}

export default function Scan_old() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <div id="scan">
        {!isLoaded && <LoadingOverlay onClick={() => setIsLoaded(true)} />}
        {isLoaded && (
          <>
            <Suspense fallback={<div>Loading...</div>}>
              <Canvas camera={{ position: [0, 2, 0] }}>
                <ImageGrid />
                <ScanControls />

                <EffectComposer>
                  <Vignette eskil={false} offset={0.9} darkness={0.9} />
                </EffectComposer>
              </Canvas>
            </Suspense>
          </>
        )}
      </div>
    </>
  );
}
