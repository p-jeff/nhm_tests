import PoissonDiskSampling from "poisson-disk-sampling";
import React, { useEffect, useRef } from "react";
import { Image, PositionalAudio } from "@react-three/drei";

function ImageWithSound({ url, position, soundUrl, scale, blur }) {
  const sound = useRef();

  useEffect(() => {
    if (sound.current) {
      sound.current.setRefDistance(0.2);
      sound.current.setLoop(true);
      sound.current.play();
    }
  }, []);

  return (
    <mesh position={position}>
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

export default function ImageGrid() {
  const groupRef = useRef();

  const image1 = process.env.PUBLIC_URL + "/rock1.png";
  const image2 = process.env.PUBLIC_URL + "/rock2.png";
  const leopard = process.env.PUBLIC_URL + "/leopard.png";
  const goat = process.env.PUBLIC_URL + "/goat.png";
  const goatSound = process.env.PUBLIC_URL + "/goat.mp3";
  const leopardSound = process.env.PUBLIC_URL + "/cat.mp3";

  const gridSizeX = 20;
  const gridSizeY = 20;
  const minDistance = 1.1;

  const pds = new PoissonDiskSampling({
    shape: [gridSizeX, gridSizeY],
    minDistance,
    tries: 30,
  });

  const points = pds.fill();

  const specialPositions = [
    [-7, -7, 0.3], // Goat 1
    [0, 7, 0.3], // Leopard
    [7, -7, 0.3], // Goat 2
  ];

  const specialPlanes = specialPositions.map((pos, index) => (
    <ImageWithSound
      key={`special-${index}`}
      url={index < 2 ? goat : leopard}
      position={pos}
      soundUrl={index < 2 ? goatSound : leopardSound}
      scale={2}
      blur={false}
    />
  ));

  const planes = points.map(([x, y], index) => {
    const texture = Math.random() < 0.5 ? image1 : image2;
    const position = [
      x - gridSizeX / 2,
      y - gridSizeY / 2,
      (Math.random() - 0.5) * 0.2,
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

  return (
    <group ref={groupRef}>
      {specialPlanes}
      {planes}
    </group>
  );
}
