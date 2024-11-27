import PoissonDiskSampling from "poisson-disk-sampling";
import React, { useEffect, useRef } from "react";
import {  Image, PositionalAudio } from "@react-three/drei";
import { Vector3 } from "three";

function ImageWithSound({ url, position, soundUrl, scale, blur, onClick }) {
  const sound = useRef();

  useEffect(() => {
    if (sound.current) {
      sound.current.setRefDistance(0.2);
      sound.current.setLoop(true);
      sound.current.play();
    }
  }, []);

  return (
    <mesh position={position} onClick={onClick}>
      <Image
        url={url}
        opacity={1}
        transparent
        scale={scale}
        style={{ filter: blur ? "blur(30px)" : "none" }}
      />
      {soundUrl && (
        <PositionalAudio ref={sound} url={soundUrl} distance={0.2} />
      )}
    </mesh>
  );
}

export default function ImageSphere() {
  const groupRef = useRef();
  const cameraPosition = new Vector3(0, 0, -3); // Adjust as per your camera

  const image1 = process.env.PUBLIC_URL + "/rock1.png";
  const image2 = process.env.PUBLIC_URL + "/rock2.png";
  const leopard = process.env.PUBLIC_URL + "/leopard.png";
  const goat = process.env.PUBLIC_URL + "/goat.png";
  const goatSound = process.env.PUBLIC_URL + "/goat.mp3";
  const leopardSound = process.env.PUBLIC_URL + "/cat.mp3";

  const pingSound = process.env.PUBLIC_URL + "/ding.mp3";

  const gridSizeX = 40;
  const gridSizeY = 40;
  const minDistance = 1.1;

  const pds = new PoissonDiskSampling({
    shape: [gridSizeX, gridSizeY],
    minDistance,
    tries: 30,
  });

  const points = pds.fill();

  const handleSpecialPlaneClick = () => {
    const audio = new Audio(pingSound);
    audio.play();
  };

 // Replace the specialPositions array with:
const radius = -18; // Match the radius used for regular planes
const specialGridPositions = [
  [10, 10], // Converted from [-7, -7]
  [20, 30], // Converted from [0, 7] 
  [30, -10]  // Converted from [7, -7]
];

const specialPositions = specialGridPositions.map(([x, y]) => {
  const angleX = ((x - gridSizeX / 2) / gridSizeX) * Math.PI;
  const angleY = ((y - gridSizeY / 2) / gridSizeY) * Math.PI;
  
  return [
    radius * Math.sin(angleX) * Math.cos(angleY),
    radius * Math.sin(angleX) * Math.sin(angleY),
    radius * Math.cos(angleX)
  ];
});

// Then use specialPositions in the specialPlanes mapping as before
const specialPlanes = specialPositions.map((pos, index) => {
  const texture = index < 2 ? goat : leopard;
  const sound = index < 2 ? goatSound : leopardSound;
  return (
    <ImageWithSound
      key={`special-${index}`}
      url={texture}
      position={pos}
      soundUrl={sound}
      scale={2}
      blur={false}
      onClick={handleSpecialPlaneClick}
    />
  );
});
  const planes = points.map(([x, y], index) => {
    const texture = Math.random() < 0.5 ? image1 : image2;

    // Adjusting position for the concave surface (circular curve)
    const angleX = ((x - gridSizeX / 2) / gridSizeX) * Math.PI; // Mapping x to angle
    const angleY = ((y - gridSizeY / 2) / gridSizeY) * Math.PI; // Mapping y to angle

    const radius = -20; // Adjust radius to make the curve larger or smaller
    const position = [
      radius * Math.sin(angleX) * Math.cos(angleY), // X
      radius * Math.sin(angleX) * Math.sin(angleY), // Y
      radius * Math.cos(angleX), // Z
    ];

    const blur = true;

    return (
      <ImageWithSound
        key={`plane-${index}`}
        url={texture}
        position={position}
        scale={3}
        blur={blur}
      />
    );
  });

  // Ensure all images face the camera
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.traverse((object) => {
        if (object.isMesh) {
          object.lookAt(cameraPosition);
        }
      });
    }
  }, [cameraPosition]);

  return (
    <group ref={groupRef}>
      {specialPlanes}
      {planes}
    </group>
  );
}
